import { auth } from "@/auth";
import { Brand } from "@/components/brand";
import { AppTabBar } from "@/components/dashboard/nav";
import { ForestHeader } from "@/components/forest-header";
import { buttonClass } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { ROLE_NAV } from "@/lib/nav";
import { unreadCount } from "@/lib/notifications";
import Link from "next/link";

export async function SiteHeader() {
  const session = await auth();
  const role = session?.user.role;
  const links = role ? ROLE_NAV[role] : null;

  if (session?.user && links) {
    const unread = await unreadCount(session.user.id);
    return (
      <>
        <ForestHeader
          name={session.user.name ?? session.user.email ?? "Account"}
          unread={unread}
        />
        <AppTabBar links={links} />
      </>
    );
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-background/90 backdrop-blur">
      <div className="page-wrap flex h-16 items-center justify-between">
        <Brand />
        <nav className="flex items-center gap-2 text-sm sm:gap-3">
          <ThemeToggle />
          <Link href="/cafeterias" className="hidden text-muted hover:text-forest sm:inline">
            Browse
          </Link>
          <Link href="/agents" className="hidden text-muted hover:text-forest sm:inline">
            Agents
          </Link>
          <Link href="/login" className="text-muted hover:text-forest">
            Log in
          </Link>
          <Link href="/signup/student" className={buttonClass("primary", "h-9 px-3")}>
            Order food
          </Link>
        </nav>
      </div>
    </header>
  );
}
