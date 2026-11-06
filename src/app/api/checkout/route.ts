import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cartContext, cartItemsSchema, priceCart } from "@/lib/checkoutCart";
import { verifyOtp } from "@/lib/otp";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

const schema = z.object({
  items: cartItemsSchema,
  otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
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
    return NextResponse.json({ error: parsed.error?.issues[0]?.path[0] === "otp" ? "Enter the 6-digit code" : "Cart is empty or invalid" }, { status: 400 });
  }

  const priced = await priceCart(parsed.data.items);
  if (!priced.ok) {
    return NextResponse.json({ error: priced.error }, { status: 400 });
  }

  // Order confirmation: the emailed code must match this exact cart.
  const check = await verifyOtp(
    session.user.email.toLowerCase(),
    "CHECKOUT",
    parsed.data.otp,
    cartContext(parsed.data.items)
  );
  if (!check.ok) {
    return NextResponse.json({ error: check.error, otpError: true }, { status: 400 });
  }

  const { lineItems, subtotalCents, shippingCents, totalCents } = priced;

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
