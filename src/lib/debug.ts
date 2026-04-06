/**
 * Opt-in server logging. Set DEBUG=true in .env.local or Vercel (disable after troubleshooting).
 * Does not log secrets; use debugDbHost() for hostname-only DB hints.
 */
export function isDebugEnabled(): boolean {
  return process.env.DEBUG === "true";
}

export function debug(...args: unknown[]): void {
  if (!isDebugEnabled()) return;
  console.debug("[chatbot-platform]", ...args);
}

/** Logs Postgres host:port only (never password). */
export function debugDbHost(connectionString: string, label = "db"): void {
  if (!isDebugEnabled()) return;
  try {
    const u = new URL(
      connectionString.replace(/^postgresql:/i, "http:").replace(/^postgres:/i, "http:")
    );
    debug(label, { host: u.hostname, port: u.port || "5432", database: u.pathname.replace(/^\//, "").split("?")[0] || "" });
  } catch {
    debug(label, "could not parse DATABASE_URL for host logging");
  }
}
