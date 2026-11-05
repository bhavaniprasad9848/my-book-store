import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";

export type RatingSummary = { avg: number; count: number };

/** Average stars and number of ratings per book. Books with no ratings are left out. */
export async function ratingSummaries(bookIds?: string[]): Promise<Record<string, RatingSummary>> {
  const groups = await prisma.rating.groupBy({
    by: ["bookId"],
    where: bookIds ? { bookId: { in: bookIds } } : undefined,
    _avg: { stars: true },
    _count: { _all: true },
  });
  const out: Record<string, RatingSummary> = {};
  for (const g of groups) {
    out[g.bookId] = { avg: Math.round((g._avg.stars ?? 0) * 10) / 10, count: g._count._all };
  }
  return out;
}

/** Only customers who have paid for a book may rate it. */
export async function hasBought(userId: string, bookId: string) {
  const item = await prisma.orderItem.findFirst({
    where: { bookId, order: { userId, status: OrderStatus.PAID } },
    select: { id: true },
  });
  return Boolean(item);
}
