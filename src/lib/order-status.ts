import type { OrderStatus } from "@prisma/client";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  placed: "Placed",
  accepted: "Accepted",
  preparing: "Preparing",
  ready: "Packed",
  picked_up: "On the way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const ORDER_STATUS_CLASS: Record<OrderStatus, string> = {
  placed: "bg-amber-100 text-amber-900 border-amber-200",
  accepted: "bg-sky-100 text-sky-900 border-sky-200",
  preparing: "bg-orange-100 text-orange-900 border-orange-200",
  ready: "bg-emerald-100 text-emerald-900 border-emerald-200",
  picked_up: "bg-violet-100 text-violet-900 border-violet-200",
  delivered: "bg-green-100 text-green-900 border-green-200",
  cancelled: "bg-rose-100 text-rose-900 border-rose-200",
};

export const ORDER_FLOW: OrderStatus[] = [
  "placed",
  "accepted",
  "preparing",
  "ready",
  "picked_up",
  "delivered",
];
