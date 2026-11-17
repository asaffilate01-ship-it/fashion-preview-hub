import { NextResponse } from "next/server";
import { getAdminIdentity } from "@/lib/admin-auth";
import { createProProof, issueProProof, listProProofs } from "@/db/proof-workflow";
import { ProofWorkflowError } from "@/lib/proof-workflow";

export const dynamic = "force-dynamic";
const noStore = { "Cache-Control": "no-store" };

export async function GET() {
  const admin = await getAdminIdentity();
  if (!admin) return NextResponse.json({ message: "Administrator access is required." }, { status: 401, headers: noStore });
  try {
    return NextResponse.json(await listProProofs(), { headers: noStore });
  } catch {
    return NextResponse.json({ message: "The proof workspace is unavailable." }, { status: 503, headers: noStore });
  }
}

export async function POST(request: Request) {
  const admin = await getAdminIdentity();
  if (!admin) return NextResponse.json({ message: "Administrator access is required." }, { status: 401, headers: noStore });
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json({ message: "JSON is required." }, { status: 415, headers: noStore });
  }
  try {
    const raw = await request.text();
    if (raw.length > 8_000) return NextResponse.json({ message: "Proof request is too large." }, { status: 413, headers: noStore });
    const body = JSON.parse(raw) as Record<string, unknown>;
    if (body.action === "create") {
      const created = await createProProof(body, admin.email);
      return NextResponse.json({ ok: true, ...created }, { headers: noStore });
    }
    if (body.action === "issue") {
      const issued = await issueProProof(String(body.proofId ?? ""), admin.email);
      return NextResponse.json({ ok: true, ...issued }, { headers: noStore });
    }
    return NextResponse.json({ message: "Unknown proof action." }, { status: 400, headers: noStore });
  } catch (error) {
    if (error instanceof ProofWorkflowError) {
      return NextResponse.json({ message: error.message }, {
        status: error.code === "conflict" ? 409 : error.code === "not_found" ? 404 : error.code === "unavailable" ? 503 : 400,
        headers: noStore,
      });
    }
    return NextResponse.json({ message: "Proof details could not be saved." }, { status: 503, headers: noStore });
  }
}
