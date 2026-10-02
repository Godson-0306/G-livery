import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber">{eyebrow}</p>
        ) : null}
        <h1 className="mt-1 font-display text-3xl font-medium tracking-tight text-heading sm:text-4xl">{title}</h1>
        {subtitle ? <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}
