import { requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { formatNgn } from "@/lib/money";
import { hasPayoutDetails } from "@/lib/payout";
import { fetchRunnerPayout } from "@/lib/payout-db";
import { isRunnerLive, syncRunnerSubscription } from "@/lib/subscription";
import { buttonClass } from "@/components/ui/button";
import { Card, StatCard } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { RefreshOnInterval } from "@/components/refresh-on-interval";
import { toggleAcceptingOrdersAction, updateRunnerPayoutAction, updateRunnerSlugAction } from "@/actions/runner";
import { appUrl } from "@/lib/utils";
import Link from "next/link";
import { RunnerSlugForm } from "./slug-form";
import { RunnerPayoutForm } from "./payout-form";

export default async function RunnerHomePage() {
  const session = await requireRole("runner");
  const runner = await prisma.runner.findUnique({
    where: { userId: session.user.id },
    include: { user: true },
  });
  if (!runner) return <p>Delivery agent profile missing.</p>;

  await syncRunnerSubscription(runner.id);
  const liveRunner = await prisma.runner.findUnique({ where: { id: runner.id } });
  const live = liveRunner ? isRunnerLive(liveRunner) : false;
  const payout = await fetchRunnerPayout(runner.id);
  const payoutReady = hasPayoutDetails(payout);

  const [poolCount, myIncoming, deliveredVolume, customerCount] = await Promise.all([
    prisma.order.count({ where: { status: "placed", runnerId: null } }),
    prisma.order.count({ where: { status: "placed", runnerId: runner.id } }),
    prisma.order.aggregate({
      where: { runnerId: runner.id, status: "delivered" },
      _sum: { totalAmount: true },
    }),
    prisma.order.findMany({
      where: { runnerId: runner.id },
      distinct: ["studentId"],
      select: { studentId: true },
    }),
  ]);

  const link = appUrl(`/r/${runner.personalSlug}`);

  return (
    <div className="space-y-6">
      <RefreshOnInterval />
      <PageHeader
        eyebrow="Delivery agent"
        title="Your desk"
        subtitle={
          live
            ? "Subscription active — accept pool orders or jobs tagged to your link."
            : "Activate your subscription to accept orders. Your payout account is still visible to students."
        }
        action={
          live ? null : (
            <Link href="/dashboard/runner/subscribe" className={buttonClass("amber")}>
              Activate subscription
            </Link>
          )
        }
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Pool orders" value={poolCount} />
        <StatCard label="Via your link" value={myIncoming} />
        <StatCard label="Customers" value={customerCount.length} />
        <StatCard label="Delivered volume" value={formatNgn(deliveredVolume._sum.totalAmount ?? 0)} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/dashboard/runner/orders" className="block">
          <Card className="h-full transition hover:border-forest/40">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber">General pool</p>
            <h2 className="mt-1 text-lg font-semibold text-forest">{poolCount} waiting</h2>
            <p className="mt-1 text-sm text-muted">Open campus orders with no agent yet. Accept from the board.</p>
          </Card>
        </Link>
        <Link href="/dashboard/runner/orders" className="block">
          <Card className="h-full transition hover:border-forest/40">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber">Via your link</p>
            <h2 className="mt-1 text-lg font-semibold text-forest">{myIncoming} tagged to you</h2>
            <p className="mt-1 text-sm text-muted">Students who ordered through /r/{runner.personalSlug}.</p>
          </Card>
        </Link>
      </div>
      <Card>
        <h2 className="font-semibold text-forest">Payout account</h2>
        <p className="mt-1 text-sm text-muted">
          {payoutReady
            ? "Students see these details on their order after you accept. You can edit them anytime."
            : "Add a Nigerian bank account so students know where to transfer you off-platform."}
        </p>
        <RunnerPayoutForm
          action={updateRunnerPayoutAction}
          bankName={payout.bankName}
          accountName={payout.accountName}
          accountNumber={payout.accountNumber}
        />
      </Card>
      <Card>
        <h2 className="font-semibold text-forest">Shareable link</h2>
        <p className="mt-1 break-all text-sm text-forest">{link}</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/runner/${runner.personalSlug}/qr`}
          alt="Delivery agent link QR"
          className="mt-3 h-40 w-40 rounded-xl border border-line bg-white p-2"
        />
        <RunnerSlugForm action={updateRunnerSlugAction} current={runner.personalSlug} />
        <form action={toggleAcceptingOrdersAction} className="mt-3">
          <button type="submit" className={buttonClass("secondary")}>
            {runner.isAcceptingOrders ? "Pause accepting orders" : "Resume accepting orders"}
          </button>
        </form>
      </Card>
      <p className="text-xs text-muted">
        Delivered volume is the food-order total tagged to you. Food and any delivery amount stay
        off-platform — Flutterwave is only for your subscription.
      </p>
    </div>
  );
}
