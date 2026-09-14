import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/utils";
import type { Role } from "@prisma/client";

export const OAUTH_ROLE_COOKIE = "oauth-role";

export type OAuthRole = "student" | "runner";

export async function setOAuthRoleCookie(role: OAuthRole) {
  const store = await cookies();
  store.set(OAUTH_ROLE_COOKIE, role, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 10,
    path: "/",
  });
}

async function readOAuthRole(): Promise<OAuthRole> {
  const store = await cookies();
  const value = store.get(OAUTH_ROLE_COOKIE)?.value;
  return value === "runner" ? "runner" : "student";
}

async function clearOAuthRoleCookie() {
  const store = await cookies();
  store.delete(OAUTH_ROLE_COOKIE);
}

export async function upsertGoogleUser(profile: {
  email?: string | null;
  name?: string | null;
}) {
  const email = profile.email?.toLowerCase().trim();
  if (!email) return { error: "Google did not share an email address." as const };

  const existing = await prisma.user.findUnique({ where: { email } });
  const intended = await readOAuthRole();
  await clearOAuthRoleCookie();

  if (existing) {
    if (existing.isDisabled) return { error: "This account is disabled." as const };
    return { user: existing };
  }

  const name = profile.name?.trim() || email.split("@")[0] || "Student";
  const role: Role = intended === "runner" ? "runner" : "student";

  if (role === "runner") {
    let personalSlug = uniqueSlug(name);
    while (await prisma.runner.findUnique({ where: { personalSlug } })) {
      personalSlug = uniqueSlug(name);
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        role: "runner",
        runner: {
          create: {
            personalSlug,
            subscriptionStatus: "inactive",
          },
        },
      },
    });
    return { user };
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      role: "student",
    },
  });
  return { user };
}
