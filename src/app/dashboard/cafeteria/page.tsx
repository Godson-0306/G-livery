import { requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { buttonClass } from "@/components/ui/button";
import { StatusChip } from "@/components/ui/status-chip";
import { formatNgn } from "@/lib/money";
import { RefreshOnInterval } from "@/components/refresh-on-interval";
import Link from "next/link";
import { updateCafeteriaProfileAction } from "@/actions/menu";
import { CafeteriaProfileForm } from "./profile-form";
import { CafeteriaLogo } from "@/components/cafeteria-logo";
import { Card, StatCard } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { StatusActions } from "@/components/orders/status-actions";

export default async function CafeteriaHomePage() {
  const session = await requireRole("cafeteria");
  const cafeteria = await prisma.cafeteria.findFirst({
    where: { ownerId: session.user.id },
    include: {
      _count: { select: { menuItems: true, orders: true } },
    },
  });

  if (!cafeteria) {
    return (
      <EmptyState
        title="No kitchen linked"
        body="Ask a G-Livery admin to onboard this cafeteria account."
      />
    );
  }

  const [incoming, recent] = await Promise.all([
    prisma.order.findMany({
      where: { cafeteriaId: cafeteria.id, status: { in: ["accepted", "preparing"] } },
      include: { student: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.order.findMany({
      where: { cafeteriaId: cafeteria.id },
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { student: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <RefreshOnInterval />
      <PageHeader
        eyebrow="Kitchen"
        title={cafeteria.name}
        subtitle={cafeteria.isActive ? "Live to students" : "Hidden until admin activates"}
        action={
          <Link href="/dashboard/cafeteria/menu/new" className={buttonClass("primary")}>
            Add menu item
          </Link>
        }
      />
      <div className="flex items-center gap-3">
        <CafeteriaLogo src={cafeteria.logoUrl} name={cafeteria.name} size="lg" />
        <p className="text-sm text-muted">{cafeteria.location ?? "Set your building in the profile below."}</p>
      </div>
      <section>
        <h2 className="font-semibold text-forest">Incoming — needs the kitchen</h2>
        <p className="text-sm text-muted">Start preparing and mark ready. Agents cannot pick up until you do.</p>
        {incoming.length === 0 ? (
          <div className="mt-3">
            <EmptyState
              title="No tickets on the pass"
              body="When an agent accepts, the order lands here. Start preparing, then mark ready."
              actionHref="/dashboard/cafeteria/orders"
              actionLabel="See all orders"
            />
          </div>
        ) : (
          <ul className="mt-3 space-y-3">
            {incoming.map((order) => (
              <li key={order.id}>
                <Card>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        href={`/dashboard/cafeteria/orders/${order.id}`}
                        className="font-semibold text-forest"
                      >
                        {order.student.name} · {formatNgn(order.totalAmount)}
                      </Link>
                      <p className="text-sm text-muted">{order.deliveryLocation}</p>
                    </div>
                    <StatusChip status={order.status} />
                  </div>
                  <div className="mt-4">
                    <StatusActions orderId={order.id} status={order.status} role="cafeteria" />
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Menu items" value={cafeteria._count.menuItems} />
        <StatCard label="Orders" value={cafeteria._count.orders} />
      </div>
      <CafeteriaProfileForm
        action={updateCafeteriaProfileAction}
        defaultName={cafeteria.name}
        defaultLocation={cafeteria.location ?? ""}
        defaultDescription={cafeteria.description ?? ""}
        currentLogoUrl={cafeteria.logoUrl}
      />
      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-forest">Recent orders</h2>
          <Link href="/dashboard/cafeteria/orders" className="text-sm font-semibold text-forest">
            See all
          </Link>
        </div>
        <ul className="mt-3 space-y-2">
          {recent.map((order) => (
            <li key={order.id}>
              <Link href={`/dashboard/cafeteria/orders/${order.id}`}>
                <Card className="flex items-center justify-between py-3">
                  <span>
                    {order.student.name} · {formatNgn(order.totalAmount)}
                  </span>
                  <StatusChip status={order.status} />
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
