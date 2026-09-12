"use client";

import type { ActionState } from "@/actions/auth";
import { buttonClass } from "@/components/ui/button";
import { Field, fieldClass } from "@/components/ui/field";
import { useActionState } from "react";

export function RunnerPayoutForm({
  action,
  bankName,
  accountName,
  accountNumber,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  bankName: string;
  accountName: string;
  accountNumber: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="mt-4 space-y-3">
      <Field label="Bank name" hint="Any Nigerian bank students can transfer to.">
        <input name="bankName" required defaultValue={bankName} className={fieldClass()} />
      </Field>
      <Field label="Account name">
        <input name="accountName" required defaultValue={accountName} className={fieldClass()} />
      </Field>
      <Field label="Account number" hint="10-digit NUBAN. Students copy this from their order.">
        <input
          name="accountNumber"
          required
          inputMode="numeric"
          pattern="\d{10}"
          maxLength={10}
          defaultValue={accountNumber}
          className={fieldClass()}
        />
      </Field>
      {state?.error ? <p className="text-sm text-rose-700">{state.error}</p> : null}
      {state?.success ? <p className="text-sm text-forest">{state.success}</p> : null}
      <button type="submit" disabled={pending} className={buttonClass("primary", "h-11")}>
        {pending ? "Saving…" : "Save payout account"}
      </button>
    </form>
  );
}
