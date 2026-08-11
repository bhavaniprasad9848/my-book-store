import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calcShippingCents } from "@/lib/catalog";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

const schema = z.object({
  items: z
    .array(
      z.object({
        bookId: z.string().min(1),
        qty: z.number().int().positive(),
      })
    )
    .min(1),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Please login first" }, { status: 401 });
  }

  if (!isStripeConfigured()) {
    return NextResponse.json(
      {
        error:
          "Stripe is not configured. Add STRIPE_SECRET_KEY to .env (use Stripe test keys).",
      },
      { status: 503 }
    );
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Cart is empty or invalid" }, { status: 400 });
  }

  const bookIds = parsed.data.items.map((item) => item.bookId);
  const books = await prisma.book.findMany({ where: { id: { in: bookIds } } });
  const bookMap = new Map(books.map((book) => [book.id, book]));

  const lineItems: Array<{ bookId: string; title: string; unitPriceCents: number; qty: number }> =
    [];

  for (const item of parsed.data.items) {
    const book = bookMap.get(item.bookId);
    if (!book) {
      return NextResponse.json({ error: "A book in your cart no longer exists" }, { status: 400 });
    }
    if (book.stock < item.qty) {
      return NextResponse.json(
        { error: `Not enough stock for "${book.title}" (available: ${book.stock})` },
        { status: 400 }
      );
    }
    lineItems.push({
      bookId: book.id,
      title: book.title,
      unitPriceCents: book.priceCents,
      qty: item.qty,
    });
  }

  const subtotalCents = lineItems.reduce(
    (sum, item) => sum + item.unitPriceCents * item.qty,
    0
  );
  const shippingCents = calcShippingCents(subtotalCents);
  const totalCents = subtotalCents + shippingCents;

  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      subtotalCents,
      shippingCents,
      totalCents,
      items: {
        create: lineItems.map((item) => ({
          bookId: item.bookId,
          title: item.title,
          unitPriceCents: item.unitPriceCents,
          qty: item.qty,
        })),
      },
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const stripe = getStripe();

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: session.user.email,
    line_items: [
      ...lineItems.map((item) => ({
        quantity: item.qty,
        price_data: {
          currency: "usd",
          unit_amount: item.unitPriceCents,
          product_data: { name: item.title },
        },
      })),
      ...(shippingCents > 0
        ? [
            {
              quantity: 1,
              price_data: {
                currency: "usd",
                unit_amount: shippingCents,
                product_data: { name: "Shipping" },
              },
            },
          ]
        : []),
    ],
    metadata: {
      orderId: order.id,
      userId: session.user.id,
    },
    success_url: `${appUrl}/success?orderId=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/cart?canceled=1`,
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { stripeSessionId: checkoutSession.id },
  });

  return NextResponse.json({ url: checkoutSession.url, orderId: order.id });
}
