"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Topbar } from "@/components/Topbar";
import { moneyFromCents } from "@/lib/catalog";

type OrderView = {
  id: string;
  status: string;
  emailStatus: string | null;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  paidAt: string | null;
  items: Array<{ title: string; qty: number; unitPriceCents: number }>;
};

export default function SuccessClient() {
  const params = useSearchParams();
  const orderId = params.get("orderId");
  const sessionId = params.get("session_id");
  const [order, setOrder] = useState<OrderView | null>(null);
  const [message, setMessage] = useState("Confirming your payment...");
  const [error, setError] = useState("");

  useEffect(() => {
    async function confirm() {
      if (!orderId) {
        setError("Missing order id");
        return;
      }

      if (sessionId) {
        const res = await fetch("/api/orders/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, sessionId }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Could not confirm payment");
          return;
        }
        setOrder({
          ...data.order,
          paidAt: data.order.paidAt
            ? new Date(data.order.paidAt).toLocaleString()
            : null,
        });
        setMessage(data.email?.status || data.order.emailStatus || "Payment confirmed");
        return;
      }

      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Order not found");
        return;
      }
      setOrder({
        ...data.order,
        paidAt: data.order.paidAt ? new Date(data.order.paidAt).toLocaleString() : null,
      });
      setMessage(data.order.emailStatus || "Order loaded");
    }

    confirm().catch(() => setError("Something went wrong confirming the order"));
  }, [orderId, sessionId]);

  return (
    <>
      <Topbar />
      <main className="mx-auto w-[min(720px,calc(100%-2rem))] pb-16 pt-8">
        <section className="panel p-8 text-center">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-2xl text-emerald-700">
            ✓
          </div>
          <h1 className="font-display text-4xl">Payment successful</h1>
          {error ? <p className="mt-3 text-red-700">{error}</p> : <p className="mt-3 text-ink-soft">{message}</p>}

          {order ? (
            <div className="mt-6 rounded-xl border border-dashed border-black/20 bg-[#fffdf8] p-4 text-left">
              <div className="mb-2 flex justify-between text-sm">
                <span>Order ID</span>
                <span>{order.id}</span>
              </div>
              <div className="mb-2 flex justify-between text-sm">
                <span>Status</span>
                <span>{order.status}</span>
              </div>
              {order.paidAt ? (
                <div className="mb-2 flex justify-between text-sm">
                  <span>Paid at</span>
                  <span>{order.paidAt}</span>
                </div>
              ) : null}
              {order.items.map((item) => (
                <div key={`${item.title}-${item.qty}`} className="flex justify-between text-sm">
                  <span>
                    {item.title} × {item.qty}
                  </span>
                  <span>{moneyFromCents(item.unitPriceCents * item.qty)}</span>
                </div>
              ))}
              <div className="mt-3 flex justify-between border-t border-black/10 pt-3 font-bold">
                <span>Total paid</span>
                <span>{moneyFromCents(order.totalCents)}</span>
              </div>
            </div>
          ) : null}

          <Link href="/shop" className="btn-primary mt-6 inline-flex">
            Shop again
          </Link>
        </section>
      </main>
    </>
  );
}
