import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { clients, auditLogs } from "@/lib/db/schema";
import { getAppSession } from "@/lib/get-session";
import { isMockData } from "@/lib/mock/mode";
import { mockClients, mockNewClient } from "@/lib/mock/fixtures";

export async function POST(req: Request) {
  try {
    const session = await getAppSession();
    const orgId = session?.user?.organizationId;
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    if (isMockData()) {
      const name = typeof body.name === "string" ? body.name.trim() : "";
      if (!name) {
        return NextResponse.json({ error: "name is required" }, { status: 400 });
      }
      return NextResponse.json({ data: mockNewClient(name) });
    }
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const db = getDb();
    const [row] = await db
      .insert(clients)
      .values({
        organizationId: orgId,
        name,
        whatsappPhoneNumberId: body.whatsappPhoneNumberId ?? null,
        whatsappAccessToken: body.whatsappAccessToken ?? null,
        whatsappVerifyToken: body.whatsappVerifyToken ?? null,
      })
      .returning();

    await db.insert(auditLogs).values({
      organizationId: orgId,
      userId: session.user.id,
      action: "client.create",
      resource: row.id,
      payload: { name },
    });

    return NextResponse.json({ data: row });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getAppSession();
    const orgId = session?.user?.organizationId;
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (isMockData()) {
      return NextResponse.json({ data: mockClients });
    }

    const db = getDb();
    const data = await db
      .select()
      .from(clients)
      .where(eq(clients.organizationId, orgId))
      .orderBy(desc(clients.createdAt));

    return NextResponse.json({ data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
