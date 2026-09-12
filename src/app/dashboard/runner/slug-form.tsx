"use client";

import { buttonClass } from "@/components/ui/button";
import { Field, fieldClass } from "@/components/ui/field";
import type { ActionState } from "@/actions/auth";
import { useActionState } from "react";

export function RunnerSlugForm({
  action,
  current,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  current: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="mt-4 space-y-3">
      <Field label="Personal slug" hint="This becomes /r/your-slug for students.">
        <input name="personalSlug" defaultValue={current} className={fieldClass()} />
      </Field>
      <button type="submit" disabled={pending} className={buttonClass("primary", "h-10")}>
        {pending ? "Saving…" : "Update link"}
      </button>
      {state?.error ? <p className="text-sm text-rose-700">{state.error}</p> : null}
      {state?.success ? <p className="text-sm text-forest">{state.success}</p> : null}
    </form>
  );
}
