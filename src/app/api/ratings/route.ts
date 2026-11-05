import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasBought, ratingSummaries } from "@/lib/ratings";

const schema = z.object({
  bookId: z.string().min(1),
  stars: z.number().int().min(1).max(5),
});

/** Rate a book 1-5 stars. Allowed only after paying for it; rating again replaces the old one. */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Please sign in first" }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Choose between 1 and 5 stars" }, { status: 400 });
  }
  const { bookId, stars } = parsed.data;

  if (!(await hasBought(session.user.id, bookId))) {
    return NextResponse.json({ error: "You can rate a book after you have bought it" }, { status: 403 });
  }

  await prisma.rating.upsert({
    where: { bookId_userId: { bookId, userId: session.user.id } },
    create: { bookId, userId: session.user.id, stars },
    update: { stars },
  });

  const summary = (await ratingSummaries([bookId]))[bookId] ?? { avg: stars, count: 1 };
  return NextResponse.json({ bookId, stars, summary });
}
