import { requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { StatusChip } from "@/components/ui/status-chip";
import { formatNgn } from "@/lib/money";
import { RefreshOnInterval } from "@/components/refresh-on-interval";
import { buttonClass } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { OrderTimeline } from "@/components/ui/order-timeline";
import { PageHeader } from "@/components/ui/page-header";
import { PayAgentCard } from "@/components/pay-agent-card";
import { fetchRunnerPayout } from "@/lib/payout-db";
import Link from "next/link";

export default async function StudentHomePage() {
  const session = await requireRole("student");
  const firstName = session.user.name?.split(" ")[0] ?? "there";

  const [active, recent] = await Promise.all([
    prisma.order.findFirst({
      where: {
        studentId: session.user.id,
        status: { notIn: ["delivered", "cancelled"] },
      },
      include: {
        cafeteria: true,
        runner: { include: { user: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.findMany({
      where: { studentId: session.user.id },
      include: { cafeteria: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);
  const activePayout = active?.runner ? await fetchRunnerPayout(active.runner.id) : null;

  return (
    <div className="space-y-6">
      <RefreshOnInterval />
      <PageHeader
        eyebrow="Student"
        title={`Hey ${firstName}`}
        subtitle={
          active
            ? "You have an order in motion. Transfer the food total to the student who delivers."
            : "Browse a cafeteria, tap items, drop your hostel. We’ll keep the rest live."
        }
        action={
          <Link href="/cafeterias" className={buttonClass("primary")}>
            Browse cafeterias
          </Link>
        }
      />

      {active ? (
        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber">Active order</p>
              <h2 className="mt-1 text-lg font-semibold text-forest">{active.cafeteria.name}</h2>
              <p className="text-sm text-muted">
                {formatNgn(active.totalAmount)} · {active.deliveryLocation}
              </p>
            </div>
            <StatusChip status={active.status} />
          </div>
          <div className="mt-4">
            <OrderTimeline status={active.status} />
          </div>
          <div className="mt-4">
            {active.runner && activePayout ? (
              <PayAgentCard
                agentName={active.runner.user.name}
                bankName={activePayout.bankName}
                accountName={activePayout.accountName}
                accountNumber={activePayout.accountNumber}
                amount={Number(active.totalAmount)}
              />
            ) : (
              <div className="rounded-2xl bg-forest-soft/80 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Pay the student</p>
                <p className="mt-1 text-sm">
                  Food total {formatNgn(active.totalAmount)}. After a student agent accepts, transfer that
                  amount to them — they settle the cafeteria.
                </p>
              </div>
            )}
          </div>
          <Link
            href={`/dashboard/student/orders/${active.id}`}
            className={buttonClass("primary", "mt-4 h-11 w-full sm:w-auto")}
          >
            Open order
          </Link>
        </Card>
      ) : (
        <EmptyState
          title="Nothing in motion"
          body="When you place an order you’ll see who to pay — a student agent — plus a live timeline here."
          actionHref="/cafeterias"
          actionLabel="Order food"
        />
      )}

      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-forest">Recent orders</h2>
          <Link href="/dashboard/student/orders" className="text-sm font-semibold text-forest">
            History
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Your history will land here after the first order.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {recent.map((order) => (
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
      </section>
    </div>
  );
}
