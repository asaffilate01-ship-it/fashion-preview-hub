import { NextResponse } from "next/server";
import { recordCustomerTradeReview } from "@/db/trade-review";
import { parseTradeReviewDecision, TradeReviewError } from "@/lib/trade-review";
import { rateLimitResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" };

export async function POST(request: Request) {
  const limited = rateLimitResponse(request, "trade-customer-decision", 5, 900,
    "Too many quotation review attempts. Please contact KALËTHON.");
  if (limited) return limited;
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json({ message: "JSON is required." }, { status: 415, headers });
  }
  if (Number(request.headers.get("content-length") || 0) > 2400) {
    return NextResponse.json({ message: "Your response is too large." }, { status: 413, headers });
  }
  try {
    const raw = await request.text();
    if (raw.length > 2400) return NextResponse.json({ message: "Your response is too large." }, { status: 413, headers });
    const payload: unknown = JSON.parse(raw);
    const validated = parseTradeReviewDecision(payload);
    const result = await recordCustomerTradeReview(validated);
    return NextResponse.json({ ok: true, ...result }, { headers });
  } catch (error) {
    if (error instanceof TradeReviewError) {
      return NextResponse.json({ message: error.message }, {
        status: error.code === "conflict" ? 409 : error.code === "unavailable" ? 503 : 400, headers,
      });
    }
    if (error instanceof SyntaxError) return NextResponse.json({ message: "Invalid JSON." }, { status: 400, headers });
    return NextResponse.json({
      message: "Quotation review is unavailable. Contact hello@kalethon.com.",
    }, { status: 503, headers });
  }
}
