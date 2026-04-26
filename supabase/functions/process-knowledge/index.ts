/**
 * Backend LLD §10.3 — process-knowledge
 * Supports text/plain and .docx (Office Open XML) via npm:mammoth. Other MIME types → failed until extended.
 * Chunks are embedded (OpenAI text-embedding-3-small, 1536d) so chat-message-send can run vector RAG.
 * Requires OPENAI_API_KEY on the function. Invoke with INTERNAL_CRON_SECRET header.
 */
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { handleOptions, jsonResponse } from "../_shared/http.ts";
import { requireInternalSecret } from "../_shared/auth.ts";
import { embedText, embeddingToVectorLiteral } from "../_shared/embeddings.ts";
import { serviceClient } from "../_shared/supabase.ts";

const CHUNK = 1400;

function chunkText(text: string): string[] {
  const t = text.replace(/\r\n/g, "\n").trim();
  if (!t) return [];
  const out: string[] = [];
  for (let i = 0; i < t.length; i += CHUNK) {
    out.push(t.slice(i, i + CHUNK));
  }
  return out;
}

Deno.serve(async (req: Request) => {
  const opt = handleOptions(req);
  if (opt) return opt;
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  if (!requireInternalSecret(req)) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  let body: { knowledgeFileId?: string };
  try {
    body = (await req.json()) as { knowledgeFileId?: string };
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }

  const id = typeof body.knowledgeFileId === "string" ? body.knowledgeFileId.trim() : "";
  if (!id) return jsonResponse({ error: "knowledgeFileId required" }, 400);

  try {
    const supabase = serviceClient();

    const { data: row, error: fErr } = await supabase.from("knowledge_files").select("*").eq("id", id).single();
    if (fErr || !row) return jsonResponse({ error: "knowledge file not found" }, 404);

    await supabase.from("knowledge_files").update({ status: "processing" }).eq("id", id);

    const mime = String(row.mime_type ?? "").toLowerCase();
    const fileName = String(row.file_name ?? "").toLowerCase();
    const isPlain = mime.includes("text/plain");
    const isDocx =
      mime.includes("wordprocessingml") || mime.includes("application/vnd.openxmlformats") || fileName.endsWith(".docx");

    if (!isPlain && !isDocx) {
      await supabase.from("knowledge_files").update({ status: "failed" }).eq("id", id);
      return jsonResponse({
        ok: false,
        status: "failed",
        reason: "unsupported_mime",
        mime_type: row.mime_type,
        hint: "Supported: text/plain and Word .docx. Add PDF or other parsers as needed.",
      });
    }

    const path = row.storage_path as string;
    const { data: blob, error: dlErr } = await supabase.storage.from("project-documents").download(path);
    if (dlErr || !blob) {
      console.error("[process-knowledge] download", dlErr);
      await supabase.from("knowledge_files").update({ status: "failed" }).eq("id", id);
      return jsonResponse({ error: "storage download failed" }, 500);
    }

    let text: string;
    if (isPlain) {
      text = await blob.text();
    } else {
      const ab = await blob.arrayBuffer();
      const mammoth = (await import("npm:mammoth@1.8.0")).default;
      const { value } = await mammoth.extractRawText({ arrayBuffer: ab });
      text = typeof value === "string" ? value : "";
    }
    const parts = chunkText(text);

    const openaiKey = Deno.env.get("OPENAI_API_KEY")?.trim();
    if (!openaiKey) {
      await supabase.from("knowledge_files").update({ status: "failed" }).eq("id", id);
      return jsonResponse(
        {
          ok: false,
          status: "failed",
          reason: "missing_openai_key",
          hint: "Set OPENAI_API_KEY on this Edge function to embed chunks for RAG.",
        },
        500,
      );
    }

    await supabase.from("knowledge_chunks").delete().eq("knowledge_file_id", id);

    for (const chunk_text of parts) {
      let embeddingLiteral: string;
      try {
        const emb = await embedText(chunk_text, openaiKey);
        embeddingLiteral = embeddingToVectorLiteral(emb);
      } catch (e) {
        console.error("[process-knowledge] embed", e);
        await supabase.from("knowledge_files").update({ status: "failed" }).eq("id", id);
        return jsonResponse({ error: "embedding failed", detail: String(e) }, 500);
      }

      const { error: insErr } = await supabase.from("knowledge_chunks").insert({
        project_id: row.project_id,
        knowledge_file_id: id,
        chunk_text,
        embedding: embeddingLiteral,
        metadata: { processor: "process-knowledge-v2-embed" },
      });
      if (insErr) {
        console.error("[process-knowledge] chunk insert", insErr);
        await supabase.from("knowledge_files").update({ status: "failed" }).eq("id", id);
        return jsonResponse({ error: "chunk insert failed" }, 500);
      }
    }

    await supabase.from("knowledge_files").update({ status: "ready" }).eq("id", id);
    return jsonResponse({ ok: true, knowledgeFileId: id, chunks: parts.length });
  } catch (e) {
    console.error("[process-knowledge]", e);
    return jsonResponse({ error: "internal error" }, 500);
  }
});
