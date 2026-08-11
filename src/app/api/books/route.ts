import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

const createSchema = z.object({
  title: z.string().min(2),
  author: z.string().min(2),
  description: z.string().min(5),
  category: z.enum(["kids", "school", "history", "nature", "adventure", "mix"]),
  condition: z.string().min(2),
  pages: z.number().int().positive(),
  price: z.number().positive(),
  stock: z.number().int().positive().default(5),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  const books = await prisma.book.findMany({
    where: category && category !== "all" ? { category } : undefined,
    orderBy: [{ category: "asc" }, { title: "asc" }],
  });

  return NextResponse.json({ books });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Only the store owner can add books" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid book details" }, { status: 400 });
  }

  const book = await prisma.book.create({
    data: {
      title: parsed.data.title.trim(),
      author: parsed.data.author.trim(),
      description: parsed.data.description.trim(),
      category: parsed.data.category,
      condition: parsed.data.condition,
      pages: parsed.data.pages,
      priceCents: Math.round(parsed.data.price * 100),
      stock: parsed.data.stock,
    },
  });

  return NextResponse.json({ book }, { status: 201 });
}
