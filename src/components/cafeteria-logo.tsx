export function CafeteriaLogo({
  src,
  name,
  size = "md",
}: {
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const box =
    size === "xl"
      ? "h-28 w-28 text-3xl"
      : size === "lg"
        ? "h-20 w-20 text-2xl"
        : size === "sm"
          ? "h-12 w-12 text-sm"
          : "h-16 w-16 text-lg";

  if (!src) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center rounded-xl bg-forest/10 font-semibold text-forest ${box}`}
        aria-hidden
      >
        {name.slice(0, 1).toUpperCase()}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`${name} logo`}
      className={`shrink-0 rounded-xl object-cover ${box}`}
    />
  );
}
