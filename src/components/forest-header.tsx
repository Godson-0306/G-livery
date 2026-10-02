import { logoutAction } from "@/actions/auth";
import { LiveAlertsBadge } from "@/components/alerts/live-alerts-badge";
import { Brand } from "@/components/brand";
import { buttonClass } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

export function ForestHeader({ name, unread }: { name: string; unread: number }) {
  const firstName = name.split(" ")[0] || name;

  return (
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
            <LiveAlertsBadge initialCount={unread} />
          </Link>
          <form action={logoutAction}>
            <button type="submit" className={buttonClass("amber", "h-8 px-3 text-xs")}>
              Log out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
