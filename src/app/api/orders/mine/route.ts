import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { Role } from "@prisma/client";
import { getOrdersFor } from "@/lib/orders";

export const dynamic = "force-dynamic";

/** Paid orders with their shipping status. The owner gets every order. */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Please sign in first" }, { status: 401 });
  }
  const data = await getOrdersFor({ id: session.user.id, isAdmin: session.user.role === Role.ADMIN });
  return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
}
