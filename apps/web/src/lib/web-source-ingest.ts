import { and, eq, sql } from "drizzle-orm";
import type { getDb } from "@/lib/db/client";
import { clientWebSources, documentChunks } from "@/lib/db/schema";
import { insertDocumentChunk } from "@/lib/db/document-chunks";
import { embedText } from "@/lib/embeddings";
import { chunkText } from "@/lib/text-chunk";
import { assertFetchableHttpUrl, fetchUrlAsPlainText } from "@/lib/web-fetch";
import { logStructured } from "@/lib/structured-log";
import { isMockData } from "@/lib/mock/mode";

type Db = ReturnType<typeof getDb>;

export async function deleteChunksForWebSource(db: Db, clientId: string, webSourceId: string): Promise<void> {
  await db.delete(documentChunks).where(
    and(
      eq(documentChunks.clientId, clientId),
      sql`(${documentChunks.metadata}->>'kind') = 'web_source'`,
      sql`(${documentChunks.metadata}->>'webSourceId') = ${webSourceId}`
    )
  );
}

/**
 * Fetches URL text, replaces prior chunks for this source, embeds new chunks into RAG.
 */
export async function ingestWebSourceNow(
  db: Db,
  params: { clientId: string; webSourceId: string; url: string }
): Promise<{ chunkCount: number }> {
  if (isMockData()) {
    return { chunkCount: 0 };
  }
  const u = assertFetchableHttpUrl(params.url);
  const plain = await fetchUrlAsPlainText(u);
  if (!plain.trim()) {
    throw new Error("No extractable text from URL");
  }

  await deleteChunksForWebSource(db, params.clientId, params.webSourceId);

  const chunks = chunkText(plain);
  let n = 0;
  for (const chunk of chunks) {
    const embedding = await embedText(chunk);
    await insertDocumentChunk({
      clientId: params.clientId,
      chunk,
      embedding,
      metadata: {
        kind: "web_source",
        webSourceId: params.webSourceId,
        sourceUrl: u.toString(),
        fetchedAt: new Date().toISOString(),
      },
    });
    n += 1;
  }

  await db
    .update(clientWebSources)
    .set({ updatedAt: new Date() })
    .where(eq(clientWebSources.id, params.webSourceId));

  return { chunkCount: n };
}

/** Re-fetch all enabled web sources that opt into refresh when a new conversation thread starts. */
export async function refreshWebSourcesOnNewConversation(db: Db, clientId: string): Promise<void> {
  if (isMockData() || process.env.WEB_FETCH_ENABLED === "false") {
    return;
  }
  const rows = await db
    .select()
    .from(clientWebSources)
    .where(
      and(
        eq(clientWebSources.clientId, clientId),
        eq(clientWebSources.enabled, true),
        eq(clientWebSources.refreshOnNewConversation, true)
      )
    );

  for (const row of rows) {
    try {
      await ingestWebSourceNow(db, {
        clientId,
        webSourceId: row.id,
        url: row.url,
      });
    } catch (e) {
      logStructured("web_source_refresh_failed", {
        clientId,
        webSourceId: row.id,
        url: row.url.slice(0, 200),
        message: e instanceof Error ? e.message.slice(0, 500) : String(e),
      });
    }
  }
}
