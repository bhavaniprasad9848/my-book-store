import { createHmac, randomInt, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";

export type OtpPurpose = "LOGIN" | "CHECKOUT";

export const OTP_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 45;

function hashCode(code: string) {
  const secret = process.env.AUTH_SECRET || "dev-otp-secret";
  return createHmac("sha256", secret).update(code).digest("hex");
}

/**
 * Creates a fresh 6-digit code for this email + purpose and returns it in plain text
 * so it can be emailed. Only a hash is stored. Older unused codes are replaced.
 * `context` ties a checkout code to one exact cart, so it can't confirm a different order.
 */
export async function createOtp(email: string, purpose: OtpPurpose, context?: string) {
  const latest = await prisma.otpCode.findFirst({
    where: { email, purpose, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });
  if (latest) {
    const waited = (Date.now() - latest.createdAt.getTime()) / 1000;
    if (waited < RESEND_COOLDOWN_SECONDS) {
      return { ok: false as const, retryAfter: Math.ceil(RESEND_COOLDOWN_SECONDS - waited) };
    }
  }

  await prisma.otpCode.deleteMany({ where: { email, purpose, consumedAt: null } });

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await prisma.otpCode.create({
    data: {
      email,
      purpose,
      context: context ?? null,
      codeHash: hashCode(code),
      expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000),
    },
  });
  return { ok: true as const, code };
}

/** Checks a code and, if it's right, marks it used so it can't be reused. */
export async function verifyOtp(email: string, purpose: OtpPurpose, code: string, context?: string) {
  if (!/^\d{6}$/.test(code)) return { ok: false as const, error: "Enter the 6-digit code." };

  const record = await prisma.otpCode.findFirst({
    where: { email, purpose, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });
  if (!record || record.expiresAt < new Date()) {
    return { ok: false as const, error: "This code has expired. Request a new one." };
  }
  if (record.attempts >= MAX_ATTEMPTS) {
    return { ok: false as const, error: "Too many wrong tries. Request a new code." };
  }
  if ((record.context ?? null) !== (context ?? null)) {
    return { ok: false as const, error: "Your cart changed. Request a new code." };
  }

  const expected = Buffer.from(record.codeHash, "hex");
  const given = Buffer.from(hashCode(code), "hex");
  if (!timingSafeEqual(expected, given)) {
    await prisma.otpCode.update({ where: { id: record.id }, data: { attempts: { increment: 1 } } });
    const left = MAX_ATTEMPTS - record.attempts - 1;
    return {
      ok: false as const,
      error: left > 0 ? `Wrong code. ${left} ${left === 1 ? "try" : "tries"} left.` : "Too many wrong tries. Request a new code.",
    };
  }

  // Mark as used only if nobody else used it first (protects against double submits).
  const used = await prisma.otpCode.updateMany({
    where: { id: record.id, consumedAt: null },
    data: { consumedAt: new Date() },
  });
  if (used.count === 0) return { ok: false as const, error: "This code was already used. Request a new one." };
  return { ok: true as const };
}

/** "bhavani@gmail.com" -> "bh*****@gmail.com" */
export function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  if (!domain) return email;
  const visible = name.slice(0, Math.min(2, name.length));
  return `${visible}${"*".repeat(Math.max(1, name.length - visible.length))}@${domain}`;
}
