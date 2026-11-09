"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { BookJacket } from "@/components/BookJacket";

export type MarqueeBook = { id?: string; title: string; author: string; category: string };

/**
 * An endless row of book jackets gliding sideways. Pauses on hover/focus and while off screen,
 * so it costs nothing when nobody is looking. Pure CSS transform animation.
 */
export function BookMarquee({
  books,
  reverse = false,
  seconds = 40,
  size = "md",
  linkToShelf = false,
  label,
}: {
  books: MarqueeBook[];
  reverse?: boolean;
  seconds?: number;
  size?: "sm" | "md";
  /** When true, each jacket links to its category shelf in the shop. */
  linkToShelf?: boolean;
  label?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([entry]) => el.classList.toggle("is-offscreen", !entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (books.length === 0) return null;
  // Repeat short lists so the strip is always wider than the screen, then double it for a seamless loop.
  const base = books.length < 8 ? [...books, ...books, ...books].slice(0, Math.max(8, books.length)) : books;
  const loop = [...base, ...base];

  return (
    <div
      ref={ref}
      className={`marquee marquee-${size} ${reverse ? "is-reverse" : ""}`}
      style={{ "--marquee-s": `${seconds}s` } as React.CSSProperties}
      aria-label={label}
      role={label ? "region" : undefined}
    >
      <div className="marquee-track">
        {loop.map((b, i) => {
          const copy = i >= base.length;
          const jacket = (
            <BookJacket title={b.title} author={b.author} category={b.category} variant={i % base.length} className="marquee-cover" />
          );
          return linkToShelf && !copy ? (
            <Link key={i} href={`/shop?category=${encodeURIComponent(b.category)}#shelves`} className="marquee-item" title={`${b.title} by ${b.author}`}>
              {jacket}
            </Link>
          ) : (
            <span key={i} className="marquee-item" aria-hidden={copy || !linkToShelf ? true : undefined}>
              {jacket}
            </span>
          );
        })}
      </div>
    </div>
  );
}
