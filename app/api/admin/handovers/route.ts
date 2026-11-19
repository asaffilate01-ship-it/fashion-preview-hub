import { NextResponse } from "next/server";
import { getAdminIdentity } from "@/lib/admin-auth";
import { createTradeHandover, listTradeHandovers, updateTradeHandover } from "@/db/trade-handover";
import { HandoverError } from "@/lib/trade-handover";

export const dynamic = "force-dynamic";
const noStore = { "Cache-Control": "no-store" };
const MAX_PAYLOAD = 5_000;

export async function GET() {
  if (!(await getAdminIdentity())) {
    return NextResponse.json({ message: "Administrator access is required." }, { status: 401, headers: noStore });
  }
  try {
    return NextResponse.json(await listTradeHandovers(), { headers: noStore });
  } catch {
    return NextResponse.json({ message: "Order intake data is unavailable." }, { status: 503, headers: noStore });
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
  if (Number(request.headers.get("content-length") || 0) > MAX_PAYLOAD) {
    return NextResponse.json({ message: "Order-intake request is too large." }, { status: 413, headers: noStore });
  }
  try {
    const text = await request.text();
    if (text.length > MAX_PAYLOAD) {
      return NextResponse.json({ message: "Order-intake request is too large." }, { status: 413, headers: noStore });
    }
    const body: unknown = JSON.parse(text);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ message: "Invalid handover request." }, { status: 400, headers: noStore });
    }
    const input = body as Record<string, unknown>;
    if (input.action === "create") {
      return NextResponse.json({ ok: true, ...await createTradeHandover(input, admin.email) }, { headers: noStore });
    }
    if (input.action === "update") {
      return NextResponse.json({ ok: true, ...await updateTradeHandover(input, admin.email) }, { headers: noStore });
    }
    return NextResponse.json({ message: "Unknown handover action." }, { status: 400, headers: noStore });
  } catch (error) {
    if (error instanceof HandoverError) {
      const status = error.code === "conflict" ? 409 : error.code === "not_found" ? 404 :
        error.code === "unavailable" ? 503 : 400;
      return NextResponse.json({ message: error.message }, { status, headers: noStore });
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: "Invalid JSON." }, { status: 400, headers: noStore });
    }
    return NextResponse.json({ message: "This handover could not be saved." }, { status: 503, headers: noStore });
  }
}
