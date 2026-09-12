import { auth } from "@/auth";
import { Brand } from "@/components/brand";
import { buttonClass } from "@/components/ui/button";
import { DASHBOARD_HOME } from "@/auth.config";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

export async function SiteHeader() {
  const session = await auth();
  const home = session?.user ? DASHBOARD_HOME[session.user.role] : null;

  return (
    <header className="sticky top-0 z-20 border-b border-line/80 bg-background/90 backdrop-blur">
      <div className="page-wrap flex h-14 items-center justify-between">
        <Brand />
        <nav className="flex items-center gap-2 text-sm sm:gap-3">
          <ThemeToggle />
          <Link href="/cafeterias" className="hidden text-muted hover:text-forest sm:inline">
            Browse
          </Link>
          {home ? (
            <Link href={home} className={buttonClass("primary", "h-9 px-3")}>
              Dashboard
            </Link>
          ) : (
            <>
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
  );
}
