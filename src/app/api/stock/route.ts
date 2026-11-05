import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** Current stock for every book, so the shop can update counts without a refresh. */
export async function GET() {
  const books = await prisma.book.findMany({ select: { id: true, stock: true } });
  const stock: Record<string, number> = {};
  for (const b of books) stock[b.id] = b.stock;
  return NextResponse.json({ stock }, { headers: { "Cache-Control": "no-store" } });
}
