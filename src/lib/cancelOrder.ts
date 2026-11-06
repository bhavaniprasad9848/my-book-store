import { OrderStatus, ShippingStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { sendCancellationEmail } from "@/lib/mail";
import { moneyFromCents } from "@/lib/catalog";

/** An order can be cancelled until it ships. */
export const CANCELLABLE_STEPS: ShippingStatus[] = [ShippingStatus.PROCESSING, ShippingStatus.PACKED];

export function canCancel(order: { status: OrderStatus; shippingStatus: ShippingStatus }) {
  return order.status === OrderStatus.PAID && CANCELLABLE_STEPS.includes(order.shippingStatus);
}

/**
 * Cancels a paid order that hasn't shipped: marks it cancelled, puts the books
 * back in stock, refunds the payment through Stripe and emails the customer.
 * The database step is guarded so it can't race with the admin marking it shipped.
 */
export async function cancelOrder({
  orderId,
  by,
  reason,
}: {
  orderId: string;
  by: "customer" | "admin";
  reason?: string;
}) {
  const claimed = await prisma.$transaction(async (tx) => {
    const updated = await tx.order.updateMany({
      where: { id: orderId, status: OrderStatus.PAID, shippingStatus: { in: CANCELLABLE_STEPS } },
      data: {
        status: OrderStatus.CANCELLED,
        cancelledAt: new Date(),
        cancelledBy: by,
        cancelReason: reason?.slice(0, 200) || null,
        refundStatus: "Refund in progress",
      },
    });
    if (updated.count === 0) return false;

    const items = await tx.orderItem.findMany({ where: { orderId } });
    for (const item of items) {
      await tx.book.update({ where: { id: item.bookId }, data: { stock: { increment: item.qty } } });
    }
    return true;
  });

  if (!claimed) {
    return { ok: false as const, error: "This order can't be cancelled. It may have shipped already or was cancelled before." };
  }

  const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId }, include: { items: true, user: true } });

  // Refund the card payment. If this fails, the order stays cancelled and the
  // admin sees the refund status so they can refund it from the Stripe dashboard.
  let refundStatus = "Refund pending. The store will refund you manually.";
  let refundId: string | null = null;
  if (isStripeConfigured() && order.stripeSessionId) {
    try {
      const stripe = getStripe();
      const checkout = await stripe.checkout.sessions.retrieve(order.stripeSessionId);
      const paymentIntent =
        typeof checkout.payment_intent === "string" ? checkout.payment_intent : checkout.payment_intent?.id;
      if (!paymentIntent) throw new Error("No payment found for this order");
      const refund = await stripe.refunds.create(
        { payment_intent: paymentIntent, reason: "requested_by_customer", metadata: { orderId } },
        { idempotencyKey: `cancel-${orderId}` }
      );
      refundId = refund.id;
      refundStatus = `Refunded ${moneyFromCents(order.totalCents)} to the original card. It can take 5–10 days to appear.`;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Refund failed";
      console.error(`[cancel] refund failed for ${orderId}:`, message);
      refundStatus = "Refund pending. The store will refund you manually.";
    }
  }

  await prisma.order.update({ where: { id: orderId }, data: { refundStatus, refundId } });

  const email = await sendCancellationEmail({
    id: order.id,
    customerName: order.user.name,
    customerEmail: order.user.email,
    by,
    refundStatus,
    items: order.items.map((i) => ({ title: i.title, qty: i.qty })),
  });

  return { ok: true as const, refundStatus, cancelledAt: order.cancelledAt?.toISOString() ?? null, email };
}
