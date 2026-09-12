"use client";

import { buttonClass } from "@/components/ui/button";
import type { ActionState } from "@/actions/auth";
import { useActionState } from "react";
import { CafeteriaLogo } from "@/components/cafeteria-logo";
import { Card } from "@/components/ui/card";
import { Field, fieldClass } from "@/components/ui/field";

export function CafeteriaProfileForm({
  action,
  defaultName,
  defaultLocation,
  defaultDescription,
  currentLogoUrl,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  defaultName: string;
  defaultLocation: string;
  defaultDescription: string;
  currentLogoUrl?: string | null;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <Card>
      <form action={formAction} encType="multipart/form-data" className="space-y-3">
        <h2 className="font-semibold text-forest">Kitchen profile</h2>
        <Field label="Name">
          <input name="name" defaultValue={defaultName} required className={fieldClass()} />
        </Field>
        <Field label="Location">
          <input name="location" defaultValue={defaultLocation} className={fieldClass()} />
        </Field>
        <Field label="Description">
          <textarea name="description" defaultValue={defaultDescription} rows={3} className={fieldClass()} />
        </Field>
        <div className="flex items-start gap-3">
          <CafeteriaLogo src={currentLogoUrl} name={defaultName} />
          <Field label="Logo" hint="JPG, PNG, WEBP, or GIF up to 4MB.">
            <input
              name="photo"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="mt-1.5 block w-full text-sm"
            />
          </Field>
        </div>
        {state?.error ? <p className="text-sm text-rose-700">{state.error}</p> : null}
        {state?.success ? <p className="text-sm text-forest">{state.success}</p> : null}
        <button type="submit" disabled={pending} className={buttonClass("secondary")}>
          {pending ? "Saving…" : "Save profile"}
        </button>
      </form>
    </Card>
  );
}
