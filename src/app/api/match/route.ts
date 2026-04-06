import { embedText } from "@/lib/embeddings";
import { matchDocuments } from "@/lib/db/match-documents";
import { isMockData } from "@/lib/mock/mode";
import { mockMatchChunks } from "@/lib/mock/fixtures";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { query, clientId } = await req.json();

  if (!query || !clientId) {
    return new Response(JSON.stringify({ error: "Missing query or clientId" }), { status: 400 });
  }

  if (isMockData()) {
    return new Response(JSON.stringify({ chunks: mockMatchChunks }), { status: 200 });
  }

  try {
    const embedding = await embedText(query);
    const chunks = await matchDocuments({
      clientId,
      queryEmbedding: embedding,
      matchThreshold: 0.2,
      matchCount: 5,
    });

    return new Response(JSON.stringify({ chunks }), { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("match error:", message);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}
