"use client";

import { useRef, useState } from "react";
import { moneyFromCents } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { BookJacket } from "@/components/BookJacket";
import { flyToCart } from "@/lib/flyToCart";
import { announceAddedToCart } from "@/components/Toaster";

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
};

export function BookCard({ book, index }: BookCardProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const coverRef = useRef<HTMLDivElement>(null);
  const soldOut = book.stock < 1;

  return (
    <article className="book-item" style={{ "--i": index ?? 0 } as React.CSSProperties}>
      <div className="book-cover-wrap">
        <div className="book-3d" ref={coverRef}>
          <div className="book-pages" aria-hidden="true" />
          <BookJacket title={book.title} author={book.author} category={book.category} variant={index} className="book-cover" />
        </div>
      </div>
      <div className="book-info">
        <h3 className="book-title">{book.title}</h3>
        <p className="book-author">{book.author}</p>
        <p className="book-desc">{book.description}</p>
        <p className="book-meta">
          {book.condition}, {book.pages} pages
          {book.stock > 0 && book.stock <= 2 ? <span className="low-stock">Only {book.stock} left</span> : null}
        </p>
        <div className="book-buy">
          <span className="book-price">{moneyFromCents(book.priceCents)}</span>
          <button
            type="button"
            className={`btn-add ${added ? "is-added" : ""}`}
            disabled={soldOut}
            aria-live="polite"
            onClick={() => {
              addItem(book.id);
              flyToCart(coverRef.current?.querySelector("svg") ?? null);
              announceAddedToCart(book.title);
              setAdded(true);
              setTimeout(() => setAdded(false), 1400);
            }}
          >
            {soldOut ? "Sold out" : added ? "Added to cart" : "Add to cart"}
          </button>
        </div>
      </div>
    </article>
  );
}
