"use client";

import { useEffect, useRef, useState } from "react";
import { moneyFromCents } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { BookJacket } from "@/components/BookJacket";
import { flyToCart } from "@/lib/flyToCart";
import { announceAddedToCart } from "@/components/Toaster";
import { useLiveStock } from "@/components/LiveStock";
import { RatingLine } from "@/components/Stars";

type BookCardProps = {
  book: {
    id: string;
    title: string;
    author: string;
    description: string;
    pages: number;
    condition: string;
    priceCents: number;
    stock: number;
    category: string;
    categoryName: string;
    accent?: string;
    photo?: string | null;
  };
  index?: number;
  rating?: { avg: number; count: number };
  /** Sellers manage stock; only customers can add books to a cart. */
  canBuy?: boolean;
};

function stockText(stock: number) {
  if (stock < 1) return "Sold out";
  if (stock <= 2) return `Only ${stock} left`;
  return `${stock} in stock`;
}

export function BookCard({ book, index, rating, canBuy = true }: BookCardProps) {
  const { addItem, items } = useCart();
  const [added, setAdded] = useState(false);
  const coverRef = useRef<HTMLDivElement>(null);
  const stock = useLiveStock(book.id, book.stock);
  const inCart = items.find((i) => i.bookId === book.id)?.qty ?? 0;
  const soldOut = stock < 1;
  const allInCart = !soldOut && inCart >= stock;

  // Briefly highlight the stock line when it changes while the page is open.
  const [changed, setChanged] = useState(false);
  const prev = useRef(stock);
  useEffect(() => {
    if (prev.current !== stock) {
      prev.current = stock;
      setChanged(true);
      const t = window.setTimeout(() => setChanged(false), 1600);
      return () => window.clearTimeout(t);
    }
  }, [stock]);

  return (
    <article className="book-item" style={{ "--i": index ?? 0 } as React.CSSProperties}>
      <div className="book-cover-wrap">
        <div className="book-3d" ref={coverRef}>
          <div className="book-pages" aria-hidden="true" />
          <BookJacket title={book.title} author={book.author} category={book.category} variant={index} className="book-cover" />
        </div>
        {soldOut ? <span className="sold-out-tag">Sold out</span> : null}
      </div>
      <div className="book-info">
        <h3 className="book-title">{book.title}</h3>
        <p className="book-author">{book.author}</p>
        <RatingLine avg={rating?.avg} count={rating?.count} />
        <p className="book-desc">{book.description}</p>
        <p className="book-meta">
          {book.condition}, {book.pages} pages
        </p>
        <p
          className={`stock-line ${stock <= 2 ? "is-low" : ""} ${soldOut ? "is-out" : ""} ${changed ? "is-changed" : ""}`}
          aria-live="polite"
        >
          <span className="stock-dot" aria-hidden="true" />
          <span key={stock} className="stock-num">
            {stockText(stock)}
          </span>
          {inCart > 0 && !soldOut ? <span className="text-ink-soft">, {inCart} in your cart</span> : null}
        </p>
        <div className="book-buy">
          <span className="book-price">{moneyFromCents(book.priceCents)}</span>
          {canBuy ? (
          <button
            type="button"
            className={`btn-add ${added ? "is-added" : ""}`}
            disabled={soldOut || allInCart}
            aria-live="polite"
            onClick={() => {
              addItem(book.id);
              flyToCart(coverRef.current?.querySelector("svg") ?? null);
              announceAddedToCart(book.title);
              setAdded(true);
              setTimeout(() => setAdded(false), 1400);
            }}
          >
            {soldOut ? "Sold out" : added ? "Added to cart" : allInCart ? "All in your cart" : "Add to cart"}
          </button>
          ) : (
            <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-ink-soft">Customers buy here</span>
          )}
        </div>
      </div>
    </article>
  );
}
