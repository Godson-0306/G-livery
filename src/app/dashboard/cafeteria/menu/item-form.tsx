"use client";

import { buttonClass } from "@/components/ui/button";
import type { ActionState } from "@/actions/auth";
import { useActionState } from "react";
import { Card } from "@/components/ui/card";
import { Field, fieldClass } from "@/components/ui/field";

export function MenuItemForm({
  action,
  submitLabel,
  defaults,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel: string;
  defaults?: {
    id?: string;
    name?: string;
    description?: string;
    price?: string;
    category?: string;
  };
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <Card className="mx-auto max-w-lg">
      <form action={formAction} encType="multipart/form-data" className="space-y-4">
        {defaults?.id ? <input type="hidden" name="id" value={defaults.id} /> : null}
        <Field label="Name">
          <input name="name" required defaultValue={defaults?.name} className={fieldClass()} />
        </Field>
        <Field label="Price (NGN)">
          <input
            name="price"
            type="number"
            min="1"
            step="1"
            required
            defaultValue={defaults?.price}
            className={fieldClass()}
          />
        </Field>
        <Field label="Category">
          <input
            name="category"
            defaultValue={defaults?.category}
            placeholder="Mains, Drinks…"
            className={fieldClass()}
          />
        </Field>
        <Field label="Description">
          <textarea name="description" rows={3} defaultValue={defaults?.description} className={fieldClass()} />
        </Field>
        <Field label="Photo" hint="JPG, PNG, WEBP, or GIF up to 4MB.">
          <input
            name="photo"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="mt-1.5 block w-full text-sm"
          />
        </Field>
        {state?.error ? <p className="text-sm text-rose-700">{state.error}</p> : null}
        <button type="submit" disabled={pending} className={buttonClass("primary", "h-11")}>
          {pending ? "Saving…" : submitLabel}
        </button>
      </form>
    </Card>
  );
}
