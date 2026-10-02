import { requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { buttonClass } from "@/components/ui/button";
import { Card, StatCard } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatusChip } from "@/components/ui/status-chip";
import { formatNgn, toMoney } from "@/lib/money";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CustomerAvatar } from "../customer-avatar";
import { formatWhen, isOpenJob } from "../customer-types";

export default async function RunnerCustomerDetailPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const session = await requireRole("runner");
  const { studentId } = await params;
  const runner = await prisma.runner.findUnique({ where: { userId: session.user.id } });
  if (!runner) notFound();

  const student = await prisma.user.findUnique({
    where: { id: studentId },
    select: { id: true, name: true, phone: true, email: true },
  });
  if (!student) notFound();

  const orders = await prisma.order.findMany({
    where: { runnerId: runner.id, studentId: student.id },
    include: { cafeteria: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  if (orders.length === 0) notFound();

  const delivered = orders.filter((order) => order.status === "delivered").length;
  const active = orders.filter((order) => isOpenJob(order.status)).length;
  const volume = orders.reduce(
    (sum, order) => sum + (order.status === "cancelled" ? 0 : toMoney(order.totalAmount)),
    0,
  );
  const last = orders[0];
  const firstName = student.name.split(" ")[0] ?? student.name;

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/dashboard/runner/customers"
          className="text-sm font-semibold text-forest hover:underline"
        >
          ← All customers
        </Link>
        <PageHeader
          className="mt-2"
          eyebrow="Customer"
          title={student.name}
          subtitle={
            last
              ? `${last.deliveryLocation} · last job ${formatWhen(last.createdAt.toISOString())}`
              : undefined
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Orders" value={orders.length} />
        <StatCard label="Delivered" value={delivered} />
        <StatCard label="Open" value={active} />
        <StatCard label="Volume" value={formatNgn(volume)} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(16rem,20rem)_1fr] lg:items-start">
        <aside className="lg:sticky lg:top-24">
          <Card>
            <div className="flex items-start gap-4">
              <CustomerAvatar name={student.name} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-forest">{student.name}</p>
                <p className="mt-1 break-all text-sm text-muted">{student.email}</p>
                <p className="mt-0.5 text-sm font-medium tabular-nums text-forest">
                  {student.phone ?? "No phone on file"}
                </p>
                {active > 0 ? (
                  <p className="mt-2 inline-flex rounded-full bg-amber/20 px-2.5 py-0.5 text-[11px] font-semibold text-stone-900">
                    {active} open {active === 1 ? "job" : "jobs"}
                  </p>
                ) : null}
              </div>
            </div>
            <div
              className={
                student.phone
                  ? "mt-4 grid grid-cols-2 gap-2 lg:grid-cols-1"
                  : "mt-4 grid grid-cols-1 gap-2"
              }
            >
              {student.phone ? (
                <a href={`tel:${student.phone}`} className={buttonClass("amber", "h-11 w-full")}>
                  Call {firstName}
                </a>
              ) : null}
              <a href={`mailto:${student.email}`} className={buttonClass("secondary", "h-11 w-full")}>
                Email
              </a>
            </div>
          </Card>
        </aside>

        <section>
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-semibold text-forest">Jobs with you</h2>
            <p className="text-xs font-medium text-muted">
              {orders.length} {orders.length === 1 ? "order" : "orders"}
            </p>
          </div>

          <ul className="mt-3 space-y-3 md:hidden">
            {orders.map((order) => (
              <li key={order.id}>
                <Link href={`/dashboard/runner/orders/${order.id}`}>
                  <Card className="flex items-start justify-between gap-3 p-4 transition hover:border-forest/40">
                    <div className="min-w-0">
                      <p className="font-semibold text-forest">{order.cafeteria.name}</p>
                      <p className="mt-0.5 text-sm text-muted">{order.deliveryLocation}</p>
                      <p className="mt-1 text-xs text-muted">{formatWhen(order.createdAt.toISOString())}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <StatusChip status={order.status} />
                      <p className="mt-2 text-sm font-semibold tabular-nums text-forest">
                        {formatNgn(order.totalAmount)}
                      </p>
                    </div>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-3 hidden overflow-hidden rounded-[1.4rem] border border-line bg-card md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[36rem] text-left text-sm">
                <thead className="bg-forest-soft/70 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                  <tr>
                    <th className="px-5 py-3">When</th>
                    <th className="px-5 py-3">Kitchen</th>
                    <th className="px-5 py-3">Drop-off</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {orders.map((order) => (
                    <tr key={order.id} className="transition hover:bg-forest-soft/40">
                      <td className="px-5 py-3.5 whitespace-nowrap text-muted">
                        {formatWhen(order.createdAt.toISOString())}
                      </td>
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/dashboard/runner/orders/${order.id}`}
                          className="whitespace-nowrap font-semibold text-forest hover:underline"
                        >
                          {order.cafeteria.name}
                        </Link>
                      </td>
                      <td className="max-w-[14rem] truncate px-5 py-3.5 text-muted">
                        {order.deliveryLocation}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusChip status={order.status} />
                      </td>
                      <td className="px-5 py-3.5 text-right font-semibold tabular-nums text-forest">
                        {formatNgn(order.totalAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
