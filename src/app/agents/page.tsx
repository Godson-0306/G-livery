import { AgentRatingLine } from "@/components/agents/agent-rating";
import { QueueBadge } from "@/components/agents/queue-badge";
import { SiteHeader } from "@/components/site-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { listLiveAgents } from "@/lib/agents";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Agents",
  description: "Live G-Livery Agents ranked by student ratings after delivery.",
};

export default async function AgentsLeaderboardPage() {
  const agents = await listLiveAgents();

  return (
    <div className="min-h-full">
      <SiteHeader />
      <main className="page-wrap py-8">
        <PageHeader
          eyebrow="Delivery agents"
          title="Agent leaderboard"
          subtitle="Live Agents ranked by average stars from students after delivery. Tap a name to order with them."
        />
        {agents.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              title="No Agents live yet"
              body="When an Agent’s subscription is active and they are accepting orders, they show up here."
              actionHref="/cafeterias"
              actionLabel="Browse cafeterias"
            />
          </div>
        ) : (
          <ol className="mt-6 grid gap-3 sm:grid-cols-2">
            {agents.map((agent, index) => (
              <li key={agent.id}>
                <Link href={`/r/${agent.slug}`} className="block h-full">
                  <Card className="flex h-full items-start gap-4 transition hover:border-amber/45">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-amber/30 font-display text-sm text-amber">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-display text-lg font-medium text-heading">{agent.name}</h2>
                        <QueueBadge count={agent.queueCount} />
                      </div>
                      <AgentRatingLine
                        averageStars={agent.averageStars}
                        ratingCount={agent.ratingCount}
                        className="mt-1 text-muted"
                      />
                      <p className="mt-3 text-sm font-semibold text-forest">Order with {agent.name} →</p>
                    </div>
                  </Card>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </main>
    </div>
  );
}
