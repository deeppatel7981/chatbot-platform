import { eq, and, desc } from "drizzle-orm";
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
import { sendWhatsAppText } from "@/lib/whatsapp";
import { notifyHandoff } from "@/lib/notifications";

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
  rawPayload?: Record<string, unknown>;
}): Promise<{ reply: string; conversationId: string; needsHuman: boolean }> {
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

  await db.insert(messages).values({
    conversationId: conv.id,
    role: "user",
    body: params.body,
    rawPayload: params.rawPayload,
  });

  const ai = await generateRagReply({
    clientId: params.clientId,
    userMessage: params.body,
    chatModel: orgRow?.openaiChatModel,
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
      });
    }
  }

  return { reply: ai.reply, conversationId: conv.id, needsHuman: ai.needsHuman };
}
