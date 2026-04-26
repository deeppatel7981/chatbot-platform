import "jsr:@supabase/functions-js/edge-runtime.d.ts";

/** Shared secret for cron / internal triggers (Vercel cron, app server). */
export function requireInternalSecret(req: Request): boolean {
  const secret = Deno.env.get("INTERNAL_CRON_SECRET") ?? Deno.env.get("EDGE_INTERNAL_SECRET");
  if (!secret) {
    console.warn("[auth] INTERNAL_CRON_SECRET not set — allowing request (dev only)");
    return true;
  }
  const header = req.headers.get("x-cron-secret") ?? req.headers.get("x-internal-secret");
  const auth = req.headers.get("authorization");
  const bearer = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  return header === secret || bearer === secret;
}
