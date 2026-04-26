import { NextResponse } from "next/server";
import { readDatabaseUrlFromEnv } from "@/lib/db/database-url";

/** No DB required. With DEBUG=true, adds non-secret deploy hints (Vercel env, region). */
export async function GET() {
  const body: Record<string, unknown> = {
    ok: true,
    service: "chatbot-platform",
    time: new Date().toISOString(),
  };
  if (process.env.DEBUG === "true") {
    body.debug = {
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV ?? null,
      vercelRegion: process.env.VERCEL_REGION ?? null,
      hasDatabaseUrl: Boolean(readDatabaseUrlFromEnv()),
      hasNextAuthSecret: Boolean(process.env.NEXTAUTH_SECRET),
    };
  }
  return NextResponse.json(body);
}
