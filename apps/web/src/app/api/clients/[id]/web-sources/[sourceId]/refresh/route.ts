import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { clients, clientWebSources } from "@/lib/db/schema";
import { ingestWebSourceNow } from "@/lib/web-source-ingest";
import { assertPortalClientAllowed, getAccessFromSession } from "@/lib/access-scope";
import { getAppSession } from "@/lib/get-session";
import { requireFullOrgApi } from "@/lib/require-full-org-api";
import { isMockData } from "@/lib/mock/mode";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string; sourceId: string }> }) {
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
    return NextResponse.json({ data: { chunkCount: 0 } });
  }

  const db = getDb();
  const [row] = await db
    .select({ id: clientWebSources.id, url: clientWebSources.url })
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

  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const { chunkCount } = await ingestWebSourceNow(db, {
      clientId,
      webSourceId: row.id,
      url: row.url,
    });
    return NextResponse.json({ data: { chunkCount } });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
