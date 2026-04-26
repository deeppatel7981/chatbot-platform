import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { contacts } from "@/lib/db/schema";
import { insertContactRls, listContactsRls } from "@/lib/data/supabase-queries";
import { getAppSession } from "@/lib/get-session";
import { requireFullOrgApi } from "@/lib/require-full-org-api";
import { isMockData } from "@/lib/mock/mode";
import { mockContactsList } from "@/lib/mock/fixtures";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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
      return NextResponse.json({ data: mockContactsList });
    }

    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        try {
          const data = await listContactsRls(supabase);
          return NextResponse.json({ data });
        } catch {
          /* fall through to Drizzle (RLS off, PostgREST error, or legacy NextAuth-only user) */
        }
      }
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
    const blocked = requireFullOrgApi(session);
    if (blocked) return blocked;
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

    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        try {
          const row = await insertContactRls(supabase, {
            organization_id: orgId,
            name: name || null,
            phone,
            email,
            source,
          });
          return NextResponse.json({ data: row });
        } catch {
          /* fall through to Drizzle */
        }
      }
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
