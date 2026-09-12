import { buttonClass } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export function EmptyState({
  title,
  body,
  actionHref,
  actionLabel,
}: {
  title: string;
  body: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <Card className="text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-soft text-lg font-semibold text-forest">
        G
      </div>
      <h3 className="mt-4 text-lg font-semibold text-forest">{title}</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted">{body}</p>
      {actionHref && actionLabel ? (
        <Link href={actionHref} className={buttonClass("primary", "mt-5")}>
          {actionLabel}
        </Link>
      ) : null}
    </Card>
  );
}
