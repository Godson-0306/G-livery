import { requireSession } from "@/lib/auth-guards";
import { DashboardShell } from "@/components/dashboard/shell";
import { unreadCount } from "@/lib/notifications";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const unread = await unreadCount(session.user.id);

  return (
    <DashboardShell
      role={session.user.role}
      name={session.user.name ?? session.user.email ?? "Account"}
      unread={unread}
    >
      {children}
    </DashboardShell>
  );
}
