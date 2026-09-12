"use client";

import { startSubscriptionPaymentAction } from "@/actions/runner";
import { buttonClass } from "@/components/ui/button";
import { useState, useTransition } from "react";

export function SubscribeButton() {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={pending}
        className={buttonClass("primary")}
        onClick={() =>
          start(async () => {
            setError(null);
            const result = await startSubscriptionPaymentAction();
            if (result?.error) setError(result.error);
          })
        }
      >
        {pending ? "Redirecting to Flutterwave…" : "Pay with Flutterwave"}
      </button>
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
    </div>
  );
}
