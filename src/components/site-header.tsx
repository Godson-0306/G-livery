import { auth } from "@/auth";
import { Brand } from "@/components/brand";
import { AppTabBar } from "@/components/dashboard/nav";
import { buttonClass } from "@/components/ui/button";
import { DASHBOARD_HOME } from "@/auth.config";
import { ThemeToggle } from "@/components/theme-toggle";
import { ROLE_NAV } from "@/lib/nav";
import Link from "next/link";

export async function SiteHeader() {
  const session = await auth();
  const role = session?.user.role;
  const home = role ? DASHBOARD_HOME[role] : null;
  const links = role ? ROLE_NAV[role] : null;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line/80 bg-background/90 backdrop-blur">
        <div className="page-wrap flex h-16 items-center justify-between">
          <Brand />
          <nav className="flex items-center gap-2 text-sm sm:gap-3">
            <ThemeToggle />
            {home ? (
              <Link href={home} className={buttonClass("primary", "h-9 px-3")}>
                Dashboard
              </Link>
            ) : (
              <>
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
              </>
            )}
          </nav>
        </div>
      </header>
      {links ? <AppTabBar links={links} /> : null}
    </>
  );
}
