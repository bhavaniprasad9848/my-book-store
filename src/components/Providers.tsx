"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/lib/cart";
import { Toaster } from "@/components/Toaster";
import { CartDrawer } from "@/components/CartDrawer";
import { MotionProvider } from "@/components/MotionProvider";
import { Spotlight } from "@/components/Spotlight";
import { Ripples } from "@/components/Ripples";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>
        <MotionProvider>
          {children}
          <Toaster />
          <CartDrawer />
          <Spotlight />
          <Ripples />
        </MotionProvider>
      </CartProvider>
    </SessionProvider>
  );
}
