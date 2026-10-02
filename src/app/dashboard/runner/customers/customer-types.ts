export type CustomerRow = {
  id: string;
  name: string;
  phone: string | null;
  email: string;
  orders: number;
  delivered: number;
  active: number;
  volume: number;
  lastOrderAt: string;
  lastLocation: string;
  lastCafeteria: string;
};

export { isOpenJob } from "@/lib/order-status";

export function customerInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "S";
  const second = parts[1]?.[0] ?? "";
  return `${first}${second}`.toUpperCase();
}

export function formatWhen(iso: string) {
  const date = new Date(iso);
  const mins = Math.max(0, Math.round((Date.now() - date.getTime()) / 60_000));
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}
