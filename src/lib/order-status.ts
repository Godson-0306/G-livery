import type { OrderStatus } from "@prisma/client";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  placed: "Placed",
  accepted: "Accepted",
  picked_up: "On the way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const ORDER_STATUS_CLASS: Record<OrderStatus, string> = {
  placed: "bg-amber-100 text-amber-900 border-amber-200",
  accepted: "bg-sky-100 text-sky-900 border-sky-200",
  picked_up: "bg-violet-100 text-violet-900 border-violet-200",
  delivered: "bg-green-100 text-green-900 border-green-200",
  cancelled: "bg-rose-100 text-rose-900 border-rose-200",
};

export const ORDER_FLOW: OrderStatus[] = ["placed", "accepted", "picked_up", "delivered"];

export const OPEN_JOB_STATUSES: OrderStatus[] = ["placed", "accepted", "picked_up"];

export function isOpenJob(status: string) {
  return (OPEN_JOB_STATUSES as string[]).includes(status);
}
