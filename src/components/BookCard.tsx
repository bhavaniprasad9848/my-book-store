"use client";

import { useState } from "react";
import { moneyFromCents } from "@/lib/catalog";
import { useCart } from "@/lib/cart";

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
    accent: string;
    categoryName: string;
  };
};

export function BookCard({ book }: BookCardProps) {
  const { addItem } = useCart();
  const [label, setLabel] = useState("Add to cart");

  return (
    <article className="overflow-hidden rounded-[18px] border border-black/10 bg-[rgba(255,252,246,0.95)]">
      <div
        className="flex min-h-[120px] flex-col justify-between p-4 text-[#f8f4ec]"
        style={{
          background: `linear-gradient(160deg, rgba(0,0,0,0.18), transparent 50%), ${book.accent}`,
        }}
      >
        <span className="text-xs uppercase tracking-[0.08em] opacity-85">{book.categoryName}</span>
        <strong className="font-display text-xl leading-snug">{book.title}</strong>
      </div>
      <div className="grid gap-2 p-4">
        <h3 className="text-base font-semibold">{book.title}</h3>
        <p className="text-sm text-ink-soft">
          by {book.author} · {book.pages} pages · {book.condition}
        </p>
        <p className="text-sm text-ink-soft">{book.description}</p>
        <p className="text-lg font-bold">{moneyFromCents(book.priceCents)}</p>
        <p className="text-xs text-ink-soft">Stock: {book.stock}</p>
        <button
          type="button"
          className="btn-primary mt-1"
          disabled={book.stock < 1}
          onClick={() => {
            addItem(book.id);
            setLabel("Added ✓");
            setTimeout(() => setLabel("Add to cart"), 900);
          }}
        >
          {book.stock < 1 ? "Out of stock" : label}
        </button>
      </div>
    </article>
  );
}
