import { NextResponse } from "next/server";
import { readDatabaseUrlFromEnv } from "@/lib/db/database-url";
import { ensureNextAuthUrlFromVercel } from "@/lib/vercel-env";

/**
 * Safe production diagnostics (no secrets). Use when Vercel misbehaves:
 * open GET /api/deployment-check on your deployment URL.
 */
export async function GET() {
  ensureNextAuthUrlFromVercel();
  const nextAuthUrl = process.env.NEXTAUTH_URL ?? null;
  const hasSecret = Boolean(process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET);
  const hasDb = Boolean(readDatabaseUrlFromEnv());
  const mockOn = process.env.MOCK_DATA === "true";
  const productionDataPath = !mockOn && hasDb;
  const openAiConfigured = Boolean(process.env.OPENAI_API_KEY?.trim());
  const whatsappSignatureVerification = Boolean(process.env.WHATSAPP_APP_SECRET?.trim());

  let databaseReachable: boolean | null = null;
  if (hasDb && !mockOn) {
    try {
      const { getPool } = await import("@/lib/db/client");
      await Promise.race([
        getPool().query("SELECT 1 as ok"),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 4000)),
      ]);
      databaseReachable = true;
    } catch {
      databaseReachable = false;
    }
  }

  return NextResponse.json({
    ok: true,
    time: new Date().toISOString(),
    /** True when env is set for real DB-backed app (not demo mock mode). */
    productionDataMode: productionDataPath,
    checks: {
      vercelUrl: process.env.VERCEL_URL ?? null,
      nextAuthUrl,
      nextAuthUrlDerivedFromVercel: Boolean(process.env.VERCEL_URL && nextAuthUrl),
      hasNextAuthSecret: hasSecret,
      hasDatabaseUrl: hasDb,
      databaseReachable,
      openAiApiKeyConfigured: openAiConfigured,
      whatsappWebhookSignatureVerificationEnabled: whatsappSignatureVerification,
      databaseUrlEnvKeysChecked: ["DATABASE_URL", "POSTGRES_URL", "POSTGRES_PRISMA_URL", "SUPABASE_DATABASE_URL"],
      mockData: mockOn,
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
      process.env.VERCEL_ENV === "production" && !hasSecret
        ? "Production: set NEXTAUTH_SECRET (or AUTH_SECRET) in Vercel."
        : null,
      process.env.VERCEL_ENV === "production" && !hasDb
        ? "Production: set DATABASE_URL (or POSTGRES_URL) to your Postgres URI for the Production environment, then Redeploy."
        : null,
      databaseReachable === false
        ? "Database URL is set but SELECT 1 failed or timed out — check network, SSL, and credentials."
        : null,
      !openAiConfigured && !mockOn
        ? "OPENAI_API_KEY is not set — automated replies will fall back to handoff messaging until configured."
        : null,
      !whatsappSignatureVerification && !mockOn
        ? "WHATSAPP_APP_SECRET is not set — Meta webhook POSTs are not signature-verified (set in production)."
        : null,
    ].filter(Boolean),
  });
}
