import { defineConfig } from "drizzle-kit";
import { getDatabaseUrlOrThrow } from "./scripts/load-env";
import { poolConfigFromDatabaseUrl } from "./src/lib/db/pg-config";

const c = poolConfigFromDatabaseUrl(getDatabaseUrlOrThrow());

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    host: c.host!,
    port: c.port,
    user: c.user,
    password: c.password,
    database: c.database!,
    ssl: c.ssl,
  },
});
