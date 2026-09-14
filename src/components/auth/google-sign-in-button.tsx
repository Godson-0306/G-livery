import { googleSignInAction } from "@/actions/auth";
import { buttonClass } from "@/components/ui/button";
import type { OAuthRole } from "@/lib/google-user";

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-8.9Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.2 0-5.9-2.1-6.8-5H1.2v3.1A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.2 14.3A7.2 7.2 0 0 1 4.8 12c0-.8.1-1.6.4-2.3V6.6H1.2A12 12 0 0 0 0 12c0 1.9.5 3.8 1.2 5.4l4-3.1Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4C18 1.1 15.2 0 12 0 7.3 0 3.3 2.7 1.2 6.6l4 3.1C6.1 6.9 8.8 4.8 12 4.8Z"
      />
    </svg>
  );
}

export function GoogleSignInButton({
  role,
  redirectTo,
}: {
  role: OAuthRole;
  redirectTo?: string;
}) {
  return (
    <form action={googleSignInAction.bind(null, role, redirectTo)}>
      <button type="submit" className={buttonClass("secondary", "h-11 w-full gap-2")}>
        <GoogleMark />
        Continue with Google
      </button>
    </form>
  );
}
