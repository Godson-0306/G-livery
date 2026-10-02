import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-forest text-white hover:bg-forest-dark disabled:opacity-60",
  secondary:
    "bg-transparent text-heading border border-amber/35 hover:bg-amber/10 disabled:opacity-60",
  amber: "bg-amber text-stone-900 hover:bg-amber/90 disabled:opacity-60",
  danger: "bg-rose-700 text-white hover:bg-rose-800 disabled:opacity-60",
  ghost: "bg-transparent text-heading hover:bg-forest/10 disabled:opacity-60",
};

export function buttonClass(
  variant: keyof typeof variants = "primary",
  className?: string,
) {
  return cn(
    "inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold tracking-wide transition",
    variants[variant],
    className,
  );
}
