/**
 * OpenAI embeddings for Supabase Edge (align dims/model with apps/web/src/lib/embeddings.ts).
 */
const MODEL = "text-embedding-3-small";
const DIMENSIONS = 1536;

export function embeddingToVectorLiteral(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}

export async function embedText(text: string, apiKey: string): Promise<number[]> {
  const input = text.replace(/\r\n/g, "\n").trim().slice(0, 8000);
  if (!input) {
    throw new Error("empty text for embedding");
  }
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      input,
      dimensions: DIMENSIONS,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI embeddings ${res.status}: ${err}`);
  }
  const json = (await res.json()) as { data?: { embedding?: number[] }[] };
  const emb = json?.data?.[0]?.embedding;
  if (!emb || emb.length !== DIMENSIONS) {
    throw new Error("unexpected embedding shape");
  }
  return emb;
}
