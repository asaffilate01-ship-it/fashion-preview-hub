import { NextResponse } from "next/server";
import { createCommerceQuestion } from "@/db/commerce";
import { rateLimitResponse } from "@/lib/rate-limit";
import { formatProQuoteForInbox, parseProQuoteRequest, QuoteValidationError } from "@/lib/pro-quote";

export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store" };
const MAX_BODY_BYTES = 12_000;

export async function POST(request: Request) {
  const limited = rateLimitResponse(
    request, "pro-quote", 3, 600,
    "Too many quotation requests. Please wait a few minutes before trying again.",
  );
  if (limited) return limited;
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json({ message: "JSON is required." }, { status: 415, headers: noStore });
  }
  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return NextResponse.json({ message: "Your enquiry is too large." }, { status: 413, headers: noStore });
  }

  let body: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return NextResponse.json({ message: "Your enquiry is too large." }, { status: 413, headers: noStore });
    }
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new QuoteValidationError("Invalid request");
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json({ message: "Please submit a valid quotation request." }, { status: 400, headers: noStore });
  }

  // A honeypot helps filter basic automated submissions without creating a record.
  if (body.website) return NextResponse.json({ ok: true }, { headers: noStore });

  try {
    const quote = parseProQuoteRequest(body);
    const inboxMessage = formatProQuoteForInbox(quote);
    await createCommerceQuestion(inboxMessage);
    return NextResponse.json({ ok: true }, { headers: noStore });
  } catch (error) {
    if (error instanceof QuoteValidationError) {
      return NextResponse.json({ message: error.message }, { status: 400, headers: noStore });
    }
    // Database connectivity or storage errors must not create false success notices.
    return NextResponse.json({
      message: "The quotation service is temporarily unavailable. Please contact hello@kalethon.com.",
    }, { status: 503, headers: noStore });
  }
}
