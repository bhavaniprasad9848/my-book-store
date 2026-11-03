"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Topbar } from "@/components/Topbar";
import { useCart } from "@/lib/cart";
import { calcShippingCents, moneyFromCents } from "@/lib/catalog";

type Book = {
  id: string;
  title: string;
  author: string;
  priceCents: number;
  stock: number;
  category: string;
};

export default function CartPage() {
  const { items, setQty, removeItem, clear, count } = useCart();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const searchParams = useSearchParams();
  const canceled = searchParams.get("canceled");

  useEffect(() => {
    let cancelled = false;

    async function loadBooks() {
      try {
        const res = await fetch("/api/books");
        // An expired login redirects /api/books to the login page (HTML, not JSON).
        const isJson = (res.headers.get("content-type") || "").includes("application/json");
        if (!res.ok || !isJson) throw new Error("Could not load books");
        const data = await res.json();
        if (!cancelled) setBooks(data.books || []);
      } catch {
        if (!cancelled) {
          setLoadError(
            "We couldn't load your book details, so the order summary can't be shown. Please refresh the page, or log in again."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadBooks();
    return () => {
      cancelled = true;
    };
  }, []);

  // Cart entries whose book is no longer in the database (for example after the
  // catalog was reseeded) can never be priced or bought, so drop them instead of
  // leaving the cart badge and the order summary out of sync.
  useEffect(() => {
    if (loading || loadError) return;
    const missing = items.filter((item) => !books.some((book) => book.id === item.bookId));
    if (missing.length === 0) return;
    missing.forEach((item) => removeItem(item.bookId));
    setNotice(
      `${missing.length} item${missing.length === 1 ? " was" : "s were"} removed from your cart because ${
        missing.length === 1 ? "it is" : "they are"
      } no longer in the store. Please add ${missing.length === 1 ? "it" : "them"} again from the shop.`
    );
  }, [loading, loadError, items, books, removeItem]);

  const rows = useMemo(() => {
    return items
      .map((item) => {
        const book = books.find((entry) => entry.id === item.bookId);
        if (!book) return null;
        return { ...item, book };
      })
      .filter(Boolean) as Array<{ bookId: string; qty: number; book: Book }>;
  }, [items, books]);

  const subtotalCents = rows.reduce((sum, row) => sum + row.book.priceCents * row.qty, 0);
  const shippingCents = calcShippingCents(subtotalCents);
  const totalCents = subtotalCents + shippingCents;

  async function checkout() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: rows.map((row) => ({ bookId: row.bookId, qty: row.qty })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Checkout failed");
        return;
      }
      clear();
      window.location.href = data.url;
    } catch {
      setError("Checkout failed. Please refresh the page, log in again, and retry.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Topbar />
      <main className="mx-auto w-[min(1120px,calc(100%-2rem))] pb-16 pt-6">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-4xl">Your cart</h1>
            <p className="mt-2 text-ink-soft">Review items, then pay securely with Stripe Checkout.</p>
          </div>
          <Link href="/shop" className="btn-secondary">
            Keep shopping
          </Link>
        </div>

        {canceled ? (
          <p className="mb-4 rounded-xl border border-amber/30 bg-amber/10 px-4 py-3 text-sm">
            Checkout canceled. Your cart is ready when you want to try again.
          </p>
        ) : null}

        {notice ? (
          <p className="mb-4 rounded-xl border border-amber/30 bg-amber/10 px-4 py-3 text-sm">
            {notice}
          </p>
        ) : null}

        {count === 0 ? (
          <div className="panel p-8 text-center">
            <h2 className="font-display text-2xl">Your cart is empty</h2>
            <Link href="/shop" className="btn-primary mt-4 inline-flex">
              Browse books
            </Link>
          </div>
        ) : loading ? (
          <div className="panel p-8 text-center">
            <p className="text-ink-soft">Loading your cart...</p>
          </div>
        ) : loadError ? (
          <div className="panel p-8 text-center">
            <p className="text-sm text-red-700">{loadError}</p>
            <button
              type="button"
              className="btn-primary mt-4"
              onClick={() => window.location.reload()}
            >
              Refresh
            </button>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
            <section className="panel p-5">
              {rows.map((row) => (
                <div
                  key={row.bookId}
                  className="flex flex-wrap items-start justify-between gap-3 border-b border-black/10 py-4 last:border-0"
                >
                  <div>
                    <h3 className="font-display text-lg">{row.book.title}</h3>
                    <p className="text-sm text-ink-soft">{row.book.author}</p>
                    <p className="mt-1 font-semibold">{moneyFromCents(row.book.priceCents)}</p>
                    <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-black/10 px-2 py-1">
                      <button
                        type="button"
                        className="h-7 w-7 rounded-full bg-black/5"
                        onClick={() => setQty(row.bookId, row.qty - 1)}
                      >
                        −
                      </button>
                      <span>{row.qty}</span>
                      <button
                        type="button"
                        className="h-7 w-7 rounded-full bg-black/5"
                        onClick={() => setQty(row.bookId, row.qty + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {moneyFromCents(row.book.priceCents * row.qty)}
                    </p>
                    <button
                      type="button"
                      className="mt-2 text-sm text-ink-soft underline"
                      onClick={() => removeItem(row.bookId)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </section>

            <aside className="panel h-fit p-5">
              <h3 className="font-display text-xl">Order summary</h3>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{moneyFromCents(subtotalCents)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shippingCents === 0 ? "Free" : moneyFromCents(shippingCents)}</span>
                </div>
                <div className="flex justify-between border-t border-black/10 pt-3 text-base font-bold">
                  <span>Total</span>
                  <span>{moneyFromCents(totalCents)}</span>
                </div>
              </div>
              {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
              <button
                className="btn-primary mt-4 w-full"
                type="button"
                disabled={busy || rows.length === 0}
                onClick={checkout}
              >
                {busy ? "Redirecting to Stripe..." : "Pay with Stripe Checkout"}
              </button>
              <p className="mt-3 text-xs text-ink-soft">
                Prices are calculated on the server from the database. Use Stripe test card 4242 4242 4242 4242.
              </p>
            </aside>
          </div>
        )}
      </main>
    </>
  );
}
