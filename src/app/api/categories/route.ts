import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { getCategories } from "@/lib/categories";
import { slugify } from "@/lib/slug";

const schema = z.object({
  name: z.string().trim().min(2, "Name needs at least 2 characters").max(40, "Keep the name under 40 characters"),
  blurb: z.string().trim().min(5, "Add a short description (5+ characters)").max(140, "Keep the description under 140 characters"),
});

export async function GET() {
  return NextResponse.json({ categories: await getCategories() });
}

/** Admin only: add a new category shelf. */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Only the admin can add categories" }, { status: 403 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid category" }, { status: 400 });
  }

  await getCategories(); // make sure the original six exist before adding more
  const id = slugify(parsed.data.name);
  if (!id) {
    return NextResponse.json({ error: "Use letters or numbers in the name" }, { status: 400 });
  }
  const existing = await prisma.category.findUnique({ where: { id } });
  if (existing) {
    return NextResponse.json({ error: `A category called "${existing.name}" already exists` }, { status: 409 });
  }

  const last = await prisma.category.aggregate({ _max: { sortOrder: true } });
  const category = await prisma.category.create({
    data: { id, name: parsed.data.name, blurb: parsed.data.blurb, sortOrder: (last._max.sortOrder ?? 0) + 1 },
  });
  return NextResponse.json({ category }, { status: 201 });
}
