import { prisma } from "@/lib/prisma";
import type { SubscriptionStatus } from "@prisma/client";

export function deriveSubscriptionStatus(
  expiresAt: Date | null,
  current: SubscriptionStatus,
): SubscriptionStatus {
  if (current === "inactive") return "inactive";
  if (!expiresAt) return current;
  if (expiresAt.getTime() < Date.now()) return "expired";
  return "active";
}

export async function syncRunnerSubscription(runnerId: string) {
  const runner = await prisma.runner.findUnique({ where: { id: runnerId } });
  if (!runner) return null;

  const next = deriveSubscriptionStatus(
    runner.subscriptionExpiresAt,
    runner.subscriptionStatus,
  );

  if (next !== runner.subscriptionStatus) {
    return prisma.runner.update({
      where: { id: runnerId },
      data: { subscriptionStatus: next },
    });
  }

  return runner;
}

export function isRunnerLive(runner: {
  subscriptionStatus: SubscriptionStatus;
  subscriptionExpiresAt: Date | null;
  isAcceptingOrders: boolean;
}) {
  const status = deriveSubscriptionStatus(
    runner.subscriptionExpiresAt,
    runner.subscriptionStatus,
  );
  return status === "active" && runner.isAcceptingOrders;
}
