/**
 * Placeholder only — do NOT register this URL in Meta for WhatsApp Cloud API.
 *
 * Production webhooks are handled by the Next.js route:
 * `apps/web/src/app/api/webhooks/whatsapp/route.ts` (verify token + optional `X-Hub-Signature-256` via `WHATSAPP_APP_SECRET`, RAG, outbound Graph send).
 *
 * This Edge function exists for historical LLD references. POST returns 410 so misconfigured deploys fail loudly.
 */
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { handleOptions, jsonResponse } from "../_shared/http.ts";

Deno.serve(async (req: Request) => {
  const opt = handleOptions(req);
  if (opt) return opt;

  const url = new URL(req.url);

  if (req.method === "GET") {
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");
    const expected = Deno.env.get("WHATSAPP_WEBHOOK_VERIFY_TOKEN");
    if (mode === "subscribe" && expected && token === expected && challenge) {
      return new Response(challenge, { status: 200, headers: { "Content-Type": "text/plain" } });
    }
    return new Response("Forbidden", { status: 403 });
  }

  if (req.method === "POST") {
    return jsonResponse(
      {
        deprecated: true,
        processed: false,
        message:
          "This Supabase function is not the WhatsApp webhook. Configure Meta to POST to your Next.js app at /api/webhooks/whatsapp instead.",
      },
      410
    );
  }

  return jsonResponse({ error: "Method not allowed" }, 405);
});
