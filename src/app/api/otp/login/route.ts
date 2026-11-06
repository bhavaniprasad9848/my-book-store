import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createOtp, maskEmail, OTP_TTL_MINUTES } from "@/lib/otp";
import { isEmailConfigured, sendOtpEmail } from "@/lib/mail";
import { parsePortal, portalError } from "@/lib/portal";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  portal: z.enum(["customer", "seller", "admin", "owner"]).optional(),
});

/** Step 1 of sign-in: check the password, then email a 6-digit code. */
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  const valid = user ? await bcrypt.compare(parsed.data.password, user.passwordHash) : false;
  if (!user || !valid) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const portal = parsePortal(parsed.data.portal);
  const wrongPage = portalError(portal, user.role);
  if (wrongPage) {
    return NextResponse.json({ error: wrongPage, wrongPortal: true }, { status: 403 });
  }

  const otp = await createOtp(email, "LOGIN");
  if (!otp.ok) {
    return NextResponse.json(
      { error: `Please wait ${otp.retryAfter}s before requesting another code.`, retryAfter: otp.retryAfter },
      { status: 429 }
    );
  }

  // Without an email provider (local dev / demo) the code is shown on screen instead.
  if (!isEmailConfigured()) {
    return NextResponse.json({ ok: true, sentTo: maskEmail(email), devCode: otp.code });
  }

  const mail = await sendOtpEmail(
    email,
    otp.code,
    { admin: "Use it to finish signing in to the MY BOOK STORE admin dashboard.", seller: "Use it to finish signing in to your MY BOOK STORE seller dashboard.", customer: "Use it to finish signing in to MY BOOK STORE." }[portal],
    OTP_TTL_MINUTES
  );
  if (!mail.ok) {
    return NextResponse.json({ error: `Couldn't send the code: ${mail.status}` }, { status: 502 });
  }
  return NextResponse.json({ ok: true, sentTo: maskEmail(email) });
}
