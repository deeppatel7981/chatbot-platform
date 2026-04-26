import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { clients, clientWebSources } from "@/lib/db/schema";
import { deleteChunksForWebSource } from "@/lib/web-source-ingest";
import { assertPortalClientAllowed, getAccessFromSession } from "@/lib/access-scope";
import { getAppSession } from "@/lib/get-session";
import { requireFullOrgApi } from "@/lib/require-full-org-api";
import { isMockData } from "@/lib/mock/mode";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string; sourceId: string }> }) {
  const session = await getAppSession();
  const blocked = requireFullOrgApi(session);
  if (blocked) return blocked;
  const orgId = session?.user?.organizationId;
  const scope = getAccessFromSession(session);
  if (!orgId || !scope) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: clientId, sourceId } = await params;
  if (!assertPortalClientAllowed(scope, clientId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (isMockData()) {
    return NextResponse.json({ ok: true });
  }

  const db = getDb();
  const [src] = await db
    .select({ id: clientWebSources.id })
    .from(clientWebSources)
    .innerJoin(clients, eq(clientWebSources.clientId, clients.id))
    .where(
      and(
        eq(clientWebSources.id, sourceId),
        eq(clientWebSources.clientId, clientId),
        eq(clients.organizationId, orgId)
      )
    )
    .limit(1);

  if (!src) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await deleteChunksForWebSource(db, clientId, sourceId);
  await db.delete(clientWebSources).where(eq(clientWebSources.id, sourceId));

  return NextResponse.json({ ok: true });
}
