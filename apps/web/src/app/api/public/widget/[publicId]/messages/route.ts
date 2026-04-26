import { NextRequest, NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { clients, contacts, conversations, messages } from "@/lib/db/schema";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit-memory";
import { isMockData } from "@/lib/mock/mode";
import { mockClients, mockConversationMessages, mockConversations } from "@/lib/mock/fixtures";

const POLL_WINDOW_MS = 60_000;
const POLL_MAX_PER_WINDOW = 120;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  const { publicId } = await params;
  const ip = getClientIp(req);
  const rl = checkRateLimit(`widget-poll:${publicId}:${ip}`, POLL_MAX_PER_WINDOW, POLL_WINDOW_MS);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests. Try again shortly." },
      { status: 429, headers: { ...corsHeaders, "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  const visitorId = req.nextUrl.searchParams.get("visitorId")?.trim() ?? "";
  const conversationId = req.nextUrl.searchParams.get("conversationId")?.trim() ?? "";
  if (!visitorId || !conversationId) {
    return NextResponse.json(
      { error: "visitorId and conversationId query parameters are required" },
      { status: 400, headers: corsHeaders }
    );
  }

  if (isMockData()) {
    const client = mockClients.find((c) => c.widgetPublicId === publicId);
    if (!client) {
      return NextResponse.json({ error: "Not found" }, { status: 404, headers: corsHeaders });
    }
    const conv = mockConversations.find(
      (c) => c.id === conversationId && c.clientId === client.id && c.channel === "widget"
    );
    if (!conv) {
      return NextResponse.json({ error: "Not found" }, { status: 404, headers: corsHeaders });
    }
    const list = mockConversationMessages[conversationId] ?? [];
    return NextResponse.json({ messages: list }, { headers: corsHeaders });
  }

  const db = getDb();
  const [ok] = await db
    .select({ one: conversations.id })
    .from(conversations)
    .innerJoin(clients, eq(conversations.clientId, clients.id))
    .innerJoin(contacts, eq(conversations.contactId, contacts.id))
    .where(
      and(
        eq(clients.widgetPublicId, publicId),
        eq(conversations.id, conversationId),
        eq(conversations.channel, "widget"),
        eq(contacts.externalId, visitorId)
      )
    )
    .limit(1);

  if (!ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers: corsHeaders });
  }

  const rows = await db
    .select({
      id: messages.id,
      role: messages.role,
      body: messages.body,
      createdAt: messages.createdAt,
    })
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.createdAt));

  return NextResponse.json({ messages: rows }, { headers: corsHeaders });
}
