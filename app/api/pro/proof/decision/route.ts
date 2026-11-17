import { NextResponse } from "next/server";
import { recordCustomerProofDecision } from "@/db/proof-workflow";
import { parseProofDecision, ProofWorkflowError } from "@/lib/proof-workflow";
import { rateLimitResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
const noStore = { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" };

export async function POST(request: Request) {
  const limited = rateLimitResponse(request, "pro-proof-decision", 5, 900, "Too many review attempts. Please contact KALËTHON.");
  if (limited) return limited;
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json({ message: "JSON is required." }, { status: 415, headers: noStore });
  }
  try {
    const body = await request.text();
    if (body.length > 2_500) {
      return NextResponse.json({ message: "The review response is too long." }, { status: 413, headers: noStore });
    }
    const parsed: unknown = JSON.parse(body);
    const validated = parseProofDecision(parsed);
    const result = await recordCustomerProofDecision(validated);
    return NextResponse.json({ ok: true, ...result }, { headers: noStore });
  } catch (error) {
    if (error instanceof ProofWorkflowError) {
      return NextResponse.json({ message: error.message }, {
        status: error.code === "conflict" ? 409 : error.code === "unavailable" ? 503 : 400,
        headers: noStore,
      });
    }
    return NextResponse.json({ message: "The proof review service is unavailable. Please contact hello@kalethon.com." }, {
      status: 503, headers: noStore,
    });
  }
}
