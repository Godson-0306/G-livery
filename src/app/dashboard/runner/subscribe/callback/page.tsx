import { requireRole } from "@/lib/auth-guards";
import { fulfillSubscriptionByTxRef } from "@/actions/runner";
import { buttonClass } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import Link from "next/link";

export default async function SubscribeCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ tx_ref?: string; status?: string }>;
}) {
  await requireRole("runner");
  const { tx_ref: txRef, status } = await searchParams;

  let message = "We could not confirm that payment yet.";
  let ok = false;
  if (txRef) {
    const result = await fulfillSubscriptionByTxRef(txRef);
    if (result.success) {
      message = result.success;
      ok = true;
    } else if (result.error) {
      message = result.error;
    }
  } else if (status === "cancelled") {
    message = "Checkout was cancelled.";
  }

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Subscription"
        title={ok ? "Subscription updated" : "Payment status"}
      />
      <Card>
        <p className="text-sm text-muted">{message}</p>
        <Link href="/dashboard/runner" className={buttonClass("primary", "mt-4")}>
          Back to agent desk
        </Link>
      </Card>
    </div>
  );
}
