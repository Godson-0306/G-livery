import { requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { formatNgn } from "@/lib/money";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export default async function RunnerCustomersPage() {
  const session = await requireRole("runner");
  const runner = await prisma.runner.findUnique({ where: { userId: session.user.id } });
  if (!runner) return <p>Delivery agent profile missing.</p>;

  const grouped = await prisma.order.groupBy({
    by: ["studentId"],
    where: { runnerId: runner.id },
    _count: { _all: true },
    _sum: { totalAmount: true },
  });

  const students = await prisma.user.findMany({
    where: { id: { in: grouped.map((row) => row.studentId) } },
  });
  const byId = new Map(students.map((student) => [student.id, student]));

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Delivery agent"
        title="My customers"
        subtitle="Students who ordered through your link or jobs you fulfilled."
      />
      {grouped.length === 0 ? (
        <EmptyState
          title="No customers yet"
          body="Share your personal link so students tag orders to you. They’ll show up here."
          actionHref="/dashboard/runner"
          actionLabel="Copy your link"
        />
      ) : (
        <ul className="space-y-2">
          {grouped.map((row) => {
            const student = byId.get(row.studentId);
            return (
              <li key={row.studentId}>
                <Card>
                  <p className="font-medium text-forest">{student?.name ?? "Student"}</p>
                  <p className="text-sm text-muted">
                    {student?.phone ?? student?.email} · {row._count._all} orders ·{" "}
                    {formatNgn(row._sum.totalAmount ?? 0)}
                  </p>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
