import { requireSession } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { openNotificationAction } from "@/actions/notifications";
import { MarkAlertsReadOnOpen } from "@/components/alerts/mark-alerts-read-on-open";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { cn } from "@/lib/utils";

export default async function NotificationsPage() {
  const session = await requireSession();
  const items = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: 40,
  });

  const hasUnread = items.some((item) => !item.readAt);

  return (
    <div className="space-y-4">
      <MarkAlertsReadOnOpen hasUnread={hasUnread} />
      <PageHeader
        eyebrow="Inbox"
        title="Alerts"
        subtitle="Newest first. Opening this page marks alerts as read."
      />
      {items.length === 0 ? (
        <EmptyState title="No alerts yet" body="Status changes on your orders will show up here." />
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              <form action={openNotificationAction}>
                <input type="hidden" name="id" value={item.id} />
                <button type="submit" className="w-full text-left">
                  <Card className={cn("transition", !item.readAt && "border-amber/50 bg-amber/5")}>
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-medium text-forest">
                        {item.title}
                        {!item.readAt ? <span className="ml-2 text-xs text-amber">new</span> : null}
                      </p>
                      <time
                        dateTime={item.createdAt.toISOString()}
                        className="shrink-0 text-xs text-muted"
                      >
                        {item.createdAt.toLocaleString("en-NG", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </time>
                    </div>
                    <p className="mt-1 text-sm text-muted">{item.body}</p>
                    <p className="mt-2 text-sm font-semibold text-forest">
                      {item.link ? "Open →" : item.readAt ? "Read" : "Mark as read"}
                    </p>
                  </Card>
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
