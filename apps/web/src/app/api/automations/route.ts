import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { ensureDefaultAutomations } from "@/lib/automation-defaults";
import { getDb } from "@/lib/db/client";
import { automations } from "@/lib/db/schema";
import { getAppSession } from "@/lib/get-session";
import { requireFullOrgApi } from "@/lib/require-full-org-api";
import { isMockData } from "@/lib/mock/mode";
import { mockAutomationsList } from "@/lib/mock/fixtures";

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
      return NextResponse.json({ data: mockAutomationsList });
    }

    const db = getDb();
    await ensureDefaultAutomations(db, orgId);
    const data = await db
      .select()
      .from(automations)
      .where(eq(automations.organizationId, orgId))
      .orderBy(asc(automations.key));

    return NextResponse.json({ data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
