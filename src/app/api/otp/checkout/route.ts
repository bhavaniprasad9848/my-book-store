import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { cartContext, cartItemsSchema, priceCart } from "@/lib/checkoutCart";
import { createOtp, maskEmail, OTP_TTL_MINUTES } from "@/lib/otp";
import { isEmailConfigured, sendOtpEmail } from "@/lib/mail";
import { moneyFromCents } from "@/lib/catalog";

const schema = z.object({ items: cartItemsSchema });

/** Emails a code the customer must enter to confirm this order before paying. */
export async function POST(request: Request) {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();
  if (!session?.user?.id || !email) {
    return NextResponse.json({ error: "Please login first" }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Cart is empty or invalid" }, { status: 400 });
  }

  const priced = await priceCart(parsed.data.items);
  if (!priced.ok) return NextResponse.json({ error: priced.error }, { status: 400 });

  const otp = await createOtp(email, "CHECKOUT", cartContext(parsed.data.items));
  if (!otp.ok) {
    return NextResponse.json(
      { error: `Please wait ${otp.retryAfter}s before requesting another code.`, retryAfter: otp.retryAfter },
      { status: 429 }
    );
  }

  if (!isEmailConfigured()) {
    return NextResponse.json({ ok: true, sentTo: maskEmail(email), devCode: otp.code });
  }

  const summary = priced.lineItems.map((item) => `- ${item.title} x${item.qty}`).join("\n");
  const mail = await sendOtpEmail(
    email,
    otp.code,
    `Use it to confirm your order of ${moneyFromCents(priced.totalCents)}:\n${summary}`,
    OTP_TTL_MINUTES
  );
  if (!mail.ok) {
    return NextResponse.json({ error: `Couldn't send the code: ${mail.status}` }, { status: 502 });
  }
  return NextResponse.json({ ok: true, sentTo: maskEmail(email) });
}
