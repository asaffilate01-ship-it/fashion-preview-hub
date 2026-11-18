import { NextResponse } from "next/server";
import { getAdminIdentity } from "@/lib/admin-auth";
import { createProductionPlan, listProductionPlans, updateProductionPlan } from "@/db/production-planning";
import { ProductionPlanError } from "@/lib/production-planning";

export const dynamic = "force-dynamic";
const noStore = { "Cache-Control": "no-store" };

export async function GET() {
  if (!(await getAdminIdentity())) {
    return NextResponse.json({ message: "Administrator access is required." }, { status: 401, headers: noStore });
  }
  try {
    return NextResponse.json(await listProductionPlans(), { headers: noStore });
  } catch {
    return NextResponse.json({ message: "Production planning is temporarily unavailable." }, { status: 503, headers: noStore });
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
  if (Number(request.headers.get("content-length") || 0) > 4_000) {
    return NextResponse.json({ message: "Production request is too large." }, { status: 413, headers: noStore });
  }
  try {
    const text = await request.text();
    if (text.length > 4_000) return NextResponse.json({ message: "Production request is too large." }, { status: 413, headers: noStore });
    const body = JSON.parse(text) as Record<string, unknown>;
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ message: "Invalid production request." }, { status: 400, headers: noStore });
    }
    if (body.action === "create") {
      const result = await createProductionPlan(body, admin.email);
      return NextResponse.json({ ok: true, ...result }, { headers: noStore });
    }
    if (body.action === "update") {
      const result = await updateProductionPlan(body, admin.email);
      return NextResponse.json({ ok: true, ...result }, { headers: noStore });
    }
    return NextResponse.json({ message: "Unknown production action." }, { status: 400, headers: noStore });
  } catch (error) {
    if (error instanceof ProductionPlanError) {
      const status = error.code === "not_found" ? 404 : error.code === "conflict" ? 409 : error.code === "unavailable" ? 503 : 400;
      return NextResponse.json({ message: error.message }, { status, headers: noStore });
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: "Invalid JSON." }, { status: 400, headers: noStore });
    }
    return NextResponse.json({ message: "Production changes could not be saved." }, { status: 503, headers: noStore });
  }
}
