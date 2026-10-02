import { Card } from "@/components/ui/card";
import Link from "next/link";

export function KitchenCard({
  href,
  name,
  location,
  logoUrl,
  description,
}: {
  href: string;
  name: string;
  location: string | null;
  logoUrl: string | null;
  description?: string | null;
}) {
  return (
    <Link href={href} className="block h-full">
      <Card padded={false} className="h-full overflow-hidden transition hover:border-amber/45">
        <div className="relative h-40 bg-[#13201a]">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-end p-5">
              <span className="font-display text-4xl font-medium text-[#f3eee4]">{name.slice(0, 1).toUpperCase()}</span>
            </div>
          )}
        </div>
        <div className="p-5">
          <h2 className="font-display text-xl font-medium text-heading">{name}</h2>
          <p className="mt-2 inline-flex rounded-full border border-amber/25 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber">
            {location ?? "Campus"}
          </p>
          {description ? <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted">{description}</p> : null}
          <p className="mt-4 text-sm font-semibold text-forest">Open menu →</p>
        </div>
      </Card>
    </Link>
  );
}
