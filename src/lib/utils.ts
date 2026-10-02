export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function uniqueSlug(base: string) {
  const suffix = Math.random().toString(36).slice(2, 6);
  const clean = slugify(base) || "user";
  return `${clean}-${suffix}`;
}

export function appUrl(path = "") {
  const candidates = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.AUTH_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : undefined,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  ].filter((value): value is string => Boolean(value));

  const live = candidates.find((url) => {
    try {
      const host = new URL(url.includes("://") ? url : `https://${url}`).hostname;
      return host !== "localhost" && host !== "127.0.0.1";
    } catch {
      return false;
    }
  });
  const base = (live ?? candidates[0] ?? "http://localhost:3000").replace(/\/$/, "");
  if (!path) return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
