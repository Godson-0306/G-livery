import { formatAgentQueue } from "@/lib/agents";
import { cn } from "@/lib/utils";

export function QueueBadge({ count, className }: { count: number; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
        count > 0
          ? "bg-amber/25 text-amber-950 dark:text-amber-100"
          : "border border-amber/30 bg-transparent text-amber",
        className,
      )}
    >
      {formatAgentQueue(count)}
    </span>
  );
}
