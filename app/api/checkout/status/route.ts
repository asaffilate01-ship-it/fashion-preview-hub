import { NextResponse } from "next/server";
import { hasRecordedPaidOrder } from "@/db/commerce";
import { rateLimitResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// A session identifier is a lookup reference, not proof of payment.
const SESSION_ID = /^cs_(?:test|live)_[A-Za-z0-9]{20,180}$/;

export async function GET(request: Request) {
  const limited = rateLimitResponse(request, "checkout-status", 30, 60);
  if (limited) return limited;

  const sessionId = new URL(request.url).searchParams.get("session_id") ?? "";
  if (!SESSION_ID.test(sessionId)) {
    return NextResponse.json(
      { code: "invalid_session", message: "That checkout reference was not valid." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const confirmed = await hasRecordedPaidOrder(sessionId);
    return NextResponse.json(
      { confirmed },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { code: "verification_unavailable", message: "We cannot verify this payment right now." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
