import { createFileRoute } from "@tanstack/react-router";

const PREDICTION_ID = /^[a-z0-9-]{20,100}$/i;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export const Route = createFileRoute("/api/try-on/status")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const apiKey = process.env["FASHN_API_KEY"];
        if (!apiKey) {
          return json(
            { code: "not_configured", message: "Virtual try-on is awaiting its secure API connection." },
            503,
          );
        }

        const id = new URL(request.url).searchParams.get("id") || "";
        if (!PREDICTION_ID.test(id)) {
          return json({ message: "The preview reference was not valid." }, 400);
        }

        try {
          const response = await fetch(`https://api.fashn.ai/v1/status/${encodeURIComponent(id)}`, {
            headers: { Authorization: `Bearer ${apiKey}` },
          });
          const data = (await response.json().catch(() => ({}))) as {
            status?: string;
            output?: unknown;
            error?: { message?: string };
          };

          if (!response.ok) {
            return json({ message: "The virtual studio could not refresh this preview." }, response.status);
          }

          const output = Array.isArray(data.output)
            ? data.output
                .filter(
                  (item: unknown) =>
                    typeof item === "string" &&
                    (/^data:image\/jpeg;base64,/i.test(item) || /^https:\/\//i.test(item)),
                )
                .slice(0, 1)
            : [];

          return json({
            id,
            status: typeof data.status === "string" ? data.status : "processing",
            output,
            message: typeof data.error?.message === "string" ? data.error.message : undefined,
          });
        } catch {
          return json({ message: "The virtual studio could not be reached." }, 502);
        }
      },
    },
  },
});
