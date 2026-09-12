"use client";

import { changePasswordAction } from "@/actions/auth";
import { AuthShell } from "@/components/auth/auth-shell";
import { buttonClass } from "@/components/ui/button";
import { Field, fieldClass } from "@/components/ui/field";
import { DASHBOARD_HOME } from "@/auth.config";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useActionState } from "react";

export default function ChangePasswordPage() {
  const { data } = useSession();
  const [state, action, pending] = useActionState(changePasswordAction, undefined);
  const home = data?.user?.role ? DASHBOARD_HOME[data.user.role] : "/dashboard";

  return (
    <AuthShell>
      <form action={action} className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight text-forest">Set a new password</h1>
        <p className="text-sm text-muted">
          Admin-created cafeteria accounts should change the temporary password before continuing.
        </p>
        <Field label="Current password">
          <input name="currentPassword" type="password" required className={fieldClass()} />
        </Field>
        <Field label="New password" hint="At least 8 characters.">
          <input name="newPassword" type="password" required minLength={8} className={fieldClass()} />
        </Field>
        {state?.error ? <p className="text-sm text-rose-700">{state.error}</p> : null}
        {state?.success ? <p className="text-sm text-forest">{state.success}</p> : null}
        <button type="submit" disabled={pending} className={buttonClass("primary", "w-full h-11")}>
          {pending ? "Saving…" : "Update password"}
        </button>
        {state?.success ? (
          <Link href={home} className={buttonClass("secondary", "w-full h-11")}>
            Continue to dashboard
          </Link>
        ) : null}
      </form>
    </AuthShell>
  );
}
