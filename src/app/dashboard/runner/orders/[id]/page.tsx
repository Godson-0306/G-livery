import { requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { StatusChip } from "@/components/ui/status-chip";
import { StatusActions } from "@/components/orders/status-actions";
import { formatNgn } from "@/lib/money";
import { RefreshOnInterval } from "@/components/refresh-on-interval";
import { isRunnerLive, syncRunnerSubscription } from "@/lib/subscription";
import { Card } from "@/components/ui/card";
import { OrderTimeline } from "@/components/ui/order-timeline";
import { PageHeader } from "@/components/ui/page-header";
import { notFound } from "next/navigation";

export default async function RunnerOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole("runner");
  const { id } = await params;
  const runner = await prisma.runner.findUnique({ where: { userId: session.user.id } });
  if (!runner) notFound();
  await syncRunnerSubscription(runner.id);
  const live = isRunnerLive((await prisma.runner.findUnique({ where: { id: runner.id } }))!);

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      cafeteria: true,
      student: true,
      items: { include: { menuItem: true } },
    },
  });
  if (!order) notFound();
  if (order.runnerId && order.runnerId !== runner.id && order.status !== "placed") notFound();

  const taggedToMe = order.runnerId === runner.id;

  return (
    <div className="space-y-4">
      <RefreshOnInterval />
      <PageHeader
        eyebrow="Delivery"
        title={order.cafeteria.name}
        subtitle={`${order.student.name} · ${order.student.phone ?? "no phone"} · ${order.deliveryLocation}`}
        action={<StatusChip status={order.status} />}
      />
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
      {live ? (
        <StatusActions
          orderId={order.id}
          status={order.status}
          role="runner"
          taggedToMe={taggedToMe && order.status === "placed"}
        />
      ) : (
        <p className="rounded-2xl bg-amber/20 px-4 py-3 text-sm">
          Activate your subscription to accept, pick up, or deliver this order.
        </p>
      )}
    </div>
  );
}
