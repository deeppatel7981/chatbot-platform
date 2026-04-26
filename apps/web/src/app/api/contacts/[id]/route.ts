import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { contacts } from "@/lib/db/schema";
import { getAppSession } from "@/lib/get-session";
import { requireFullOrgApi } from "@/lib/require-full-org-api";
import { isMockData } from "@/lib/mock/mode";
import { mockContactsList } from "@/lib/mock/fixtures";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAppSession();
  const blocked = requireFullOrgApi(session);
  if (blocked) return blocked;
  const orgId = session?.user?.organizationId;
  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  if (isMockData()) {
    const row = mockContactsList.find((c) => c.id === id);
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ data: row });
  }

  try {
    const db = getDb();
    const [row] = await db
      .select()
      .from(contacts)
      .where(and(eq(contacts.id, id), eq(contacts.organizationId, orgId)))
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
  const blocked = requireFullOrgApi(session);
  if (blocked) return blocked;
  const orgId = session?.user?.organizationId;
  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = (await req.json()) as Record<string, unknown>;

  if (isMockData()) {
    const row = mockContactsList.find((c) => c.id === id);
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const next = {
      ...row,
      name: typeof body.name === "string" ? body.name.trim() || null : row.name,
      phone: typeof body.phone === "string" ? body.phone.trim() || null : row.phone,
      email: typeof body.email === "string" ? body.email.trim().toLowerCase() || null : row.email,
      source: typeof body.source === "string" ? body.source.trim() || null : row.source,
    };
    return NextResponse.json({ data: next });
  }

  try {
    const db = getDb();
    const patch: Partial<typeof contacts.$inferInsert> = {};
    if (typeof body.name === "string") patch.name = body.name.trim() || null;
    if (typeof body.phone === "string") patch.phone = body.phone.trim() || null;
    if (typeof body.email === "string") patch.email = body.email.trim().toLowerCase() || null;
    if (typeof body.source === "string") patch.source = body.source.trim() || null;

    const [row] = await db
      .update(contacts)
      .set(patch)
      .where(and(eq(contacts.id, id), eq(contacts.organizationId, orgId)))
      .returning();
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ data: row });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
