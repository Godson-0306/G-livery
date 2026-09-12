"use client";

import { useActionState } from "react";
import { buttonClass } from "@/components/ui/button";
import { Field, fieldClass } from "@/components/ui/field";
import type { ActionState } from "@/actions/auth";

export function AuthForm({
  action,
  title,
  subtitle,
  submitLabel,
  extraFields,
  afterFields,
  callbackUrl,
  passwordHint,
  passwordMinLength = 8,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  title: string;
  subtitle?: string;
  submitLabel: string;
  extraFields?: React.ReactNode;
  afterFields?: React.ReactNode;
  callbackUrl?: string;
  passwordHint?: string;
  passwordMinLength?: number;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-forest">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
      </div>
      {callbackUrl ? <input type="hidden" name="callbackUrl" value={callbackUrl} /> : null}
      {extraFields}
      <Field label="Email">
        <input name="email" type="email" required autoComplete="email" className={fieldClass()} />
      </Field>
      <Field label="Password" hint={passwordHint}>
        <input
          name="password"
          type="password"
          required
          minLength={passwordMinLength}
          autoComplete={passwordMinLength >= 8 ? "new-password" : "current-password"}
          className={fieldClass()}
        />
      </Field>
      {afterFields}
      {state?.error ? <p className="text-sm text-rose-700">{state.error}</p> : null}
      <button type="submit" disabled={pending} className={buttonClass("primary", "w-full h-11")}>
        {pending ? "Please wait…" : submitLabel}
      </button>
    </form>
  );
}
