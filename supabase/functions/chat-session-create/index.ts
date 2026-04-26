/**
 * Backend LLD §10.1 — chat-session-create
 * Deploy: supabase functions deploy chat-session-create --no-verify-jwt
 */
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { handleOptions, jsonResponse } from "../_shared/http.ts";
import { serviceClient } from "../_shared/supabase.ts";

type SessionBody = {
  publicKey?: string;
  pageUrl?: string;
  referrer?: string;
};

Deno.serve(async (req: Request) => {
  const opt = handleOptions(req);
  if (opt) return opt;
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  let body: SessionBody;
  try {
    body = (await req.json()) as SessionBody;
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }

  const publicKey = typeof body.publicKey === "string" ? body.publicKey.trim() : "";
  if (!publicKey || publicKey.length > 256) {
    return jsonResponse({ error: "publicKey is required" }, 400);
  }

  const pageUrl = typeof body.pageUrl === "string" ? body.pageUrl.slice(0, 2048) : "";
  const referrer = typeof body.referrer === "string" ? body.referrer.slice(0, 2048) : "";

  try {
    const supabase = serviceClient();

    const { data: wc, error: wcErr } = await supabase
      .from("widget_configs")
      .select("id, project_id, welcome_message, enabled")
      .eq("public_key", publicKey)
      .eq("enabled", true)
      .maybeSingle();

    if (wcErr || !wc) {
      return jsonResponse({ error: "Unknown or disabled widget" }, 404);
    }

    const { data: project, error: pErr } = await supabase
      .from("projects")
      .select("id, name, workspace_id, status")
      .eq("id", wc.project_id)
      .single();

    if (pErr || !project) {
      return jsonResponse({ error: "Project not found" }, 404);
    }

    const allowDraft = Deno.env.get("WIDGET_ALLOW_DRAFT_PROJECT") === "true";
    if (!allowDraft && project.status !== "active") {
      return jsonResponse({ error: "Widget not available" }, 403);
    }

    const { data: contact, error: cErr } = await supabase
      .from("contacts")
      .insert({
        workspace_id: project.workspace_id,
        project_id: project.id,
        source_first: "website_widget",
        last_seen_at: new Date().toISOString(),
        first_seen_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (cErr || !contact) {
      console.error("[chat-session-create] contact insert", cErr);
      return jsonResponse({ error: "Could not start session" }, 500);
    }

    const { data: conv, error: convErr } = await supabase
      .from("conversations")
      .insert({
        workspace_id: project.workspace_id,
        project_id: project.id,
        contact_id: contact.id,
        channel: "website",
        status: "open",
        last_message_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (convErr || !conv) {
      console.error("[chat-session-create] conversation insert", convErr);
      return jsonResponse({ error: "Could not start session" }, 500);
    }

    if (pageUrl || referrer) {
      await supabase.from("messages").insert({
        conversation_id: conv.id,
        sender_type: "system",
        content: "Session started",
        metadata: { pageUrl: pageUrl || null, referrer: referrer || null, kind: "session_start" },
      });
    }

    return jsonResponse({
      conversationId: conv.id,
      project: {
        name: project.name,
        welcomeMessage: wc.welcome_message ?? `Hi — you're chatting about ${project.name}. How can we help?`,
      },
    });
  } catch (e) {
    console.error("[chat-session-create]", e);
    return jsonResponse({ error: "Server misconfigured or database unavailable" }, 500);
  }
});
