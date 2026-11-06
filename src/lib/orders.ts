import { prisma } from "@/lib/prisma";
import { OrderStatus, ShippingStatus } from "@prisma/client";
import { ratingSummaries, type RatingSummary } from "@/lib/ratings";
import { canCancel } from "@/lib/cancelOrder";

export const SHIPPING_STEPS: { status: ShippingStatus; label: string; detail: string }[] = [
  { status: ShippingStatus.PROCESSING, label: "Processing", detail: "Payment received. We are getting your books ready." },
  { status: ShippingStatus.PACKED, label: "Packed", detail: "Your books are wrapped and boxed." },
  { status: ShippingStatus.SHIPPED, label: "Shipped", detail: "Your parcel is on its way." },
  { status: ShippingStatus.DELIVERED, label: "Delivered", detail: "Your parcel has arrived. Enjoy your reading." },
];

export function shippingLabel(status: ShippingStatus) {
  return SHIPPING_STEPS.find((s) => s.status === status)?.label ?? status;
}

export type OrderView = {
  id: string;
  createdAt: string;
  paidAt: string | null;
  totalCents: number;
  shippingStatus: ShippingStatus;
  shippingUpdatedAt: string | null;
  cancelled: boolean;
  canCancel: boolean;
  cancelledAt: string | null;
  cancelledBy: string | null;
  cancelReason: string | null;
  refundStatus: string | null;
  customer?: { name: string; email: string };
  items: { bookId: string; title: string; qty: number; unitPriceCents: number; category: string; author: string }[];
};

export type OrdersPayload = {
  orders: OrderView[];
  ratings: Record<string, RatingSummary>;
  myRatings: Record<string, number>;
};

/** Paid and cancelled orders for a customer, or every one of them for the admin. */
export async function getOrdersFor(user: { id: string; isAdmin: boolean }): Promise<OrdersPayload> {
  const rows = await prisma.order.findMany({
    where: { status: { in: [OrderStatus.PAID, OrderStatus.CANCELLED] }, ...(user.isAdmin ? {} : { userId: user.id }) },
    orderBy: { createdAt: "desc" },
    include: {
      items: { include: { book: { select: { category: true, author: true } } } },
      user: { select: { name: true, email: true } },
    },
    take: 100,
  });

  const orders: OrderView[] = rows.map((o) => ({
    id: o.id,
    createdAt: o.createdAt.toISOString(),
    paidAt: o.paidAt ? o.paidAt.toISOString() : null,
    totalCents: o.totalCents,
    shippingStatus: o.shippingStatus,
    shippingUpdatedAt: o.shippingUpdatedAt ? o.shippingUpdatedAt.toISOString() : null,
    cancelled: o.status === OrderStatus.CANCELLED,
    canCancel: canCancel(o),
    cancelledAt: o.cancelledAt ? o.cancelledAt.toISOString() : null,
    cancelledBy: o.cancelledBy,
    cancelReason: o.cancelReason,
    refundStatus: o.refundStatus,
    customer: user.isAdmin ? { name: o.user.name, email: o.user.email } : undefined,
    items: o.items.map((i) => ({
      bookId: i.bookId,
      title: i.title,
      qty: i.qty,
      unitPriceCents: i.unitPriceCents,
      category: i.book.category,
      author: i.book.author,
    })),
  }));

  const bookIds = [...new Set(orders.flatMap((o) => o.items.map((i) => i.bookId)))];
  const ratings = await ratingSummaries(bookIds);
  const mine = user.isAdmin
    ? []
    : await prisma.rating.findMany({ where: { userId: user.id, bookId: { in: bookIds } }, select: { bookId: true, stars: true } });
  const myRatings: Record<string, number> = {};
  for (const r of mine) myRatings[r.bookId] = r.stars;

  return { orders, ratings, myRatings };
}
