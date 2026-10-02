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
    <ol className="flex flex-col md:flex-row md:items-start">
      {ORDER_FLOW.map((step, index) => {
        const done = index <= currentIndex;
        const current = index === currentIndex;
        const last = index === ORDER_FLOW.length - 1;
        const connectorOn = index < currentIndex;
        return (
          <li key={step} className="flex min-h-0 min-w-0 md:flex-1 md:flex-col">
            <div className="flex flex-col items-center md:w-full md:flex-row">
              <span
                className={cn(
                  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                  current
                    ? "bg-forest text-white"
                    : done
                      ? "bg-forest-soft text-forest"
                      : "bg-stone-200 text-stone-400 dark:bg-stone-700 dark:text-stone-400",
                )}
                aria-current={current ? "step" : undefined}
              >
                {index + 1}
              </span>
              {!last ? (
                <span
                  className={cn(
                    "w-px min-h-6 flex-1 md:h-px md:min-h-0 md:w-auto",
                    connectorOn ? "bg-forest" : "bg-line",
                  )}
                />
              ) : null}
            </div>
            <p
              className={cn(
                "ml-3 pb-5 text-sm font-semibold md:ml-0 md:mt-2 md:pb-0 md:text-center",
                last && "pb-0",
                current ? "text-forest" : done ? "text-forest/80" : "text-muted",
              )}
            >
              {ORDER_STATUS_LABEL[step]}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
