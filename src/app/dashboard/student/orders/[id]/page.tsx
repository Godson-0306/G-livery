import { requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { StatusActions } from "@/components/orders/status-actions";
import { formatNgn } from "@/lib/money";
import { RefreshOnInterval } from "@/components/refresh-on-interval";
import { ClearCart } from "@/components/cart/clear-cart";
import { Card } from "@/components/ui/card";
import { OrderTrackPanel } from "@/components/orders/order-track-panel";
import { RateAgentForm } from "@/components/agents/rate-agent-form";
import { CafeteriaLogo } from "@/components/cafeteria-logo";
import { fetchRunnerPayout } from "@/lib/payout-db";
import { notFound } from "next/navigation";
import Link from "next/link";

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
      <Link href="/dashboard/student/orders" className="text-sm font-semibold text-forest">
        ← History
      </Link>
      <div className="flex items-start gap-4">
        <CafeteriaLogo src={order.cafeteria.logoUrl} name={order.cafeteria.name} size="lg" />
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber">Your order</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-forest sm:text-3xl">
            {order.cafeteria.name}
          </h1>
          <p className="mt-1 text-sm text-muted">Drop-off · {order.deliveryLocation}</p>
          {order.runner ? (
            <p className="mt-0.5 text-sm text-muted">Agent · {order.runner.user.name}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(18rem,22rem)_1fr] lg:items-start">
        <div className="lg:sticky lg:top-24">
          <OrderTrackPanel
            status={order.status}
            amount={Number(order.totalAmount)}
            runnerName={order.runner?.user.name}
            payout={agentPayout}
          />
        </div>
        <div className="space-y-4">
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
                <li key={item.id} className="flex justify-between gap-3 px-5 py-3 text-sm">
                  <span>
                    {item.quantity}× {item.menuItem.name}
                  </span>
                  <span className="shrink-0 font-medium tabular-nums">
                    {formatNgn(Number(item.priceAtOrder) * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <p className="border-t border-line px-5 py-3 text-right font-semibold tabular-nums">
              Food total {formatNgn(order.totalAmount)}
            </p>
          </Card>
          <StatusActions orderId={order.id} status={order.status} role="student" />
        </div>
      </div>
    </div>
  );
}
