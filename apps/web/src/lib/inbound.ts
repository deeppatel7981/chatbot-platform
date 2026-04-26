import { eq, and, asc, desc } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import {
  clients,
  contacts,
  conversations,
  messages,
  leadEvents,
  organizations,
} from "@/lib/db/schema";
import { generateRagReply } from "@/lib/ai/conversation-reply";
import { parseReplyLanguage } from "@/lib/ai/reply-language";
import { logStructured, newCorrelationId } from "@/lib/structured-log";
import { sendWhatsAppReadAndTyping, sendWhatsAppText } from "@/lib/whatsapp";
import { notifyHandoff } from "@/lib/notifications";
import { refreshWebSourcesOnNewConversation } from "@/lib/web-source-ingest";
import { isMockData } from "@/lib/mock/mode";

export async function handleCustomerMessage(params: {
  organizationId: string;
  clientId: string;
  channel: "whatsapp" | "widget";
  /** WhatsApp wa_id or widget visitor id */
  externalUserId?: string;
  phone?: string;
  email?: string;
  name?: string;
  body: string;
  /** Widget visitor preference; falls back to client default. */
  replyLanguage?: string | null;
  rawPayload?: Record<string, unknown>;
  /** Trace id from the HTTP edge (widget / WhatsApp); generated if omitted. */
  correlationId?: string;
  /** WhatsApp Cloud API inbound `messages[].id` — used for read receipt + typing indicator before RAG. */
  whatsappInboundMessageId?: string | null;
}): Promise<{ reply: string; conversationId: string; needsHuman: boolean }> {
  const correlationId = params.correlationId?.trim() || newCorrelationId();
  if (process.env.LOG_INBOUND_VERBOSE === "true") {
    logStructured("inbound_received", {
      correlationId,
      channel: params.channel,
      clientId: params.clientId,
      organizationId: params.organizationId,
    });
  }
  const db = getDb();

  const ext = params.externalUserId ?? params.phone ?? "";
  let contactId: string | undefined;

  if (ext) {
    const [existing] = await db
      .select()
      .from(contacts)
      .where(
        and(eq(contacts.organizationId, params.organizationId), eq(contacts.externalId, ext))
      )
      .limit(1);

    if (existing) {
      contactId = existing.id;
    } else {
      const [c] = await db
        .insert(contacts)
        .values({
          organizationId: params.organizationId,
          phone: params.phone,
          email: params.email,
          name: params.name,
          source: params.channel,
          externalId: ext,
        })
        .returning();
      contactId = c.id;
    }
  }

  const [clientRow] = await db.select().from(clients).where(eq(clients.id, params.clientId)).limit(1);
  if (!clientRow) throw new Error("Client not found");

  const [orgRow] = await db
    .select({ openaiChatModel: organizations.openaiChatModel })
    .from(organizations)
    .where(eq(organizations.id, params.organizationId))
    .limit(1);

  let conv: (typeof conversations.$inferSelect) | undefined;
  let isNewConversation = false;

  if (contactId) {
    const existingConv = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.clientId, params.clientId),
          eq(conversations.contactId, contactId),
          eq(conversations.status, "open")
        )
      )
      .orderBy(desc(conversations.updatedAt))
      .limit(1);
    conv = existingConv[0];
  }

  if (!conv) {
    isNewConversation = true;
    const [c] = await db
      .insert(conversations)
      .values({
        organizationId: params.organizationId,
        clientId: params.clientId,
        contactId,
        channel: params.channel,
        status: "open",
        needsHuman: false,
      })
      .returning();
    conv = c;
  }

  if (isNewConversation && !isMockData()) {
    await refreshWebSourcesOnNewConversation(db, params.clientId);
  }

  const priorRows = await db
    .select({ role: messages.role, body: messages.body })
    .from(messages)
    .where(eq(messages.conversationId, conv.id))
    .orderBy(asc(messages.createdAt));
  const priorTurns = priorRows
    .map((r) => ({ role: (r.role ?? "").toLowerCase(), body: r.body ?? "" }))
    .filter((r) => r.role === "user" || r.role === "assistant" || r.role === "staff");

  await db.insert(messages).values({
    conversationId: conv.id,
    role: "user",
    body: params.body,
    rawPayload: { ...(params.rawPayload ?? {}), correlationId },
  });

  const clientDefault = parseReplyLanguage(clientRow.replyLanguage, "english");
  const effectiveReplyLanguage = parseReplyLanguage(params.replyLanguage, clientDefault);

  const waMsgId = params.whatsappInboundMessageId?.trim();
  if (
    params.channel === "whatsapp" &&
    waMsgId &&
    clientRow.whatsappPhoneNumberId &&
    clientRow.whatsappAccessToken
  ) {
    await sendWhatsAppReadAndTyping({
      phoneNumberId: clientRow.whatsappPhoneNumberId,
      accessToken: clientRow.whatsappAccessToken,
      messageId: waMsgId,
      correlationId,
      clientId: clientRow.id,
    });
  }

  const ai = await generateRagReply({
    clientId: params.clientId,
    userMessage: params.body,
    chatModel: orgRow?.openaiChatModel,
    replyLanguage: effectiveReplyLanguage,
    correlationId,
    channel: params.channel,
    priorTurns,
  });

  await db.insert(messages).values({
    conversationId: conv.id,
    role: "assistant",
    body: ai.reply,
    modelId: ai.modelId,
  });

  await db
    .update(conversations)
    .set({
      needsHuman: ai.needsHuman,
      lastConfidence: ai.confidence,
      updatedAt: new Date(),
    })
    .where(eq(conversations.id, conv.id));

  if (ai.needsHuman) {
    await db.insert(leadEvents).values({
      organizationId: params.organizationId,
      contactId,
      conversationId: conv.id,
      intent: "handoff",
      extracted: { reason: "low_confidence_or_policy", topSimilarity: ai.topSimilarity },
    });
    await notifyHandoff({
      organizationId: params.organizationId,
      clientName: clientRow.name,
      conversationId: conv.id,
      summary: ai.reply.slice(0, 280),
    });
  }

  if (params.channel === "whatsapp" && clientRow.whatsappPhoneNumberId && clientRow.whatsappAccessToken) {
    const to = params.phone?.replace(/\D/g, "") ?? ext.replace(/\D/g, "");
    if (to) {
      await sendWhatsAppText({
        to,
        text: ai.reply,
        phoneNumberId: clientRow.whatsappPhoneNumberId,
        accessToken: clientRow.whatsappAccessToken,
        correlationId,
        clientId: clientRow.id,
      });
    }
  }

  return { reply: ai.reply, conversationId: conv.id, needsHuman: ai.needsHuman };
}
