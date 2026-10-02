import type { OrderStatus } from "@prisma/client";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  placed: "Placed",
  accepted: "Accepted",
  picked_up: "On the way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const ORDER_STATUS_CLASS: Record<OrderStatus, string> = {
  placed: "bg-amber/15 text-amber border-amber/30",
  accepted: "bg-sky-500/10 text-sky-800 border-sky-500/25 dark:text-sky-200",
  picked_up: "bg-violet-500/10 text-violet-800 border-violet-500/25 dark:text-violet-200",
  delivered: "bg-forest/15 text-heading border-forest/30",
  cancelled: "bg-rose-500/10 text-rose-800 border-rose-500/25 dark:text-rose-200",
};

export const ORDER_FLOW: OrderStatus[] = ["placed", "accepted", "picked_up", "delivered"];

export const OPEN_JOB_STATUSES: OrderStatus[] = ["placed", "accepted", "picked_up"];

export const ORDER_STATUS_HEADLINE: Record<OrderStatus, string> = {
  placed: "Waiting for an agent",
  accepted: "Transfer the food total",
  picked_up: "Your agent is on the way",
  delivered: "Delivered",
  cancelled: "This order was cancelled",
};

export function isOpenJob(status: string) {
  return (OPEN_JOB_STATUSES as string[]).includes(status);
}
