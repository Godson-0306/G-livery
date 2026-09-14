"use client";

import { logoutToCheckoutLoginAction } from "@/actions/auth";
import { placeOrderAction } from "@/actions/orders";
import { useCart } from "@/components/cart/cart-provider";
import { AgentPicker } from "@/components/checkout/agent-picker";
import { buttonClass } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, fieldClass } from "@/components/ui/field";
import { PageHeader } from "@/components/ui/page-header";
import type { AgentBoardRow } from "@/lib/agents";
import { formatNgn } from "@/lib/money";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useActionState, useMemo } from "react";

export function CheckoutClient({ agents }: { agents: AgentBoardRow[] }) {
  const { cart, ready, setQuantity, subtotal } = useCart();
  const { data: session, status } = useSession();
  const payload = useMemo(() => {
    if (!cart) return "";
    return JSON.stringify({
      cafeteriaId: cart.cafeteriaId,
      runnerSlug: cart.runnerSlug,
      items: cart.items.map((item) => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
      })),
    });
  }, [cart]);

  const [state, formAction, pending] = useActionState(placeOrderAction, undefined);

  if (!ready || status === "loading") {
    return (
      <main className="page-wrap max-w-lg py-12">
        <PageHeader title="Checkout" subtitle="Loading your bag…" />
      </main>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <main className="page-wrap max-w-lg py-12">
        <EmptyState
          title="Your bag is empty"
          body="Pick a cafeteria and add a few items. You’ll transfer the food total to the Agent."
          actionHref="/cafeterias"
          actionLabel="Browse cafeterias"
        />
      </main>
    );
  }

  if (status === "authenticated" && session?.user.role !== "student") {
    return (
      <main className="page-wrap max-w-lg py-12">
        <PageHeader
          title="Student account needed"
          subtitle={`You are logged in as ${session.user.role === "runner" ? "a delivery agent" : session.user.role}. Food orders have to be placed from a student account. Your bag will stay saved.`}
        />
        <form action={logoutToCheckoutLoginAction} className="mt-6">
          <button type="submit" className={buttonClass("primary", "h-11")}>
            Log in as a student
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="page-wrap max-w-lg py-8">
      <PageHeader
        eyebrow="Checkout"
        title={cart.cafeteriaName}
        subtitle={checkoutSubtitle(cart.runnerSlug, agents)}
      />
      <AgentPicker agents={agents} />
      <Card className="mt-6" padded={false}>
        <ul className="divide-y divide-line">
          {cart.items.map((item) => (
            <li key={item.menuItemId} className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted">{formatNgn(item.price)} each</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className={buttonClass("secondary", "h-8 w-8 p-0")}
                  onClick={() => setQuantity(item.menuItemId, item.quantity - 1)}
                >
                  −
                </button>
                <span className="w-6 text-center">{item.quantity}</span>
                <button
                  type="button"
                  className={buttonClass("primary", "h-8 w-8 p-0")}
                  onClick={() => setQuantity(item.menuItemId, item.quantity + 1)}
                >
                  +
                </button>
              </div>
            </li>
          ))}
        </ul>
        <div className="border-t border-line px-4 py-4">
          <p className="text-right text-lg font-semibold">Food total {formatNgn(subtotal)}</p>
          <p className="mt-1 text-right text-xs text-muted">
            After an Agent accepts, transfer the food total to them. They pay the cafeteria.
          </p>
        </div>
      </Card>

      {status !== "authenticated" ? (
        <Link href="/login?callbackUrl=/checkout" className={buttonClass("primary", "mt-6 w-full h-11")}>
          Log in as a student to place order
        </Link>
      ) : (
        <form action={formAction} className="mt-6 space-y-3">
          <input type="hidden" name="payload" value={payload} />
          <Field label="Delivery location on campus">
            <input
              name="deliveryLocation"
              required
              placeholder="e.g. Prophet Moses Block 1, Room 30"
              className={fieldClass()}
            />
          </Field>
          <Field label="Notes (optional)">
            <input name="notes" placeholder="No extra pepper" className={fieldClass()} />
          </Field>
          {state?.error ? <p className="text-sm text-rose-700">{state.error}</p> : null}
          <button type="submit" disabled={pending} className={buttonClass("primary", "w-full h-11")}>
            {pending ? "Placing order…" : "Place order"}
          </button>
        </form>
      )}
    </main>
  );
}

function checkoutSubtitle(runnerSlug: string | null | undefined, agents: AgentBoardRow[]) {
  if (!runnerSlug) {
    return "Any available Agent can pick this up. Transfer the food total after they accept.";
  }
  const named = agents.find((agent) => agent.slug === runnerSlug);
  if (named) {
    return `Tagged to ${named.name}. Transfer the food total to this Agent after they accept.`;
  }
  return `Tagged to agent /r/${runnerSlug}. Transfer the food total to this Agent after they accept.`;
}
