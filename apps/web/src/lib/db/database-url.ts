/**
 * Postgres URI for Drizzle / `pg`. Vercel and templates sometimes use names other than DATABASE_URL.
 */
const URL_KEYS = ["DATABASE_URL", "POSTGRES_URL", "POSTGRES_PRISMA_URL", "SUPABASE_DATABASE_URL"] as const;

export function readDatabaseUrlFromEnv(): string | undefined {
  for (const key of URL_KEYS) {
    const v = process.env[key]?.trim();
    if (v) return v;
  }
  return undefined;
}
