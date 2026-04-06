import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { clients } from "@/lib/db/schema";
import { getAppSession } from "@/lib/get-session";
import { isMockData } from "@/lib/mock/mode";
import { mockClients } from "@/lib/mock/fixtures";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAppSession();
  const orgId = session?.user?.organizationId;
  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  if (isMockData()) {
    const row = mockClients.find((c) => c.id === id);
    if (!row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ data: row });
  }

  const db = getDb();
  const [row] = await db
    .select()
    .from(clients)
    .where(and(eq(clients.id, id), eq(clients.organizationId, orgId)))
    .limit(1);

  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ data: row });
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
    const row = mockClients.find((c) => c.id === id);
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const next = {
      ...row,
      name: typeof body.name === "string" ? body.name.trim() : row.name,
      whatsappPhoneNumberId:
        typeof body.whatsappPhoneNumberId === "string"
          ? body.whatsappPhoneNumberId.trim() || null
          : row.whatsappPhoneNumberId,
    };
    return NextResponse.json({ data: next });
  }

  try {
    const db = getDb();
    const patch: Partial<typeof clients.$inferInsert> = {};
    if (typeof body.name === "string") patch.name = body.name.trim();
    if (typeof body.whatsappPhoneNumberId === "string") patch.whatsappPhoneNumberId = body.whatsappPhoneNumberId.trim() || null;
    if (typeof body.whatsappAccessToken === "string") patch.whatsappAccessToken = body.whatsappAccessToken.trim() || null;
    if (typeof body.whatsappVerifyToken === "string") patch.whatsappVerifyToken = body.whatsappVerifyToken.trim() || null;

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "No valid fields" }, { status: 400 });
    }

    const [row] = await db
      .update(clients)
      .set(patch)
      .where(and(eq(clients.id, id), eq(clients.organizationId, orgId)))
      .returning();
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ data: row });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
