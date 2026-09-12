import { requireRole } from "@/lib/auth-guards";
import { StatusChip } from "@/components/ui/status-chip";
import { prisma } from "@/lib/prisma";
import { formatNgn } from "@/lib/money";
import type { OrderStatus } from "@prisma/client";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { cn } from "@/lib/utils";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireRole("admin");
  const { status } = await searchParams;
  const filter = status && status !== "all" ? (status as OrderStatus) : undefined;

  const orders = await prisma.order.findMany({
    where: filter ? { status: filter } : undefined,
    include: { cafeteria: true, student: true, runner: { include: { user: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const statuses = ["all", "placed", "accepted", "preparing", "ready", "picked_up", "delivered", "cancelled"];

  return (
    <div className="space-y-4">
      <PageHeader eyebrow="Admin" title="All orders" subtitle="Filter by status. Totals are food-only." />
      <div className="flex flex-wrap gap-2">
        {statuses.map((value) => (
          <Link
            key={value}
            href={value === "all" ? "/dashboard/admin/orders" : `/dashboard/admin/orders?status=${value}`}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-semibold",
              (status ?? "all") === value
                ? "border-forest bg-forest text-white"
                : "border-line text-muted",
            )}
          >
            {value.replace("_", " ")}
          </Link>
        ))}
      </div>
      {orders.length === 0 ? (
        <EmptyState title="No matching orders" body="Try another status, or wait for campus traffic." />
      ) : (
        <ul className="space-y-2">
          {orders.map((order) => (
            <li key={order.id}>
              <Card>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-forest">
                    {order.cafeteria.name} · {formatNgn(order.totalAmount)}
                  </p>
                  <StatusChip status={order.status} />
                </div>
                <p className="mt-1 text-sm text-muted">
                  {order.student.name} → {order.deliveryLocation}
                  {order.runner ? ` · agent ${order.runner.user.name}` : " · unassigned"}
                </p>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
