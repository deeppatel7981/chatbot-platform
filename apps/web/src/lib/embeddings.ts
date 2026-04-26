import OpenAI from "openai";

const EMBEDDING_MODEL = "text-embedding-3-small";
const DIMENSIONS = 1536;

let openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openai) {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error("OPENAI_API_KEY is not set");
    openai = new OpenAI({ apiKey: key });
  }
  return openai;
}

export async function embedText(text: string): Promise<number[]> {
  const client = getOpenAI();
  const res = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
    dimensions: DIMENSIONS,
  });
  const emb = res.data[0]?.embedding;
  if (!emb || emb.length !== DIMENSIONS) {
    throw new Error("Unexpected embedding shape");
  }
  return emb;
}

export { DIMENSIONS as EMBEDDING_DIMENSIONS };
