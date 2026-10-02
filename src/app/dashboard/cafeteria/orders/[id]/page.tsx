import { requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { StatusChip } from "@/components/ui/status-chip";
import { formatNgn } from "@/lib/money";
import { RefreshOnInterval } from "@/components/refresh-on-interval";
import { Card } from "@/components/ui/card";
import { OrderTimeline } from "@/components/ui/order-timeline";
import { PageHeader } from "@/components/ui/page-header";
import { notFound } from "next/navigation";

export default async function CafeteriaOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole("cafeteria");
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      cafeteria: true,
      student: true,
      items: { include: { menuItem: true } },
    },
  });
  if (!order || order.cafeteria.ownerId !== session.user.id) notFound();
  if (order.status === "placed" || order.status === "cancelled") notFound();

  return (
    <div className="space-y-4">
      <RefreshOnInterval />
      <PageHeader
        eyebrow="Kitchen ticket"
        title={order.student.name}
        subtitle={order.deliveryLocation}
        action={<StatusChip status={order.status} />}
      />
      <p className="text-sm text-muted">
        Cook this ticket. Delivery status is updated by the agent.
      </p>
      <OrderTimeline status={order.status} />
      <Card padded={false}>
        <ul className="divide-y divide-line">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between px-5 py-3 text-sm">
              <span>
                {item.quantity}× {item.menuItem.name}
              </span>
              <span>{formatNgn(Number(item.priceAtOrder) * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <p className="border-t border-line px-5 py-3 text-right font-semibold">
          Food total {formatNgn(order.totalAmount)}
        </p>
      </Card>
    </div>
  );
}
