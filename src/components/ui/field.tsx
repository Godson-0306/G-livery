import { cn } from "@/lib/utils";

export function fieldClass(className?: string) {
  return cn(
    "mt-1.5 w-full rounded-xl border border-line bg-card px-3.5 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted/70 focus:border-amber/60 focus:ring-2 focus:ring-amber/15",
    className,
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-medium text-heading">
      {label}
      {children}
      {hint ? <span className="mt-1 block text-xs font-normal text-muted">{hint}</span> : null}
    </label>
  );
}
