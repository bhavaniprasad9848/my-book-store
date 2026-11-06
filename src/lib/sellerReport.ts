import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCategories } from "@/lib/categories";

export const LOW_STOCK = 2;
const DAYS = 14;

export type BookRow = {
  id: string;
  title: string;
  author: string;
  categoryName: string;
  sellerName: string;
  priceCents: number;
  stock: number;
  unitsSold: number;
  revenueCents: number;
};

export type ReportScope = { kind: "store" } | { kind: "seller"; sellerId: string };

/**
 * Everything a dashboard shows. Money counts PAID orders only.
 * "store" = the whole shop (admin). "seller" = only books that seller listed,
 * so a seller's money is what their own books earned (shipping goes to the store).
 */
export async function getSellerReport(scope: ReportScope = { kind: "store" }) {
  const sellerId = scope.kind === "seller" ? scope.sellerId : null;
  const bookWhere = sellerId ? { sellerId } : {};
  const orderHasMine = sellerId ? { items: { some: { book: { sellerId } } } } : {};
  const [books, categories, paidOrders, pendingOrders, cancelledOrders] = await Promise.all([
    prisma.book.findMany({ where: bookWhere, orderBy: { title: "asc" }, include: { seller: { select: { name: true } } } }),
    getCategories(),
    prisma.order.findMany({
      where: { status: OrderStatus.PAID, ...orderHasMine },
      include: { items: true, user: { select: { name: true, email: true } } },
      orderBy: { paidAt: "desc" },
    }),
    prisma.order.count({ where: { status: OrderStatus.PENDING, ...orderHasMine } }),
    prisma.order.findMany({ where: { status: OrderStatus.CANCELLED, ...orderHasMine }, include: { items: true } }),
  ]);

  const catName = new Map(categories.map((c) => [c.id, c.name]));
  const mine = new Set(books.map((b) => b.id));
  // For a seller, only their own lines in each order count.
  const ownItems = (items: (typeof paidOrders)[number]["items"]) => (sellerId ? items.filter((i) => mine.has(i.bookId)) : items);
  const orderCents = (o: (typeof paidOrders)[number]) =>
    sellerId ? ownItems(o.items).reduce((s, i) => s + i.qty * i.unitPriceCents, 0) : o.totalCents;

  // Units and money per book from paid orders.
  const sold = new Map<string, { units: number; cents: number }>();
  for (const order of paidOrders) {
    for (const item of ownItems(order.items)) {
      const row = sold.get(item.bookId) ?? { units: 0, cents: 0 };
      row.units += item.qty;
      row.cents += item.qty * item.unitPriceCents;
      sold.set(item.bookId, row);
    }
  }

  const rows: BookRow[] = books.map((book) => ({
    id: book.id,
    title: book.title,
    author: book.author,
    categoryName: catName.get(book.category) ?? book.category,
    sellerName: book.seller?.name ?? "Store",
    priceCents: book.priceCents,
    stock: book.stock,
    unitsSold: sold.get(book.id)?.units ?? 0,
    revenueCents: sold.get(book.id)?.cents ?? 0,
  }));

  // Per-category totals.
  const byCategory = new Map<string, { name: string; titles: number; stock: number; units: number; cents: number }>();
  for (const row of rows) {
    const c = byCategory.get(row.categoryName) ?? { name: row.categoryName, titles: 0, stock: 0, units: 0, cents: 0 };
    c.titles += 1;
    c.stock += row.stock;
    c.units += row.unitsSold;
    c.cents += row.revenueCents;
    byCategory.set(row.categoryName, c);
  }

  // Money per day for the last two weeks (by payment date, local server day).
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daily = Array.from({ length: DAYS }, (_, i) => {
    const day = new Date(today);
    day.setDate(today.getDate() - (DAYS - 1 - i));
    return { day, cents: 0, orders: 0 };
  });
  for (const order of paidOrders) {
    if (!order.paidAt) continue;
    const d = new Date(order.paidAt);
    d.setHours(0, 0, 0, 0);
    const slot = daily.find((x) => x.day.getTime() === d.getTime());
    if (slot) {
      slot.cents += orderCents(order);
      slot.orders += 1;
    }
  }

  const bookSalesCents = rows.reduce((s, r) => s + r.revenueCents, 0);
  const totals = {
    revenueCents: paidOrders.reduce((s, o) => s + orderCents(o), 0),
    bookSalesCents,
    shippingCents: sellerId ? 0 : paidOrders.reduce((s, o) => s + o.shippingCents, 0),
    paidOrders: paidOrders.length,
    pendingOrders,
    cancelledOrders: cancelledOrders.length,
    refundedCents: cancelledOrders.reduce(
      (s, o) => s + (sellerId ? o.items.filter((i) => mine.has(i.bookId)).reduce((t, i) => t + i.qty * i.unitPriceCents, 0) : o.totalCents),
      0
    ),
    unitsSold: rows.reduce((s, r) => s + r.unitsSold, 0),
    titles: rows.length,
    unitsInStock: rows.reduce((s, r) => s + r.stock, 0),
    stockValueCents: rows.reduce((s, r) => s + r.stock * r.priceCents, 0),
    lowStock: rows.filter((r) => r.stock > 0 && r.stock <= LOW_STOCK).length,
    soldOut: rows.filter((r) => r.stock < 1).length,
    avgOrderCents: paidOrders.length ? Math.round(paidOrders.reduce((s, o) => s + orderCents(o), 0) / paidOrders.length) : 0,
  };

  // Admin view: how much each seller (and the store's own books) has earned.
  const bySeller = new Map<string, { name: string; titles: number; stock: number; units: number; cents: number }>();
  for (const row of rows) {
    const x = bySeller.get(row.sellerName) ?? { name: row.sellerName, titles: 0, stock: 0, units: 0, cents: 0 };
    x.titles += 1;
    x.stock += row.stock;
    x.units += row.unitsSold;
    x.cents += row.revenueCents;
    bySeller.set(row.sellerName, x);
  }

  return {
    scope: scope.kind,
    totals,
    sellers: [...bySeller.values()].sort((a, b) => b.cents - a.cents || a.name.localeCompare(b.name)),
    books: rows,
    categories: [...byCategory.values()].sort((a, b) => b.cents - a.cents || a.name.localeCompare(b.name)),
    daily,
    restock: rows.filter((r) => r.stock <= LOW_STOCK).sort((a, b) => a.stock - b.stock || b.unitsSold - a.unitsSold),
    topSellers: [...rows].filter((r) => r.unitsSold > 0).sort((a, b) => b.unitsSold - a.unitsSold || b.revenueCents - a.revenueCents).slice(0, 5),
    recentOrders: paidOrders.slice(0, 8).map((o) => ({
      id: o.id,
      customer: o.user.name || o.user.email,
      paidAt: o.paidAt,
      units: ownItems(o.items).reduce((s, i) => s + i.qty, 0),
      totalCents: orderCents(o),
      shippingStatus: o.shippingStatus,
    })),
  };
}
