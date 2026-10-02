"use client";

import { useCart } from "@/components/cart/cart-provider";
import { buttonClass } from "@/components/ui/button";
import { formatNgn } from "@/lib/money";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import Link from "next/link";

export function CartBar() {
  const { cart, itemCount, subtotal } = useCart();
  const { status } = useSession();
  if (!cart || itemCount === 0) return null;
  const raised = status === "authenticated";

  return (
    <div
      className={cn(
        "fixed inset-x-0 z-30 p-3",
        raised
          ? "bottom-16 pb-3"
          : "bottom-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]",
      )}
    >
      <div className="mx-auto max-w-5xl rounded-[1.35rem] border border-amber/25 bg-[#0c1210] px-4 py-4 text-[#f3eee4] shadow-[0_20px_44px_-28px_rgb(0_0_0_/_0.7)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber">Your bag</p>
            <p className="mt-1 text-sm font-semibold">
              {itemCount} item{itemCount === 1 ? "" : "s"} · {cart.cafeteriaName}
            </p>
            <p className="text-xs text-[#f3eee4]/65">
              Food total {formatNgn(subtotal)} · pay the Agent
            </p>
          </div>
          <p className="font-display text-xl font-medium tabular-nums">{formatNgn(subtotal)}</p>
        </div>
        <Link href="/checkout" className={buttonClass("amber", "mt-3 h-11 w-full")}>
          Review &amp; place order
        </Link>
      </div>
    </div>
  );
}
