import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { automations } from "@/lib/db/schema";
import { getAppSession } from "@/lib/get-session";
import { isMockData } from "@/lib/mock/mode";
import { mockAutomationsList } from "@/lib/mock/fixtures";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAppSession();
  const orgId = session?.user?.organizationId;
  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = (await req.json()) as Record<string, unknown>;

  if (isMockData()) {
    const row = mockAutomationsList.find((a) => a.id === id);
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const next = {
      ...row,
      enabled: typeof body.enabled === "boolean" ? body.enabled : row.enabled,
      name: typeof body.name === "string" ? body.name.trim() : row.name,
      config:
        body.config && typeof body.config === "object" && body.config !== null
          ? (body.config as Record<string, unknown>)
          : row.config,
      updatedAt: new Date().toISOString(),
    };
    return NextResponse.json({ data: next });
  }

  try {
    const db = getDb();
    const patch: Partial<typeof automations.$inferInsert> = { updatedAt: new Date() };
    if (typeof body.enabled === "boolean") patch.enabled = body.enabled;
    if (typeof body.name === "string") patch.name = body.name.trim();
    if (body.config && typeof body.config === "object" && body.config !== null) {
      patch.config = body.config as Record<string, unknown>;
    }

    const [row] = await db
      .update(automations)
      .set(patch)
      .where(and(eq(automations.id, id), eq(automations.organizationId, orgId)))
      .returning();
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ data: row });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
