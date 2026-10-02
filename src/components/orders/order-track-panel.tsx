import { PayAgentCard } from "@/components/pay-agent-card";
import { Card } from "@/components/ui/card";
import { OrderTimeline } from "@/components/ui/order-timeline";
import { formatNgn } from "@/lib/money";
import { ORDER_STATUS_HEADLINE } from "@/lib/order-status";
import type { OrderStatus } from "@prisma/client";

export function OrderTrackPanel({
  status,
  amount,
  runnerName,
  payout,
}: {
  status: OrderStatus;
  amount: number;
  runnerName?: string | null;
  payout?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
  } | null;
}) {
  const showPay = status !== "delivered" && status !== "cancelled";

  return (
    <div className="space-y-4">
      <p className="text-lg font-display font-medium text-heading">{ORDER_STATUS_HEADLINE[status]}</p>
      <OrderTimeline status={status} />
      {showPay && runnerName && payout ? (
        <PayAgentCard
          agentName={runnerName}
          bankName={payout.bankName}
          accountName={payout.accountName}
          accountNumber={payout.accountNumber}
          amount={amount}
        />
      ) : showPay ? (
        <Card>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber">Pay the Agent</p>
          <h2 className="mt-1 font-display text-xl font-medium text-heading">Waiting for an Agent</h2>
          <p className="mt-1 text-sm text-muted">
            Food total {formatNgn(amount)}. After an Agent accepts, transfer that amount to them — they
            pay the cafeteria when they pick up.
          </p>
        </Card>
      ) : null}
    </div>
  );
}
