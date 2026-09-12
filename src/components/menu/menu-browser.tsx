"use client";

import { useCart } from "@/components/cart/cart-provider";
import { buttonClass } from "@/components/ui/button";
import { formatNgn, toMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

type MenuItemView = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  photoUrl: string | null;
  isAvailable: boolean;
  category: string | null;
};

export function MenuBrowser({
  cafeteriaId,
  cafeteriaSlug,
  cafeteriaName,
  runnerSlug,
  items,
}: {
  cafeteriaId: string;
  cafeteriaSlug: string;
  cafeteriaName: string;
  runnerSlug?: string | null;
  items: MenuItemView[];
}) {
  const { addItem, cart, setQuantity, setRunnerSlug } = useCart();

  useEffect(() => {
    if (runnerSlug) setRunnerSlug(runnerSlug);
  }, [runnerSlug, setRunnerSlug]);

  const grouped = items.reduce<Record<string, MenuItemView[]>>((acc, item) => {
    const key = item.category || "Menu";
    acc[key] ??= [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-8 pb-32">
      {Object.entries(grouped).map(([category, rows]) => (
        <section key={category} className="space-y-3">
          <h2 className="text-lg font-semibold text-forest">{category}</h2>
          <ul className="space-y-3">
            {rows.map((item) => {
              const qty =
                cart?.cafeteriaId === cafeteriaId
                  ? (cart.items.find((row) => row.menuItemId === item.id)?.quantity ?? 0)
                  : 0;
              return (
                <li
                  key={item.id}
                  className={cn(
                    "surface flex gap-3 rounded-[1.4rem] p-3",
                    !item.isAvailable && "opacity-70",
                  )}
                >
                  <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-forest-soft">
                    {item.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.photoUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-3xl">🍽️</div>
                    )}
                    {!item.isAvailable ? (
                      <span className="absolute inset-x-2 bottom-2 rounded-full bg-rose-700 px-2 py-0.5 text-center text-[10px] font-bold uppercase tracking-wide text-white">
                        Sold out
                      </span>
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="shrink-0 font-semibold text-forest">{formatNgn(toMoney(item.price))}</p>
                    </div>
                    {item.description ? (
                      <p className="mt-0.5 line-clamp-2 text-sm text-muted">{item.description}</p>
                    ) : null}
                    <div className="mt-3">
                      {!item.isAvailable ? (
                        <span className="text-xs font-semibold text-rose-700">Not available right now</span>
                      ) : qty > 0 ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className={buttonClass("secondary", "h-9 w-9 p-0")}
                            onClick={() => setQuantity(item.id, qty - 1)}
                          >
                            −
                          </button>
                          <span className="w-6 text-center text-sm font-semibold">{qty}</span>
                          <button
                            type="button"
                            className={buttonClass("primary", "h-9 w-9 p-0")}
                            onClick={() => setQuantity(item.id, qty + 1)}
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className={buttonClass("primary", "h-9 px-4 text-xs")}
                          onClick={() =>
                            addItem(
                              {
                                cafeteriaId,
                                cafeteriaSlug,
                                cafeteriaName,
                                runnerSlug: runnerSlug ?? null,
                              },
                              {
                                menuItemId: item.id,
                                name: item.name,
                                price: toMoney(item.price),
                                photoUrl: item.photoUrl,
                              },
                            )
                          }
                        >
                          Add
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
