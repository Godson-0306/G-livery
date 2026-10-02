import { logoutAction } from "@/actions/auth";
import { LiveAlertsBadge } from "@/components/alerts/live-alerts-badge";
import { Brand } from "@/components/brand";
import { buttonClass } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

export function ForestHeader({ name, unread }: { name: string; unread: number }) {
  const firstName = name.split(" ")[0] || name;

  return (
    <header className="sticky top-0 z-40 border-b border-amber/25 bg-[#0c1210]/90 text-[#f3eee4] backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <Brand />
          <Link href="/dashboard/profile" className="mt-0.5 block truncate text-xs text-[#f3eee4]/70 hover:text-amber">
            Hey, {firstName}
          </Link>
        </div>
        <div className="flex items-center gap-2 text-sm sm:gap-3">
          <ThemeToggle inverted />
          <Link
            href="/dashboard/notifications"
            className="relative rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-[#f3eee4]/90 hover:border-amber/40 hover:text-amber"
          >
            Alerts
            <LiveAlertsBadge initialCount={unread} />
          </Link>
          <form action={logoutAction}>
            <button type="submit" className={buttonClass("ghost", "h-8 border border-amber/35 px-3 text-xs text-amber hover:bg-amber/10")}>
              Log out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
