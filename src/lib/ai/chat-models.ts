/**
 * Curated OpenAI chat models for customer-facing RAG replies.
 * Keep in sync with what your OpenAI account can call.
 */
export type ChatModelOption = {
  id: string;
  label: string;
  description: string;
};

export const CHAT_MODEL_OPTIONS: ChatModelOption[] = [
  {
    id: "gpt-4o-mini",
    label: "GPT-4o mini",
    description: "Default — fast responses, lowest cost. Best for most SMB workloads.",
  },
  {
    id: "gpt-4o",
    label: "GPT-4o",
    description: "Higher quality reasoning and nuance when answers must be precise.",
  },
  {
    id: "gpt-4-turbo",
    label: "GPT-4 Turbo",
    description: "Legacy high-capability model; use if your policy requires it.",
  },
  {
    id: "gpt-3.5-turbo",
    label: "GPT-3.5 Turbo",
    description: "Economy option for very high volume; less capable than 4o mini.",
  },
];

const ALLOWED = new Set(CHAT_MODEL_OPTIONS.map((m) => m.id));

export function isAllowedChatModel(id: string): boolean {
  return ALLOWED.has(id);
}

/** Org override wins when allowed; otherwise fall back to env default. */
export function resolveChatModel(orgOverride: string | null | undefined): string {
  const envDefault = process.env.OPENAI_CHAT_MODEL ?? "gpt-4o-mini";
  const trimmed = orgOverride?.trim();
  if (!trimmed) return envDefault;
  return isAllowedChatModel(trimmed) ? trimmed : envDefault;
}
