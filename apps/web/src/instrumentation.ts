import { ensureNextAuthUrlFromVercel } from "@/lib/vercel-env";

/** Runs once per Node server process (API routes, RSC); pairs with middleware bootstrap for Edge. */
export function register() {
  ensureNextAuthUrlFromVercel();
}
