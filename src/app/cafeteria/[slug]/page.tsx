import { CartBar } from "@/components/cart/cart-bar";
import { CafeteriaLogo } from "@/components/cafeteria-logo";
import { MenuBrowser } from "@/components/menu/menu-browser";
import { SiteHeader } from "@/components/site-header";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function PublicCafeteriaPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ runner?: string }>;
}) {
  const { slug } = await params;
  const { runner } = await searchParams;
  const cafeteria = await prisma.cafeteria.findUnique({
    where: { slug },
    include: { menuItems: { orderBy: [{ category: "asc" }, { name: "asc" }] } },
  });
  if (!cafeteria || !cafeteria.isActive) notFound();

  return (
    <div className="min-h-full">
      <SiteHeader />
      <main className="page-wrap max-w-lg py-8">
        <div className="flex items-start gap-4">
          <CafeteriaLogo src={cafeteria.logoUrl} name={cafeteria.name} size="xl" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber">Live e-menu</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-forest">{cafeteria.name}</h1>
            <p className="mt-1 text-sm text-muted">{cafeteria.location}</p>
          </div>
        </div>
        {cafeteria.description ? (
          <p className="mt-4 text-sm text-muted">{cafeteria.description}</p>
        ) : null}
        {runner ? (
          <p className="mt-3 rounded-2xl bg-forest-soft px-4 py-3 text-sm text-forest">
            This bag will be tagged to your delivery agent. Pay food to the kitchen; agent transfer
            details show on your order after they accept.
          </p>
        ) : (
          <p className="mt-3 text-sm text-muted">
            Pay the cafeteria for food off-platform. An available agent can pick this up from the pool.
          </p>
        )}
        <div className="mt-6">
          <MenuBrowser
            cafeteriaId={cafeteria.id}
            cafeteriaSlug={cafeteria.slug}
            cafeteriaName={cafeteria.name}
            runnerSlug={runner ?? null}
            items={cafeteria.menuItems.map((item) => ({
              id: item.id,
              name: item.name,
              description: item.description,
              price: Number(item.price),
              photoUrl: item.photoUrl,
              isAvailable: item.isAvailable,
              category: item.category,
            }))}
          />
        </div>
      </main>
      <CartBar />
    </div>
  );
}
