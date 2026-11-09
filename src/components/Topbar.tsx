"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getSession, signOut, useSession } from "next-auth/react";
import { useCart } from "@/lib/cart";
import { openCartDrawer } from "@/components/CartDrawer";

export function Topbar() {
  const { data } = useSession();
  const role = data?.user?.role;
  const isAdmin = role === "ADMIN";
  const isSeller = role === "SELLER";
  const isStaff = isAdmin || isSeller;
  const { count } = useCart();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [farDown, setFarDown] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(y > 8);
      setFarDown(y > 900);
      setProgress(max > 0 ? Math.min(1, y / max) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const linkClass = (href: string) =>
    `nav-link ${pathname?.startsWith(href) ? "is-active" : ""}`;

  return (
    <>
    <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      <div className="site-header-inner">
        <Link href={isAdmin ? "/admin" : isSeller ? "/seller" : "/shop"} className="wordmark">
          My Book Store
        </Link>
        <nav className="flex items-center gap-4 text-[15px] sm:gap-6">
          {isAdmin ? (
            <>
              <Link href="/admin" className={linkClass("/admin")}>
                Dashboard
              </Link>
              <Link href="/shop" className={linkClass("/shop")}>
                Books
              </Link>
              <Link href="/orders" className={linkClass("/orders")}>
                Orders
              </Link>
            </>
          ) : isSeller ? (
            <>
              <Link href="/seller" className={linkClass("/seller")}>
                My dashboard
              </Link>
              <Link href="/shop" className={linkClass("/shop")}>
                List a book
              </Link>
            </>
          ) : (
            <>
              <Link href="/shop" className={linkClass("/shop")}>
                Shop
              </Link>
              {data?.user ? (
                <Link href="/orders" className={linkClass("/orders")}>
                  My orders
                </Link>
              ) : null}
              <Link
                href="/cart"
                id="cart-link"
                className={linkClass("/cart")}
                onClick={(e) => {
                  if (pathname?.startsWith("/cart") || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                  e.preventDefault();
                  openCartDrawer();
                }}
              >
                Cart
                <span className="cart-count" aria-label={`${count} items in cart`}>
                  <span key={count} className="cart-count-num">
                    {count}
                  </span>
                </span>
              </Link>
            </>
          )}
          {data?.user ? (
            <span className="hidden items-center gap-4 sm:flex">
              <span className="text-ink-soft">{data.user.name}</span>
              {isStaff ? (
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-white ${isAdmin ? "bg-ink" : "bg-forest"}`}
                >
                  {isAdmin ? "Admin" : "Seller"}
                </span>
              ) : null}
              <button
                type="button"
                onClick={async () => {
                  // Ask the server who is signed in right now, so a stale role can't pick the wrong page.
                  const fresh = await getSession();
                  const r = fresh?.user?.role ?? role;
                  await signOut({ callbackUrl: r === "ADMIN" ? "/admin/login" : r === "SELLER" ? "/seller/login" : "/login" });
                }}
                className="nav-link"
              >
                Sign out
              </button>
            </span>
          ) : (
            <Link href="/login" className={linkClass("/login")}>
              Sign in
            </Link>
          )}
        </nav>
      </div>
      <span className="read-progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />
    </header>
    <button
      type="button"
      className={`to-top ${farDown ? "is-shown" : ""}`}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      tabIndex={farDown ? 0 : -1}
      aria-hidden={!farDown}
    >
      Back to top
    </button>
    </>
  );
}
