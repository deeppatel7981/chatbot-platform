import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { organizations, users, organizationMembers, auditLogs } from "@/lib/db/schema";
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

async function uniqueSlug(db: ReturnType<typeof getDb>, base: string): Promise<string> {
  let slug = base;
  for (let i = 0; i < 8; i++) {
    const existing = await db.select({ id: organizations.id }).from(organizations).where(eq(organizations.slug, slug)).limit(1);
    if (existing.length === 0) return slug;
    slug = `${base}-${Math.random().toString(36).slice(2, 8)}`;
  }
  return `${base}-${Date.now().toString(36)}`;
}

/**
 * Self-serve org + owner user. Disabled when MOCK_DATA=true (no persistent DB).
 */
export async function POST(req: Request) {
  if (isMockData()) {
    return NextResponse.json(
      {
        error:
          "Account creation requires a real database. Set MOCK_DATA=false and DATABASE_URL, or sign in with any email and password “admin” in demo mode.",
      },
      { status: 400 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const organizationName = typeof body.organizationName === "string" ? body.organizationName.trim() : "";
  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }
  if (organizationName.length < 2) {
    return NextResponse.json({ error: "Workspace name is required" }, { status: 400 });
  }

  const db = getDb();

  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  const baseSlug = slugify(organizationName);
  const slug = await uniqueSlug(db, baseSlug);
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const result = await db.transaction(async (tx) => {
      const [org] = await tx
        .insert(organizations)
        .values({ name: organizationName, slug })
        .returning();

      const [user] = await tx
        .insert(users)
        .values({
          email,
          passwordHash,
          name: fullName || email.split("@")[0] || null,
        })
        .returning();

      await tx.insert(organizationMembers).values({
        organizationId: org.id,
        userId: user.id,
        role: "owner",
      });

      const extra = {
        phone: typeof body.phone === "string" ? body.phone.trim() : undefined,
        businessType: typeof body.businessType === "string" ? body.businessType : undefined,
        teamSize: typeof body.teamSize === "string" ? body.teamSize : undefined,
      };

      await tx.insert(auditLogs).values({
        organizationId: org.id,
        userId: user.id,
        action: "auth.signup",
        resource: org.id,
        payload: { email, organizationName, ...extra },
      });

      return { org, user };
    });

    return NextResponse.json({
      ok: true,
      userId: result.user.id,
      organizationId: result.org.id,
    });
  } catch (e) {
    console.error("[signup]", e);
    return NextResponse.json({ error: "Could not create account. Try again." }, { status: 500 });
  }
}
