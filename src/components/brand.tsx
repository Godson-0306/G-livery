import Link from "next/link";
import { cn } from "@/lib/utils";

export const TAGLINE = "Campus life, simplified";

export function Brand({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <Link href="/" className={cn("flex items-baseline gap-1 font-semibold tracking-tight", className)}>
      <span className={light ? "text-white" : "text-forest"}>G-Livery</span>
    </Link>
  );
}
