import { prisma } from "@/lib/prisma";
import { OPEN_JOB_STATUSES } from "@/lib/order-status";
import { isRunnerLive } from "@/lib/subscription";

export type AgentBoardRow = {
  id: string;
  name: string;
  slug: string;
  averageStars: number | null;
  ratingCount: number;
  deliveredCount: number;
  queueCount: number;
};

export function rankAgents(rows: AgentBoardRow[]) {
  return [...rows].sort((a, b) => {
    const aRated = a.averageStars != null ? 1 : 0;
    const bRated = b.averageStars != null ? 1 : 0;
    if (bRated !== aRated) return bRated - aRated;
    if ((b.averageStars ?? 0) !== (a.averageStars ?? 0)) {
      return (b.averageStars ?? 0) - (a.averageStars ?? 0);
    }
    if (b.ratingCount !== a.ratingCount) return b.ratingCount - a.ratingCount;
    return b.deliveredCount - a.deliveredCount;
  });
}

export async function listLiveAgents(): Promise<AgentBoardRow[]> {
  const runners = await prisma.runner.findMany({
    where: {
      isAcceptingOrders: true,
      subscriptionStatus: "active",
      user: { isDisabled: false },
    },
    include: { user: { select: { name: true, isDisabled: true } } },
  });

  const live = runners.filter((runner) => isRunnerLive(runner) && !runner.user.isDisabled);
  return hydrateAgentStats(live.map((runner) => ({
    id: runner.id,
    name: runner.user.name,
    slug: runner.personalSlug,
  })));
}

export async function getAgentStats(
  runnerId: string,
): Promise<Pick<AgentBoardRow, "averageStars" | "ratingCount" | "deliveredCount" | "queueCount">> {
  const [rows] = await hydrateAgentStats([{ id: runnerId, name: "", slug: "" }]);
  return {
    averageStars: rows?.averageStars ?? null,
    ratingCount: rows?.ratingCount ?? 0,
    deliveredCount: rows?.deliveredCount ?? 0,
    queueCount: rows?.queueCount ?? 0,
  };
}

async function hydrateAgentStats(
  agents: Array<{ id: string; name: string; slug: string }>,
): Promise<AgentBoardRow[]> {
  if (agents.length === 0) return [];
  const ids = agents.map((agent) => agent.id);

  const [ratings, delivered, queued] = await Promise.all([
    prisma.runnerRating.groupBy({
      by: ["runnerId"],
      where: { runnerId: { in: ids } },
      _avg: { stars: true },
      _count: { _all: true },
    }),
    prisma.order.groupBy({
      by: ["runnerId"],
      where: { runnerId: { in: ids }, status: "delivered" },
      _count: { _all: true },
    }),
    prisma.order.groupBy({
      by: ["runnerId"],
      where: { runnerId: { in: ids }, status: { in: OPEN_JOB_STATUSES } },
      _count: { _all: true },
    }),
  ]);

  const ratingMap = new Map(ratings.map((row) => [row.runnerId, row]));
  const deliveredMap = new Map(
    delivered.map((row) => [row.runnerId as string, row._count._all]),
  );
  const queueMap = new Map(queued.map((row) => [row.runnerId as string, row._count._all]));

  return rankAgents(
    agents.map((agent) => {
      const rating = ratingMap.get(agent.id);
      const average = rating?._avg.stars;
      return {
        ...agent,
        averageStars: average == null ? null : Math.round(average * 10) / 10,
        ratingCount: rating?._count._all ?? 0,
        deliveredCount: deliveredMap.get(agent.id) ?? 0,
        queueCount: queueMap.get(agent.id) ?? 0,
      };
    }),
  );
}

export function formatAgentRating(averageStars: number | null, ratingCount: number) {
  if (ratingCount === 0 || averageStars == null) return "No ratings yet";
  const noun = ratingCount === 1 ? "rating" : "ratings";
  return `${averageStars.toFixed(1)} · ${ratingCount} ${noun}`;
}

export function formatAgentQueue(queueCount: number) {
  if (queueCount <= 0) return "No queue";
  return `${queueCount} in queue`;
}
