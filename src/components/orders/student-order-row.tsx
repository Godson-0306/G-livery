import { CafeteriaLogo } from "@/components/cafeteria-logo";
import { Card } from "@/components/ui/card";
import { StatusChip } from "@/components/ui/status-chip";
import { formatNgn } from "@/lib/money";
import { formatWhen } from "@/lib/when";
import type { OrderStatus } from "@prisma/client";
import Link from "next/link";

export function StudentOrderRow({
  href,
  cafeteriaName,
  cafeteriaLogoUrl,
  amount,
  location,
  createdAt,
  status,
}: {
  href: string;
  cafeteriaName: string;
  cafeteriaLogoUrl?: string | null;
  amount: { toString(): string } | number;
  location: string;
  createdAt: Date | string;
  status: OrderStatus;
}) {
  return (
    <Link href={href} className="block">
      <Card className="flex items-center gap-3 py-3.5 transition hover:border-amber/45">
        <CafeteriaLogo src={cafeteriaLogoUrl} name={cafeteriaName} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate font-semibold text-forest">{cafeteriaName}</p>
            <StatusChip status={status} />
          </div>
          <p className="mt-0.5 text-sm font-semibold tabular-nums text-forest">{formatNgn(amount)}</p>
          <p className="mt-0.5 truncate text-sm text-muted">
            {location} · {formatWhen(createdAt)}
          </p>
        </div>
      </Card>
    </Link>
  );
}
