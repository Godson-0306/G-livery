import { formatAgentRating } from "@/lib/agents";
import { cn } from "@/lib/utils";

export function StarGlyphs({ value, className }: { value: number; className?: string }) {
  const filled = Math.max(0, Math.min(5, Math.round(value)));
  return (
    <span className={cn("inline-flex tracking-tight text-amber", className)} aria-hidden>
      {"★".repeat(filled)}
      {"☆".repeat(5 - filled)}
    </span>
  );
}

export function AgentRatingLine({
  averageStars,
  ratingCount,
  className,
}: {
  averageStars: number | null;
  ratingCount: number;
  className?: string;
}) {
  return (
    <p className={cn("text-sm", className)}>
      {ratingCount > 0 && averageStars != null ? (
        <>
          <StarGlyphs value={averageStars} className="mr-1.5 align-middle" />
          {formatAgentRating(averageStars, ratingCount)}
        </>
      ) : (
        formatAgentRating(averageStars, ratingCount)
      )}
    </p>
  );
}
