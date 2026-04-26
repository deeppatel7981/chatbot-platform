/**
 * Backend LLD §10.2 — chat-message-send
 * RAG: prefers pgvector match on knowledge_chunks.embedding (same model/dims as process-knowledge).
 * Falls back to the latest 8 chunks (no embedding) when no matches or OPENAI_API_KEY is unset.
 * Deploy: supabase functions deploy chat-message-send --no-verify-jwt
 */
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { embedText, embeddingToVectorLiteral } from "../_shared/embeddings.ts";
import { handleOptions, jsonResponse } from "../_shared/http.ts";
import { leadScore, openaiReply, pickLocalReply, type FaqRow } from "../_shared/reply.ts";
import { serviceClient } from "../_shared/supabase.ts";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Visitor = { name?: string | null; phone?: string | null };

type MessageBody = {
  conversationId?: string;
  message?: string;
  visitor?: Visitor;
};

Deno.serve(async (req: Request) => {
  const opt = handleOptions(req);
  if (opt) return opt;
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  let body: MessageBody;
  try {
    body = (await req.json()) as MessageBody;
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }

  const conversationId = typeof body.conversationId === "string" ? body.conversationId.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!conversationId || !UUID_RE.test(conversationId)) {
    return jsonResponse({ error: "conversationId must be a UUID" }, 400);
  }
  if (!message || message.length > 12_000) {
    return jsonResponse({ error: "message is required (max 12000 chars)" }, 400);
  }

  const visitor = body.visitor ?? {};

  try {
    const supabase = serviceClient();

    const { data: conv, error: convErr } = await supabase
      .from("conversations")
      .select("id, workspace_id, project_id, contact_id, status")
      .eq("id", conversationId)
      .single();

    if (convErr || !conv) {
      return jsonResponse({ error: "Conversation not found" }, 404);
    }

    if (conv.status !== "open") {
      return jsonResponse(
        { error: "Conversation is closed or handed off", status: conv.status },
        409,
      );
    }

    if (conv.contact_id && (visitor.name || visitor.phone)) {
      const patch: Record<string, string> = {};
      if (typeof visitor.name === "string" && visitor.name.trim()) patch.name = visitor.name.trim().slice(0, 200);
      if (typeof visitor.phone === "string" && visitor.phone.trim()) patch.phone = visitor.phone.trim().slice(0, 64);
      if (Object.keys(patch).length) {
        patch.last_seen_at = new Date().toISOString();
        await supabase.from("contacts").update(patch).eq("id", conv.contact_id);
      }
    }

    const { error: vErr } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_type: "visitor",
      content: message,
      metadata: {},
    });
    if (vErr) {
      console.error("[chat-message-send] visitor message", vErr);
      return jsonResponse({ error: "Could not store message" }, 500);
    }

    const { data: wc } = await supabase
      .from("widget_configs")
      .select("welcome_message")
      .eq("project_id", conv.project_id)
      .maybeSingle();

    const { data: project } = await supabase
      .from("projects")
      .select("name")
      .eq("id", conv.project_id)
      .single();

    const projectName = project?.name ?? "this project";
    const welcomeMessage = wc?.welcome_message ?? null;

    const { data: faqRows } = await supabase
      .from("faq_items")
      .select("question, answer")
      .eq("project_id", conv.project_id)
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .limit(40);

    const faqs: FaqRow[] = (faqRows ?? []).map((r) => ({
      question: r.question as string,
      answer: r.answer as string,
    }));

    let { reply, intent, handoff } = pickLocalReply(message, faqs, welcomeMessage, projectName);

    const openaiKey = Deno.env.get("OPENAI_API_KEY")?.trim();
    if (!handoff && intent === null && openaiKey) {
      let rag = "";

      try {
        const queryEmb = await embedText(message, openaiKey);
        const vecLiteral = embeddingToVectorLiteral(queryEmb);
        const { data: matched, error: rpcErr } = await supabase.rpc("match_knowledge_chunks", {
          p_project_id: conv.project_id,
          p_query_embedding: vecLiteral,
          match_threshold: 0.2,
          match_count: 5,
        });
        if (rpcErr) {
          console.warn("[chat-message-send] match_knowledge_chunks rpc", rpcErr);
        } else if (matched?.length) {
          rag = (matched as { chunk_text: string }[])
            .map((r) => r.chunk_text)
            .join("\n---\n")
            .slice(0, 6000);
        }
      } catch (e) {
        console.warn("[chat-message-send] vector rag", e);
      }

      if (!rag) {
        const { data: kchunks } = await supabase
          .from("knowledge_chunks")
          .select("chunk_text")
          .eq("project_id", conv.project_id)
          .order("created_at", { ascending: false })
          .limit(8);
        rag =
          (kchunks ?? [])
            .map((r) => (r as { chunk_text: string }).chunk_text)
            .join("\n---\n")
            .slice(0, 6000) ?? "";
      }

      const faqSnippet =
        faqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n") +
        (rag ? `\n\n---\nKnowledge excerpts:\n${rag}` : "");
      const ai = await openaiReply(message, projectName, faqSnippet);
      if (ai) {
        reply = ai;
        if (!intent) intent = "llm_assist";
      }
    }

    const score = leadScore(intent, message);

    const { error: bErr } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_type: "bot",
      content: reply,
      metadata: { intent, leadScore: score },
    });
    if (bErr) {
      console.error("[chat-message-send] bot message", bErr);
    }

    const convPatch: Record<string, unknown> = {
      last_message_at: new Date().toISOString(),
      intent,
      intent_confidence: intent ? 0.65 : null,
      lead_score: score,
    };
    if (handoff) convPatch.status = "human_handoff";

    await supabase.from("conversations").update(convPatch).eq("id", conversationId);

    if (conv.contact_id && (intent === "brochure_request" || intent === "pricing" || intent === "site_visit")) {
      const { data: existing } = await supabase
        .from("leads")
        .select("id")
        .eq("conversation_id", conversationId)
        .maybeSingle();
      if (!existing) {
        await supabase.from("leads").insert({
          workspace_id: conv.workspace_id,
          project_id: conv.project_id,
          contact_id: conv.contact_id,
          conversation_id: conversationId,
          stage: "new",
          intent,
          summary: message.slice(0, 500),
        });
      }
    }

    return jsonResponse({
      reply,
      intent: intent ?? "general",
      leadScore: score,
      handoff,
    });
  } catch (e) {
    console.error("[chat-message-send]", e);
    return jsonResponse({ error: "Server misconfigured or database unavailable" }, 500);
  }
});
