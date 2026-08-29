// Minimal ambient declarations for the Cloudflare Workers runtime bindings
// used by this project. Kept local so the app's DOM `fetch`/`Response` types
// are not replaced by the full workers-types global overrides.

interface Fetcher {
  fetch(input: Request | string, init?: RequestInit): Promise<Response>;
}

interface D1Database {
  prepare(query: string): unknown;
  batch(statements: unknown[]): Promise<unknown>;
  exec(query: string): Promise<unknown>;
  dump(): Promise<ArrayBuffer>;
}

declare module "cloudflare:workers" {
  export const env: Record<string, unknown> & { DB?: D1Database };
}
