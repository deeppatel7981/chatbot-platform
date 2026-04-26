import { defineConfig } from "drizzle-kit";
import { getDatabaseUrlOrThrow } from "./scripts/load-env";
import { poolConfigFromDatabaseUrl } from "./apps/web/src/lib/db/pg-config";

const c = poolConfigFromDatabaseUrl(getDatabaseUrlOrThrow());

/** Drizzle expects string creds; pg's PoolConfig allows password as a function for IAM rotation. */
const user = typeof c.user === "string" ? c.user : undefined;
const password = typeof c.password === "string" ? c.password : undefined;

export default defineConfig({
  schema: "./apps/web/src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    host: c.host!,
    port: c.port,
    user,
    password,
    database: c.database!,
    ssl: c.ssl,
  },
});
