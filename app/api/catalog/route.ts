import { NextResponse } from "next/server";
import { getPublishedCatalogue } from "@/db/commerce";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ products: await getPublishedCatalogue() }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
  } catch {
    return NextResponse.json({ products: [], databaseReady: false }, { status: 503 });
  }
}
