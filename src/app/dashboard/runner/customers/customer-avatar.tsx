import { cn } from "@/lib/utils";
import { customerInitials } from "./customer-types";

const SIZE = {
  sm: "h-10 w-10 text-xs",
  md: "h-12 w-12 text-sm",
  lg: "h-16 w-16 text-lg",
} as const;

export function CustomerAvatar({
  name,
  size = "md",
  className,
}: {
  name: string;
  size?: keyof typeof SIZE;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-forest font-semibold text-white",
        SIZE[size],
        className,
      )}
    >
      {customerInitials(name)}
    </span>
  );
}
