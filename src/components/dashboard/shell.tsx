import { logoutAction } from "@/actions/auth";
import { Brand } from "@/components/brand";
import { DashboardNav } from "@/components/dashboard/nav";
import { buttonClass } from "@/components/ui/button";
import { DASHBOARD_HOME } from "@/auth.config";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import type { Role } from "@prisma/client";

const NAV: Record<Role, Array<{ href: string; label: string }>> = {
  admin: [
    { href: "/dashboard/admin", label: "Overview" },
    { href: "/dashboard/admin/cafeterias", label: "Cafeterias" },
    { href: "/dashboard/admin/runners", label: "Agents" },
    { href: "/dashboard/admin/orders", label: "Orders" },
    { href: "/dashboard/admin/users", label: "Users" },
    { href: "/dashboard/profile", label: "Profile" },
  ],
  cafeteria: [
    { href: "/dashboard/cafeteria", label: "Home" },
    { href: "/dashboard/cafeteria/menu", label: "Menu" },
    { href: "/dashboard/cafeteria/orders", label: "Orders" },
    { href: "/dashboard/cafeteria/qr", label: "QR code" },
    { href: "/dashboard/profile", label: "Profile" },
  ],
  runner: [
    { href: "/dashboard/runner", label: "Home" },
    { href: "/dashboard/runner/orders", label: "Orders" },
    { href: "/dashboard/runner/customers", label: "Customers" },
    { href: "/dashboard/runner/subscribe", label: "Plan" },
    { href: "/dashboard/profile", label: "Profile" },
  ],
  student: [
    { href: "/dashboard/student", label: "Home" },
    { href: "/cafeterias", label: "Browse" },
    { href: "/agents", label: "Agents" },
    { href: "/dashboard/student/orders", label: "Orders" },
    { href: "/dashboard/profile", label: "Profile" },
  ],
};

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
  const links = NAV[role];
  const home = DASHBOARD_HOME[role];
  const firstName = name.split(" ")[0] || name;

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-40 border-b border-forest-dark bg-forest text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <Brand />
            <Link href="/dashboard/profile" className="mt-0.5 block truncate text-xs text-emerald-100 hover:text-white">
              Hey, {firstName}
            </Link>
          </div>
          <div className="flex items-center gap-2 text-sm sm:gap-3">
            <ThemeToggle inverted />
            <Link
              href="/dashboard/notifications"
              className="relative rounded-full bg-white/10 px-3 py-1.5"
            >
              Alerts
              {unread > 0 ? (
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber px-1 text-[10px] font-bold text-stone-900">
                  {unread > 9 ? "9+" : unread}
                </span>
              ) : null}
            </Link>
            <form action={logoutAction}>
              <button type="submit" className={buttonClass("amber", "h-8 px-3 text-xs")}>
                Log out
              </button>
            </form>
          </div>
        </div>
        <DashboardNav links={links} variant="top" />
      </header>
      <main className="mx-auto w-full max-w-5xl px-4 py-6 pb-24 md:pb-8">{children}</main>
      <DashboardNav links={links} variant="bottom" />
      <p className="sr-only">{home}</p>
    </div>
  );
}
