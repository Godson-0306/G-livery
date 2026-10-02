import { KitchenCard } from "@/components/cafeterias/kitchen-card";
import { SiteHeader } from "@/components/site-header";
import { EmptyState } from "@/components/ui/empty-state";
import { fieldClass } from "@/components/ui/field";
import { PageHeader } from "@/components/ui/page-header";
import { prisma } from "@/lib/prisma";

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
      <main className="page-wrap py-8 pb-24">
        <PageHeader
          eyebrow="Campus kitchens"
          title="What’s cooking"
          subtitle="Tap a cafeteria for the live menu. You’ll pay the Agent — they settle the cafeteria."
        />
        <form className="sticky top-16 z-20 -mx-1 mt-6 bg-background/90 px-1 py-3 backdrop-blur">
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
          <ul className="mt-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cafeterias.map((cafeteria) => (
              <li key={cafeteria.id}>
                <KitchenCard
                  href={`/cafeteria/${cafeteria.slug}`}
                  name={cafeteria.name}
                  location={cafeteria.location}
                  logoUrl={cafeteria.logoUrl}
                  description={cafeteria.description}
                />
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
