import { CafeteriaLogo } from "@/components/cafeteria-logo";
import { SiteHeader } from "@/components/site-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { fieldClass } from "@/components/ui/field";
import { PageHeader } from "@/components/ui/page-header";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function CafeteriasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim();

  const cafeterias = await prisma.cafeteria.findMany({
    where: {
      isActive: true,
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { location: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-full">
      <SiteHeader />
      <main className="page-wrap py-8">
        <PageHeader
          eyebrow="Campus kitchens"
          title="What’s cooking"
          subtitle="Tap a cafeteria for the live menu. You’ll pay the student who delivers — they settle the cafeteria."
        />
        <form className="mt-6">
          <input
            name="q"
            defaultValue={query}
            placeholder="Search by name or building"
            className={fieldClass("sm:max-w-md")}
          />
        </form>
        {cafeterias.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              title="No kitchens match"
              body="Try another search, or check back when a cafeteria goes live."
              actionHref="/"
              actionLabel="Back home"
            />
          </div>
        ) : (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {cafeterias.map((cafeteria) => (
              <li key={cafeteria.id}>
                <Link href={`/cafeteria/${cafeteria.slug}`}>
                  <Card className="flex gap-4 transition hover:border-forest/40">
                    <CafeteriaLogo src={cafeteria.logoUrl} name={cafeteria.name} size="xl" />
                    <div className="min-w-0">
                      <h2 className="text-lg font-semibold text-forest">{cafeteria.name}</h2>
                      <p className="mt-1 text-sm text-muted">{cafeteria.location ?? "Campus"}</p>
                      {cafeteria.description ? (
                        <p className="mt-2 line-clamp-2 text-sm text-muted">{cafeteria.description}</p>
                      ) : null}
                      <p className="mt-3 text-sm font-semibold text-forest">Open menu →</p>
                    </div>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
