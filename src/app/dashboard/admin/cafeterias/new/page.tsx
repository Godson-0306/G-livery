"use client";

import { createCafeteriaAction } from "@/actions/admin";
import { buttonClass } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, fieldClass } from "@/components/ui/field";
import { PageHeader } from "@/components/ui/page-header";
import { useActionState } from "react";

export default function NewCafeteriaPage() {
  const [state, action, pending] = useActionState(createCafeteriaAction, undefined);

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Admin"
        title="Onboard a cafeteria"
        subtitle="Creates the kitchen profile and an owner login. Share the temp password with the manager."
      />
      <Card className="mx-auto max-w-lg">
        <form action={action} className="space-y-4">
          <Field label="Cafeteria name">
            <input name="name" required className={fieldClass()} />
          </Field>
          <Field label="Location / building">
            <input name="location" className={fieldClass()} />
          </Field>
          <Field label="Description">
            <textarea name="description" rows={3} className={fieldClass()} />
          </Field>
          <Field label="Owner name">
            <input name="ownerName" required className={fieldClass()} />
          </Field>
          <Field label="Owner email">
            <input name="ownerEmail" type="email" required className={fieldClass()} />
          </Field>
          <Field label="Owner phone">
            <input name="ownerPhone" className={fieldClass()} />
          </Field>
          <Field label="Temporary password" hint="At least 8 characters. They’ll be asked to change it.">
            <input name="tempPassword" type="text" required minLength={8} className={fieldClass()} />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input name="isActive" type="checkbox" defaultChecked />
            Activate immediately (visible to students)
          </label>
          {state?.error ? <p className="text-sm text-rose-700">{state.error}</p> : null}
          <button type="submit" disabled={pending} className={buttonClass("primary", "h-11")}>
            {pending ? "Creating…" : "Create cafeteria"}
          </button>
        </form>
      </Card>
    </div>
  );
}
