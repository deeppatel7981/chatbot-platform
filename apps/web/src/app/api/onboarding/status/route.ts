import { NextResponse } from "next/server";
import { and, count, eq, isNotNull, ne, sql } from "drizzle-orm";
import { buildOnboardingStatusFromCounts, mockOnboardingStatusPayload } from "@chatbot/core";
import { getDb } from "@/lib/db/client";
import { clients, conversations, documentChunks } from "@/lib/db/schema";
import { getAppSession } from "@/lib/get-session";
import { requireFullOrgApi } from "@/lib/require-full-org-api";
import { isMockData } from "@/lib/mock/mode";

/**
 * Progress for dashboard "Getting started" — clients, knowledge, first conversation.
 */
export async function GET() {
  const session = await getAppSession();
  const blocked = requireFullOrgApi(session);
  if (blocked) return blocked;
  const orgId = session?.user?.organizationId;
  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isMockData()) {
    return NextResponse.json({ data: mockOnboardingStatusPayload() });
  }

  try {
    const db = getDb();

    const [cc] = await db.select({ n: count() }).from(clients).where(eq(clients.organizationId, orgId));
    const clientCount = Number(cc?.n ?? 0);

    const [dc] = await db
      .select({ n: count() })
      .from(documentChunks)
      .innerJoin(clients, eq(documentChunks.clientId, clients.id))
      .where(eq(clients.organizationId, orgId));
    const docChunks = Number(dc?.n ?? 0);

    const [cv] = await db.select({ n: count() }).from(conversations).where(eq(conversations.organizationId, orgId));
    const conversationCount = Number(cv?.n ?? 0);

    const [wa] = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(clients)
      .where(
        and(
          eq(clients.organizationId, orgId),
          isNotNull(clients.whatsappPhoneNumberId),
          ne(clients.whatsappPhoneNumberId, "")
        )
      );
    const whatsappConnected = (wa?.n ?? 0) > 0;

    return NextResponse.json({
      data: buildOnboardingStatusFromCounts(
        {
          clientCount,
          documentChunkCount: docChunks,
          conversationCount,
          whatsappConnected,
        },
        { mock: false }
      ),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: message, hint: "Check DATABASE_URL and that the server was restarted after MOCK_DATA=false." },
      { status: 503 }
    );
  }
}
