import { ORDER_STATUS_CLASS, ORDER_STATUS_LABEL } from "@/lib/order-status";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@prisma/client";

export function StatusChip({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        ORDER_STATUS_CLASS[status],
      )}
    >
      {ORDER_STATUS_LABEL[status]}
    </span>
  );
}
