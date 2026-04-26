import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db/client";
import { organizations, organizationMembers, profiles } from "@/lib/db/schema";
import { isMockData } from "@/lib/mock/mode";

function slugify(name: string): string {
  const s = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  return s || "workspace";
}

async function uniqueSlug(base: string): Promise<string> {
  const db = getDb();
  let slug = base;
  for (let i = 0; i < 8; i++) {
    const existing = await db.select({ id: organizations.id }).from(organizations).where(eq(organizations.slug, slug)).limit(1);
    if (existing.length === 0) return slug;
    slug = `${base}-${Math.random().toString(36).slice(2, 8)}`;
  }
  return `${base}-${Date.now().toString(36)}`;
}

/**
 * After Supabase Auth signUp/signIn, create profile + default organization (server-side, trusted DB).
 */
export async function POST(req: Request) {
  if (isMockData()) {
    return NextResponse.json({ error: "Not available in mock mode" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const organizationName = typeof body.organizationName === "string" ? body.organizationName.trim() : "";
  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";

  if (organizationName.length < 2) {
    return NextResponse.json({ error: "Workspace name is required" }, { status: 400 });
  }

  const db = getDb();
  const userId = user.id;
  const email = (user.email ?? "").toLowerCase();

  const [existingMember] = await db
    .select({ id: organizationMembers.id })
    .from(organizationMembers)
    .where(eq(organizationMembers.authUserId, userId))
    .limit(1);

  if (existingMember) {
    return NextResponse.json({ ok: true, alreadyCompleted: true });
  }

  await db
    .insert(profiles)
    .values({
      id: userId,
      email: email || "unknown@user.local",
      fullName: fullName || null,
    })
    .onConflictDoNothing();

  await db
    .update(profiles)
    .set({ email: email || "unknown@user.local", fullName: fullName || null })
    .where(eq(profiles.id, userId));

  const baseSlug = slugify(organizationName);
  const slug = await uniqueSlug(baseSlug);

  const result = await db.transaction(async (tx) => {
    const [org] = await tx.insert(organizations).values({ name: organizationName, slug }).returning();
    await tx.insert(organizationMembers).values({
      organizationId: org.id,
      userId: null,
      authUserId: userId,
      role: "owner",
    });
    return org;
  });

  return NextResponse.json({ ok: true, organizationId: result.id });
}
