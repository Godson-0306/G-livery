import { cn } from "@/lib/utils";

export function fieldClass(className?: string) {
  return cn(
    "mt-1.5 w-full rounded-2xl border border-line bg-card px-3.5 py-2.5 text-sm text-foreground outline-none transition placeholder:text-stone-400 focus:border-forest focus:ring-2 focus:ring-forest/15",
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
    <label className="block text-sm font-medium text-foreground">
      {label}
      {children}
      {hint ? <span className="mt-1 block text-xs font-normal text-muted">{hint}</span> : null}
    </label>
  );
}
