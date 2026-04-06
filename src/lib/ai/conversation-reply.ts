import OpenAI from "openai";
import { matchDocuments } from "@/lib/db/match-documents";
import { embedText } from "@/lib/embeddings";
import { resolveChatModel } from "@/lib/ai/chat-models";

let openai: OpenAI | null = null;

function getClient(): OpenAI {
  if (!openai) {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error("OPENAI_API_KEY is not set");
    openai = new OpenAI({ apiKey: key });
  }
  return openai;
}

export type ReplyResult = {
  reply: string;
  confidence: "high" | "medium" | "low";
  needsHuman: boolean;
  modelId: string;
  topSimilarity: number;
};

export async function generateRagReply(params: {
  clientId: string;
  userMessage: string;
  /** Organization-level override; resolved with env default in resolveChatModel. */
  chatModel?: string | null;
}): Promise<ReplyResult> {
  const queryEmbedding = await embedText(params.userMessage);
  const chunks = await matchDocuments({
    clientId: params.clientId,
    queryEmbedding,
    matchThreshold: 0.2,
    matchCount: 5,
  });

  const topSimilarity = chunks[0]?.similarity ?? 0;
  const context = chunks.map((c) => c.chunk).join("\n---\n");

  const model = resolveChatModel(params.chatModel);
  const client = getClient();
  const completion = await client.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: `You are a customer operations assistant for an Indian SME. Answer using ONLY the knowledge context below when possible. Be concise and polite. If the answer is not in the context, say briefly that you will connect them with the team. Support mixed English and Hindi (romanized) naturally.

Knowledge context:
${context || "(no documents retrieved)"}`,
      },
      { role: "user", content: params.userMessage },
    ],
    temperature: 0.3,
  });

  const reply = completion.choices[0]?.message?.content?.trim() ?? "Thanks — our team will get back to you shortly.";
  const modelId = completion.model;

  let confidence: ReplyResult["confidence"] = "low";
  if (topSimilarity >= 0.55) confidence = "high";
  else if (topSimilarity >= 0.35) confidence = "medium";

  const needsHuman =
    confidence === "low" ||
    /connect (you |)with (the |)team|human|representative|not in the context/i.test(reply);

  return { reply, confidence, needsHuman, modelId, topSimilarity };
}
