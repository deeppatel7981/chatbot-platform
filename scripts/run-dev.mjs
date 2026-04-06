#!/usr/bin/env node
/**
 * Load .env.local with override so shell DATABASE_URL (e.g. localhost) does not win over the file.
 * Next.js also skips .env keys when process.env already has them — we set correct values first.
 */
import { config } from "dotenv";
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
config({ path: resolve(root, ".env.local"), override: true });
config({ path: resolve(root, ".env") });

const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev"], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code) => process.exit(code ?? 0));
