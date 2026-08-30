import { NextResponse } from "next/server";
import { createCommerceQuestion } from "@/db/commerce";

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) return NextResponse.json({ message: "JSON is required." }, { status: 415 });
  try {
    const body = await request.json() as Record<string, unknown>;
    if (body.website) return NextResponse.json({ ok: true });
    await createCommerceQuestion({
      customerName: String(body.customerName ?? ""),
      customerEmail: String(body.customerEmail ?? ""),
      orderNumber: String(body.orderNumber ?? ""),
      subject: String(body.subject ?? ""),
      message: String(body.message ?? ""),
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Your question could not be sent." }, { status: 400 });
  }
}
