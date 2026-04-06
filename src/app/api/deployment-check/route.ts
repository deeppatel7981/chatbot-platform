import { NextResponse } from "next/server";
import { ensureNextAuthUrlFromVercel } from "@/lib/vercel-env";

/**
 * Safe production diagnostics (no secrets). Use when Vercel misbehaves:
 * open GET /api/deployment-check on your deployment URL.
 */
export async function GET() {
  ensureNextAuthUrlFromVercel();
  const nextAuthUrl = process.env.NEXTAUTH_URL ?? null;
  return NextResponse.json({
    ok: true,
    time: new Date().toISOString(),
    checks: {
      vercelUrl: process.env.VERCEL_URL ?? null,
      nextAuthUrl,
      nextAuthUrlDerivedFromVercel: Boolean(process.env.VERCEL_URL && nextAuthUrl),
      hasNextAuthSecret: Boolean(process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET),
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
      mockData: process.env.MOCK_DATA === "true",
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV ?? null,
    },
    hints: [
      !nextAuthUrl
        ? "Set NEXTAUTH_URL to https://<your-project>.vercel.app (or rely on VERCEL_URL — we auto-fill when VERCEL_URL is set)."
        : null,
      !(process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET)
        ? "Set NEXTAUTH_SECRET in Vercel Production env."
        : null,
      process.env.MOCK_DATA === "true"
        ? "MOCK_DATA=true is for local demo only; set MOCK_DATA=false on Vercel for real login."
        : null,
    ].filter(Boolean),
  });
}
