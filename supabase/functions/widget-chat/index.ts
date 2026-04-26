/**
 * Deprecated single-endpoint widget stub. LLD v1 uses `chat-session-create` + `chat-message-send`, or the Next.js route
 * `apps/web/src/app/api/public/widget/[publicId]/chat/route.ts`.
 *
 * POST returns 410 so misconfigured proxies fail loudly (same pattern as `whatsapp-webhook`).
 */
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { handleOptions, jsonResponse } from "../_shared/http.ts";

Deno.serve(async (req: Request) => {
  const opt = handleOptions(req);
  if (opt) return opt;

  if (req.method === "POST") {
    return jsonResponse(
      {
        deprecated: true,
        processed: false,
        message:
          "This Edge function is not the widget chat API. Use Next.js /api/public/widget/{publicId}/chat, or Supabase chat-session-create + chat-message-send.",
      },
      410
    );
  }

  return jsonResponse({ error: "Method not allowed" }, 405);
});
