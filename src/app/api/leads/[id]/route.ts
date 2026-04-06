import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { leads } from "@/lib/db/schema";
import { getAppSession } from "@/lib/get-session";
import { isMockData } from "@/lib/mock/mode";
import { mockLeadsList } from "@/lib/mock/fixtures";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAppSession();
  const orgId = session?.user?.organizationId;
  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  if (isMockData()) {
    const row = mockLeadsList.find((l) => l.id === id);
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ data: row });
  }

  try {
    const db = getDb();
    const [row] = await db
      .select()
      .from(leads)
      .where(and(eq(leads.id, id), eq(leads.organizationId, orgId)))
      .limit(1);
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ data: row });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAppSession();
  const orgId = session?.user?.organizationId;
  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = (await req.json()) as Record<string, unknown>;

  if (isMockData()) {
    const row = mockLeadsList.find((l) => l.id === id);
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const next = {
      ...row,
      title: typeof body.title === "string" ? body.title.trim() : row.title,
      status: typeof body.status === "string" ? body.status.trim() : row.status,
      source: typeof body.source === "string" ? body.source.trim() || null : row.source,
      intent: typeof body.intent === "string" ? body.intent.trim() || null : row.intent,
      notes: typeof body.notes === "string" ? body.notes.trim() || null : row.notes,
      assignedToUserId:
        body.assignedToUserId === null
          ? null
          : typeof body.assignedToUserId === "string"
            ? body.assignedToUserId
            : row.assignedToUserId,
      updatedAt: new Date().toISOString(),
    };
    return NextResponse.json({ data: next });
  }

  try {
    const db = getDb();
    const patch: Partial<typeof leads.$inferInsert> = { updatedAt: new Date() };
    if (typeof body.title === "string") patch.title = body.title.trim();
    if (typeof body.status === "string") patch.status = body.status.trim();
    if (typeof body.source === "string") patch.source = body.source.trim() || null;
    if (typeof body.intent === "string") patch.intent = body.intent.trim() || null;
    if (typeof body.notes === "string") patch.notes = body.notes.trim() || null;
    if (body.assignedToUserId === null) patch.assignedToUserId = null;
    if (typeof body.assignedToUserId === "string") patch.assignedToUserId = body.assignedToUserId;

    const [row] = await db
      .update(leads)
      .set(patch)
      .where(and(eq(leads.id, id), eq(leads.organizationId, orgId)))
      .returning();
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ data: row });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
