export function formatWhen(iso: string | Date) {
  const date = iso instanceof Date ? iso : new Date(iso);
  const mins = Math.max(0, Math.round((Date.now() - date.getTime()) / 60_000));
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}
