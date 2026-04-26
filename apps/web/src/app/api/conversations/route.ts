import { NextResponse } from "next/server";
import { and, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { conversations, clients } from "@/lib/db/schema";
import { getAccessFromSession } from "@/lib/access-scope";
import { getAppSession } from "@/lib/get-session";
import { isMockData } from "@/lib/mock/mode";
import { mockConversations } from "@/lib/mock/fixtures";

export async function GET() {
  const session = await getAppSession();
  const orgId = session?.user?.organizationId;
  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const scope = getAccessFromSession(session);
  if (!scope) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isMockData()) {
    const data =
      scope.mode === "portal"
        ? mockConversations.filter((c) => scope.portalClientIds.includes(c.clientId))
        : mockConversations;
    return NextResponse.json({ data });
  }

  try {
    if (scope.mode === "portal" && scope.portalClientIds.length === 0) {
      return NextResponse.json({ data: [] });
    }

    const db = getDb();
    const orgFilter = eq(conversations.organizationId, orgId);
    const where =
      scope.mode === "portal" ? and(orgFilter, inArray(conversations.clientId, scope.portalClientIds)) : orgFilter;

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
      .where(where)
      .orderBy(desc(conversations.updatedAt))
      .limit(100);

    return NextResponse.json({ data: rows });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
