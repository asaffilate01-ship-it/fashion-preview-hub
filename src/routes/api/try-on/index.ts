import { createFileRoute } from "@tanstack/react-router";

const PRODUCT_IDS = new Set(["court-polo", "form-tee", "poise-hoodie", "track-jacket", "motion-jogger"]);
const DATA_URI = /^data:image\/(jpeg|png|webp);base64,[a-z0-9+/=\r\n]+$/i;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function safeMessage(status: number) {
  if (status === 401) return "The virtual studio is not authorised yet.";
  if (status === 429) return "The virtual studio is busy or has reached its usage limit. Please try again shortly.";
  return "The virtual studio could not start. Please try again.";
}

export const Route = createFileRoute("/api/try-on/")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["FASHN_API_KEY"];
        if (!apiKey) {
          return json(
            { code: "not_configured", message: "Virtual try-on is awaiting its secure API connection." },
            503,
          );
        }

        try {
          const body = (await request.json()) as {
            productId?: string;
            modelImage?: string;
            productImage?: string;
          };
          const { productId, modelImage, productImage } = body ?? {};

          if (
            !productId ||
            !PRODUCT_IDS.has(productId) ||
            typeof modelImage !== "string" ||
            typeof productImage !== "string" ||
            modelImage.length > 6_500_000 ||
            productImage.length > 1_500_000 ||
            !DATA_URI.test(modelImage) ||
            !DATA_URI.test(productImage)
          ) {
            return json({ message: "The try-on request was not valid." }, 400);
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

          const data = (await response.json().catch(() => ({}))) as { id?: string };
          if (!response.ok || typeof data.id !== "string") {
            return json({ message: safeMessage(response.status) }, response.status || 502);
          }

          return json({ id: data.id });
        } catch {
          return json({ message: "The virtual studio could not read this request." }, 400);
        }
      },
    },
  },
});
