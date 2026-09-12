import { requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { isRunnerLive, syncRunnerSubscription } from "@/lib/subscription";
import { StatusChip } from "@/components/ui/status-chip";
import { StatusActions } from "@/components/orders/status-actions";
import { formatNgn } from "@/lib/money";
import { RefreshOnInterval } from "@/components/refresh-on-interval";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import Link from "next/link";

export default async function RunnerOrdersPage() {
  const session = await requireRole("runner");
  const runner = await prisma.runner.findUnique({ where: { userId: session.user.id } });
  if (!runner) return <p>Delivery agent profile missing.</p>;
  await syncRunnerSubscription(runner.id);
  const live = isRunnerLive((await prisma.runner.findUnique({ where: { id: runner.id } }))!);

  const [pool, mine, active] = await Promise.all([
    prisma.order.findMany({
      where: { status: "placed", runnerId: null },
      include: { cafeteria: true, student: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.order.findMany({
      where: { status: "placed", runnerId: runner.id },
      include: { cafeteria: true, student: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.order.findMany({
      where: {
        runnerId: runner.id,
        status: { in: ["accepted", "preparing", "ready", "picked_up"] },
      },
      include: { cafeteria: true, student: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-8">
      <RefreshOnInterval />
      <PageHeader
        eyebrow="Delivery agent"
        title="Orders board"
        subtitle="Link jobs first, then the campus pool. Accept, pick up, and deliver with the large buttons."
      />
      {!live ? (
        <p className="rounded-2xl bg-amber/20 px-4 py-3 text-sm">
          Your subscription is not active. You can look, but you cannot accept until an admin or
          Flutterwave payment activates you.
        </p>
      ) : null}

      <section>
        <h2 className="font-semibold text-forest">Via your link</h2>
        <p className="text-sm text-muted">Students who ordered through your personal page.</p>
        <OrderList orders={mine} live={live} tagged empty="No tagged orders waiting. Share your link." />
      </section>
      <section>
        <h2 className="font-semibold text-forest">General pool</h2>
        <p className="text-sm text-muted">Open campus orders with no agent yet.</p>
        <OrderList orders={pool} live={live} empty="Pool is quiet. Check back in a bit." />
      </section>
      <section>
        <h2 className="font-semibold text-forest">In progress</h2>
        <OrderList
          orders={active}
          live={live}
          empty="Nothing in motion. Accepted jobs will wait here for pickup and delivery."
        />
      </section>
    </div>
  );
}

function OrderList({
  orders,
  live,
  tagged = false,
  empty,
}: {
  orders: Array<{
    id: string;
    status: "placed" | "accepted" | "preparing" | "ready" | "picked_up" | "delivered" | "cancelled";
    totalAmount: { toString(): string };
    deliveryLocation: string;
    cafeteria: { name: string };
    student: { name: string };
  }>;
  live: boolean;
  tagged?: boolean;
  empty: string;
}) {
  if (orders.length === 0) {
    return (
      <div className="mt-3">
        <EmptyState title="Nothing here" body={empty} />
      </div>
    );
  }

  return (
    <ul className="mt-3 space-y-3">
      {orders.map((order) => (
        <li key={order.id}>
          <Card>
            <div className="flex items-start justify-between gap-2">
              <Link href={`/dashboard/runner/orders/${order.id}`} className="font-medium text-forest">
                {order.cafeteria.name} · {formatNgn(order.totalAmount)}
              </Link>
              <StatusChip status={order.status} />
            </div>
            <p className="mt-1 text-sm text-muted">
              {order.student.name} · {order.deliveryLocation}
            </p>
            {live ? (
              <div className="mt-4">
                <StatusActions
                  orderId={order.id}
                  status={order.status}
                  role="runner"
                  taggedToMe={tagged}
                />
              </div>
            ) : null}
          </Card>
        </li>
      ))}
    </ul>
  );
}
