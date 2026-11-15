import { NextResponse } from "next/server";
import { rateLimitResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const limited = rateLimitResponse(request, "checkout-confirmation", 20, 60);
  if (limited) return limited;
  const sessionId = new URL(request.url).searchParams.get("session_id") ?? "";
  if (!/^cs_(?:live|test)_[a-zA-Z0-9]{8,200}$/.test(sessionId)) {
    return NextResponse.json({ verified: false, message: "Invalid checkout session." }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return NextResponse.json({ verified: false, message: "Payment verification is unavailable." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  try {
    const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
      headers: { Authorization: `Bearer ${secret}` },
      cache: "no-store",
    });
    if (!response.ok) throw new Error("Stripe session could not be verified.");
    const session = await response.json() as { id?: string; payment_status?: string; status?: string; metadata?: Record<string,string> };
    const verified = session.id === sessionId && session.payment_status === "paid" && session.status === "complete";
    return NextResponse.json({ verified }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ verified: false, message: "Payment verification is temporarily unavailable." }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
