import { NextResponse } from "next/server";
import { count } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { isMockData } from "@/lib/mock/mode";

/**
 * Quick check: is DATABASE_URL valid and is there at least one user? Helps debug failed logins.
 */
export async function GET() {
  if (isMockData()) {
    return NextResponse.json({
      ok: true,
      database: "mock",
      userCount: 1,
      hint: "MOCK_DATA=true — no Postgres. Login: any email + password admin",
    });
  }
  try {
    const db = getDb();
    const [row] = await db.select({ n: count() }).from(users);
    const userCount = Number(row?.n ?? 0);
    return NextResponse.json({
      ok: true,
      database: "connected",
      userCount,
      hint:
        userCount === 0
          ? "No users in DB — run: npm run db:push && npm run db:seed"
          : "Users exist — use admin@example.com / admin unless you changed SEED_*",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      {
        ok: false,
        database: "error",
        error: message,
        hint: "Set DATABASE_URL in .env.local and ensure Postgres is running (with pgvector).",
      },
      { status: 503 }
    );
  }
}
