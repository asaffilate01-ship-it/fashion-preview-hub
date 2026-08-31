import { NextResponse } from "next/server";
import { rateLimitResponse } from "@/lib/rate-limit";

const PREDICTION_ID = /^[a-z0-9-]{20,100}$/i;

export async function GET(request: Request) {
  const limited = rateLimitResponse(request, "try-on-status", 120, 60, "Too many status checks. Please wait a moment.");
  if (limited) return limited;

  const apiKey = process.env.FASHN_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { code: "not_configured", message: "Virtual try-on is awaiting its secure API connection." },
      { status: 503 },
    );
  }

  const id = new URL(request.url).searchParams.get("id") || "";
  if (!PREDICTION_ID.test(id)) {
    return NextResponse.json({ message: "The preview reference was not valid." }, { status: 400 });
  }

  try {
    const response = await fetch(`https://api.fashn.ai/v1/status/${encodeURIComponent(id)}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return NextResponse.json({ message: "The virtual studio could not refresh this preview." }, { status: response.status });
    }

    const output = Array.isArray(data.output)
      ? data.output.filter((item: unknown) => typeof item === "string" && (/^data:image\/jpeg;base64,/i.test(item) || /^https:\/\//i.test(item))).slice(0, 1)
      : [];
    const errorMessage = typeof data.error?.message === "string" ? data.error.message : undefined;

    return NextResponse.json({
      id,
      status: typeof data.status === "string" ? data.status : "processing",
      output,
      message: errorMessage,
    });
  } catch {
    return NextResponse.json({ message: "The virtual studio could not be reached." }, { status: 502 });
  }
}
