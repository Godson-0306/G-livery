import { requireRole } from "@/lib/auth-guards";
import { setRunnerSubscriptionAction } from "@/actions/admin";
import { buttonClass } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { hasPayoutDetails } from "@/lib/payout";
import { fetchRunnerPayouts } from "@/lib/payout-db";
import { prisma } from "@/lib/prisma";
import { syncRunnerSubscription } from "@/lib/subscription";

export default async function AdminRunnersPage() {
  await requireRole("admin");
  const runners = await prisma.runner.findMany({
    include: { user: true, _count: { select: { orders: true } } },
    orderBy: { createdAt: "desc" },
  });

  await Promise.all(runners.map((runner) => syncRunnerSubscription(runner.id)));
  const payouts = await fetchRunnerPayouts(runners.map((runner) => runner.id));

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Admin"
        title="Delivery agents"
        subtitle="Activate subscriptions after off-platform payment if Flutterwave is not configured. Payout details are for student transfers, not a platform fee."
      />
      {runners.length === 0 ? (
        <EmptyState title="No agents yet" body="Agents appear here after they sign up with a payout account." />
      ) : (
        <ul className="space-y-3">
          {runners.map((runner) => {
            const payout = hasPayoutDetails(payouts.get(runner.id));
            return (
              <li key={runner.id}>
                <Card>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="font-semibold text-forest">{runner.user.name}</h2>
                      <p className="text-sm text-muted">
                        {runner.user.email} · /r/{runner.personalSlug}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {runner.subscriptionStatus}
                        {runner.subscriptionExpiresAt
                          ? ` · expires ${runner.subscriptionExpiresAt.toLocaleDateString()}`
                          : ""}
                        {" · "}
                        {runner._count.orders} orders
                      </p>
                      <p
                        className={
                          payout
                            ? "mt-2 text-xs font-semibold text-forest"
                            : "mt-2 text-xs font-semibold text-amber"
                        }
                      >
                        {payout
                          ? `Payout complete · ${payouts.get(runner.id)?.bankName}`
                          : "Payout details incomplete"}
                      </p>
                    </div>
                    <form action={setRunnerSubscriptionAction} className="flex flex-wrap gap-2">
                      <input type="hidden" name="runnerId" value={runner.id} />
                      <button name="status" value="active" className={buttonClass("primary", "h-8 text-xs")}>
                        Activate
                      </button>
                      <button name="status" value="inactive" className={buttonClass("secondary", "h-8 text-xs")}>
                        Deactivate
                      </button>
                      <button name="status" value="expired" className={buttonClass("secondary", "h-8 text-xs")}>
                        Mark expired
                      </button>
                    </form>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
