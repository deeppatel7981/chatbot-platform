import { Pool } from "pg";
import { poolConfigFromDatabaseUrl } from "../src/lib/db/pg-config";
import { getDatabaseUrlOrThrow } from "./load-env";

async function main() {
  const pool = new Pool(poolConfigFromDatabaseUrl(getDatabaseUrlOrThrow()));
  try {
    await pool.query("CREATE EXTENSION IF NOT EXISTS vector");
    console.log("pgvector extension enabled (vector type is available).");
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
