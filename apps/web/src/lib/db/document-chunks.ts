import { getPool } from "./client";
import { randomUUID } from "crypto";

export async function insertDocumentChunk(params: {
  clientId: string;
  chunk: string;
  embedding: number[];
  metadata: Record<string, unknown>;
}): Promise<{ id: string }> {
  const pool = getPool();
  const id = randomUUID();
  const vecLiteral = `[${params.embedding.join(",")}]`;
  await pool.query(
    `
    INSERT INTO document_chunks (id, client_id, chunk, embedding, metadata)
    VALUES ($1::uuid, $2::uuid, $3, $4::vector, $5::jsonb)
    `,
    [id, params.clientId, params.chunk, vecLiteral, JSON.stringify(params.metadata)]
  );
  return { id };
}

export async function listDocumentRowsForClient(clientId: string) {
  const pool = getPool();
  const { rows } = await pool.query<{
    id: string;
    chunk: string;
    metadata: Record<string, unknown>;
    created_at: string;
  }>(
    `SELECT id, chunk, metadata, created_at FROM document_chunks WHERE client_id = $1::uuid ORDER BY created_at DESC`,
    [clientId]
  );
  return rows;
}
