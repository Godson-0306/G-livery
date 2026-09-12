import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export type RunnerPayoutRow = {
  bankName: string;
  accountName: string;
  accountNumber: string;
};

export async function fetchRunnerPayouts(ids: string[]) {
  const unique = [...new Set(ids.filter(Boolean))];
  const map = new Map<string, RunnerPayoutRow>();
  if (unique.length === 0) return map;

  const rows = await prisma.$queryRaw<
    Array<{ id: string; bankName: string | null; accountName: string | null; accountNumber: string | null }>
  >(
    Prisma.sql`SELECT id, "bankName", "accountName", "accountNumber" FROM "Runner" WHERE id IN (${Prisma.join(unique)})`,
  );

  for (const row of rows) {
    map.set(row.id, {
      bankName: row.bankName ?? "",
      accountName: row.accountName ?? "",
      accountNumber: row.accountNumber ?? "",
    });
  }
  return map;
}

export async function fetchRunnerPayout(id: string): Promise<RunnerPayoutRow> {
  return (
    (await fetchRunnerPayouts([id])).get(id) ?? {
      bankName: "",
      accountName: "",
      accountNumber: "",
    }
  );
}
