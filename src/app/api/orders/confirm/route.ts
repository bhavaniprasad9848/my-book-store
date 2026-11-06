import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { sendReceiptEmail } from "@/lib/mail";
import { OrderStatus } from "@prisma/client";

/** Dev helper: confirm a Checkout session and fulfill if webhook is not running. */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const { sessionId, orderId } = (await request.json()) as {
    sessionId?: string;
    orderId?: string;
  };

  if (!sessionId || !orderId) {
    return NextResponse.json({ error: "Missing sessionId or orderId" }, { status: 400 });
  }

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: session.user.id },
    include: { items: true, user: true },
  });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.status === OrderStatus.CANCELLED) {
    return NextResponse.json({ order, cancelled: true });
  }
  if (order.status === OrderStatus.PAID) {
    return NextResponse.json({ order, alreadyPaid: true });
  }

  const stripe = getStripe();
  const checkout = await stripe.checkout.sessions.retrieve(sessionId);
  if (checkout.payment_status !== "paid") {
    return NextResponse.json({ error: "Payment not completed yet" }, { status: 400 });
  }

  // Claim the order first so the webhook and this page can't both fulfill it.
  const fulfilled = await prisma.$transaction(async (tx) => {
    const claimed = await tx.order.updateMany({
      where: { id: order.id, status: OrderStatus.PENDING },
      data: { status: OrderStatus.PAID, paidAt: new Date(), stripeSessionId: sessionId },
    });
    if (claimed.count === 0) return false;
    for (const item of order.items) {
      await tx.book.update({
        where: { id: item.bookId },
        data: { stock: { decrement: item.qty } },
      });
    }
    return true;
  });
  if (!fulfilled) {
    const latest = await prisma.order.findUnique({ where: { id: order.id }, include: { items: true, user: true } });
    return NextResponse.json({ order: latest, alreadyPaid: latest?.status === OrderStatus.PAID });
  }

  const paidOrder = await prisma.order.findUnique({
    where: { id: order.id },
    include: { items: true, user: true },
  });
  if (!paidOrder) {
    return NextResponse.json({ error: "Order missing after pay" }, { status: 500 });
  }

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

  const updated = await prisma.order.update({
    where: { id: paidOrder.id },
    data: { emailStatus: emailResult.status },
    include: { items: true },
  });

  return NextResponse.json({ order: updated, email: emailResult });
}
