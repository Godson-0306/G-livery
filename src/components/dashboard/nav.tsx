"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function DashboardNav({
  links,
  variant,
}: {
  links: Array<{ href: string; label: string }>;
  variant: "top" | "bottom";
}) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (pathname === href) return true;
    if (!pathname.startsWith(`${href}/`)) return false;
    const moreSpecific = links.some(
      (link) =>
        link.href !== href &&
        link.href.length > href.length &&
        (pathname === link.href || pathname.startsWith(`${link.href}/`)),
    );
    return !moreSpecific;
  }

  if (variant === "bottom") {
    return (
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card/95 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
        <ul
          className="mx-auto grid max-w-5xl"
          style={{ gridTemplateColumns: `repeat(${links.length}, minmax(0, 1fr))` }}
        >
          {links.map((link) => {
            const active = isActive(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "flex min-h-14 flex-col items-center justify-center px-1 text-center text-[11px] font-semibold",
                    active ? "text-forest" : "text-muted",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }

  return (
    <nav className="mx-auto hidden max-w-5xl gap-1 overflow-x-auto px-3 pb-2 md:flex">
      {links.map((link) => {
        const active = isActive(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "whitespace-nowrap rounded-full px-3 py-1.5 text-sm",
              active ? "bg-white/15 text-white" : "text-emerald-50 hover:bg-white/10",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
