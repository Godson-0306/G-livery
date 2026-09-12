import { requireRole } from "@/lib/auth-guards";
import { toggleCafeteriaActiveAction } from "@/actions/admin";
import { CafeteriaLogo } from "@/components/cafeteria-logo";
import { buttonClass } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export default async function AdminCafeteriasPage() {
  await requireRole("admin");
  const cafeterias = await prisma.cafeteria.findMany({
    include: { owner: true, _count: { select: { menuItems: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Admin"
        title="Cafeterias"
        subtitle="Onboard kitchens here. There is no public cafeteria signup."
        action={
          <Link href="/dashboard/admin/cafeterias/new" className={buttonClass("primary")}>
            Onboard kitchen
          </Link>
        }
      />
      {cafeterias.length === 0 ? (
        <EmptyState
          title="No kitchens yet"
          body="Create a cafeteria and owner login, then activate it for students."
          actionHref="/dashboard/admin/cafeterias/new"
          actionLabel="Onboard kitchen"
        />
      ) : (
        <ul className="space-y-3">
          {cafeterias.map((cafeteria) => (
            <li key={cafeteria.id}>
              <Card>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <CafeteriaLogo src={cafeteria.logoUrl} name={cafeteria.name} size="lg" />
                    <div>
                      <h2 className="font-semibold text-forest">{cafeteria.name}</h2>
                      <p className="text-sm text-muted">
                        {cafeteria.location} · owner {cafeteria.owner.email}
                      </p>
                      <p className="text-xs text-muted">
                        /cafeteria/{cafeteria.slug} · {cafeteria._count.menuItems} items ·{" "}
                        {cafeteria.isActive ? "live" : "inactive"}
                      </p>
                    </div>
                  </div>
                  <form
                    action={async () => {
                      "use server";
                      await toggleCafeteriaActiveAction(cafeteria.id, !cafeteria.isActive);
                    }}
                  >
                    <button type="submit" className={buttonClass("secondary", "h-9")}>
                      {cafeteria.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </form>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
