import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { organizations } from "@/lib/db/schema";
import { getAppSession } from "@/lib/get-session";
import { isMockData } from "@/lib/mock/mode";
import { mockWorkspace } from "@/lib/mock/fixtures";

export async function GET() {
  try {
    const session = await getAppSession();
    const orgId = session?.user?.organizationId;
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (isMockData()) {
      return NextResponse.json({ data: mockWorkspace });
    }

    const db = getDb();
    const [row] = await db.select().from(organizations).where(eq(organizations.id, orgId)).limit(1);
    if (!row) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    return NextResponse.json({ data: row });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getAppSession();
    const orgId = session?.user?.organizationId;
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as Record<string, unknown>;

    if (isMockData()) {
      return NextResponse.json({
        data: {
          ...mockWorkspace,
          name: typeof body.name === "string" ? body.name.trim() || mockWorkspace.name : mockWorkspace.name,
          openaiChatModel:
            body.openaiChatModel === null
              ? null
              : typeof body.openaiChatModel === "string"
                ? body.openaiChatModel.trim() || null
                : mockWorkspace.openaiChatModel,
        },
      });
    }

    const db = getDb();
    const patch: Partial<typeof organizations.$inferInsert> = {};
    if (typeof body.name === "string") patch.name = body.name.trim();
    if (body.openaiChatModel === null) patch.openaiChatModel = null;
    if (typeof body.openaiChatModel === "string") patch.openaiChatModel = body.openaiChatModel.trim() || null;

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "No valid fields" }, { status: 400 });
    }

    const [row] = await db.update(organizations).set(patch).where(eq(organizations.id, orgId)).returning();
    if (!row) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    return NextResponse.json({ data: row });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
