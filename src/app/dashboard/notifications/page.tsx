import { requireSession } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { markNotificationsReadAction } from "@/actions/notifications";
import { buttonClass } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import Link from "next/link";

export default async function NotificationsPage() {
  const session = await requireSession();
  const items = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 40,
  });

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Inbox"
        title="Alerts"
        action={
          items.length > 0 ? (
            <form action={markNotificationsReadAction}>
              <button type="submit" className={buttonClass("secondary", "h-9 text-xs")}>
                Mark all read
              </button>
            </form>
          ) : null
        }
      />
      {items.length === 0 ? (
        <EmptyState title="No alerts yet" body="Status changes on your orders will show up here." />
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              <Card>
                <p className="font-medium text-forest">
                  {item.title}
                  {!item.readAt ? <span className="ml-2 text-xs text-amber">new</span> : null}
                </p>
                <p className="text-sm text-muted">{item.body}</p>
                {item.link ? (
                  <Link href={item.link} className="mt-2 inline-block text-sm font-semibold text-forest">
                    Open
                  </Link>
                ) : null}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
