import { NextRequest, NextResponse } from "next/server";
import { embedText } from "@/lib/embeddings";
import { matchDocuments } from "@/lib/db/match-documents";
import { isMockData } from "@/lib/mock/mode";
import { mockMatchChunks } from "@/lib/mock/fixtures";

export async function POST(req: NextRequest) {
  const { clientId, query } = await req.json();

  if (!clientId || !query) {
    return NextResponse.json({ error: "Missing clientId or query" }, { status: 400 });
  }

  if (isMockData()) {
    return NextResponse.json({ chunks: mockMatchChunks });
  }

  try {
    const embedding = await embedText(query);
    const chunks = await matchDocuments({
      clientId,
      queryEmbedding: embedding,
      matchThreshold: 0.2,
      matchCount: 5,
    });

    return NextResponse.json({ chunks });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("query-documents error:", message);
    return NextResponse.json({ error: message || "Server error" }, { status: 500 });
  }
}
