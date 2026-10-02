import { requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { formatNgn } from "@/lib/money";
import Link from "next/link";
import { Card, StatCard } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { StatusChip } from "@/components/ui/status-chip";

export default async function AdminHomePage() {
  await requireRole("admin");

  const [orders, activeRunners, activeCafeterias, users, recent] = await Promise.all([
    prisma.order.count(),
    prisma.runner.count({ where: { subscriptionStatus: "active" } }),
    prisma.cafeteria.count({ where: { isActive: true } }),
    prisma.user.count(),
    prisma.order.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { cafeteria: true, student: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Platform overview"
        subtitle="Kitchens, agents, and orders across campus. Activate subscriptions and kitchens from their lists."
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Orders" value={orders} />
        <StatCard label="Active agents" value={activeRunners} />
        <StatCard label="Active kitchens" value={activeCafeterias} />
        <StatCard label="Users" value={users} />
      </div>
      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-medium text-heading">Recent orders</h2>
          <Link href="/dashboard/admin/orders" className="text-sm font-semibold text-forest">
            View all
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="mt-3">
            <EmptyState title="No orders yet" body="Live campus traffic will show up here." />
          </div>
        ) : (
          <ul className="mt-3 space-y-2">
            {recent.map((order) => (
              <li key={order.id}>
                <Card className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                  <span>
                    <span className="font-medium text-forest">{order.cafeteria.name}</span>
                    {" · "}
                    {formatNgn(order.totalAmount)} · {order.student.name}
                  </span>
                  <StatusChip status={order.status} />
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
