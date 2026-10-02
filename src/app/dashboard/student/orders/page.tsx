import { requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { RefreshOnInterval } from "@/components/refresh-on-interval";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { StudentOrderRow } from "@/components/orders/student-order-row";

export default async function StudentOrdersPage() {
  const session = await requireRole("student");
  const orders = await prisma.order.findMany({
    where: { studentId: session.user.id },
    include: { cafeteria: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <RefreshOnInterval />
      <PageHeader
        eyebrow="Student"
        title="Order history"
        subtitle="Open any order to see the timeline and who to pay."
      />
      {orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          body="Browse a cafeteria and place your first bag. Tracking and transfer details show up here."
          actionHref="/cafeterias"
          actionLabel="Browse cafeterias"
        />
      ) : (
        <ul className="space-y-2">
          {orders.map((order) => (
            <li key={order.id}>
              <StudentOrderRow
                href={`/dashboard/student/orders/${order.id}`}
                cafeteriaName={order.cafeteria.name}
                cafeteriaLogoUrl={order.cafeteria.logoUrl}
                amount={order.totalAmount}
                location={order.deliveryLocation}
                createdAt={order.createdAt}
                status={order.status}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
