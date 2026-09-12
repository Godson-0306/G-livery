import { cn } from "@/lib/utils";

const variants = {
  primary:
    "bg-forest text-white hover:bg-forest-dark disabled:opacity-60",
  secondary:
    "bg-card text-forest border border-forest/20 hover:bg-forest-soft disabled:opacity-60",
  amber:
    "bg-amber text-stone-900 hover:bg-amber/90 disabled:opacity-60",
  danger:
    "bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-60",
  ghost:
    "bg-transparent text-forest hover:bg-forest/10 disabled:opacity-60",
};

export function buttonClass(
  variant: keyof typeof variants = "primary",
  className?: string,
) {
  return cn(
    "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition",
    variants[variant],
    className,
  );
}
