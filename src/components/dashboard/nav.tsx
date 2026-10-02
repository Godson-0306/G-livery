"use client";

import { NavIcon } from "@/components/ui/nav-icon";
import { navLinkIsActive, type AppNavLink } from "@/lib/nav";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AppTabBar({ links }: { links: AppNavLink[] }) {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card/95 pb-[max(0.4rem,env(safe-area-inset-bottom))] backdrop-blur">
      <ul
        className="mx-auto grid max-w-5xl"
        style={{ gridTemplateColumns: `repeat(${links.length}, minmax(0, 1fr))` }}
      >
        {links.map((link) => {
          const active = navLinkIsActive(pathname, link.href, links);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 text-center text-[11px] font-semibold",
                  active ? "text-forest" : "text-muted",
                )}
              >
                <NavIcon name={link.icon} />
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
