"use client";

import { useEffect, useRef, useState } from "react";
import { openCartDrawer } from "@/components/CartDrawer";

type Toast = { id: number; title?: string; message?: string };

/** Call from anywhere in the browser to confirm a book was added to the cart. */
export function announceAddedToCart(title: string) {
  window.dispatchEvent(new CustomEvent("cart:added", { detail: { title } }));
}

/** Show any short message in the same notice, for example an order status change. */
export function announce(message: string) {
  window.dispatchEvent(new CustomEvent("toast:message", { detail: { message } }));
}

/** Small confirmation that slides up from the bottom after "Add to cart" or other events. */
export function Toaster() {
  const [toast, setToast] = useState<Toast | null>(null);
  const [leaving, setLeaving] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    function show(next: Omit<Toast, "id">) {
      timers.current.forEach(clearTimeout);
      setLeaving(false);
      setToast({ id: Date.now(), ...next });
      timers.current = [
        window.setTimeout(() => setLeaving(true), 3200),
        window.setTimeout(() => setToast(null), 3550),
      ];
    }
    const onAdded = (e: Event) => show({ title: (e as CustomEvent<{ title: string }>).detail.title });
    const onMessage = (e: Event) => show({ message: (e as CustomEvent<{ message: string }>).detail.message });
    window.addEventListener("cart:added", onAdded);
    window.addEventListener("toast:message", onMessage);
    return () => {
      window.removeEventListener("cart:added", onAdded);
      window.removeEventListener("toast:message", onMessage);
      timers.current.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="toast-region" role="status" aria-live="polite">
      {toast ? (
        <div key={toast.id} className={`toast ${leaving ? "is-leaving" : ""}`}>
          {toast.title ? (
            <>
              <p>
                Added <em>{toast.title}</em> to your cart.
              </p>
              <button type="button" className="text-link toast-link" onClick={openCartDrawer}>
                View cart
              </button>
            </>
          ) : (
            <p>{toast.message}</p>
          )}
          <span className="toast-timer" aria-hidden="true" />
        </div>
      ) : null}
    </div>
  );
}
