"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useCart } from "@/lib/cart";

export function Topbar() {
  const { data } = useSession();
  const { count } = useCart();

  return (
    <header className="mx-auto mt-4 flex w-[min(1120px,calc(100%-2rem))] flex-wrap items-center justify-between gap-3 rounded-full border border-black/10 bg-[rgba(255,252,246,0.85)] px-4 py-3 shadow-sm backdrop-blur">
      <Link href="/shop" className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-forest to-forest-deep font-display text-sm font-bold text-[#f8f4ec]">
          MB
        </span>
        <span>
          <span className="block font-display text-base font-bold tracking-wide">MY BOOK STORE</span>
          <span className="block text-sm text-ink-soft">
            {data?.user ? `Hello, ${data.user.name}` : "House collection shop"}
          </span>
        </span>
      </Link>
      <nav className="flex items-center gap-2">
        <Link href="/shop" className="rounded-full px-3 py-2 text-sm hover:bg-black/5">
          Shop
        </Link>
        <Link
          href="/cart"
          className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-[#f8f4ec]"
        >
          Cart <span className="ml-1 inline-grid min-w-5 place-items-center rounded-full bg-amber px-1.5 text-xs font-bold text-ink">{count}</span>
        </Link>
        {data?.user ? (
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="rounded-full px-3 py-2 text-sm hover:bg-black/5"
          >
            Logout
          </button>
        ) : (
          <Link href="/login" className="rounded-full px-3 py-2 text-sm hover:bg-black/5">
            Login
          </Link>
        )}
      </nav>
    </header>
  );
}
