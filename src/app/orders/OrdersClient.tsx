"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { BookJacket } from "@/components/BookJacket";
import { RatingLine, StarInput } from "@/components/Stars";
import { announce } from "@/components/Toaster";
import { moneyFromCents } from "@/lib/catalog";
import type { OrdersPayload, OrderView } from "@/lib/orders";

type Status = OrderView["shippingStatus"];

const STEPS: { status: Status; label: string; detail: string }[] = [
  { status: "PROCESSING", label: "Processing", detail: "Payment received. We are getting your books ready." },
  { status: "PACKED", label: "Packed", detail: "Your books are wrapped and boxed." },
  { status: "SHIPPED", label: "Shipped", detail: "Your parcel is on its way." },
  { status: "DELIVERED", label: "Delivered", detail: "Your parcel has arrived. Enjoy your reading." },
];
const stepIndex = (s: Status) => STEPS.findIndex((x) => x.status === s);
const shortId = (id: string) => id.slice(-6).toUpperCase();
const when = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "";

export function OrdersClient({ initial, isAdmin }: { initial: OrdersPayload; isAdmin: boolean }) {
  const [data, setData] = useState(initial);
  const [flash, setFlash] = useState<string[]>([]);
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);
  const prev = useRef(new Map(initial.orders.map((o) => [o.id, o.shippingStatus])));

  // Live updates: check every 5 seconds while this tab is visible.
  useEffect(() => {
    let stopped = false;
    async function refresh() {
      if (document.hidden) return;
      try {
        const res = await fetch("/api/orders/mine", { cache: "no-store" });
        if (!res.ok || !(res.headers.get("content-type") || "").includes("application/json")) return;
        const next = (await res.json()) as OrdersPayload;
        if (stopped) return;
        const changed: string[] = [];
        for (const o of next.orders) {
          const before = prev.current.get(o.id);
          if (before && before !== o.shippingStatus) {
            changed.push(o.id);
            if (!isAdmin) announce(`Order #${shortId(o.id)} is now ${STEPS[stepIndex(o.shippingStatus)].label.toLowerCase()}.`);
          }
        }
        prev.current = new Map(next.orders.map((o) => [o.id, o.shippingStatus]));
        setData(next);
        setCheckedAt(new Date());
        if (changed.length) {
          setFlash(changed);
          window.setTimeout(() => setFlash([]), 2200);
        }
      } catch {
        /* keep showing the last known state */
      }
    }
    const id = window.setInterval(refresh, 5000);
    const onVisible = () => !document.hidden && refresh();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      stopped = true;
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [isAdmin]);

  function patchOrder(id: string, patch: Partial<OrderView>) {
    setData((d) => ({ ...d, orders: d.orders.map((o) => (o.id === id ? { ...o, ...patch } : o)) }));
    if (patch.shippingStatus) prev.current.set(id, patch.shippingStatus);
  }

  function patchRating(bookId: string, stars: number, summary: { avg: number; count: number }) {
    setData((d) => ({ ...d, ratings: { ...d.ratings, [bookId]: summary }, myRatings: { ...d.myRatings, [bookId]: stars } }));
  }

  const counts = STEPS.map((s) => ({ ...s, n: data.orders.filter((o) => o.shippingStatus === s.status).length }));

  return (
    <>
      <div className="orders-head">
        <div>
          <h1 className="section-title">{isAdmin ? "Orders" : "My orders"}</h1>
          <p className="section-blurb">
            {isAdmin
              ? "Move each order to its next step. The customer sees the change right away and gets an email."
              : "Track each order as it moves from packing to your door. This page updates by itself."}
          </p>
        </div>
        <p className="live-pill" aria-live="off">
          <span className="live-dot" aria-hidden="true" />
          Live{checkedAt ? `, checked ${checkedAt.toLocaleTimeString(undefined, { timeStyle: "short" })}` : ""}
        </p>
      </div>

      {isAdmin && data.orders.length > 0 ? (
        <div className="status-summary">
          {counts.map((c) => (
            <p key={c.status}>
              <span className="status-count">{c.n}</span> {c.label}
            </p>
          ))}
        </div>
      ) : null}

      {data.orders.length === 0 ? (
        <div className="orders-empty">
          <p className="font-display text-2xl">{isAdmin ? "No paid orders yet." : "You have no orders yet."}</p>
          <p className="mt-1 text-ink-soft">
            {isAdmin ? "Paid orders will appear here as soon as customers check out." : "When you buy a book, you can follow its delivery here."}
          </p>
          {!isAdmin ? (
            <Link href="/shop" className="btn-primary mt-5">
              Browse the shelves
            </Link>
          ) : null}
        </div>
      ) : (
        <div className="orders-list">
          {data.orders.map((order, i) => (
            <OrderCard
              key={order.id}
              order={order}
              index={i}
              isAdmin={isAdmin}
              flashing={flash.includes(order.id)}
              ratings={data.ratings}
              myRatings={data.myRatings}
              onStatus={(patch) => patchOrder(order.id, patch)}
              onRated={patchRating}
            />
          ))}
        </div>
      )}
    </>
  );
}

function OrderCard({
  order,
  index,
  isAdmin,
  flashing,
  ratings,
  myRatings,
  onStatus,
  onRated,
}: {
  order: OrderView;
  index: number;
  isAdmin: boolean;
  flashing: boolean;
  ratings: OrdersPayload["ratings"];
  myRatings: OrdersPayload["myRatings"];
  onStatus: (patch: Partial<OrderView>) => void;
  onRated: (bookId: string, stars: number, summary: { avg: number; count: number }) => void;
}) {
  const current = stepIndex(order.shippingStatus);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  async function setStatus(status: Status) {
    setBusy(true);
    setNote("");
    try {
      const res = await fetch(`/api/orders/${order.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setNote(body.error || "Could not update the order");
        return;
      }
      onStatus({ shippingStatus: body.shippingStatus ?? status, shippingUpdatedAt: body.shippingUpdatedAt ?? new Date().toISOString() });
      setNote(body.email?.status || "Status saved");
    } catch {
      setNote("Could not reach the server. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <motion.article
      className={`order-card ${flashing ? "is-flashing" : ""}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: Math.min(index, 6) * 0.06, ease: [0.2, 0.75, 0.25, 1] }}
    >
      <header className="order-top">
        <div>
          <h2 className="font-display text-xl">Order #{shortId(order.id)}</h2>
          <p className="text-sm text-ink-soft">
            Paid {when(order.paidAt || order.createdAt)}
            {isAdmin && order.customer ? (
              <>
                <br />
                {order.customer.name}, {order.customer.email}
              </>
            ) : null}
          </p>
        </div>
        <p className="order-total">{moneyFromCents(order.totalCents)}</p>
      </header>

      <ol className="timeline" aria-label={`Delivery progress: ${STEPS[current].label}`}>
        <span className="timeline-track" aria-hidden="true">
          <motion.span
            className="timeline-fill"
            initial={false}
            animate={{ scaleX: current / (STEPS.length - 1) }}
            transition={{ duration: 0.8, ease: [0.2, 0.75, 0.25, 1] }}
          />
        </span>
        {STEPS.map((s, i) => (
          <li key={s.status} className={`step ${i < current ? "is-done" : ""} ${i === current ? "is-current" : ""}`}>
            <span className="step-dot" aria-hidden="true">
              {i < current || (i === current && i === STEPS.length - 1) ? (
                <svg viewBox="0 0 16 16" width="12" height="12">
                  <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : null}
            </span>
            <span className="step-label">{s.label}</span>
          </li>
        ))}
      </ol>
      <p className="step-detail" key={order.shippingStatus}>
        {STEPS[current].detail}
        {order.shippingUpdatedAt ? <span className="text-ink-soft"> Updated {when(order.shippingUpdatedAt)}.</span> : null}
      </p>

      {isAdmin ? (
        <div className="owner-actions">
          {current < STEPS.length - 1 ? (
            <button type="button" className="btn-primary" disabled={busy} onClick={() => setStatus(STEPS[current + 1].status)}>
              {busy ? "Saving..." : `Mark as ${STEPS[current + 1].label.toLowerCase()}`}
            </button>
          ) : (
            <p className="text-sm font-semibold text-forest">Delivered. Nothing left to do.</p>
          )}
          <label className="text-sm text-ink-soft">
            or set to{" "}
            <select
              className="status-select"
              value={order.shippingStatus}
              disabled={busy}
              onChange={(e) => setStatus(e.target.value as Status)}
            >
              {STEPS.map((s) => (
                <option key={s.status} value={s.status}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          {note ? <p className="w-full text-sm text-ink-soft" role="status">{note}</p> : null}
        </div>
      ) : null}

      <ul className="order-items">
        {order.items.map((item) => (
          <li key={item.bookId} className="order-item">
            <BookJacket title={item.title} author={item.author} category={item.category} className="cart-thumb" />
            <div className="min-w-0 flex-1">
              <p className="font-display text-lg leading-tight">{item.title}</p>
              <p className="text-sm text-ink-soft">
                {item.author}, {item.qty} {item.qty === 1 ? "copy" : "copies"}, {moneyFromCents(item.unitPriceCents * item.qty)}
              </p>
              <RatingLine avg={ratings[item.bookId]?.avg} count={ratings[item.bookId]?.count} />
            </div>
            {!isAdmin ? <RateBook bookId={item.bookId} title={item.title} mine={myRatings[item.bookId] ?? 0} onRated={onRated} /> : null}
          </li>
        ))}
      </ul>
    </motion.article>
  );
}

function RateBook({
  bookId,
  title,
  mine,
  onRated,
}: {
  bookId: string;
  title: string;
  mine: number;
  onRated: (bookId: string, stars: number, summary: { avg: number; count: number }) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function rate(stars: number) {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId, stars }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(body.error || "Could not save your rating");
        return;
      }
      onRated(bookId, stars, body.summary);
      setMsg(mine ? "Rating updated" : "Thanks for rating");
    } catch {
      setMsg("Could not reach the server. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rate-book">
      <p className="text-xs text-ink-soft">{mine ? "Your rating" : "Rate this book"}</p>
      <StarInput value={mine} onRate={rate} disabled={busy} label={`Rate ${title}`} />
      {msg ? <p className="rate-msg text-xs" role="status">{msg}</p> : null}
    </div>
  );
}
