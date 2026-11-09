"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

/** Search by title or author. Updates the address as you type (after a short pause). */
export function ShopSearch({ suggestions = [] }: { suggestions?: string[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get("q") ?? "");
  const [pending, startTransition] = useTransition();
  const first = useRef(true);
  const [focused, setFocused] = useState(false);
  const [hint, setHint] = useState("");

  // When the box is empty and idle, type out real titles as hints: "Try Canyon Echoes".
  useEffect(() => {
    if (!suggestions.length || value || focused) {
      setHint("");
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let i = 0;
    let chars = 0;
    let deleting = false;
    let timer = 0;
    const tick = () => {
      const full = `Try \u201c${suggestions[i % suggestions.length]}\u201d`;
      if (!deleting) {
        chars += 1;
        setHint(full.slice(0, chars));
        if (chars >= full.length) {
          deleting = true;
          timer = window.setTimeout(tick, 1700);
          return;
        }
        timer = window.setTimeout(tick, 55);
      } else {
        chars -= 2;
        setHint(full.slice(0, Math.max(0, chars)));
        if (chars <= 0) {
          deleting = false;
          chars = 0;
          i += 1;
          timer = window.setTimeout(tick, 450);
          return;
        }
        timer = window.setTimeout(tick, 25);
      }
    };
    timer = window.setTimeout(tick, 1200);
    return () => window.clearTimeout(timer);
  }, [suggestions, value, focused]);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const id = window.setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      if (value.trim()) next.set("q", value.trim());
      else next.delete("q");
      startTransition(() => router.replace(`/shop?${next.toString()}`, { scroll: false }));
    }, 300);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <form role="search" className={`shop-search ${pending ? "is-pending" : ""}`} onSubmit={(e) => e.preventDefault()}>
      <svg viewBox="0 0 24 24" className="shop-search-icon" aria-hidden="true">
        <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M16 16l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      <label htmlFor="shop-search" className="sr-only">
        Search books by title or author
      </label>
      <input
        id="shop-search"
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={hint || "Search title or author"}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoComplete="off"
      />
      {value ? (
        <button type="button" className="shop-search-clear" onClick={() => setValue("")} aria-label="Clear search">
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      ) : null}
      <span className="shop-search-bar" aria-hidden="true" />
    </form>
  );
}
