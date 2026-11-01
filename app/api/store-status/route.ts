import { NextResponse } from "next/server";
import { getPublishedCatalogue } from "@/db/commerce";

export const dynamic = "force-dynamic";

/**
 * A public availability hint, not a health dashboard. Never expose secret
 * values, database errors or unverified inventory quantities to customers.
 */
export async function GET() {
  const configured =
    process.env.CHECKOUT_ENABLED === "true" &&
    /^(sk|rk)_(test|live)_/.test(process.env.STRIPE_SECRET_KEY ?? "") &&
    Boolean(process.env.STRIPE_WEBHOOK_SECRET) &&
    Boolean(process.env.RESEND_API_KEY) &&
    Boolean(process.env.ORDER_EMAIL_FROM) &&
    Boolean(process.env.ORDER_EMAIL_TO);

  if (!configured) return NextResponse.json({ ordersOpen: false }, { headers: { "Cache-Control": "no-store" } });
  try {
    await getPublishedCatalogue();
    return NextResponse.json({ ordersOpen: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ ordersOpen: false }, { headers: { "Cache-Control": "no-store" } });
  }
}
