import { config as loadEnvFile } from "dotenv";
import { resolve } from "node:path";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { readDatabaseUrlFromEnv } from "@/lib/db/database-url";
import { debugDbHost } from "@/lib/debug";
import * as schema from "./schema";
import { poolConfigFromDatabaseUrl } from "./pg-config";

let pool: Pool | null = null;
let localEnvLoaded = false;

/**
 * Next.js does not override env vars already set in the shell (even if empty).
 * `npm run dev` preloads .env.local with override; plain `next dev` may not.
 *
 * When not on Vercel, also load `.env.local` here (including for `next start` where
 * NODE_ENV is production) so DATABASE_URL is available if the shell blocked it.
 * On Vercel, `VERCEL` is set — use dashboard env vars only (no repo .env on disk).
 */
function resolveDatabaseUrl(): string | undefined {
  let url = readDatabaseUrlFromEnv();
  if (url) return url;
  if (localEnvLoaded) return undefined;
  localEnvLoaded = true;

  if (!process.env.VERCEL) {
    loadEnvFile({ path: resolve(process.cwd(), ".env.local"), override: true });
    url = readDatabaseUrlFromEnv();
    if (url) return url;
    loadEnvFile({ path: resolve(process.cwd(), ".env"), override: true });
    url = readDatabaseUrlFromEnv();
  }
  return url;
}

export function getPool(): Pool {
  if (pool) return pool;
  const url = resolveDatabaseUrl();
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  debugDbHost(url, "pool");
  pool = new Pool({ ...poolConfigFromDatabaseUrl(url), max: 10 });
  return pool;
}

export function getDb() {
  return drizzle(getPool(), { schema });
}

export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
