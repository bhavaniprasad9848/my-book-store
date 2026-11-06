import { Resend } from "resend";
import nodemailer from "nodemailer";
import { moneyFromCents } from "@/lib/catalog";

/** Returns the Resend key, ignoring the "re_..." placeholder from .env.example. */
function resendKey() {
  const key = process.env.RESEND_API_KEY ?? "";
  return /^re_[A-Za-z0-9_]{10,}$/.test(key) ? key : "";
}

/** Gmail (or any SMTP) is used when SMTP_USER and SMTP_PASS are set. */
function smtpConfigured() {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
}

export function isEmailConfigured() {
  return smtpConfigured() || Boolean(resendKey());
}

/**
 * Sends one plain-text email. Prefers SMTP (e.g. Gmail with an App Password),
 * falls back to Resend. Returns { ok, status } and never throws.
 */
export async function sendMail({ to, subject, text }: { to: string; subject: string; text: string }) {
  try {
    if (smtpConfigured()) {
      const port = Number(process.env.SMTP_PORT || 465);
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port,
        secure: port === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
      await transporter.sendMail({
        from: process.env.SMTP_FROM || `MY BOOK STORE <${process.env.SMTP_USER}>`,
        to,
        subject,
        text,
      });
      return { ok: true, status: `Email sent to ${to}` };
    }

    const apiKey = resendKey();
    if (apiKey) {
      const resend = new Resend(apiKey);
      const result = await resend.emails.send({
        from: process.env.EMAIL_FROM || "MY BOOK STORE <onboarding@resend.dev>",
        to,
        subject,
        text,
      });
      if (result.error) return { ok: false, status: result.error.message };
      return { ok: true, status: `Email sent to ${to}` };
    }

    console.log(`[mail] No email provider configured. Would send to ${to}: ${subject}\n${text}`);
    return { ok: false, status: "Email not configured. Add SMTP_USER/SMTP_PASS or RESEND_API_KEY." };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send email";
    console.error("[mail] send failed:", message);
    return { ok: false, status: message };
  }
}

export async function sendOtpEmail(to: string, code: string, reason: string, minutes: number) {
  return sendMail({
    to,
    subject: `${code} is your MY BOOK STORE code`,
    text: [
      `Your one-time code is: ${code}`,
      "",
      reason,
      `It expires in ${minutes} minutes and can be used once.`,
      "",
      "If you didn't ask for this, you can ignore this email. Never share this code with anyone.",
      "",
      "MY BOOK STORE",
    ].join("\n"),
  });
}

type ReceiptOrder = {
  id: string;
  customerName: string;
  customerEmail: string;
  paidAt: string;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  items: Array<{ title: string; qty: number; unitPriceCents: number }>;
};

export function buildReceiptText(order: ReceiptOrder) {
  const lines = [
    "MY BOOK STORE — Order Receipt",
    `Order ID: ${order.id}`,
    `Customer: ${order.customerName}`,
    `Email: ${order.customerEmail}`,
    `Date: ${order.paidAt}`,
    "",
    "Items:",
    ...order.items.map(
      (item) =>
        `- ${item.title} x${item.qty} @ ${moneyFromCents(item.unitPriceCents)} = ${moneyFromCents(item.unitPriceCents * item.qty)}`
    ),
    "",
    `Subtotal: ${moneyFromCents(order.subtotalCents)}`,
    `Shipping: ${moneyFromCents(order.shippingCents)}`,
    `Total paid: ${moneyFromCents(order.totalCents)}`,
    "",
    "Thank you buying in MY BOOK STORE.",
    "If you like please visit again.",
  ];
  return lines.join("\n");
}

export async function sendReceiptEmail(order: ReceiptOrder) {
  if (!isEmailConfigured()) {
    console.log("[mail] Email not configured. Receipt preview:\n", buildReceiptText(order));
    return { ok: false, status: "Email not configured. Add SMTP_USER/SMTP_PASS to send Gmail receipts." };
  }
  const result = await sendMail({
    to: order.customerEmail,
    subject: `MY BOOK STORE Receipt — ${order.id}`,
    text: buildReceiptText(order),
  });
  return result.ok ? { ok: true, status: `Receipt emailed to ${order.customerEmail}` } : result;
}

type ShippingUpdate = {
  id: string;
  customerName: string;
  customerEmail: string;
  statusLabel: string;
  detail: string;
  items: Array<{ title: string; qty: number }>;
};

export function buildShippingUpdateText(update: ShippingUpdate) {
  return [
    `Hello ${update.customerName},`,
    "",
    `Your MY BOOK STORE order ${update.id} is now: ${update.statusLabel}.`,
    update.detail,
    "",
    "Books in this order:",
    ...update.items.map((item) => `- ${item.title} x${item.qty}`),
    "",
    "You can follow every step on the My orders page of the store.",
    "Thank you for shopping with MY BOOK STORE.",
  ].join("\n");
}

/** Emails the customer whenever the owner moves their order to a new shipping step. */
export async function sendShippingUpdateEmail(update: ShippingUpdate) {
  if (!isEmailConfigured()) {
    console.log("[mail] Email not configured. Status email preview:\n", buildShippingUpdateText(update));
    return { ok: false, status: "Status saved. Email not sent because no email provider is set." };
  }
  const result = await sendMail({
    to: update.customerEmail,
    subject: `Your MY BOOK STORE order is ${update.statusLabel.toLowerCase()}`,
    text: buildShippingUpdateText(update),
  });
  return result.ok
    ? { ok: true, status: `Status saved and emailed to ${update.customerEmail}` }
    : { ok: false, status: `Status saved. Email failed: ${result.status}` };
}

/** Tells the customer their order was cancelled and what happens with the money. */
export async function sendCancellationEmail(info: {
  id: string;
  customerName: string;
  customerEmail: string;
  by: "customer" | "admin";
  refundStatus: string;
  items: Array<{ title: string; qty: number }>;
}) {
  const text = [
    `Hello ${info.customerName},`,
    "",
    info.by === "customer"
      ? `Your MY BOOK STORE order ${info.id} has been cancelled, as you asked.`
      : `We're sorry, your MY BOOK STORE order ${info.id} had to be cancelled by the store.`,
    info.refundStatus,
    "",
    "Books in this order:",
    ...info.items.map((item) => `- ${item.title} x${item.qty}`),
    "",
    "Thank you for shopping with MY BOOK STORE.",
  ].join("\n");

  if (!isEmailConfigured()) {
    console.log("[mail] Email not configured. Cancellation email preview:\n", text);
    return { ok: false, status: "Order cancelled. Email not sent because no email provider is set." };
  }
  const result = await sendMail({ to: info.customerEmail, subject: `Your MY BOOK STORE order was cancelled`, text });
  return result.ok
    ? { ok: true, status: `Cancellation email sent to ${info.customerEmail}` }
    : { ok: false, status: `Order cancelled. Email failed: ${result.status}` };
}
