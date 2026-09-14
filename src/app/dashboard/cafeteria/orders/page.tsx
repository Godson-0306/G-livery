import { requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { StatusChip } from "@/components/ui/status-chip";
import { formatNgn } from "@/lib/money";
import { RefreshOnInterval } from "@/components/refresh-on-interval";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import Link from "next/link";

export default async function CafeteriaOrdersPage() {
  const session = await requireRole("cafeteria");
  const cafeteria = await prisma.cafeteria.findFirst({ where: { ownerId: session.user.id } });
  if (!cafeteria) return <p>No cafeteria linked.</p>;

  const orders = await prisma.order.findMany({
    where: { cafeteriaId: cafeteria.id },
    include: { student: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <RefreshOnInterval />
      <PageHeader
        eyebrow="Kitchen"
        title="Kitchen orders"
        subtitle="Open a ticket to start preparing or mark it packed."
      />
      {orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          body="When students order from your e-menu, tickets appear here for the pass."
        />
      ) : (
        <ul className="space-y-2">
          {orders.map((order) => (
            <li key={order.id}>
              <Link href={`/dashboard/cafeteria/orders/${order.id}`}>
                <Card className="flex items-center justify-between gap-3 py-3">
                  <span>
                    {order.student.name} · {formatNgn(order.totalAmount)} · {order.deliveryLocation}
                  </span>
                  <StatusChip status={order.status} />
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
