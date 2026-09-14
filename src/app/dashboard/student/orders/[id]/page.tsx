import { requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { StatusChip } from "@/components/ui/status-chip";
import { StatusActions } from "@/components/orders/status-actions";
import { formatNgn } from "@/lib/money";
import { RefreshOnInterval } from "@/components/refresh-on-interval";
import { ClearCart } from "@/components/cart/clear-cart";
import { Card } from "@/components/ui/card";
import { OrderTimeline } from "@/components/ui/order-timeline";
import { PageHeader } from "@/components/ui/page-header";
import { PayAgentCard } from "@/components/pay-agent-card";
import { RateAgentForm } from "@/components/agents/rate-agent-form";
import { fetchRunnerPayout } from "@/lib/payout-db";
import { notFound } from "next/navigation";

export default async function StudentOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole("student");
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      cafeteria: true,
      runner: { include: { user: true } },
      items: { include: { menuItem: true } },
      rating: true,
    },
  });
  if (!order || order.studentId !== session.user.id) notFound();
  const agentPayout = order.runner ? await fetchRunnerPayout(order.runner.id) : null;

  return (
    <div className="space-y-5">
      <ClearCart />
      <RefreshOnInterval />
      <PageHeader
        eyebrow="Your order"
        title={order.cafeteria.name}
        subtitle={`Deliver to ${order.deliveryLocation}${order.runner ? ` · agent ${order.runner.user.name}` : " · waiting for an agent"}`}
        action={<StatusChip status={order.status} />}
      />
      <OrderTimeline status={order.status} />
      {order.runner && agentPayout ? (
        <PayAgentCard
          agentName={order.runner.user.name}
          bankName={agentPayout.bankName}
          accountName={agentPayout.accountName}
          accountNumber={agentPayout.accountNumber}
          amount={Number(order.totalAmount)}
        />
      ) : (
        <Card>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber">Pay the Agent</p>
          <h2 className="mt-1 text-lg font-semibold text-forest">Waiting for an Agent</h2>
          <p className="mt-1 text-sm text-muted">
            Food total {formatNgn(order.totalAmount)}. After an Agent accepts, transfer that amount to
            them — they pay the cafeteria when they pick up.
          </p>
        </Card>
      )}
      {order.status === "delivered" && order.runner ? (
        <Card>
          <RateAgentForm
            orderId={order.id}
            agentName={order.runner.user.name}
            existingStars={order.rating?.stars ?? null}
          />
        </Card>
      ) : null}
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
      <StatusActions orderId={order.id} status={order.status} role="student" />
    </div>
  );
}
