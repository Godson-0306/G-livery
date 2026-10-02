import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const TAGLINE = "Campus life, simplified";

const SIZE = {
  sm: "h-7 w-auto sm:h-8",
  md: "h-10 w-auto",
  lg: "h-14 w-auto sm:h-[4.25rem]",
} as const;

export function BrandMark({
  className,
  size = "sm",
}: {
  className?: string;
  size?: keyof typeof SIZE;
}) {
  return (
    <span className={cn("inline-flex items-center", className)}>
      <Image
        src="/g-livery-wordmark.png"
        alt="G-Livery"
        width={961}
        height={338}
        className={SIZE[size]}
        sizes={size === "lg" ? "280px" : size === "md" ? "200px" : "160px"}
        priority
      />
    </span>
  );
}

export function Brand({
  className,
  light = false,
  size = "sm",
  variant = "logo",
}: {
  className?: string;
  light?: boolean;
  size?: keyof typeof SIZE;
  variant?: "logo" | "text";
}) {
  if (variant === "text") {
    return (
      <Link href="/" className={cn("flex items-baseline gap-1 font-display text-2xl font-medium tracking-tight", className)}>
        <span className={light ? "text-white" : "text-forest"}>G-Livery</span>
      </Link>
    );
  }

  return (
    <Link href="/" aria-label="G-Livery home" className={cn("inline-flex shrink-0 items-center", className)}>
      <BrandMark size={size} />
    </Link>
  );
}
