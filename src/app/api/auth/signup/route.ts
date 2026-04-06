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

  const baseSlug = slugify(organizationName);
  let passwordHash: string;
  try {
    passwordHash = await bcrypt.hash(password, 10);
  } catch (e) {
    console.error("[signup] bcrypt", e);
    return NextResponse.json({ error: "Could not create account. Try again." }, { status: 500 });
  }

  try {
    const db = getDb();

    const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const slug = await uniqueSlug(db, baseSlug);

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
    const message = e instanceof Error ? e.message : String(e);
    const dev = process.env.NODE_ENV === "development";
    const details = dev ? message : undefined;

    if (message.includes("DATABASE_URL is not set")) {
      const error = process.env.VERCEL
        ? "Database is not configured. In Vercel: Project → Settings → Environment Variables → add DATABASE_URL (Postgres connection string), then redeploy."
        : "Database is not configured. Add DATABASE_URL to .env.local at the project root, run npm run dev from that folder, or run unset DATABASE_URL if your shell has it set empty.";
      return NextResponse.json({ error, details }, { status: 503 });
    }
    if (
      message.includes("ECONNREFUSED") ||
      message.includes("ETIMEDOUT") ||
      message.includes("getaddrinfo") ||
      message.includes("ENOTFOUND")
    ) {
      return NextResponse.json(
        {
          error: "Cannot connect to the database. Check DATABASE_URL and that Postgres is reachable.",
          details,
        },
        { status: 503 }
      );
    }
    const code = typeof e === "object" && e !== null && "code" in e ? String((e as { code?: string }).code) : "";
    if (code === "42P01" || message.includes("does not exist") && message.includes("relation")) {
      return NextResponse.json(
        { error: "Database schema is missing. Run: npm run db:push", details },
        { status: 500 }
      );
    }
    if (code === "23505" || message.includes("unique constraint")) {
      return NextResponse.json(
        { error: "An account or workspace with this information already exists.", details },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Could not create account. Try again.", details },
      { status: 500 }
    );
  }
}
