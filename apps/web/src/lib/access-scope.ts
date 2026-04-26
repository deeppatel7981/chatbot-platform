import type { Session } from "next-auth";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { clients } from "@/lib/db/schema";

export type AccessMode = "full" | "portal";

export type AccessScope = {
  organizationId: string;
  mode: AccessMode;
  /** Client IDs this login may use in portal mode (subset of org). */
  portalClientIds: string[];
};

export function getAccessFromSession(session: Session | null): AccessScope | null {
  const orgId = session?.user?.organizationId;
  if (!orgId) return null;
  const u = session.user as Session["user"] & { accessMode?: AccessMode; portalClientIds?: string[] };
  const mode: AccessMode = u.accessMode === "portal" ? "portal" : "full";
  const portalClientIds = Array.isArray(u.portalClientIds) ? u.portalClientIds : [];
  return { organizationId: orgId, mode, portalClientIds };
}

export function isPortalOnly(scope: AccessScope): boolean {
  return scope.mode === "portal";
}

/** Portal users may not call org-wide admin APIs (create client, team, etc.). */
export function requireFullOrg(scope: AccessScope | null): boolean {
  return scope?.mode === "full";
}

export function assertPortalClientAllowed(scope: AccessScope, clientId: string): boolean {
  if (scope.mode === "full") return true;
  return scope.portalClientIds.includes(clientId);
}

export type ClientRow = typeof clients.$inferSelect;

/** Strip secrets for merchant portal JSON. */
export function clientJsonForPortal(row: ClientRow) {
  return {
    id: row.id,
    organizationId: row.organizationId,
    name: row.name,
    replyLanguage: row.replyLanguage,
    widgetPublicId: row.widgetPublicId,
    createdAt: row.createdAt,
    whatsappConnected: Boolean(row.whatsappPhoneNumberId?.trim() && row.whatsappAccessToken?.trim()),
  };
}

/**
 * Server-side: client belongs to org and (full access OR portal allow-list).
 */
export async function validatePortalClientRoute(
  scope: AccessScope,
  clientId: string
): Promise<{ ok: true; clientName: string } | { ok: false }> {
  if (!assertPortalClientAllowed(scope, clientId)) {
    return { ok: false };
  }
  const db = getDb();
  const [row] = await db
    .select({ name: clients.name })
    .from(clients)
    .where(and(eq(clients.id, clientId), eq(clients.organizationId, scope.organizationId)))
    .limit(1);
  if (!row) return { ok: false };
  return { ok: true, clientName: row.name };
}
