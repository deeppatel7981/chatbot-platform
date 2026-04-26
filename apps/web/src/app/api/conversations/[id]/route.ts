import { NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { clients, contacts, conversations, messages } from "@/lib/db/schema";
import { getAccessFromSession } from "@/lib/access-scope";
import { getAppSession } from "@/lib/get-session";
import { isMockData } from "@/lib/mock/mode";
import { mockConversationMessages, mockConversations } from "@/lib/mock/fixtures";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAppSession();
  const orgId = session?.user?.organizationId;
  const scope = getAccessFromSession(session);
  if (!orgId || !scope) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = (await req.json()) as Record<string, unknown>;

  if (isMockData()) {
    const row = mockConversations.find((c) => c.id === id);
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (scope.mode === "portal" && !scope.portalClientIds.includes(row.clientId)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const next = {
      ...row,
      status: typeof body.status === "string" ? body.status.trim() : row.status,
      needsHuman: typeof body.needsHuman === "boolean" ? body.needsHuman : row.needsHuman,
      lastConfidence:
        body.lastConfidence === null
          ? null
          : typeof body.lastConfidence === "string"
            ? body.lastConfidence
            : row.lastConfidence,
      updatedAt: new Date().toISOString(),
    };
    return NextResponse.json({ data: { conversation: next } });
  }

  try {
    const db = getDb();
    const patch: Partial<typeof conversations.$inferInsert> = { updatedAt: new Date() };
    if (typeof body.status === "string") patch.status = body.status.trim();
    if (typeof body.needsHuman === "boolean") patch.needsHuman = body.needsHuman;
    if (body.lastConfidence === null) patch.lastConfidence = null;
    if (typeof body.lastConfidence === "string") patch.lastConfidence = body.lastConfidence;
    if (body.assignedToUserId === null) patch.assignedToUserId = null;
    if (typeof body.assignedToUserId === "string") patch.assignedToUserId = body.assignedToUserId;

    const [row] = await db
      .update(conversations)
      .set(patch)
      .where(and(eq(conversations.id, id), eq(conversations.organizationId, orgId)))
      .returning();

    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (scope.mode === "portal" && !scope.portalClientIds.includes(row.clientId)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const [withClient] = await db
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
        contactPhone: contacts.phone,
      })
      .from(conversations)
      .innerJoin(clients, eq(conversations.clientId, clients.id))
      .leftJoin(contacts, eq(conversations.contactId, contacts.id))
      .where(and(eq(conversations.id, id), eq(conversations.organizationId, orgId)))
      .limit(1);

    return NextResponse.json({ data: { conversation: withClient ?? row } });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAppSession();
  const orgId = session?.user?.organizationId;
  const scope = getAccessFromSession(session);
  if (!orgId || !scope) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  if (isMockData()) {
    const row = mockConversations.find((c) => c.id === id);
    if (!row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (scope.mode === "portal" && !scope.portalClientIds.includes(row.clientId)) {
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
      contactPhone: contacts.phone,
    })
    .from(conversations)
    .innerJoin(clients, eq(conversations.clientId, clients.id))
    .leftJoin(contacts, eq(conversations.contactId, contacts.id))
    .where(and(eq(conversations.id, id), eq(conversations.organizationId, orgId)))
    .limit(1);

  if (!conv) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (scope.mode === "portal" && !scope.portalClientIds.includes(conv.clientId)) {
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
