import { requireRole } from "@/lib/auth-guards";
import { toggleUserDisabledAction } from "@/actions/admin";
import { buttonClass } from "@/components/ui/button";
import { roleLabel } from "@/lib/labels";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import Link from "next/link";

export default async function AdminUsersPage() {
  await requireRole("admin");
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Admin"
        title="Users"
        subtitle="Open anyone for phone and full account details. Disable an account if it should not sign in."
      />
      {users.length === 0 ? (
        <EmptyState title="No users" body="Signups and admin-created kitchens will list here." />
      ) : (
        <ul className="space-y-2">
          {users.map((user) => (
            <li key={user.id}>
              <Card className="flex flex-wrap items-center justify-between gap-2 py-4">
                <div className="min-w-0 flex-1">
                  <Link href={`/dashboard/admin/users/${user.id}`}>
                    <p className="font-medium text-forest">{user.name}</p>
                    <p className="text-sm text-muted">
                      {user.email} · {roleLabel(user.role)}
                      {user.isDisabled ? " · disabled" : ""}
                    </p>
                  </Link>
                  {user.phone ? (
                    <a href={`tel:${user.phone}`} className="mt-1 block text-sm font-semibold tabular-nums text-forest">
                      {user.phone}
                    </a>
                  ) : (
                    <p className="mt-1 text-sm text-muted">No phone</p>
                  )}
                </div>
                {user.role !== "admin" ? (
                  <form
                    action={async () => {
                      "use server";
                      await toggleUserDisabledAction(user.id, !user.isDisabled);
                    }}
                  >
                    <button type="submit" className={buttonClass("secondary", "h-8 text-xs")}>
                      {user.isDisabled ? "Enable" : "Disable"}
                    </button>
                  </form>
                ) : null}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
