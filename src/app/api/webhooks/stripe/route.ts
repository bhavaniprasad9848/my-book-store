import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { sendReceiptEmail } from "@/lib/mail";
import { OrderStatus } from "@prisma/client";

export const runtime = "nodejs";

async function fulfillOrder(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  if (!orderId) return;

  const existing = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, user: true },
  });
  if (!existing || existing.status === OrderStatus.PAID) return;

  await prisma.$transaction(async (tx) => {
    for (const item of existing.items) {
      const book = await tx.book.findUnique({ where: { id: item.bookId } });
      if (!book || book.stock < item.qty) {
        throw new Error(`Insufficient stock for ${item.title}`);
      }
      await tx.book.update({
        where: { id: item.bookId },
        data: { stock: { decrement: item.qty } },
      });
    }

    await tx.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.PAID,
        paidAt: new Date(),
        stripeSessionId: session.id,
      },
    });
  });

  const paidOrder = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, user: true },
  });
  if (!paidOrder) return;

  const emailResult = await sendReceiptEmail({
    id: paidOrder.id,
    customerName: paidOrder.user.name,
    customerEmail: paidOrder.user.email,
    paidAt: (paidOrder.paidAt || new Date()).toLocaleString(),
    subtotalCents: paidOrder.subtotalCents,
    shippingCents: paidOrder.shippingCents,
    totalCents: paidOrder.totalCents,
    items: paidOrder.items.map((item) => ({
      title: item.title,
      qty: item.qty,
      unitPriceCents: item.unitPriceCents,
    })),
  });

  await prisma.order.update({
    where: { id: orderId },
    data: { emailStatus: emailResult.status },
  });
}

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const stripe = getStripe();
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    const payload = await request.text();
    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } else {
      // Local fallback when webhook secret is not set yet (dev only)
      event = JSON.parse(payload) as Stripe.Event;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid webhook";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    try {
      await fulfillOrder(session);
    } catch (error) {
      console.error("Fulfillment failed", error);
      return NextResponse.json({ error: "Fulfillment failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
