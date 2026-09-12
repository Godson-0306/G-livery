import { createMenuItemAction } from "@/actions/menu";
import { MenuItemForm } from "../item-form";
import { PageHeader } from "@/components/ui/page-header";

export default function NewMenuItemPage() {
  return (
    <div className="space-y-4">
      <PageHeader eyebrow="Kitchen" title="Add menu item" subtitle="Name, price, and a photo go a long way on the e-menu." />
      <MenuItemForm action={createMenuItemAction} submitLabel="Create item" />
    </div>
  );
}
