import { Resend } from "resend";
import { moneyFromCents } from "@/lib/catalog";

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
  const apiKey = process.env.RESEND_API_KEY;
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
