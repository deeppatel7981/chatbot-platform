import { config as loadEnv } from "dotenv";
import { existsSync } from "fs";
import { dirname, join } from "path";

/** Walk up from cwd until we find the repo root (has package.json + drizzle.config.ts). */
export function resolveProjectRoot(): string {
  let dir = process.cwd();
  for (let i = 0; i < 40; i++) {
    if (
      existsSync(join(dir, "package.json")) &&
      existsSync(join(dir, "drizzle.config.ts"))
    ) {
      return dir;
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return process.cwd();
}

export function loadProjectEnv(): void {
  const root = resolveProjectRoot();
  // .env.local must win over inherited shell vars (e.g. DATABASE_URL left from another project).
  loadEnv({ path: join(root, ".env.local"), override: true });
  loadEnv({ path: join(root, ".env") });
}

export function getDatabaseUrlOrThrow(): string {
  loadProjectEnv();
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error(
      "DATABASE_URL is missing or empty in .env.local at the project root.\n" +
        "Paste the RDS URL from Secrets Manager, e.g.:\n" +
        "  aws secretsmanager get-secret-value --secret-id chatbot-platform/database-url-dev --query SecretString --output text --region ap-south-1\n" +
        "If the client fails SSL, append ?sslmode=require to the URL."
    );
  }
  return url;
}
