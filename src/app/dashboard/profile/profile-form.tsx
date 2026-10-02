"use client";

import { changePasswordAction, updateProfileAction } from "@/actions/auth";
import { buttonClass } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, fieldClass } from "@/components/ui/field";
import { PasswordField } from "@/components/ui/password-field";
import { roleLabel } from "@/lib/labels";
import type { Role } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useActionState, useEffect } from "react";

export function ProfileForm({
  name,
  phone,
  email,
  role,
  hasPassword,
}: {
  name: string;
  phone: string;
  email: string;
  role: Role;
  hasPassword: boolean;
}) {
  const { update } = useSession();
  const [profileState, profileAction, profilePending] = useActionState(updateProfileAction, undefined);
  const [passwordState, passwordAction, passwordPending] = useActionState(changePasswordAction, undefined);

  useEffect(() => {
    if (profileState?.success && profileState.name) {
      void update({ name: profileState.name });
    }
  }, [profileState, update]);

  return (
    <div className="space-y-4">
      <Card>
        <form action={profileAction} className="space-y-3">
          <h2 className="font-semibold text-forest">Your details</h2>
          <Field label="Name">
            <input name="name" defaultValue={name} required minLength={2} className={fieldClass()} />
          </Field>
          <Field label="Phone" hint="Optional. Agents use this if they need to reach you.">
            <input name="phone" defaultValue={phone} autoComplete="tel" className={fieldClass()} />
          </Field>
          <Field label="Email">
            <input defaultValue={email} readOnly className={fieldClass("bg-forest-soft/50 text-muted")} />
          </Field>
          <Field label="Role">
            <input defaultValue={roleLabel(role)} readOnly className={fieldClass("bg-forest-soft/50 text-muted")} />
          </Field>
          {profileState?.error ? <p className="text-sm text-rose-700">{profileState.error}</p> : null}
          {profileState?.success ? <p className="text-sm text-forest">{profileState.success}</p> : null}
          <button type="submit" disabled={profilePending} className={buttonClass("primary", "h-11 w-full sm:w-auto")}>
            {profilePending ? "Saving…" : "Save profile"}
          </button>
        </form>
      </Card>

      {hasPassword ? (
        <Card>
          <form action={passwordAction} className="space-y-3">
            <h2 className="font-semibold text-forest">Password</h2>
            <PasswordField name="currentPassword" label="Current password" />
            <PasswordField
              name="newPassword"
              label="New password"
              hint="At least 8 characters."
              minLength={8}
              autoComplete="new-password"
            />
            {passwordState?.error ? <p className="text-sm text-rose-700">{passwordState.error}</p> : null}
            {passwordState?.success ? <p className="text-sm text-forest">{passwordState.success}</p> : null}
            <button type="submit" disabled={passwordPending} className={buttonClass("secondary", "h-11")}>
              {passwordPending ? "Saving…" : "Update password"}
            </button>
          </form>
        </Card>
      ) : (
        <Card>
          <h2 className="font-semibold text-forest">Password</h2>
          <p className="mt-1 text-sm text-muted">This account uses Google sign-in. There is no password to change.</p>
        </Card>
      )}
    </div>
  );
}
