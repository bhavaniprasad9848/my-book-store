"use client";

import { createContext, useContext, useEffect, useState } from "react";

const StockContext = createContext<Record<string, number> | null>(null);

/**
 * Keeps stock counts fresh on the shop page: checks every 10 seconds while the tab is visible,
 * and right away when the visitor comes back to the tab.
 */
export function LiveStockProvider({ initial, children }: { initial: Record<string, number>; children: React.ReactNode }) {
  const [stock, setStock] = useState(initial);

  useEffect(() => {
    let stopped = false;
    async function refresh() {
      if (document.hidden) return;
      try {
        const res = await fetch("/api/stock", { cache: "no-store" });
        if (!res.ok || !(res.headers.get("content-type") || "").includes("application/json")) return;
        const data = (await res.json()) as { stock: Record<string, number> };
        if (!stopped) setStock((prev) => ({ ...prev, ...data.stock }));
      } catch {
        /* keep the last known numbers */
      }
    }
    const id = window.setInterval(refresh, 10000);
    const onVisible = () => !document.hidden && refresh();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      stopped = true;
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return <StockContext.Provider value={stock}>{children}</StockContext.Provider>;
}

/** Latest known stock for a book; falls back to the server value outside the provider. */
export function useLiveStock(bookId: string, fallback: number) {
  const stock = useContext(StockContext);
  return stock?.[bookId] ?? fallback;
}
