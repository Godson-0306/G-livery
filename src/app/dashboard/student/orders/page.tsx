import { requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { StatusChip } from "@/components/ui/status-chip";
import { formatNgn } from "@/lib/money";
import { RefreshOnInterval } from "@/components/refresh-on-interval";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import Link from "next/link";

export default async function StudentOrdersPage() {
  const session = await requireRole("student");
  const orders = await prisma.order.findMany({
    where: { studentId: session.user.id },
    include: { cafeteria: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <RefreshOnInterval />
      <PageHeader
        eyebrow="Student"
        title="Order history"
        subtitle="Open any order to see the timeline and who to pay."
      />
      {orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          body="Browse a cafeteria and place your first bag. Tracking and transfer details show up here."
          actionHref="/cafeterias"
          actionLabel="Browse cafeterias"
        />
      ) : (
        <ul className="space-y-2">
          {orders.map((order) => (
            <li key={order.id}>
              <Link href={`/dashboard/student/orders/${order.id}`}>
                <Card className="flex items-center justify-between gap-3 py-3">
                  <span>
                    {order.cafeteria.name} · {formatNgn(order.totalAmount)}
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
