import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { clients } from "@/lib/db/schema";
import { listDocumentRowsForClient } from "@/lib/db/document-chunks";
import { getAppSession } from "@/lib/get-session";
import { isMockData } from "@/lib/mock/mode";
import { mockDocumentRows } from "@/lib/mock/fixtures";

export async function GET(req: NextRequest) {
  const session = await getAppSession();
  const orgId = session?.user?.organizationId;
  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clientId = req.nextUrl.searchParams.get("clientId");
  if (!clientId) {
    return NextResponse.json({ error: "Missing clientId" }, { status: 400 });
  }

  if (isMockData()) {
    return NextResponse.json({ data: mockDocumentRows });
  }

  const db = getDb();
  const [c] = await db
    .select()
    .from(clients)
    .where(and(eq(clients.id, clientId), eq(clients.organizationId, orgId)))
    .limit(1);
  if (!c) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const rows = await listDocumentRowsForClient(clientId);
  return NextResponse.json({ data: rows });
}
