// Lightweight fixed-window rate limiter for public API routes.
// State is held per Worker isolate: it is not a global counter, but it stops
// single-client abuse and burst loops without an extra binding.

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const MAX_TRACKED_KEYS = 5000;

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export function clientKey(request: Request, scope: string) {
  const headers = request.headers;
  const address =
    headers.get("cf-connecting-ip") ||
    headers.get("x-real-ip") ||
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  return `${scope}:${address}`;
}

export function checkRateLimit(key: string, limit: number, windowSeconds: number): RateLimitResult {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  if (buckets.size > MAX_TRACKED_KEYS) {
    for (const [existingKey, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(existingKey);
    }
    if (buckets.size > MAX_TRACKED_KEYS) buckets.clear();
  }

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: windowSeconds };
  }

  existing.count += 1;
  const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
  if (existing.count > limit) {
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }
  return { allowed: true, remaining: Math.max(0, limit - existing.count), retryAfterSeconds };
}

/** Returns a 429 Response when the caller is over budget, otherwise null. */
export function rateLimitResponse(
  request: Request,
  scope: string,
  limit: number,
  windowSeconds: number,
  message = "Too many requests. Please wait a moment and try again.",
): Response | null {
  const result = checkRateLimit(clientKey(request, scope), limit, windowSeconds);
  if (result.allowed) return null;
  return new Response(JSON.stringify({ code: "rate_limited", message }), {
    status: 429,
    headers: {
      "Content-Type": "application/json",
      "Retry-After": String(result.retryAfterSeconds),
      "Cache-Control": "no-store",
    },
  });
}
