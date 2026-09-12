import { CartBar } from "@/components/cart/cart-bar";
import { CafeteriaLogo } from "@/components/cafeteria-logo";
import { SiteHeader } from "@/components/site-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function RunnerStorefrontPage({
  params,
}: {
  params: Promise<{ personalSlug: string }>;
}) {
  const { personalSlug } = await params;
  const runner = await prisma.runner.findUnique({
    where: { personalSlug },
    include: { user: true },
  });
  if (!runner || runner.user.isDisabled) notFound();

  const cafeterias = await prisma.cafeteria.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-full">
      <SiteHeader />
      <main className="page-wrap max-w-lg py-8">
        <section className="rounded-[1.6rem] bg-forest px-6 py-8 text-white shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber">
            Ordering with an agent
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{runner.user.name}</h1>
          <p className="mt-3 text-sm text-emerald-100">
            Pick a kitchen, add food, and this order is tagged to {runner.user.name}. Pay the cafeteria
            for food. You can pay {runner.user.name} by transfer using the account shown on your order
            after they accept.
          </p>
        </section>
        <h2 className="mt-8 text-lg font-semibold text-forest">Pick a cafeteria</h2>
        {cafeterias.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="No kitchens live yet"
              body="Active cafeterias will show up here for this agent’s link."
              actionHref="/"
              actionLabel="Back home"
            />
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {cafeterias.map((cafeteria) => (
              <li key={cafeteria.id}>
                <Link href={`/cafeteria/${cafeteria.slug}?runner=${runner.personalSlug}`}>
                  <Card className="flex items-center gap-4 transition hover:border-forest/40">
                    <CafeteriaLogo src={cafeteria.logoUrl} name={cafeteria.name} size="lg" />
                    <div>
                      <h3 className="font-semibold text-forest">{cafeteria.name}</h3>
                      <p className="text-sm text-muted">{cafeteria.location ?? "Campus"}</p>
                    </div>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
      <CartBar />
    </div>
  );
}
