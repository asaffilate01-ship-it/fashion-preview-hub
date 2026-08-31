import { NextResponse } from "next/server";
import { getPublishedCatalogue } from "@/db/commerce";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ products: await getPublishedCatalogue() }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
  } catch (error) {
    const reason = error instanceof Error && error.message === "COMMERCE_DB_BINDING_MISSING"
      ? "The database binding is not attached to this deployment."
      : error instanceof Error ? error.message : "Unknown database error.";
    return NextResponse.json({ products: [], databaseReady: false, reason }, { status: 503 });
  }
}
