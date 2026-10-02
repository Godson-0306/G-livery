"use server";

import { signIn, signOut, auth, unstable_update } from "@/auth";
import { prisma } from "@/lib/prisma";
import { parsePayoutDetails } from "@/lib/payout";
import { uniqueSlug } from "@/lib/utils";
import { setOAuthRoleCookie, isGoogleAuthConfigured, type OAuthRole } from "@/lib/google-user";
import { DASHBOARD_HOME } from "@/auth.config";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { z } from "zod";

export type ActionState = { error?: string; success?: string; name?: string } | undefined;

const signupSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(7, "Enter a phone number").optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function loginAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const password = String(formData.get("password") ?? "");
  const callbackUrl = String(formData.get("callbackUrl") ?? "/dashboard");

  const existing = email ? await prisma.user.findUnique({ where: { email } }) : null;
  if (existing && !existing.passwordHash) {
    return { error: "This account uses Google. Continue with Google." };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl || "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw error;
  }
}

export async function googleSignInAction(role: OAuthRole, redirectTo?: string) {
  if (!isGoogleAuthConfigured()) {
    redirect("/login?error=Configuration");
  }
  await setOAuthRoleCookie(role);
  const dest =
    redirectTo?.trim() ||
    (role === "runner" ? DASHBOARD_HOME.runner : "/dashboard");
  await signIn("google", { redirectTo: dest });
}

export async function signupStudentAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your details." };
  }

  const email = parsed.data.email.toLowerCase().trim();
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return { error: "An account with that email already exists." };

  await prisma.user.create({
    data: {
      name: parsed.data.name.trim(),
      email,
      phone: parsed.data.phone?.trim(),
      passwordHash: await bcrypt.hash(parsed.data.password, 10),
      role: "student",
    },
  });

  await signIn("credentials", {
    email,
    password: parsed.data.password,
    redirectTo: "/dashboard/student",
  });
}

export async function signupRunnerAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your details." };
  }

  const payout = parsePayoutDetails(formData);
  if ("error" in payout) return { error: payout.error };

  const email = parsed.data.email.toLowerCase().trim();
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return { error: "An account with that email already exists." };

  let personalSlug = uniqueSlug(parsed.data.name);
  while (await prisma.runner.findUnique({ where: { personalSlug } })) {
    personalSlug = uniqueSlug(parsed.data.name);
  }

  await prisma.user.create({
    data: {
      name: parsed.data.name.trim(),
      email,
      phone: parsed.data.phone?.trim(),
      passwordHash: await bcrypt.hash(parsed.data.password, 10),
      role: "runner",
      runner: {
        create: {
          personalSlug,
          subscriptionStatus: "inactive",
        },
      },
    },
  });

  const created = await prisma.runner.findUnique({ where: { personalSlug } });
  if (created) {
    await prisma.$executeRaw`
      UPDATE "Runner"
      SET "bankName" = ${payout.bankName},
          "accountName" = ${payout.accountName},
          "accountNumber" = ${payout.accountNumber}
      WHERE id = ${created.id}
    `;
  }

  await signIn("credentials", {
    email,
    password: parsed.data.password,
    redirectTo: "/dashboard/runner/welcome",
  });
}

export async function changePasswordAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const current = String(formData.get("currentPassword") ?? "");
  const next = String(formData.get("newPassword") ?? "");
  if (next.length < 8) return { error: "New password must be at least 8 characters." };

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { error: "Account not found." };
  if (!user.passwordHash) {
    return { error: "This account uses Google sign-in. There is no password to change." };
  }

  const ok = await bcrypt.compare(current, user.passwordHash);
  if (!ok) return { error: "Current password is incorrect." };

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: await bcrypt.hash(next, 10),
      mustChangePassword: false,
    },
  });

  await unstable_update({ user: { mustChangePassword: false } });

  return { success: "Password updated. You can continue to your dashboard." };
}

export async function updateProfileAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();
  const phoneRaw = String(formData.get("phone") ?? "").trim();
  if (name.length < 2) return { error: "Name is too short." };
  if (phoneRaw && phoneRaw.length < 7) return { error: "Enter a valid phone number." };

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name, phone: phoneRaw || null },
  });

  await unstable_update({ user: { name } });
  return { success: "Profile saved.", name };
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}

export async function logoutToCheckoutLoginAction() {
  await signOut({ redirectTo: "/login?callbackUrl=/checkout" });
}
