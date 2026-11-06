import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { calcShippingCents } from "@/lib/catalog";

export const cartItemsSchema = z
  .array(
    z.object({
      bookId: z.string().min(1),
      qty: z.number().int().positive(),
    })
  )
  .min(1);

export type CartItems = z.infer<typeof cartItemsSchema>;

/** Stable fingerprint of a cart, so an order code only confirms this exact cart. */
export function cartContext(items: CartItems) {
  return items
    .map((item) => `${item.bookId}:${item.qty}`)
    .sort()
    .join(",");
}

/** Prices a cart from the database and checks stock. */
export async function priceCart(items: CartItems) {
  const books = await prisma.book.findMany({ where: { id: { in: items.map((i) => i.bookId) } } });
  const bookMap = new Map(books.map((book) => [book.id, book]));

  const lineItems: Array<{ bookId: string; title: string; unitPriceCents: number; qty: number }> = [];
  for (const item of items) {
    const book = bookMap.get(item.bookId);
    if (!book) return { ok: false as const, error: "A book in your cart no longer exists" };
    if (book.stock < item.qty) {
      return { ok: false as const, error: `Not enough stock for "${book.title}" (available: ${book.stock})` };
    }
    lineItems.push({ bookId: book.id, title: book.title, unitPriceCents: book.priceCents, qty: item.qty });
  }

  const subtotalCents = lineItems.reduce((sum, item) => sum + item.unitPriceCents * item.qty, 0);
  const shippingCents = calcShippingCents(subtotalCents);
  return { ok: true as const, lineItems, subtotalCents, shippingCents, totalCents: subtotalCents + shippingCents };
}
