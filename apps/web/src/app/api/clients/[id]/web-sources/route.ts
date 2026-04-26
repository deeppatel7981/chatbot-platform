import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { clients, clientWebSources } from "@/lib/db/schema";
import { assertFetchableHttpUrl } from "@/lib/web-fetch";
import { ingestWebSourceNow } from "@/lib/web-source-ingest";
import { assertPortalClientAllowed, getAccessFromSession } from "@/lib/access-scope";
import { getAppSession } from "@/lib/get-session";
import { requireFullOrgApi } from "@/lib/require-full-org-api";
import { isMockData } from "@/lib/mock/mode";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAppSession();
  const orgId = session?.user?.organizationId;
  const scope = getAccessFromSession(session);
  if (!orgId || !scope) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: clientId } = await params;
  if (!assertPortalClientAllowed(scope, clientId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (isMockData()) {
    return NextResponse.json({ data: [] });
  }

  const db = getDb();
  const [clientRow] = await db
    .select({ id: clients.id })
    .from(clients)
    .where(and(eq(clients.id, clientId), eq(clients.organizationId, orgId)))
    .limit(1);
  if (!clientRow) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const rows = await db
    .select({
      id: clientWebSources.id,
      url: clientWebSources.url,
      enabled: clientWebSources.enabled,
      refreshOnNewConversation: clientWebSources.refreshOnNewConversation,
      createdAt: clientWebSources.createdAt,
      updatedAt: clientWebSources.updatedAt,
    })
    .from(clientWebSources)
    .where(eq(clientWebSources.clientId, clientId));

  return NextResponse.json({ data: rows });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAppSession();
  const blocked = requireFullOrgApi(session);
  if (blocked) return blocked;
  const orgId = session?.user?.organizationId;
  const scope = getAccessFromSession(session);
  if (!orgId || !scope) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: clientId } = await params;
  if (!assertPortalClientAllowed(scope, clientId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const rawUrl = typeof body.url === "string" ? body.url.trim() : "";
  const refreshOnNewConversation = body.refreshOnNewConversation !== false;

  if (!rawUrl) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  let normalized: string;
  try {
    normalized = assertFetchableHttpUrl(rawUrl).toString();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid URL";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  if (isMockData()) {
    return NextResponse.json({
      data: {
        id: "00000000-0000-4000-8000-00000000e001",
        url: normalized,
        enabled: true,
        refreshOnNewConversation,
        chunkCount: 0,
      },
    });
  }

  const db = getDb();
  const [clientRow] = await db
    .select({ id: clients.id })
    .from(clients)
    .where(and(eq(clients.id, clientId), eq(clients.organizationId, orgId)))
    .limit(1);
  if (!clientRow) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const [row] = await db
      .insert(clientWebSources)
      .values({
        clientId,
        url: normalized,
        enabled: true,
        refreshOnNewConversation,
      })
      .returning();

    const { chunkCount } = await ingestWebSourceNow(db, {
      clientId,
      webSourceId: row.id,
      url: row.url,
    });

    return NextResponse.json({ data: { ...row, chunkCount } });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/unique|duplicate/i.test(msg)) {
      return NextResponse.json({ error: "That URL is already added for this client" }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
