"use client";

import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/components/cart/cart-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <SessionProvider>
        <CartProvider>{children}</CartProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
