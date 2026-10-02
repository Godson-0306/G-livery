"use server";

import { requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { appUrl, slugify, uniqueSlug } from "@/lib/utils";
import { subscriptionDays } from "@/lib/money";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionState } from "@/actions/auth";
import type { SubscriptionStatus } from "@prisma/client";

export async function createCafeteriaAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole("admin");

  const name = String(formData.get("name") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const ownerName = String(formData.get("ownerName") ?? "").trim();
  const ownerEmail = String(formData.get("ownerEmail") ?? "")
    .toLowerCase()
    .trim();
  const ownerPhone = String(formData.get("ownerPhone") ?? "").trim();
  const tempPassword = String(formData.get("tempPassword") ?? "").trim();
  const activate = formData.get("isActive") === "on";

  if (!name || !ownerName || !ownerEmail || tempPassword.length < 8) {
    return { error: "Name, owner details, and a temp password (8+ chars) are required." };
  }

  const existingUser = await prisma.user.findUnique({ where: { email: ownerEmail } });
  if (existingUser) return { error: "That owner email is already in use." };

  let slug = slugify(name);
  if (!slug) slug = uniqueSlug(name);
  if (await prisma.cafeteria.findUnique({ where: { slug } })) {
    slug = uniqueSlug(name);
  }

  const owner = await prisma.user.create({
    data: {
      name: ownerName,
      email: ownerEmail,
      phone: ownerPhone || null,
      passwordHash: await bcrypt.hash(tempPassword, 10),
      role: "cafeteria",
      mustChangePassword: true,
    },
  });

  await prisma.cafeteria.create({
    data: {
      name,
      slug,
      location: location || null,
      description: description || null,
      ownerId: owner.id,
      isActive: activate,
      qrCodeUrl: appUrl(`/cafeteria/${slug}`),
    },
  });

  revalidatePath("/dashboard/admin");
  redirect("/dashboard/admin/cafeterias");
}

export async function toggleCafeteriaActiveAction(cafeteriaId: string, isActive: boolean) {
  await requireRole("admin");
  await prisma.cafeteria.update({
    where: { id: cafeteriaId },
    data: { isActive },
  });
  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/admin/cafeterias");
}

export async function setRunnerSubscriptionAction(formData: FormData) {
  await requireRole("admin");
  const runnerId = String(formData.get("runnerId") ?? "");
  const status = String(formData.get("status") ?? "") as SubscriptionStatus;
  if (!runnerId || !["active", "inactive", "expired"].includes(status)) return;

  const days = subscriptionDays();
  const expiresAt =
    status === "active" ? new Date(Date.now() + days * 24 * 60 * 60 * 1000) : null;

  const runner = await prisma.runner.update({
    where: { id: runnerId },
    data: {
      subscriptionStatus: status,
      subscriptionExpiresAt: expiresAt,
    },
    select: { userId: true },
  });

  if (status === "active") {
    await prisma.subscription.create({
      data: {
        runnerId,
        startDate: new Date(),
        endDate: expiresAt ?? new Date(),
        amountPaid: 0,
        status: "paid",
      },
    });
  }

  revalidatePath("/dashboard/admin/runners");
  revalidatePath(`/dashboard/admin/users/${runner.userId}`);
}

export async function toggleUserDisabledAction(userId: string, isDisabled: boolean) {
  await requireRole("admin");
  await prisma.user.update({
    where: { id: userId },
    data: { isDisabled },
  });
  revalidatePath("/dashboard/admin/users");
  revalidatePath(`/dashboard/admin/users/${userId}`);
  revalidatePath("/dashboard/admin/runners");
}
