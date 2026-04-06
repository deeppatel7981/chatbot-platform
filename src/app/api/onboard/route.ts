import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { organizations, clients, auditLogs } from "@/lib/db/schema";
import { getAppSession } from "@/lib/get-session";
import { isMockData } from "@/lib/mock/mode";
import { MOCK_CLIENT_ID, MOCK_WIDGET_PUBLIC_ID } from "@/lib/mock/fixtures";

export async function POST(req: Request) {
  const session = await getAppSession();
  const orgId = session?.user?.organizationId;
  if (!orgId || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));

  if (isMockData()) {
    return NextResponse.json({
      ok: true,
      clientId: MOCK_CLIENT_ID,
      widgetPublicId: MOCK_WIDGET_PUBLIC_ID,
    });
  }
  const businessName = typeof body.businessName === "string" ? body.businessName.trim() : "";
  const industry = typeof body.industry === "string" ? body.industry.trim() : "General";
  const website = typeof body.website === "string" ? body.website.trim() : "";

  if (!businessName) {
    return NextResponse.json({ error: "businessName is required" }, { status: 400 });
  }

  const db = getDb();

  await db
    .update(organizations)
    .set({ name: businessName })
    .where(eq(organizations.id, orgId));

  const [client] = await db
    .insert(clients)
    .values({
      organizationId: orgId,
      name: website ? `${industry}: ${businessName} (${website})` : `${industry}: ${businessName}`,
    })
    .returning();

  await db.insert(auditLogs).values({
    organizationId: orgId,
    userId: session.user.id,
    action: "onboard.complete",
    resource: client.id,
    payload: { industry, website },
  });

  return NextResponse.json({ ok: true, clientId: client.id, widgetPublicId: client.widgetPublicId });
}
