import { NextResponse } from "next/server";
import { recordPaidStripeOrder } from "@/db/commerce";

type StripeLineItem = {
  description?: string;
  quantity?: number;
  amount_total?: number;
  currency?: string;
  price?: {
    unit_amount?: number;
    product?: { name?: string; metadata?: Record<string, string> };
  };
};

type StripeSession = {
  id: string;
  amount_total?: number;
  amount_subtotal?: number;
  total_details?: { amount_shipping?: number; amount_tax?: number };
  currency?: string;
  payment_status?: string;
  customer_details?: { email?: string; name?: string };
  shipping_details?: { name?: string; address?: Record<string, string | null> };
  line_items?: { data?: StripeLineItem[] };
};

type StripeEvent = {
  id: string;
  type: string;
  data?: { object?: { id?: string } };
};

function safeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return difference === 0;
}

async function hmacHex(secret: string, value: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function verifyStripeSignature(payload: string, header: string, secret: string) {
  const values = header.split(",").map((part) => part.trim().split("=", 2));
  const timestamp = values.find(([key]) => key === "t")?.[1];
  const signatures = values.filter(([key]) => key === "v1").map(([, value]) => value);
  if (!timestamp || signatures.length === 0 || Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;
  const expected = await hmacHex(secret, `${timestamp}.${payload}`);
  return signatures.some((signature) => safeEqual(signature, expected));
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);
}

function formatMoney(amount = 0, currency = "gbp") {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: currency.toUpperCase() }).format(amount / 100);
}

async function retrieveSession(sessionId: string, secretKey: string): Promise<StripeSession> {
  const query = new URLSearchParams();
  query.append("expand[]", "line_items");
  query.append("expand[]", "line_items.data.price.product");
  const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}?${query}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  });
  if (!response.ok) throw new Error("Unable to retrieve the paid Stripe session");
  return response.json() as Promise<StripeSession>;
}

async function sendEmail(to: string, subject: string, html: string, idempotencyKey: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.ORDER_EMAIL_FROM;
  if (!apiKey || !fromAddress) throw new Error("Order email is not configured");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify({ from: `KALËTHON Orders <${fromAddress}>`, to: [to], subject, html }),
  });
  if (!response.ok) throw new Error("Order email could not be sent");
}

async function notifyOrder(eventId: string, session: StripeSession) {
  const items = session.line_items?.data ?? [];
  const itemRows = items.map((item) => `<li><strong>${escapeHtml(item.description ?? "KALËTHON garment")}</strong> × ${item.quantity ?? 1} — ${formatMoney(item.amount_total, item.currency)}</li>`).join("");
  const customerName = escapeHtml(session.customer_details?.name ?? session.shipping_details?.name ?? "Customer");
  const orderTotal = formatMoney(session.amount_total, session.currency);
  const orderHtml = `<h1>New KALËTHON order</h1><p><strong>Stripe session:</strong> ${escapeHtml(session.id)}</p><p><strong>Customer:</strong> ${customerName}</p><p><strong>Email:</strong> ${escapeHtml(session.customer_details?.email ?? "Not supplied")}</p><ul>${itemRows}</ul><p><strong>Total paid:</strong> ${orderTotal}</p><p>Open Stripe to review the verified payment and delivery address before fulfilment.</p>`;
  await sendEmail(process.env.ORDER_EMAIL_TO ?? "hello@kalethon.com", `New KALËTHON order · ${orderTotal}`, orderHtml, `kalethon/${eventId}/owner`);

  const customerEmail = session.customer_details?.email;
  if (customerEmail) {
    const receiptHtml = `<h1>Thank you, ${customerName}.</h1><p>We have received your KALËTHON order and secure payment.</p><ul>${itemRows}</ul><p><strong>Total paid:</strong> ${orderTotal}</p><p>We will confirm production and delivery details from hello@kalethon.com.</p>`;
    await sendEmail(customerEmail, "We have received your KALËTHON order", receiptHtml, `kalethon/${eventId}/customer`);
  }
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!webhookSecret || !stripeSecret) return NextResponse.json({ message: "Stripe webhook is not configured." }, { status: 503 });

  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature || !(await verifyStripeSignature(payload, signature, webhookSecret))) {
    return NextResponse.json({ message: "Invalid Stripe signature." }, { status: 400 });
  }

  const event = JSON.parse(payload) as StripeEvent;
  if (["checkout.session.completed", "checkout.session.async_payment_succeeded"].includes(event.type)) {
    const sessionId = event.data?.object?.id;
    if (!sessionId) return NextResponse.json({ message: "Stripe session is missing." }, { status: 400 });
    const session = await retrieveSession(sessionId, stripeSecret);
    if (session.payment_status === "paid") {
      await recordPaidStripeOrder(event.id, event.type, session);
      await notifyOrder(event.id, session);
    }
  }
  return NextResponse.json({ received: true });
}
