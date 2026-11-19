import { NextResponse } from "next/server";
import { getAdminIdentity } from "@/lib/admin-auth";
import { createTradePrice, listTradePrices, markTradePriceReady } from "@/db/commercial-quote";
import { CommercialPricingError } from "@/lib/commercial-quote";
import { issueTradeReview, listTradeReviews } from "@/db/trade-review";
import { TradeReviewError } from "@/lib/trade-review";

export const dynamic = "force-dynamic";
const noStore = { "Cache-Control": "no-store" };
const MAX_BODY_BYTES = 8_000;

export async function GET() {
  if (!(await getAdminIdentity())) {
    return NextResponse.json({ message: "Administrator access is required." }, { status: 401, headers: noStore });
  }
  try {
    const [prices, reviews] = await Promise.all([listTradePrices(), listTradeReviews()]);
    return NextResponse.json({ ...prices, ...reviews }, { headers: noStore });
  } catch {
    return NextResponse.json({ message: "Trade pricing is unavailable." }, { status: 503, headers: noStore });
  }
}

export async function POST(request: Request) {
  const admin = await getAdminIdentity();
  if (!admin) {
    return NextResponse.json({ message: "Administrator access is required." }, { status: 401, headers: noStore });
  }
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json({ message: "JSON is required." }, { status: 415, headers: noStore });
  }
  const length = Number(request.headers.get("content-length") || 0);
  if (length > MAX_BODY_BYTES) {
    return NextResponse.json({ message: "Price request is too large." }, { status: 413, headers: noStore });
  }
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return NextResponse.json({ message: "Price request is too large." }, { status: 413, headers: noStore });
    }
    const body = JSON.parse(raw) as Record<string, unknown>;
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ message: "Invalid price request." }, { status: 400, headers: noStore });
    }
    if (body.action === "create") {
      const result = await createTradePrice(body, admin.email);
      return NextResponse.json({ ok: true, ...result }, { headers: noStore });
    }
    if (body.action === "mark_ready") {
      const result = await markTradePriceReady(String(body.id ?? ""), admin.email);
      return NextResponse.json({ ok: true, ...result }, { headers: noStore });
    }
    if (body.action === "issue_customer_review") {
      const result = await issueTradeReview(String(body.id ?? ""), admin.email);
      return NextResponse.json({ ok: true, ...result }, {
        headers: { ...noStore, "Referrer-Policy": "no-referrer" },
      });
    }
    return NextResponse.json({ message: "Unknown pricing action." }, { status: 400, headers: noStore });
  } catch (error) {
    if (error instanceof TradeReviewError) {
      const status = error.code === "conflict" ? 409 : error.code === "unavailable" ? 503 : 400;
      return NextResponse.json({ message: error.message }, { status, headers: noStore });
    }
    if (error instanceof CommercialPricingError) {
      const status = error.code === "not_found" ? 404 : error.code === "conflict" ? 409 :
        error.code === "unavailable" ? 503 : 400;
      return NextResponse.json({ message: error.message }, { status, headers: noStore });
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: "Invalid JSON." }, { status: 400, headers: noStore });
    }
    return NextResponse.json({ message: "Could not save trade pricing." }, { status: 503, headers: noStore });
  }
}
