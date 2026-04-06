import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { contacts } from "@/lib/db/schema";
import { getAppSession } from "@/lib/get-session";
import { isMockData } from "@/lib/mock/mode";
import { mockContactsList } from "@/lib/mock/fixtures";

export async function GET() {
  try {
    const session = await getAppSession();
    const orgId = session?.user?.organizationId;
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (isMockData()) {
      return NextResponse.json({ data: mockContactsList });
    }

    const db = getDb();
    const data = await db
      .select()
      .from(contacts)
      .where(eq(contacts.organizationId, orgId))
      .orderBy(desc(contacts.createdAt));

    return NextResponse.json({ data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAppSession();
    const orgId = session?.user?.organizationId;
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as Record<string, unknown>;
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() || null : null;
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() || null : null;
    const source = typeof body.source === "string" ? body.source.trim() || null : null;

    if (!name && !phone && !email) {
      return NextResponse.json({ error: "Provide at least one of name, phone, or email" }, { status: 400 });
    }

    if (isMockData()) {
      return NextResponse.json({
        data: {
          id: randomUUID(),
          organizationId: orgId,
          phone,
          email,
          name: name || null,
          source,
          externalId: null,
          createdAt: new Date().toISOString(),
        },
      });
    }

    const db = getDb();
    const [row] = await db
      .insert(contacts)
      .values({
        organizationId: orgId,
        name: name || null,
        phone,
        email,
        source: source ?? undefined,
      })
      .returning();

    return NextResponse.json({ data: row });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
