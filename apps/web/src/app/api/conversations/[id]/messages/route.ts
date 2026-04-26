import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { clients, contacts, conversations, messages } from "@/lib/db/schema";
import { getAccessFromSession } from "@/lib/access-scope";
import { getAppSession } from "@/lib/get-session";
import { isMockData } from "@/lib/mock/mode";
import { mockConversationMessages, mockConversations } from "@/lib/mock/fixtures";
import { sendWhatsAppText } from "@/lib/whatsapp";
import { newCorrelationId } from "@/lib/structured-log";

const MESSAGE_MAX_CHARS = 12_000;

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAppSession();
  const orgId = session?.user?.organizationId;
  const scope = getAccessFromSession(session);
  if (!orgId || !scope) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: conversationId } = await params;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const text = typeof body.body === "string" ? body.body.trim() : "";
  const resolveHandoff = body.resolveHandoff !== false;

  if (!text) {
    return NextResponse.json({ error: "body is required" }, { status: 400 });
  }
  if (text.length > MESSAGE_MAX_CHARS) {
    return NextResponse.json({ error: `Message must be at most ${MESSAGE_MAX_CHARS} characters` }, { status: 400 });
  }

  if (isMockData()) {
    const row = mockConversations.find((c) => c.id === conversationId);
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (scope.mode === "portal" && !scope.portalClientIds.includes(row.clientId)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (row.status?.toLowerCase() === "closed") {
      return NextResponse.json({ error: "Thread is closed" }, { status: 400 });
    }
    if (!mockConversationMessages[conversationId]) {
      mockConversationMessages[conversationId] = [];
    }
    const list = mockConversationMessages[conversationId];
    const newMsg = {
      id: randomUUID(),
      role: "staff",
      body: text,
      createdAt: new Date().toISOString(),
    };
    list.push(newMsg);
    row.needsHuman = resolveHandoff ? false : row.needsHuman;
    row.updatedAt = new Date().toISOString();
    return NextResponse.json({ data: { message: newMsg } });
  }

  const db = getDb();
  const [conv] = await db
    .select({
      id: conversations.id,
      organizationId: conversations.organizationId,
      clientId: conversations.clientId,
      channel: conversations.channel,
      status: conversations.status,
      contactId: conversations.contactId,
    })
    .from(conversations)
    .where(and(eq(conversations.id, conversationId), eq(conversations.organizationId, orgId)))
    .limit(1);

  if (!conv) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (scope.mode === "portal" && !scope.portalClientIds.includes(conv.clientId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (conv.status?.toLowerCase() === "closed") {
    return NextResponse.json({ error: "Thread is closed" }, { status: 400 });
  }

  const correlationId = newCorrelationId();
  const [inserted] = await db
    .insert(messages)
    .values({
      conversationId: conv.id,
      role: "staff",
      body: text,
      rawPayload: { source: "dashboard", correlationId },
    })
    .returning();

  const patch: { updatedAt: Date; needsHuman?: boolean } = { updatedAt: new Date() };
  if (resolveHandoff) patch.needsHuman = false;
  await db.update(conversations).set(patch).where(eq(conversations.id, conv.id));

  if (conv.channel === "whatsapp" && conv.contactId) {
    const [clientRow] = await db.select().from(clients).where(eq(clients.id, conv.clientId)).limit(1);
    const [contactRow] = await db.select().from(contacts).where(eq(contacts.id, conv.contactId)).limit(1);
    const to = contactRow?.phone?.replace(/\D/g, "") ?? "";
    if (
      clientRow?.whatsappPhoneNumberId &&
      clientRow.whatsappAccessToken &&
      to
    ) {
      await sendWhatsAppText({
        to,
        text,
        phoneNumberId: clientRow.whatsappPhoneNumberId,
        accessToken: clientRow.whatsappAccessToken,
        correlationId,
        clientId: conv.clientId,
      });
    }
  }

  return NextResponse.json({ data: { message: inserted } });
}
