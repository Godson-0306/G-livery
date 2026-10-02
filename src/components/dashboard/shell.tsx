import { logoutAction } from "@/actions/auth";
import { Brand } from "@/components/brand";
import { AppTabBar } from "@/components/dashboard/nav";
import { buttonClass } from "@/components/ui/button";
import { DASHBOARD_HOME } from "@/auth.config";
import { ThemeToggle } from "@/components/theme-toggle";
import { ROLE_NAV } from "@/lib/nav";
import Link from "next/link";
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
      </header>
      <main className="mx-auto w-full max-w-5xl px-4 py-6 pb-24">{children}</main>
      <AppTabBar links={links} />
      <p className="sr-only">{home}</p>
    </div>
  );
}
