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
      <Card padded={false} className="h-full overflow-hidden transition hover:border-forest/40">
        <div className="relative h-36 bg-forest">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-end p-4">
              <span className="text-3xl font-semibold text-white">{name.slice(0, 1).toUpperCase()}</span>
            </div>
          )}
        </div>
        <div className="p-4">
          <h2 className="text-lg font-semibold text-forest">{name}</h2>
          <p className="mt-1 inline-flex rounded-full bg-forest-soft px-2.5 py-0.5 text-xs font-semibold text-forest">
            {location ?? "Campus"}
          </p>
          {description ? <p className="mt-2 line-clamp-2 text-sm text-muted">{description}</p> : null}
          <p className="mt-3 text-sm font-semibold text-forest">Open menu →</p>
        </div>
      </Card>
    </Link>
  );
}
