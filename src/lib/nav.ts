import type { Role } from "@prisma/client";

export type NavIconName =
  | "home"
  | "browse"
  | "agents"
  | "orders"
  | "profile"
  | "menu"
  | "qr"
  | "customers"
  | "plan"
  | "users"
  | "overview"
  | "kitchens";

export type AppNavLink = {
  href: string;
  label: string;
  icon: NavIconName;
};

export const ROLE_NAV: Record<Role, AppNavLink[]> = {
  admin: [
    { href: "/dashboard/admin", label: "Overview", icon: "overview" },
    { href: "/dashboard/admin/cafeterias", label: "Cafeterias", icon: "kitchens" },
    { href: "/dashboard/admin/runners", label: "Agents", icon: "agents" },
    { href: "/dashboard/admin/orders", label: "Orders", icon: "orders" },
    { href: "/dashboard/admin/users", label: "Users", icon: "users" },
    { href: "/dashboard/profile", label: "Profile", icon: "profile" },
  ],
  cafeteria: [
    { href: "/dashboard/cafeteria", label: "Home", icon: "home" },
    { href: "/dashboard/cafeteria/menu", label: "Menu", icon: "menu" },
    { href: "/dashboard/cafeteria/orders", label: "Orders", icon: "orders" },
    { href: "/dashboard/cafeteria/qr", label: "QR", icon: "qr" },
    { href: "/dashboard/profile", label: "Profile", icon: "profile" },
  ],
  runner: [
    { href: "/dashboard/runner", label: "Home", icon: "home" },
    { href: "/dashboard/runner/orders", label: "Orders", icon: "orders" },
    { href: "/dashboard/runner/customers", label: "Customers", icon: "customers" },
    { href: "/dashboard/runner/subscribe", label: "Plan", icon: "plan" },
    { href: "/dashboard/profile", label: "Profile", icon: "profile" },
  ],
  student: [
    { href: "/dashboard/student", label: "Home", icon: "home" },
    { href: "/cafeterias", label: "Browse", icon: "browse" },
    { href: "/agents", label: "Agents", icon: "agents" },
    { href: "/dashboard/student/orders", label: "Orders", icon: "orders" },
    { href: "/dashboard/profile", label: "Profile", icon: "profile" },
  ],
};

export function navLinkIsActive(pathname: string, href: string, links: AppNavLink[]) {
  if (href === "/cafeterias" && (pathname.startsWith("/cafeteria/") || pathname === "/checkout")) {
    return true;
  }
  if (href === "/agents" && pathname.startsWith("/r/")) return true;
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
