import { auth } from "@/auth";
import { DASHBOARD_HOME } from "@/auth.config";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";

export async function requireSession() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session;
}

export async function requireRole(roles: Role | Role[]) {
  const session = await requireSession();
  const allowed = Array.isArray(roles) ? roles : [roles];
  if (!allowed.includes(session.user.role)) {
    redirect(DASHBOARD_HOME[session.user.role] ?? "/");
  }
  return session;
}
