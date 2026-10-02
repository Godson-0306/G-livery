import { requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { toMoney } from "@/lib/money";
import { CustomersBoard } from "./customers-board";
import { isOpenJob, type CustomerRow } from "./customer-types";

export default async function RunnerCustomersPage() {
  const session = await requireRole("runner");
  const runner = await prisma.runner.findUnique({ where: { userId: session.user.id } });
  if (!runner) return <p>Delivery agent profile missing.</p>;

  const orders = await prisma.order.findMany({
    where: { runnerId: runner.id },
    include: {
      student: { select: { id: true, name: true, phone: true, email: true } },
      cafeteria: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const byStudent = new Map<string, CustomerRow>();
  for (const order of orders) {
    const existing = byStudent.get(order.studentId);
    const amount = order.status === "cancelled" ? 0 : toMoney(order.totalAmount);
    if (!existing) {
      byStudent.set(order.studentId, {
        id: order.student.id,
        name: order.student.name,
        phone: order.student.phone,
        email: order.student.email,
        orders: 1,
        delivered: order.status === "delivered" ? 1 : 0,
        active: isOpenJob(order.status) ? 1 : 0,
        volume: amount,
        lastOrderAt: order.createdAt.toISOString(),
        lastLocation: order.deliveryLocation,
        lastCafeteria: order.cafeteria.name,
      });
      continue;
    }
    existing.orders += 1;
    if (order.status === "delivered") existing.delivered += 1;
    if (isOpenJob(order.status)) existing.active += 1;
    existing.volume += amount;
  }

  const customers = [...byStudent.values()];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Delivery agent"
        title="My customers"
        subtitle="Search, call, and reopen jobs for students you run for."
      />
      {customers.length === 0 ? (
        <EmptyState
          title="No customers yet"
          body="Share your personal link so students tag orders to you. They’ll show up here."
          actionHref="/dashboard/runner"
          actionLabel="Copy your link"
        />
      ) : (
        <CustomersBoard customers={customers} />
      )}
    </div>
  );
}
