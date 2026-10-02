import { requireRole } from "@/lib/auth-guards";
import { setRunnerSubscriptionAction, toggleUserDisabledAction } from "@/actions/admin";
import { buttonClass } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatusChip } from "@/components/ui/status-chip";
import { roleLabel } from "@/lib/labels";
import { formatNgn } from "@/lib/money";
import { hasPayoutDetails } from "@/lib/payout";
import { fetchRunnerPayout } from "@/lib/payout-db";
import { prisma } from "@/lib/prisma";
import { syncRunnerSubscription } from "@/lib/subscription";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("admin");
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      runner: { include: { _count: { select: { orders: true } } } },
      ownedCafeterias: { orderBy: { name: "asc" } },
      orders: {
        include: { cafeteria: true },
        orderBy: { createdAt: "desc" },
        take: 12,
      },
    },
  });
  if (!user) notFound();

  if (user.runner) await syncRunnerSubscription(user.runner.id);
  const runner = user.runner
    ? await prisma.runner.findUniqueOrThrow({
        where: { id: user.runner.id },
        include: { _count: { select: { orders: true } } },
      })
    : null;
  const payout = runner ? await fetchRunnerPayout(runner.id) : null;

  return (
    <div className="space-y-5">
      <Link href="/dashboard/admin/users" className="text-sm font-semibold text-forest">
        ← Users
      </Link>
      <PageHeader
        eyebrow="Admin"
        title={user.name}
        subtitle={`${roleLabel(user.role)}${user.isDisabled ? " · disabled" : ""}`}
        action={
          user.role !== "admin" ? (
            <form
              action={async () => {
                "use server";
                await toggleUserDisabledAction(user.id, !user.isDisabled);
              }}
            >
              <button type="submit" className={buttonClass("secondary", "h-9")}>
                {user.isDisabled ? "Enable account" : "Disable account"}
              </button>
            </form>
          ) : null
        }
      />

      <Card>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber">Phone</p>
        {user.phone ? (
          <a href={`tel:${user.phone}`} className="mt-2 block select-all text-3xl font-semibold tabular-nums tracking-tight text-forest">
            {user.phone}
          </a>
        ) : (
          <p className="mt-2 text-lg font-semibold text-muted">No phone on file</p>
        )}
        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          <Detail label="Email">
            <a href={`mailto:${user.email}`} className="break-all font-semibold text-forest">
              {user.email}
            </a>
          </Detail>
          <Detail label="Role">{roleLabel(user.role)}</Detail>
          <Detail label="Account">{user.isDisabled ? "Disabled" : "Active"}</Detail>
          <Detail label="Sign-in">{user.passwordHash ? "Email and password" : "Google"}</Detail>
          <Detail label="Signed up">
            {user.createdAt.toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}
          </Detail>
        </dl>
      </Card>

      {runner ? (
        <Card>
          <h2 className="font-semibold text-forest">Delivery agent</h2>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <Detail label="Personal link">
              <Link href={`/r/${runner.personalSlug}`} className="font-semibold text-forest">
                /r/{runner.personalSlug}
              </Link>
            </Detail>
            <Detail label="Accepting orders">{runner.isAcceptingOrders ? "Yes" : "Paused"}</Detail>
            <Detail label="Subscription">{runner.subscriptionStatus}</Detail>
            <Detail label="Expires">
              {runner.subscriptionExpiresAt
                ? runner.subscriptionExpiresAt.toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "—"}
            </Detail>
            <Detail label="Orders">{runner._count.orders}</Detail>
          </dl>
          <div className="mt-5 border-t border-line pt-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber">Payout account</p>
            {payout && hasPayoutDetails(payout) ? (
              <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                <Detail label="Bank">{payout.bankName}</Detail>
                <Detail label="Account name">{payout.accountName}</Detail>
                <Detail label="Account number">
                  <span className="select-all tabular-nums">{payout.accountNumber}</span>
                </Detail>
              </dl>
            ) : (
              <p className="mt-2 text-sm font-semibold text-amber">Payout details incomplete</p>
            )}
          </div>
          <form action={setRunnerSubscriptionAction} className="mt-5 flex flex-wrap gap-2">
            <input type="hidden" name="runnerId" value={runner.id} />
            <button name="status" value="active" className={buttonClass("primary", "h-8 text-xs")}>
              Activate
            </button>
            <button name="status" value="inactive" className={buttonClass("secondary", "h-8 text-xs")}>
              Deactivate
            </button>
            <button name="status" value="expired" className={buttonClass("secondary", "h-8 text-xs")}>
              Mark expired
            </button>
          </form>
        </Card>
      ) : null}

      {user.ownedCafeterias.length > 0 ? (
        <Card>
          <h2 className="font-semibold text-forest">Kitchens</h2>
          <ul className="mt-3 space-y-2">
            {user.ownedCafeterias.map((kitchen) => (
              <li key={kitchen.id} className="text-sm">
                <span className="font-semibold text-forest">{kitchen.name}</span>
                <span className="text-muted">
                  {" · "}
                  {kitchen.location ?? "Campus"}
                  {kitchen.isActive ? "" : " · inactive"}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {user.role === "student" ? (
        <section>
          <h2 className="font-semibold text-forest">Recent orders</h2>
          {user.orders.length === 0 ? (
            <p className="mt-2 text-sm text-muted">No orders yet.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {user.orders.map((order) => (
                <li key={order.id}>
                  <Card className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                    <span>
                      <span className="font-medium text-forest">{order.cafeteria.name}</span>
                      {" · "}
                      {formatNgn(order.totalAmount)}
                      {" · "}
                      {order.deliveryLocation}
                    </span>
                    <StatusChip status={order.status} />
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </div>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-0.5 font-medium text-forest">{children}</dd>
    </div>
  );
}
