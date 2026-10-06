"use client";

import {
  cancelMyOrderAction,
  declineOrderAction,
  updateOrderStatusAction,
} from "@/actions/orders";
import { buttonClass } from "@/components/ui/button";
import type { OrderStatus, Role } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function StatusActions({
  orderId,
  status,
  role,
  taggedToMe,
}: {
  orderId: string;
  status: OrderStatus;
  role: Role;
  taggedToMe?: boolean;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function run(fn: () => Promise<{ error?: string; redirectTo?: string } | void>) {
    setError(null);
    start(async () => {
      const result = await fn();
      if (result && "error" in result && result.error) {
        setError(result.error);
        return;
      }
      if (result && "redirectTo" in result && result.redirectTo) {
        router.push(result.redirectTo);
      }
    });
  }

  const actions: Array<{ label: string; variant?: "primary" | "secondary" | "danger"; onClick: () => void }> =
    [];

  if (role === "student" && status === "placed") {
    actions.push({
      label: "Cancel order",
      variant: "danger",
      onClick: () => run(() => cancelMyOrderAction(orderId)),
    });
  }

  if (role === "runner") {
    if (status === "placed") {
      actions.push({
        label: "Accept order",
        onClick: () => run(() => updateOrderStatusAction(orderId, "accepted")),
      });
      if (taggedToMe) {
        actions.push({
          label: "Decline to pool",
          variant: "secondary",
          onClick: () => run(() => declineOrderAction(orderId)),
        });
      }
    }
    if (status === "accepted") {
      actions.push({
        label: "On the way",
        onClick: () => run(() => updateOrderStatusAction(orderId, "picked_up")),
      });
    }
    if (status === "picked_up") {
      actions.push({
        label: "Mark delivered",
        onClick: () => run(() => updateOrderStatusAction(orderId, "delivered")),
      });
    }
  }

  const showAgentChat =
    role === "runner" && (status === "accepted" || status === "picked_up" || status === "delivered");

  if (actions.length === 0 && !showAgentChat) return null;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            disabled={pending}
            onClick={action.onClick}
            className={buttonClass(
              action.variant ?? "primary",
              "h-11 min-w-[10rem] flex-1 px-5 sm:flex-none",
            )}
          >
            {pending ? "Updating…" : action.label}
          </button>
        ))}
        {showAgentChat ? (
          <Link
            href={`/dashboard/runner/orders/${orderId}#chat`}
            className={buttonClass("secondary", "h-11 min-w-[10rem] flex-1 px-5 sm:flex-none")}
          >
            Message student
          </Link>
        ) : null}
      </div>
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
    </div>
  );
}
