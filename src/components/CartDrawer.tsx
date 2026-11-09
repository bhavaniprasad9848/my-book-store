"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useCart } from "@/lib/cart";
import { calcShippingCents, moneyFromCents } from "@/lib/catalog";
import { BookJacket } from "@/components/BookJacket";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { BookLoader } from "@/components/BookLoader";

type Book = { id: string; title: string; author: string; priceCents: number; category: string; stock: number };

const FREE_SHIPPING_CENTS = 4000;
const ease = [0.2, 0.75, 0.25, 1] as const;

/** Ask the cart panel to open from anywhere in the browser. */
export function openCartDrawer() {
  window.dispatchEvent(new Event("cart:open"));
}

/** Slide-out cart panel. Checkout still happens on the full /cart page. */
export function CartDrawer() {
  const { items, setQty, removeItem, count } = useCart();
  const [open, setOpen] = useState(false);
  const [books, setBooks] = useState<Book[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const onOpen = () => {
      lastFocus.current = document.activeElement as HTMLElement | null;
      setOpen(true);
    };
    window.addEventListener("cart:open", onOpen);
    return () => window.removeEventListener("cart:open", onOpen);
  }, []);

  // Load book details the first time the panel opens.
  useEffect(() => {
    if (!open || books) return;
    let cancelled = false;
    fetch("/api/books")
      .then(async (res) => {
        const isJson = (res.headers.get("content-type") || "").includes("application/json");
        if (!res.ok || !isJson) throw new Error("load failed");
        const data = await res.json();
        if (!cancelled) setBooks(data.books || []);
      })
      .catch(() => !cancelled && setLoadError(true));
    return () => {
      cancelled = true;
    };
  }, [open, books]);

  // Escape closes, page scroll is locked, focus moves into the panel and back out.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => closeRef.current?.focus(), 50);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      window.clearTimeout(t);
      lastFocus.current?.focus?.();
    };
  }, [open]);

  const rows = useMemo(
    () =>
      items
        .map((item) => ({ ...item, book: books?.find((b) => b.id === item.bookId) }))
        .filter((row): row is typeof row & { book: Book } => Boolean(row.book)),
    [items, books]
  );
  const subtotal = rows.reduce((sum, r) => sum + r.book.priceCents * r.qty, 0);
  const shipping = calcShippingCents(subtotal);
  const toFree = Math.max(0, FREE_SHIPPING_CENTS - subtotal);
  const freeProgress = Math.min(1, subtotal / FREE_SHIPPING_CENTS);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            key="backdrop"
            className="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setOpen(false)}
          />
          <motion.aside
            key="panel"
            className="drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Your cart"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.42, ease }}
          >
            <div className="drawer-head">
              <h2 className="font-display text-2xl">
                Your cart <span className="text-ink-soft text-lg">({count})</span>
              </h2>
              <button ref={closeRef} type="button" className="drawer-close" onClick={() => setOpen(false)} aria-label="Close cart">
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {count > 0 && books ? (
              <div className="ship-meter">
                <p className="text-sm">
                  {toFree > 0 ? (
                    <>
                      Add <strong>{moneyFromCents(toFree)}</strong> more for free shipping.
                    </>
                  ) : (
                    <>Your order ships free.</>
                  )}
                </p>
                <div className="ship-bar">
                  <motion.span
                    className="ship-bar-fill"
                    initial={false}
                    animate={{ scaleX: freeProgress }}
                    transition={{ duration: 0.6, ease }}
                  />
                </div>
              </div>
            ) : null}

            <div className="drawer-body">
              {count === 0 ? (
                <div className="drawer-empty">
                  <p className="font-display text-xl">Your cart is empty.</p>
                  <p className="mt-1 text-ink-soft">Browse the shelves and add a book to see it here.</p>
                  <button type="button" className="btn-primary mt-5" onClick={() => setOpen(false)}>
                    Browse the shelves
                  </button>
                </div>
              ) : loadError ? (
                <p className="text-ink-soft">Book details could not be loaded. Open the full cart page to continue.</p>
              ) : !books ? (
                <div className="grid gap-4" aria-label="Loading cart">
                  <BookLoader label="Opening your cart" />
                  {Array.from({ length: Math.min(count, 3) }, (_, i) => (
                    <div key={i} className="flex gap-4">
                      <span className="skeleton h-[78px] w-[52px]" />
                      <div className="grid flex-1 content-start gap-2 pt-1">
                        <span className="skeleton h-4 w-3/4" />
                        <span className="skeleton h-3 w-1/2" />
                        <span className="skeleton h-3 w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <ul className="grid">
                  <AnimatePresence initial={false}>
                    {rows.map((row, i) => (
                      <motion.li
                        key={row.bookId}
                        layout
                        className="drawer-row"
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0, transition: { delay: 0.12 + i * 0.05, duration: 0.35, ease } }}
                        exit={{ opacity: 0, x: -24, height: 0, paddingTop: 0, paddingBottom: 0, transition: { duration: 0.28 } }}
                      >
                        <BookJacket title={row.book.title} author={row.book.author} category={row.book.category} className="cart-thumb" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-display text-lg leading-tight">{row.book.title}</p>
                          <p className="text-sm text-ink-soft">{row.book.author}</p>
                          <div className="mt-2 flex items-center gap-3">
                            <div className="qty">
                              <button type="button" onClick={() => setQty(row.bookId, row.qty - 1)} aria-label={`One fewer ${row.book.title}`}>
                                {"\u2212"}
                              </button>
                              <span className="qty-num" aria-live="polite">
                                <span key={row.qty}>{row.qty}</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => setQty(row.bookId, Math.min(row.book.stock, row.qty + 1))}
                                disabled={row.qty >= row.book.stock}
                                aria-label={`One more ${row.book.title}`}
                              >
                                +
                              </button>
                            </div>
                            <button type="button" className="text-sm text-ink-soft underline" onClick={() => removeItem(row.bookId)}>
                              Remove
                            </button>
                          </div>
                        </div>
                        <p className="font-semibold">
                          <AnimatedNumber value={row.book.priceCents * row.qty} format={(n) => moneyFromCents(Math.round(n))} />
                        </p>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {count > 0 && books ? (
              <div className="drawer-foot">
                <div className="flex justify-between text-sm text-ink-soft">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : moneyFromCents(shipping)}</span>
                </div>
                <div className="mt-1 flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <AnimatedNumber value={subtotal + shipping} format={(n) => moneyFromCents(Math.round(n))} />
                </div>
                <Link href="/cart" className="btn-primary mt-4 w-full" onClick={() => setOpen(false)}>
                  Go to checkout
                </Link>
                <button type="button" className="btn-secondary mt-2 w-full" onClick={() => setOpen(false)}>
                  Keep shopping
                </button>
              </div>
            ) : null}
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
