import { signupStudentAction } from "@/actions/auth";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { isGoogleAuthConfigured } from "@/lib/google-user";
import { Field, fieldClass } from "@/components/ui/field";
import Link from "next/link";

export default function StudentSignupPage() {
  const google = isGoogleAuthConfigured();
  return (
    <AuthShell
      footer={
        <p>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-forest">
            Log in
          </Link>
        </p>
      }
    >
      <AuthForm
        action={signupStudentAction}
        title="Join as a student"
        subtitle="Browse live menus, drop your hostel, and track the order. You pay the Agent — they settle the cafeteria."
        submitLabel="Create student account"
        passwordHint="At least 8 characters. You’ll use this to track orders."
        oauth={google ? <GoogleSignInButton role="student" redirectTo="/dashboard/student" /> : undefined}
        extraFields={
          <>
            <Field label="Full name">
              <input name="name" required autoComplete="name" className={fieldClass()} />
            </Field>
            <Field label="Phone" hint="Optional, but agents can reach you faster.">
              <input name="phone" autoComplete="tel" className={fieldClass()} />
            </Field>
          </>
        }
      />
    </AuthShell>
  );
}
