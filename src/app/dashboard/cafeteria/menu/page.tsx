import { requireRole } from "@/lib/auth-guards";
import { deleteMenuItemAction, toggleSoldOutAction } from "@/actions/menu";
import { buttonClass } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { formatNgn } from "@/lib/money";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export default async function CafeteriaMenuPage() {
  const session = await requireRole("cafeteria");
  const cafeteria = await prisma.cafeteria.findFirst({
    where: { ownerId: session.user.id },
    include: { menuItems: { orderBy: { name: "asc" } } },
  });
  if (!cafeteria) return <p>No cafeteria linked.</p>;

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Kitchen"
        title="Menu"
        subtitle="Mark sold out when an item is gone. Students see that instantly on the e-menu."
        action={
          <Link href="/dashboard/cafeteria/menu/new" className={buttonClass("primary")}>
            Add item
          </Link>
        }
      />
      {cafeteria.menuItems.length === 0 ? (
        <EmptyState
          title="Menu is empty"
          body="Add a few dishes with photos so the public e-menu feels like a real counter."
          actionHref="/dashboard/cafeteria/menu/new"
          actionLabel="Add first item"
        />
      ) : (
        <ul className="space-y-3">
          {cafeteria.menuItems.map((item) => (
            <li key={item.id}>
              <Card>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-forest">{item.name}</h2>
                    <p className="text-sm text-muted">
                      {formatNgn(item.price)}
                      {item.category ? ` · ${item.category}` : ""}
                      {item.isAvailable ? "" : " · sold out"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <form
                      action={async () => {
                        "use server";
                        await toggleSoldOutAction(item.id);
                      }}
                    >
                      <button type="submit" className={buttonClass("secondary", "h-8 text-xs")}>
                        {item.isAvailable ? "Mark sold out" : "Mark available"}
                      </button>
                    </form>
                    <Link href={`/dashboard/cafeteria/menu/${item.id}/edit`} className={buttonClass("ghost", "h-8 text-xs")}>
                      Edit
                    </Link>
                    <form
                      action={async () => {
                        "use server";
                        await deleteMenuItemAction(item.id);
                      }}
                    >
                      <button type="submit" className={buttonClass("danger", "h-8 text-xs")}>
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
