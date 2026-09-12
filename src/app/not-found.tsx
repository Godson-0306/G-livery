import { Brand, TAGLINE } from "@/components/brand";
import { buttonClass } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col items-center justify-center px-4 text-center">
      <Brand className="text-xl" />
      <p className="mt-2 text-sm text-muted">{TAGLINE}</p>
      <h1 className="mt-8 text-2xl font-semibold text-forest">Page not found</h1>
      <p className="mt-2 text-muted">That cafeteria, agent, or page does not exist.</p>
      <Link href="/" className={buttonClass("primary", "mt-6")}>
        Back home
      </Link>
    </div>
  );
}
