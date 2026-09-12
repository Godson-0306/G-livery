import { requireRole } from "@/lib/auth-guards";
import { toggleUserDisabledAction } from "@/actions/admin";
import { buttonClass } from "@/components/ui/button";
import { roleLabel } from "@/lib/labels";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export default async function AdminUsersPage() {
  await requireRole("admin");
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-4">
      <PageHeader eyebrow="Admin" title="Users" subtitle="Disable an account if it should not sign in." />
      {users.length === 0 ? (
        <EmptyState title="No users" body="Signups and admin-created kitchens will list here." />
      ) : (
        <ul className="space-y-2">
          {users.map((user) => (
            <li key={user.id}>
              <Card className="flex flex-wrap items-center justify-between gap-2 py-4">
                <div>
                  <p className="font-medium text-forest">{user.name}</p>
                  <p className="text-sm text-muted">
                    {user.email} · {roleLabel(user.role)}
                    {user.isDisabled ? " · disabled" : ""}
                  </p>
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
