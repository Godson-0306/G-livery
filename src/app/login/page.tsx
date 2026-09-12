import { loginAction } from "@/actions/auth";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";
import Link from "next/link";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
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
          <p>
            Want to deliver?{" "}
            <Link href="/signup/runner" className="font-semibold text-forest">
              Sign up as a delivery agent
            </Link>
          </p>
        </>
      }
    >
      <AuthForm
        action={loginAction}
        title="Welcome back"
        subtitle="Log in to pick up where you left off — orders, kitchen, or deliveries."
        submitLabel="Log in"
        callbackUrl={callbackUrl}
        passwordMinLength={1}
        passwordHint="Use the password you created at signup."
      />
    </AuthShell>
  );
}
