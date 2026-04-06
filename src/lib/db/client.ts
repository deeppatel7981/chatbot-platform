import { config as loadEnvFile } from "dotenv";
import { resolve } from "node:path";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { debugDbHost } from "@/lib/debug";
import * as schema from "./schema";
import { poolConfigFromDatabaseUrl } from "./pg-config";

let pool: Pool | null = null;
let devEnvLoaded = false;

/**
 * Next.js does not override env vars already set in the shell (even if empty).
 * `npm run dev` preloads .env.local with override; `next dev` alone may not.
 * In development, reload .env.local so DATABASE_URL from the file wins.
 */
function resolveDatabaseUrl(): string | undefined {
  let url = process.env.DATABASE_URL?.trim();
  if (url) return url;
  if (process.env.NODE_ENV !== "production" && !devEnvLoaded) {
    devEnvLoaded = true;
    loadEnvFile({ path: resolve(process.cwd(), ".env.local"), override: true });
    url = process.env.DATABASE_URL?.trim();
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
