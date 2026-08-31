import { NextResponse } from "next/server";
import { rateLimitResponse } from "@/lib/rate-limit";

const PRODUCT_IDS = new Set(["court-polo", "custom-polo", "form-tee", "performance-tank", "poise-hoodie", "club-zip-hoodie", "track-jacket", "motion-jogger", "club-tracksuit", "court-short", "court-skirt"]);
const DATA_URI = /^data:image\/(jpeg|png|webp);base64,[a-z0-9+/=\r\n]+$/i;
const MAX_BODY_BYTES = 8 * 1024 * 1024;

function safeMessage(status: number) {
  if (status === 401) return "The virtual studio is not authorised yet.";
  if (status === 429) return "The virtual studio is busy or has reached its usage limit. Please try again shortly.";
  return "The virtual studio could not start. Please try again.";
}

export async function POST(request: Request) {
  const limited = rateLimitResponse(request, "try-on", 6, 60, "The virtual studio is busy with your recent requests. Please wait a moment and try again.");
  if (limited) return limited;

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ message: "The selected image is too large." }, { status: 413 });
  }

  const apiKey = process.env.FASHN_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { code: "not_configured", message: "Virtual try-on is awaiting its secure API connection." },
      { status: 503 },
    );
  }

  try {
    const body = await request.json();
    const { productId, modelImage, productImage } = body ?? {};

    if (
      !PRODUCT_IDS.has(productId) ||
      typeof modelImage !== "string" ||
      typeof productImage !== "string" ||
      modelImage.length > 6_500_000 ||
      productImage.length > 1_500_000 ||
      !DATA_URI.test(modelImage) ||
      !DATA_URI.test(productImage)
    ) {
      return NextResponse.json({ message: "The try-on request was not valid." }, { status: 400 });
    }

    const response = await fetch("https://api.fashn.ai/v1/run", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model_name: "tryon-max",
        inputs: {
          product_image: productImage,
          model_image: modelImage,
          resolution: "1k",
          generation_mode: "fast",
          num_images: 1,
          output_format: "jpeg",
          return_base64: true,
        },
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || typeof data.id !== "string") {
      return NextResponse.json({ message: safeMessage(response.status) }, { status: response.status || 502 });
    }

    return NextResponse.json({ id: data.id });
  } catch {
    return NextResponse.json({ message: "The virtual studio could not read this request." }, { status: 400 });
  }
}
