import { NextResponse } from "next/server";
import { getAdminIdentity } from "@/lib/admin-auth";
import { adjustCommerceInventory, archiveCommerceProduct, getCommerceOverview, saveCommerceProduct, updateCommerceOrder, updateCommerceQuestion } from "@/db/commerce";
import type { CommerceProduct } from "@/lib/commerce-types";

export const dynamic = "force-dynamic";

async function authorised() {
  return Boolean(await getAdminIdentity());
}

export async function GET() {
  if (!(await authorised())) return NextResponse.json({ message: "Administrator access is required." }, { status: 401 });
  try {
    return NextResponse.json(await getCommerceOverview());
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Commerce data is unavailable." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (!(await authorised())) return NextResponse.json({ message: "Administrator access is required." }, { status: 401 });
  if (!request.headers.get("content-type")?.includes("application/json")) return NextResponse.json({ message: "JSON is required." }, { status: 415 });
  try {
    const body = await request.json() as Record<string, unknown>;
    const action = String(body.action ?? "");
    if (action === "save_product") await saveCommerceProduct((body.product ?? {}) as Partial<CommerceProduct>);
    else if (action === "archive_product") await archiveCommerceProduct(String(body.id ?? ""));
    else if (action === "adjust_stock") await adjustCommerceInventory(String(body.id ?? ""), Number(body.quantity), String(body.note ?? "Manual adjustment"));
    else if (action === "update_order") await updateCommerceOrder(String(body.id ?? ""), String(body.status ?? ""), String(body.fulfilmentStatus ?? ""));
    else if (action === "update_question") await updateCommerceQuestion(String(body.id ?? ""), String(body.status ?? ""), String(body.priority ?? ""));
    else return NextResponse.json({ message: "Unknown commerce action." }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "The change could not be saved." }, { status: 400 });
  }
}
