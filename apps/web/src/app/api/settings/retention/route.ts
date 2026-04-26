import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { retentionSettings, auditLogs } from "@/lib/db/schema";
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
    return NextResponse.json({ data: { messageRetentionDays: 365 } });
  }

  const db = getDb();
  const [row] = await db.select().from(retentionSettings).where(eq(retentionSettings.organizationId, orgId)).limit(1);

  return NextResponse.json({
    data: {
      messageRetentionDays: row?.messageRetentionDays ?? 365,
    },
  });
}

export async function PATCH(req: Request) {
  const session = await getAppSession();
  const blocked = requireFullOrgApi(session);
  if (blocked) return blocked;
  const orgId = session?.user?.organizationId;
  if (!orgId || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const days = typeof body.messageRetentionDays === "number" ? body.messageRetentionDays : parseInt(String(body.messageRetentionDays), 10);
  if (!Number.isFinite(days) || days < 1 || days > 3650) {
    return NextResponse.json({ error: "messageRetentionDays must be between 1 and 3650" }, { status: 400 });
  }

  if (isMockData()) {
    return NextResponse.json({ ok: true, messageRetentionDays: days });
  }

  const db = getDb();
  const [existing] = await db
    .select()
    .from(retentionSettings)
    .where(eq(retentionSettings.organizationId, orgId))
    .limit(1);
  if (existing) {
    await db
      .update(retentionSettings)
      .set({ messageRetentionDays: days, updatedAt: new Date() })
      .where(eq(retentionSettings.organizationId, orgId));
  } else {
    await db.insert(retentionSettings).values({ organizationId: orgId, messageRetentionDays: days });
  }

  await db.insert(auditLogs).values({
    organizationId: orgId,
    userId: session.user.id,
    action: "retention.update",
    payload: { messageRetentionDays: days },
  });

  return NextResponse.json({ ok: true, messageRetentionDays: days });
}
