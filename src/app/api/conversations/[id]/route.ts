import { NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { clients, conversations, messages } from "@/lib/db/schema";
import { getAppSession } from "@/lib/get-session";
import { isMockData } from "@/lib/mock/mode";
import { mockConversationMessages, mockConversations } from "@/lib/mock/fixtures";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAppSession();
  const orgId = session?.user?.organizationId;
  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  if (isMockData()) {
    const row = mockConversations.find((c) => c.id === id);
    if (!row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const transcript = mockConversationMessages[id] ?? [];
    return NextResponse.json({
      data: {
        conversation: row,
        messages: transcript,
      },
    });
  }

  const db = getDb();
  const [conv] = await db
    .select({
      id: conversations.id,
      channel: conversations.channel,
      status: conversations.status,
      needsHuman: conversations.needsHuman,
      lastConfidence: conversations.lastConfidence,
      createdAt: conversations.createdAt,
      updatedAt: conversations.updatedAt,
      clientId: conversations.clientId,
      clientName: clients.name,
    })
    .from(conversations)
    .innerJoin(clients, eq(conversations.clientId, clients.id))
    .where(and(eq(conversations.id, id), eq(conversations.organizationId, orgId)))
    .limit(1);

  if (!conv) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const transcript = await db
    .select({
      id: messages.id,
      role: messages.role,
      body: messages.body,
      createdAt: messages.createdAt,
    })
    .from(messages)
    .where(eq(messages.conversationId, id))
    .orderBy(asc(messages.createdAt));

  return NextResponse.json({
    data: {
      conversation: conv,
      messages: transcript,
    },
  });
}
