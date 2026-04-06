import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { conversations, clients } from "@/lib/db/schema";
import { getAppSession } from "@/lib/get-session";
import { isMockData } from "@/lib/mock/mode";
import { mockConversations } from "@/lib/mock/fixtures";

export async function GET() {
  const session = await getAppSession();
  const orgId = session?.user?.organizationId;
  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isMockData()) {
    return NextResponse.json({ data: mockConversations });
  }

  try {
    const db = getDb();
    const rows = await db
      .select({
        id: conversations.id,
        channel: conversations.channel,
        status: conversations.status,
        needsHuman: conversations.needsHuman,
        lastConfidence: conversations.lastConfidence,
        updatedAt: conversations.updatedAt,
        clientName: clients.name,
        clientId: clients.id,
      })
      .from(conversations)
      .innerJoin(clients, eq(conversations.clientId, clients.id))
      .where(eq(conversations.organizationId, orgId))
      .orderBy(desc(conversations.updatedAt))
      .limit(100);

    return NextResponse.json({ data: rows });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
