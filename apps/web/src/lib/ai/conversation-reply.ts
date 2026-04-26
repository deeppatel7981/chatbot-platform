import OpenAI from "openai";
import { matchDocuments } from "@/lib/db/match-documents";
import { embedText } from "@/lib/embeddings";
import { resolveChatModel } from "@/lib/ai/chat-models";
import { replyLanguageInstructions, type ReplyLanguage } from "@/lib/ai/reply-language";
import { logStructured } from "@/lib/structured-log";

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

const NO_OPENAI_REPLY: ReplyResult = {
  reply:
    "Thanks for your message. We'll have someone from the team get back to you shortly. If this is urgent, please reach out through the business's phone or email on their website.",
  confidence: "low",
  needsHuman: true,
  modelId: "none",
  topSimilarity: 0,
};

const OPENAI_QUOTA_REPLY: ReplyResult = {
  reply:
    "We're having a temporary issue with our automated assistant (usage limits). Please try again in a little while, or contact this business directly for urgent help.",
  confidence: "low",
  needsHuman: true,
  modelId: "quota",
  topSimilarity: 0,
};

function isOpenAiQuotaError(e: unknown): boolean {
  if (!e || typeof e !== "object") return false;
  const o = e as { status?: number; code?: string; message?: string };
  if (o.status === 429) return true;
  if (o.code === "insufficient_quota") return true;
  const m = typeof o.message === "string" ? o.message : "";
  return /insufficient_quota|exceeded your current quota/i.test(m);
}

const MAX_TURN_CHARS = 12_000;
/** Max prior rows passed into the model (recent tail of the thread). */
const MAX_PRIOR_TURNS = 32;

export type PriorTurn = { role: string; body: string };

function turnToOpenAiMessage(turn: PriorTurn): { role: "user" | "assistant"; content: string } | null {
  const body = (turn.body ?? "").slice(0, MAX_TURN_CHARS);
  if (!body.trim()) return null;
  const r = (turn.role ?? "").toLowerCase();
  if (r === "user") return { role: "user", content: body };
  if (r === "assistant") return { role: "assistant", content: body };
  if (r === "staff") return { role: "assistant", content: `[Team] ${body}` };
  return null;
}

export async function generateRagReply(params: {
  clientId: string;
  userMessage: string;
  /** Organization-level override; resolved with env default in resolveChatModel. */
  chatModel?: string | null;
  /** Resolved effective language (client default and/or widget override). */
  replyLanguage?: ReplyLanguage;
  correlationId?: string;
  channel?: "widget" | "whatsapp";
  /** Prior turns on this thread (excluding the current user message). Staff → assistant with [Team] prefix. */
  priorTurns?: PriorTurn[];
}): Promise<ReplyResult> {
  if (!process.env.OPENAI_API_KEY?.trim()) {
    return NO_OPENAI_REPLY;
  }

  try {
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
    const lang = params.replyLanguage ?? "english";
    const langLine = replyLanguageInstructions(lang);
    const prior = params.priorTurns ?? [];
    const tail =
      prior.length > MAX_PRIOR_TURNS ? prior.slice(-MAX_PRIOR_TURNS) : prior;
    const history = tail.map(turnToOpenAiMessage).filter((m): m is NonNullable<typeof m> => m != null);

    const client = getClient();
    const completion = await client.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: `You are a customer operations assistant for an Indian SME. Answer using ONLY the knowledge context below when possible. Be concise and polite. If the answer is not in the context, say briefly that you will connect them with the team.
Messages prefixed with [Team] are from human staff — treat them as authoritative when they do not conflict with the knowledge context; you may build on them.
${langLine}

Knowledge context:
${context || "(no documents retrieved)"}`,
        },
        ...history,
        { role: "user", content: params.userMessage.slice(0, MAX_TURN_CHARS) },
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
  } catch (e) {
    const err = e as { status?: number; code?: string; message?: string };
    if (isOpenAiQuotaError(e)) {
      logStructured("openai_rag_quota", {
        correlationId: params.correlationId,
        channel: params.channel,
        clientId: params.clientId,
        status: err.status,
        code: err.code,
      });
      return OPENAI_QUOTA_REPLY;
    }
    logStructured("openai_rag_error", {
      correlationId: params.correlationId,
      channel: params.channel,
      clientId: params.clientId,
      status: err.status,
      code: err.code,
      message: typeof err.message === "string" ? err.message.slice(0, 500) : undefined,
    });
    return {
      ...NO_OPENAI_REPLY,
      reply:
        "Thanks for your message. We couldn't complete an automated reply just now. Someone from the team will follow up shortly.",
      modelId: "error",
    };
  }
}
