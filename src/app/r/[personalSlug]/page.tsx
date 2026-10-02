import { AgentRatingLine } from "@/components/agents/agent-rating";
import { QueueBadge } from "@/components/agents/queue-badge";
import { CartBar } from "@/components/cart/cart-bar";
import { KitchenCard } from "@/components/cafeterias/kitchen-card";
import { SiteHeader } from "@/components/site-header";
import { EmptyState } from "@/components/ui/empty-state";
import { getAgentStats } from "@/lib/agents";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

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

  const [cafeterias, stats] = await Promise.all([
    prisma.cafeteria.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
    getAgentStats(runner.id),
  ]);

  return (
    <div className="min-h-full">
      <SiteHeader />
      <main className="page-wrap py-8">
        <section className="rounded-[1.6rem] border border-amber/20 bg-gradient-to-br from-[#0c1210] via-[#13201a] to-[#1b5e3b]/40 px-6 py-10 text-[#f3eee4]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber">
            Ordering with an agent
          </p>
          <h1 className="mt-3 font-display text-4xl font-medium tracking-tight">{runner.user.name}</h1>
          <div className="mt-2 h-px w-16 bg-amber/70" />
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <AgentRatingLine
              averageStars={stats.averageStars}
              ratingCount={stats.ratingCount}
              className="text-[#f3eee4]/75"
            />
            <QueueBadge count={stats.queueCount} className="border border-amber/30 bg-transparent text-amber" />
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#f3eee4]/70">
            Pick a cafeteria, add food, and this order is tagged to {runner.user.name}. Transfer the food
            total to {runner.user.name} after they accept — they pay the cafeteria when they pick up.
          </p>
        </section>
        <h2 className="mt-10 font-display text-2xl font-medium text-heading">Pick a cafeteria</h2>
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
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cafeterias.map((cafeteria) => (
              <li key={cafeteria.id}>
                <KitchenCard
                  href={`/cafeteria/${cafeteria.slug}?runner=${runner.personalSlug}`}
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
      <CartBar />
    </div>
  );
}
