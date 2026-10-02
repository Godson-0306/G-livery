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
    <div className={cn("surface rounded-[1.4rem]", padded && "p-5", className)}>
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
    <Card className="min-w-0 bg-forest-soft/60">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className="mt-2 text-xl font-semibold tabular-nums leading-tight tracking-tight text-forest sm:text-2xl">
        {value}
      </p>
    </Card>
  );
}
