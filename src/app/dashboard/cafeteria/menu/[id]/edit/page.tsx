import { updateMenuItemAction } from "@/actions/menu";
import { requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { MenuItemForm } from "../../item-form";
import { PageHeader } from "@/components/ui/page-header";

export default async function EditMenuItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole("cafeteria");
  const { id } = await params;
  const cafeteria = await prisma.cafeteria.findFirst({ where: { ownerId: session.user.id } });
  if (!cafeteria) notFound();
  const item = await prisma.menuItem.findFirst({ where: { id, cafeteriaId: cafeteria.id } });
  if (!item) notFound();

  return (
    <div className="space-y-4">
      <PageHeader eyebrow="Kitchen" title={`Edit ${item.name}`} />
      <MenuItemForm
        action={updateMenuItemAction}
        submitLabel="Save changes"
        defaults={{
          id: item.id,
          name: item.name,
          description: item.description ?? "",
          price: String(Number(item.price)),
          category: item.category ?? "",
        }}
      />
    </div>
  );
}
