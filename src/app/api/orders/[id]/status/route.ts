import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrderStatus, Role, ShippingStatus } from "@prisma/client";
import { SHIPPING_STEPS } from "@/lib/orders";
import { sendShippingUpdateEmail } from "@/lib/mail";

const schema = z.object({ status: z.nativeEnum(ShippingStatus) });

/** Owner only: move an order to a shipping step and email the customer. */
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Only the store owner can update orders" }, { status: 403 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Unknown status" }, { status: 400 });
  }

  const { id } = await context.params;
  const order = await prisma.order.findUnique({ where: { id }, include: { user: true, items: true } });
  if (!order || order.status !== OrderStatus.PAID) {
    return NextResponse.json({ error: "Paid order not found" }, { status: 404 });
  }
  if (order.shippingStatus === parsed.data.status) {
    return NextResponse.json({ ok: true, email: { ok: false, status: "Order already has this status" } });
  }

  const updated = await prisma.order.update({
    where: { id },
    data: { shippingStatus: parsed.data.status, shippingUpdatedAt: new Date() },
  });

  const step = SHIPPING_STEPS.find((s) => s.status === parsed.data.status)!;
  const email = await sendShippingUpdateEmail({
    id: order.id,
    customerName: order.user.name,
    customerEmail: order.user.email,
    statusLabel: step.label,
    detail: step.detail,
    items: order.items.map((i) => ({ title: i.title, qty: i.qty })),
  });

  return NextResponse.json({
    ok: true,
    shippingStatus: updated.shippingStatus,
    shippingUpdatedAt: updated.shippingUpdatedAt?.toISOString() ?? null,
    email,
  });
}
