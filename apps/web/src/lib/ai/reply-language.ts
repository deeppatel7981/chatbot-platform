export const REPLY_LANGUAGES = ["english", "hindi", "hinglish", "match_user"] as const;
export type ReplyLanguage = (typeof REPLY_LANGUAGES)[number];

const SET = new Set<string>(REPLY_LANGUAGES);

export function parseReplyLanguage(input: unknown, fallback: ReplyLanguage): ReplyLanguage {
  const s = typeof input === "string" ? input.trim().toLowerCase() : "";
  if (SET.has(s)) return s as ReplyLanguage;
  return fallback;
}

/** For validation (e.g. dashboard PATCH). */
export function tryParseReplyLanguage(input: unknown): ReplyLanguage | null {
  const s = typeof input === "string" ? input.trim().toLowerCase() : "";
  if (SET.has(s)) return s as ReplyLanguage;
  return null;
}

/** System-prompt fragment for `generateRagReply`. */
export function replyLanguageInstructions(mode: ReplyLanguage): string {
  switch (mode) {
    case "english":
      return "Language: Reply entirely in English. Do not add Hindi unless you are quoting a proper noun exactly as it appears in the knowledge context.";
    case "hindi":
      return "Language: Reply entirely in Hindi using Devanagari script. Be clear, polite, and concise.";
    case "hinglish":
      return "Language: Reply in natural Hinglish — mix English and Hindi (romanized or Devanagari) as common in Indian customer chats.";
    case "match_user":
      return "Language: Mirror the customer's language. If they write in English, reply in English. If they use Hindi or Hinglish, reply in the same style.";
    default:
      return replyLanguageInstructions("english");
  }
}
