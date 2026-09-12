import { signupRunnerAction } from "@/actions/auth";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { Field, fieldClass } from "@/components/ui/field";
import Link from "next/link";

export default function RunnerSignupPage() {
  return (
    <AuthShell
      footer={
        <>
          <p>Cafeteria accounts are created by G-Livery admin — no public kitchen signup.</p>
          <p>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-forest">
              Log in
            </Link>
          </p>
        </>
      }
    >
      <AuthForm
        action={signupRunnerAction}
        title="Become a delivery agent"
        subtitle="Get a personal order link. Students pay you by transfer using the account you add here — G-Livery never charges food or delivery in the app."
        submitLabel="Create agent account"
        passwordHint="At least 8 characters."
        extraFields={
          <>
            <Field label="Full name">
              <input name="name" required autoComplete="name" className={fieldClass()} />
            </Field>
            <Field label="Phone" hint="Students and kitchens may call you about a drop-off.">
              <input name="phone" autoComplete="tel" className={fieldClass()} />
            </Field>
          </>
        }
        afterFields={
          <>
            <div className="rounded-2xl bg-forest-soft/80 px-3.5 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber">
                Payout account
              </p>
              <p className="mt-1 text-xs text-muted">
                Required now. Students copy these details from their order after you accept.
              </p>
            </div>
            <Field label="Bank name">
              <input name="bankName" required placeholder="e.g. Access Bank" className={fieldClass()} />
            </Field>
            <Field label="Account name">
              <input name="accountName" required className={fieldClass()} />
            </Field>
            <Field label="Account number" hint="10-digit NUBAN.">
              <input
                name="accountNumber"
                required
                inputMode="numeric"
                pattern="\d{10}"
                maxLength={10}
                className={fieldClass()}
              />
            </Field>
          </>
        }
      />
    </AuthShell>
  );
}
