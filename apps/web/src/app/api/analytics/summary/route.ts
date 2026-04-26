import { NextResponse } from "next/server";
import { eq, sql, and, gte } from "drizzle-orm";
import { buildAnalyticsSummaryFromCounts, mockAnalyticsSummaryPayload } from "@chatbot/core";
import { getDb } from "@/lib/db/client";
import { conversations, contacts, leadEvents } from "@/lib/db/schema";
import { getAppSession } from "@/lib/get-session";
import { requireFullOrgApi } from "@/lib/require-full-org-api";
import { isMockData } from "@/lib/mock/mode";

export async function GET() {
  const session = await getAppSession();
  const blocked = requireFullOrgApi(session);
  if (blocked) return blocked;
  const orgId = session?.user?.organizationId;
  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isMockData()) {
    return NextResponse.json({ data: mockAnalyticsSummaryPayload() });
  }

  try {
    const db = getDb();
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const [convCount] = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(conversations)
      .where(eq(conversations.organizationId, orgId));

    const [contactCount] = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(contacts)
      .where(eq(contacts.organizationId, orgId));

    const [handoffCount] = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(leadEvents)
      .where(and(eq(leadEvents.organizationId, orgId), eq(leadEvents.intent, "handoff")));

    const [recentConv] = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(conversations)
      .where(and(eq(conversations.organizationId, orgId), gte(conversations.createdAt, since)));

    return NextResponse.json({
      data: buildAnalyticsSummaryFromCounts({
        conversationsTotal: convCount?.n ?? 0,
        contactsTotal: contactCount?.n ?? 0,
        handoffsTotal: handoffCount?.n ?? 0,
        conversationsLast30Days: recentConv?.n ?? 0,
      }),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
