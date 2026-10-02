import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
  padded = true,
}: {
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div className={cn("surface rounded-[1.35rem]", padded && "p-5 sm:p-6", className)}>
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Card className="min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber">{label}</p>
      <p className="mt-2 font-display text-2xl font-medium tabular-nums leading-tight tracking-tight text-heading sm:text-3xl">
        {value}
      </p>
    </Card>
  );
}
