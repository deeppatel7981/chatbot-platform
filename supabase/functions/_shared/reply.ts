import "jsr:@supabase/functions-js/edge-runtime.d.ts";

export type FaqRow = { question: string; answer: string };

export function pickLocalReply(
  userMsg: string,
  faqs: FaqRow[],
  welcomeMessage: string | null,
  projectName: string,
): { reply: string; intent: string | null; handoff: boolean } {
  const m = userMsg.toLowerCase().trim();
  if (!m) {
    return {
      reply: welcomeMessage ?? `Hi! You're chatting about ${projectName}. How can we help today?`,
      intent: null,
      handoff: false,
    };
  }

  if (/human|agent|real person|call me|callback|representative/i.test(userMsg)) {
    return {
      reply: "I'll flag this for our team — someone will reach out shortly.",
      intent: "human_handoff",
      handoff: true,
    };
  }

  for (const f of faqs) {
    const q = f.question.toLowerCase();
    const words = q.split(/\s+/).filter((w) => w.length > 3);
    const hitCount = words.filter((w) => m.includes(w)).length;
    if (hitCount >= 2 || (q.length >= 8 && m.includes(q.slice(0, Math.min(24, q.length))))) {
      return { reply: f.answer, intent: "faq_match", handoff: false };
    }
  }

  if (/brochure|broucher|pdf|download|catalog/i.test(userMsg)) {
    return {
      reply:
        welcomeMessage ??
        "Happy to help with the brochure. Are you leaning toward a 2 BHK or 3 BHK?",
      intent: "brochure_request",
      handoff: false,
    };
  }
  if (/price|pricing|cost|rate|sq\s*ft|per\s*sq/i.test(userMsg)) {
    return {
      reply:
        "Thanks for asking about pricing. Share your preferred configuration and budget band, and our team can send accurate options.",
      intent: "pricing",
      handoff: false,
    };
  }
  if (/visit|site visit|site-visit|tour|see the flat|see the unit/i.test(userMsg)) {
    return {
      reply: "We can arrange a site visit. Which day and time window usually work for you?",
      intent: "site_visit",
      handoff: false,
    };
  }

  return {
    reply:
      welcomeMessage ??
      `Thanks for your message. Our team for ${projectName} will assist you. Anything specific about location, budget, or timeline?`,
    intent: null,
    handoff: false,
  };
}

export function leadScore(intent: string | null, message: string): number {
  let s = 32;
  if (intent === "faq_match") s += 8;
  if (intent === "brochure_request") s += 14;
  if (intent === "pricing") s += 18;
  if (intent === "site_visit") s += 22;
  if (intent === "human_handoff") s += 12;
  if (/urgent|asap|today|tomorrow|immediately/i.test(message)) s += 10;
  return Math.min(100, s);
}

export async function openaiReply(
  userMsg: string,
  projectName: string,
  faqSnippet: string,
): Promise<string | null> {
  const key = Deno.env.get("OPENAI_API_KEY");
  if (!key) return null;
  const model = Deno.env.get("OPENAI_CHAT_MODEL") ?? "gpt-4o-mini";
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content:
            `You are a concise assistant for Indian real estate project "${projectName}". Max 3 short sentences. Be helpful, not salesy. If FAQ text answers the user, prefer paraphrasing it.\n\nFAQ excerpt:\n${faqSnippet.slice(0, 6000)}`,
        },
        { role: "user", content: userMsg.slice(0, 8000) },
      ],
      max_tokens: 350,
      temperature: 0.35,
    }),
  });
  if (!res.ok) {
    console.error("[openai]", res.status, await res.text());
    return null;
  }
  const j = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const text = j?.choices?.[0]?.message?.content;
  return typeof text === "string" ? text.trim() : null;
}
