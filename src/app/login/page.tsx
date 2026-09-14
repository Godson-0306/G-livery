import { loginAction } from "@/actions/auth";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { isGoogleAuthConfigured } from "@/lib/google-user";
import Link from "next/link";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const { callbackUrl, error } = await searchParams;
  const google = isGoogleAuthConfigured();
  return (
    <AuthShell
      footer={
        <>
          <p>
            New student?{" "}
            <Link href="/signup/student" className="font-semibold text-forest">
              Create an account
            </Link>
          </p>
          {google ? (
            <p>
              New delivery agent? Use{" "}
              <Link href="/signup/runner" className="font-semibold text-forest">
                agent signup
              </Link>{" "}
              so we set up your desk — then Google works on login too.
            </p>
          ) : (
            <p>
              New delivery agent?{" "}
              <Link href="/signup/runner" className="font-semibold text-forest">
                Agent signup
              </Link>
            </p>
          )}
        </>
      }
    >
      {error ? (
        <p className="mb-4 text-sm text-rose-700">
          Google sign-in was cancelled or could not finish. Try again, or use email and password.
        </p>
      ) : null}
      <AuthForm
        action={loginAction}
        title="Welcome back"
        subtitle="Log in to pick up where you left off — orders, kitchen, or deliveries."
        submitLabel="Log in"
        callbackUrl={callbackUrl}
        passwordMinLength={1}
        passwordHint={
          google
            ? "Use the password you created at signup, or continue with Google."
            : "Use the password you created at signup."
        }
        oauth={
          google ? <GoogleSignInButton role="student" redirectTo={callbackUrl || "/dashboard"} /> : undefined
        }
      />
    </AuthShell>
  );
}
