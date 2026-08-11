"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = { bookId: string; qty: number };

type CartContextValue = {
  items: CartItem[];
  count: number;
  addItem: (bookId: string) => void;
  setQty: (bookId: string, qty: number) => void;
  removeItem: (bookId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "mbs_cart_v2";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      setItems([]);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: items.reduce((sum, item) => sum + item.qty, 0),
      addItem: (bookId) => {
        setItems((prev) => {
          const existing = prev.find((item) => item.bookId === bookId);
          if (existing) {
            return prev.map((item) =>
              item.bookId === bookId ? { ...item, qty: item.qty + 1 } : item
            );
          }
          return [...prev, { bookId, qty: 1 }];
        });
      },
      setQty: (bookId, qty) => {
        setItems((prev) =>
          prev
            .map((item) => (item.bookId === bookId ? { ...item, qty } : item))
            .filter((item) => item.qty > 0)
        );
      },
      removeItem: (bookId) => {
        setItems((prev) => prev.filter((item) => item.bookId !== bookId));
      },
      clear: () => setItems([]),
    }),
    [items]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
