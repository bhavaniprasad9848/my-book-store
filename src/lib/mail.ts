import { Resend } from "resend";
import { moneyFromCents } from "@/lib/catalog";

/** Returns the Resend key, ignoring the "re_..." placeholder from .env.example. */
function resendKey() {
  const key = process.env.RESEND_API_KEY ?? "";
  return /^re_[A-Za-z0-9_]{10,}$/.test(key) ? key : "";
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
  const apiKey = resendKey();
  const from = process.env.EMAIL_FROM || "MY BOOK STORE <onboarding@resend.dev>";

  if (!apiKey) {
    console.log("[mail] RESEND_API_KEY missing. Receipt preview:\n", buildReceiptText(order));
    return {
      ok: false,
      status: "Email not configured. Add RESEND_API_KEY to send Gmail receipts.",
    };
  }

  try {
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from,
      to: order.customerEmail,
      subject: `MY BOOK STORE Receipt — ${order.id}`,
      text: buildReceiptText(order),
    });

    if (result.error) {
      return { ok: false, status: result.error.message };
    }

    return {
      ok: true,
      status: `Receipt emailed to ${order.customerEmail}`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send email";
    return { ok: false, status: message };
  }
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
  const apiKey = resendKey();
  const from = process.env.EMAIL_FROM || "MY BOOK STORE <onboarding@resend.dev>";

  if (!apiKey) {
    console.log("[mail] RESEND_API_KEY missing. Status email preview:\n", buildShippingUpdateText(update));
    return { ok: false, status: "Status saved. Email not sent because RESEND_API_KEY is not set." };
  }

  try {
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from,
      to: update.customerEmail,
      subject: `Your MY BOOK STORE order is ${update.statusLabel.toLowerCase()}`,
      text: buildShippingUpdateText(update),
    });
    if (result.error) return { ok: false, status: `Status saved. Email failed: ${result.error.message}` };
    return { ok: true, status: `Status saved and emailed to ${update.customerEmail}` };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send email";
    return { ok: false, status: `Status saved. Email failed: ${message}` };
  }
}
