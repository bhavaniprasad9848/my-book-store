"use client";

import { useEffect, useRef, useState } from "react";
import { openCartDrawer } from "@/components/CartDrawer";

type Toast = { id: number; title: string };

/** Call from anywhere in the browser to confirm a book was added to the cart. */
export function announceAddedToCart(title: string) {
  window.dispatchEvent(new CustomEvent("cart:added", { detail: { title } }));
}

/** Small confirmation that slides up from the bottom after "Add to cart". */
export function Toaster() {
  const [toast, setToast] = useState<Toast | null>(null);
  const [leaving, setLeaving] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    function onAdded(e: Event) {
      const title = (e as CustomEvent<{ title: string }>).detail.title;
      timers.current.forEach(clearTimeout);
      setLeaving(false);
      setToast({ id: Date.now(), title });
      timers.current = [
        window.setTimeout(() => setLeaving(true), 3200),
        window.setTimeout(() => setToast(null), 3550),
      ];
    }
    window.addEventListener("cart:added", onAdded);
    return () => {
      window.removeEventListener("cart:added", onAdded);
      timers.current.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="toast-region" role="status" aria-live="polite">
      {toast ? (
        <div key={toast.id} className={`toast ${leaving ? "is-leaving" : ""}`}>
          <p>
            Added <em>{toast.title}</em> to your cart.
          </p>
          <button type="button" className="text-link toast-link" onClick={openCartDrawer}>
            View cart
          </button>
          <span className="toast-timer" aria-hidden="true" />
        </div>
      ) : null}
    </div>
  );
}
