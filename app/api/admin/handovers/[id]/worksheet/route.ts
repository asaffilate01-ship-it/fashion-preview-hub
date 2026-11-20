import { NextResponse } from "next/server";
import { getAdminIdentity } from "@/lib/admin-auth";
import { getTradeHandoverForWorksheet } from "@/db/trade-handover";
import {
  InvoicePreparationError, parseVerifiedSeller, prepareInternalInvoiceWorksheet,
} from "@/lib/invoice-preparation";

export const dynamic = "force-dynamic";
const privateHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminIdentity();
  if (!admin) {
    return NextResponse.json({ message: "Administrator access is required." }, {
      status: 401, headers: privateHeaders,
    });
  }
  const { id } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return NextResponse.json({ message: "Invalid handover reference." }, {
      status: 404, headers: privateHeaders,
    });
  }
  try {
    const handover = await getTradeHandoverForWorksheet(id);
    if (!handover) {
      return NextResponse.json({ message: "Handover not found." }, {
        status: 404, headers: privateHeaders,
      });
    }
    const seller = parseVerifiedSeller(process.env, handover.snapshot.taxPence);
    const worksheet = prepareInternalInvoiceWorksheet(
      handover, seller, new Date().toISOString().slice(0, 10),
    );
    return NextResponse.json({ worksheet }, { headers: privateHeaders });
  } catch (error) {
    if (error instanceof InvoicePreparationError) {
      return NextResponse.json({ message: error.message }, {
        status: error.code === "unavailable" ? 503 : 409, headers: privateHeaders,
      });
    }
    return NextResponse.json({
      message: "The worksheet cannot be prepared. Check the business configuration and database.",
    }, { status: 503, headers: privateHeaders });
  }
}
