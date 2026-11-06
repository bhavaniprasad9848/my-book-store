import { NextResponse } from "next/server";
import { z } from "zod";
import { Role } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cancelOrder } from "@/lib/cancelOrder";

const schema = z.object({ reason: z.string().max(200).optional() });

/** Customer (own orders) or admin (any order): cancel before it ships, restock and refund. */
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const role = session?.user?.role;
  if (!session?.user?.id || (role !== Role.CUSTOMER && role !== Role.ADMIN)) {
    return NextResponse.json({ error: "Only the customer who placed the order or the admin can cancel it" }, { status: 403 });
  }

  const { id } = await context.params;
  const order = await prisma.order.findUnique({ where: { id }, select: { userId: true } });
  if (!order || (role === Role.CUSTOMER && order.userId !== session.user.id)) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  const result = await cancelOrder({
    orderId: id,
    by: role === Role.ADMIN ? "admin" : "customer",
    reason: parsed.success ? parsed.data.reason : undefined,
  });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 409 });
  return NextResponse.json(result);
}
