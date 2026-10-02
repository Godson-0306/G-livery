import { buttonClass } from "@/components/ui/button";

export function QuantityStepper({
  value,
  onDecrease,
  onIncrease,
}: {
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  return (
    <div className="inline-flex shrink-0 flex-nowrap items-center gap-1.5">
      <button
        type="button"
        className={buttonClass("secondary", "h-10 w-10 shrink-0 p-0")}
        onClick={onDecrease}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="w-7 text-center text-sm font-semibold tabular-nums">{value}</span>
      <button
        type="button"
        className={buttonClass("primary", "h-10 w-10 shrink-0 p-0")}
        onClick={onIncrease}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
