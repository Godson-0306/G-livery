"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CartItem = {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  photoUrl?: string | null;
};

export type Cart = {
  cafeteriaId: string;
  cafeteriaSlug: string;
  cafeteriaName: string;
  runnerSlug?: string | null;
  items: CartItem[];
};

type CartContextValue = {
  cart: Cart | null;
  ready: boolean;
  itemCount: number;
  subtotal: number;
  addItem: (cartMeta: Omit<Cart, "items">, item: Omit<CartItem, "quantity">) => boolean;
  setQuantity: (menuItemId: string, quantity: number) => void;
  clear: () => void;
  setRunnerSlug: (slug: string | null) => void;
};

const STORAGE_KEY = "glivery-cart";
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setCart(raw ? (JSON.parse(raw) as Cart) : null);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      setCart(null);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (cart && cart.items.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [cart, ready]);

  const addItem = useCallback(
    (meta: Omit<Cart, "items">, item: Omit<CartItem, "quantity">) => {
      let replaced = false;
      setCart((current) => {
        if (current && current.cafeteriaId !== meta.cafeteriaId) {
          const ok = window.confirm(
            "Your cart has items from another cafeteria. Replace it with this one?",
          );
          if (!ok) return current;
          replaced = true;
          return { ...meta, items: [{ ...item, quantity: 1 }] };
        }

        const base = current ?? { ...meta, items: [] };
        const existing = base.items.find((row) => row.menuItemId === item.menuItemId);
        const items = existing
          ? base.items.map((row) =>
              row.menuItemId === item.menuItemId
                ? { ...row, quantity: row.quantity + 1 }
                : row,
            )
          : [...base.items, { ...item, quantity: 1 }];

        return {
          ...base,
          ...meta,
          runnerSlug: meta.runnerSlug ?? base.runnerSlug,
          items,
        };
      });
      return !replaced;
    },
    [],
  );

  const setQuantity = useCallback((menuItemId: string, quantity: number) => {
    setCart((current) => {
      if (!current) return current;
      const items =
        quantity <= 0
          ? current.items.filter((row) => row.menuItemId !== menuItemId)
          : current.items.map((row) =>
              row.menuItemId === menuItemId ? { ...row, quantity } : row,
            );
      if (items.length === 0) return null;
      return { ...current, items };
    });
  }, []);

  const clear = useCallback(() => setCart(null), []);

  const setRunnerSlug = useCallback((slug: string | null) => {
    setCart((current) => (current ? { ...current, runnerSlug: slug } : current));
  }, []);

  const itemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const subtotal = cart?.items.reduce((sum, item) => sum + item.price * item.quantity, 0) ?? 0;

  const value = useMemo(
    () => ({ cart, ready, itemCount, subtotal, addItem, setQuantity, clear, setRunnerSlug }),
    [cart, ready, itemCount, subtotal, addItem, setQuantity, clear, setRunnerSlug],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
