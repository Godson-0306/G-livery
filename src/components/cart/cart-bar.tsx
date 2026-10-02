"use client";

import { useCart } from "@/components/cart/cart-provider";
import { buttonClass } from "@/components/ui/button";
import { formatNgn } from "@/lib/money";
import Link from "next/link";

export function CartBar() {
  const { cart, itemCount, subtotal } = useCart();
  if (!cart || itemCount === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto max-w-5xl rounded-[1.5rem] bg-forest px-4 py-4 text-white shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber">Your bag</p>
            <p className="mt-1 text-sm font-semibold">
              {itemCount} item{itemCount === 1 ? "" : "s"} · {cart.cafeteriaName}
            </p>
            <p className="text-xs text-emerald-100">
              Food total {formatNgn(subtotal)} · pay the Agent
            </p>
          </div>
          <p className="text-lg font-semibold tabular-nums">{formatNgn(subtotal)}</p>
        </div>
        <Link href="/checkout" className={buttonClass("amber", "mt-3 h-11 w-full")}>
          Review &amp; place order
        </Link>
      </div>
    </div>
  );
}
