import { ORDER_FLOW, ORDER_STATUS_LABEL } from "@/lib/order-status";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@prisma/client";

export function OrderTimeline({ status }: { status: OrderStatus }) {
  if (status === "cancelled") {
    return (
      <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800 dark:bg-rose-950/40 dark:text-rose-200">
        This order was cancelled.
      </p>
    );
  }

  const currentIndex = ORDER_FLOW.indexOf(status);

  return (
    <ol className="grid grid-cols-3 gap-2 sm:grid-cols-6">
      {ORDER_FLOW.map((step, index) => {
        const done = index <= currentIndex;
        const current = index === currentIndex;
        return (
          <li
            key={step}
            className={cn(
              "rounded-2xl px-2 py-2 text-center text-[11px] font-semibold leading-tight transition",
              current
                ? "bg-forest text-white shadow-sm"
                : done
                  ? "bg-forest-soft text-forest"
                  : "bg-stone-100 text-stone-400",
            )}
          >
            {ORDER_STATUS_LABEL[step]}
          </li>
        );
      })}
    </ol>
  );
}
