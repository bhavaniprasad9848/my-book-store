import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid registration details" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const role =
    email === "bhavaniprasad9848@gmail.com" ? Role.ADMIN : Role.CUSTOMER;

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name.trim(),
      email,
      passwordHash,
      role,
    },
    select: { id: true, name: true, email: true, role: true },
  });

  return NextResponse.json({ user }, { status: 201 });
}
