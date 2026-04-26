import { getPool } from "./client";

export type MatchChunk = {
  id: string;
  chunk: string;
  metadata: Record<string, unknown>;
  similarity: number;
};

/**
 * Cosine similarity search via pgvector (<=> is cosine distance for normalized vectors).
 */
export async function matchDocuments(params: {
  clientId: string;
  queryEmbedding: number[];
  matchThreshold: number;
  matchCount: number;
}): Promise<MatchChunk[]> {
  const { clientId, queryEmbedding, matchThreshold, matchCount } = params;
  const pool = getPool();
  const vecLiteral = `[${queryEmbedding.join(",")}]`;

  const { rows } = await pool.query<{
    id: string;
    chunk: string;
    metadata: Record<string, unknown>;
    similarity: string;
  }>(
    `
    SELECT id, chunk, metadata,
           (1 - (embedding <=> $1::vector))::float AS similarity
    FROM document_chunks
    WHERE client_id = $2::uuid
      AND (1 - (embedding <=> $1::vector)) >= $3
    ORDER BY embedding <=> $1::vector
    LIMIT $4
    `,
    [vecLiteral, clientId, matchThreshold, matchCount]
  );

  return rows.map((r) => ({
    id: r.id,
    chunk: r.chunk,
    metadata: r.metadata ?? {},
    similarity: Number(r.similarity),
  }));
}
