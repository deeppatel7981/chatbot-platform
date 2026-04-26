import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { leads } from "@/lib/db/schema";
import { getAppSession } from "@/lib/get-session";
import { requireFullOrgApi } from "@/lib/require-full-org-api";
import { isMockData } from "@/lib/mock/mode";
import { mockLeadsList } from "@/lib/mock/fixtures";

export async function GET() {
  try {
    const session = await getAppSession();
    const blocked = requireFullOrgApi(session);
    if (blocked) return blocked;
    const orgId = session?.user?.organizationId;
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (isMockData()) {
      return NextResponse.json({ data: mockLeadsList });
    }

    const db = getDb();
    const data = await db
      .select()
      .from(leads)
      .where(eq(leads.organizationId, orgId))
      .orderBy(desc(leads.updatedAt));

    return NextResponse.json({ data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAppSession();
    const blocked = requireFullOrgApi(session);
    if (blocked) return blocked;
    const orgId = session?.user?.organizationId;
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as Record<string, unknown>;
    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }

    const status = typeof body.status === "string" ? body.status.trim() || "new" : "new";
    const source = typeof body.source === "string" ? body.source.trim() || null : null;
    const intent = typeof body.intent === "string" ? body.intent.trim() || null : null;
    const notes = typeof body.notes === "string" ? body.notes.trim() || null : null;
    const contactId = typeof body.contactId === "string" ? body.contactId : null;
    const conversationId = typeof body.conversationId === "string" ? body.conversationId : null;

    const now = new Date().toISOString();

    if (isMockData()) {
      return NextResponse.json({
        data: {
          id: randomUUID(),
          organizationId: orgId,
          contactId,
          conversationId,
          title,
          status,
          source,
          intent,
          assignedToUserId: null,
          notes,
          createdAt: now,
          updatedAt: now,
        },
      });
    }

    const db = getDb();
    const [row] = await db
      .insert(leads)
      .values({
        organizationId: orgId,
        title,
        status,
        source: source ?? undefined,
        intent: intent ?? undefined,
        notes: notes ?? undefined,
        contactId: contactId ?? undefined,
        conversationId: conversationId ?? undefined,
      })
      .returning();

    return NextResponse.json({ data: row });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
