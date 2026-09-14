"use client";

import {
  cancelMyOrderAction,
  declineOrderAction,
  updateOrderStatusAction,
} from "@/actions/orders";
import { buttonClass } from "@/components/ui/button";
import type { OrderStatus, Role } from "@prisma/client";
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

  function run(fn: () => Promise<{ error?: string } | void>) {
    setError(null);
    start(async () => {
      const result = await fn();
      if (result && "error" in result && result.error) setError(result.error);
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

  if (role === "cafeteria") {
    if (status === "accepted") {
      actions.push({
        label: "Start preparing",
        onClick: () => run(() => updateOrderStatusAction(orderId, "preparing")),
      });
    }
    if (status === "preparing") {
      actions.push({
        label: "Mark packed",
        onClick: () => run(() => updateOrderStatusAction(orderId, "ready")),
      });
    }
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
    if (status === "ready") {
      actions.push({
        label: "Picked up",
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

  if (actions.length === 0) return null;

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
      </div>
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
    </div>
  );
}
