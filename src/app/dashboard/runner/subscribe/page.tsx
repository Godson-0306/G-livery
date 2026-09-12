import { requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { formatNgn, subscriptionAmount, subscriptionDays } from "@/lib/money";
import { isFlutterwaveConfigured } from "@/lib/flutterwave";
import { syncRunnerSubscription } from "@/lib/subscription";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { SubscribeButton } from "./subscribe-button";

export default async function RunnerSubscribePage() {
  const session = await requireRole("runner");
  const runner = await prisma.runner.findUnique({
    where: { userId: session.user.id },
    include: { subscriptions: { orderBy: { createdAt: "desc" }, take: 8 } },
  });
  if (!runner) return <p>Delivery agent profile missing.</p>;
  await syncRunnerSubscription(runner.id);

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Delivery agent"
        title="Subscription"
        subtitle={`Status: ${runner.subscriptionStatus}${
          runner.subscriptionExpiresAt
            ? ` · expires ${runner.subscriptionExpiresAt.toLocaleDateString()}`
            : ""
        }`}
      />
      <Card>
        <p className="text-sm text-muted">
          {formatNgn(subscriptionAmount())} for {subscriptionDays()} days. Food payments stay
          off-platform — this only unlocks accepting orders and your personal business link.
          Flutterwave is subscription-only.
        </p>
        <div className="mt-4">
          {isFlutterwaveConfigured() ? (
            <SubscribeButton />
          ) : (
            <p className="rounded-2xl bg-amber/20 px-4 py-3 text-sm">
              Flutterwave keys are not set. Pay the admin off-platform and they will activate you from
              the admin panel.
            </p>
          )}
        </div>
      </Card>
      <section>
        <h2 className="font-semibold text-forest">History</h2>
        {runner.subscriptions.length === 0 ? (
          <div className="mt-3">
            <EmptyState title="No payments yet" body="Once a subscription is paid, the receipt line will show here." />
          </div>
        ) : (
          <ul className="mt-2 space-y-2 text-sm">
            {runner.subscriptions.map((sub) => (
              <li key={sub.id}>
                <Card className="py-3">
                  {sub.status} · {formatNgn(sub.amountPaid)} · {sub.startDate.toLocaleDateString()} →{" "}
                  {sub.endDate.toLocaleDateString()}
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
