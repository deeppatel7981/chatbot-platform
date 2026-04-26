/**
 * Vercel sets VERCEL_URL (no scheme). NextAuth needs NEXTAUTH_URL (full origin) for
 * cookies, callbacks, and middleware. Call once at module load on server/edge.
 */
export function ensureNextAuthUrlFromVercel(): void {
  if (typeof process === "undefined" || !process.env) return;
  if (process.env.NEXTAUTH_URL) return;
  const v = process.env.VERCEL_URL;
  if (!v) return;
  process.env.NEXTAUTH_URL = v.startsWith("http") ? v : `https://${v}`;
}
