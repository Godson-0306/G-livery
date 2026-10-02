import { AppTabBar } from "@/components/dashboard/nav";
import { ForestHeader } from "@/components/forest-header";
import { DASHBOARD_HOME } from "@/auth.config";
import { ROLE_NAV } from "@/lib/nav";
import type { Role } from "@prisma/client";

export function DashboardShell({
  role,
  name,
  unread,
  children,
}: {
  role: Role;
  name: string;
  unread: number;
  children: React.ReactNode;
}) {
  const links = ROLE_NAV[role];
  const home = DASHBOARD_HOME[role];

  return (
    <div className="min-h-dvh bg-background">
      <ForestHeader name={name} unread={unread} />
      <main className="mx-auto w-full max-w-5xl px-4 py-6 pb-24">{children}</main>
      <AppTabBar links={links} />
      <p className="sr-only">{home}</p>
    </div>
  );
}
