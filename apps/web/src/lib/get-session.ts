import { eq } from "drizzle-orm";
import type { Session } from "next-auth";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { getDb } from "@/lib/db/client";
import { organizationMembers, clientPortalAccess } from "@/lib/db/schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function orgIdFromSession(s: Session | null): string | undefined {
  if (!s?.user) return undefined;
  return (s.user as { organizationId?: string }).organizationId;
}

/**
 * NextAuth session (credentials) or Supabase Auth + `organization_members.auth_user_id` bridge.
 */
export async function getAppSession(): Promise<Session | null> {
  const next = await getServerSession(authOptions);
  if (orgIdFromSession(next)) {
    return next;
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return next;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return next;
  }

  try {
    const db = getDb();
    const [member] = await db
      .select()
      .from(organizationMembers)
      .where(eq(organizationMembers.authUserId, user.id))
      .limit(1);

    if (member) {
      const portalRows = await db
        .select({
          clientId: clientPortalAccess.clientId,
          organizationId: clientPortalAccess.organizationId,
        })
        .from(clientPortalAccess)
        .where(eq(clientPortalAccess.authUserId, user.id));
      const portalForOrg = portalRows.filter((r) => r.organizationId === member.organizationId);
      const portalClientIds = [...new Set(portalForOrg.map((r) => r.clientId))];

      const synthetic: Session = {
        expires: new Date(Date.now() + 86400_000).toISOString(),
        user: {
          id: user.id,
          email: user.email ?? "",
          name:
            (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name) ||
            user.email?.split("@")[0] ||
            "",
          organizationId: member.organizationId,
          accessMode: "full",
          portalClientIds,
        } as Session["user"] & { organizationId: string; accessMode: "full"; portalClientIds: string[] },
      };
      return synthetic;
    }

    const portalOnly = await db
      .select({
        clientId: clientPortalAccess.clientId,
        organizationId: clientPortalAccess.organizationId,
      })
      .from(clientPortalAccess)
      .where(eq(clientPortalAccess.authUserId, user.id));

    if (portalOnly.length === 0) {
      return next;
    }

    const orgIds = [...new Set(portalOnly.map((r) => r.organizationId))];
    if (orgIds.length !== 1) {
      return next;
    }

    const syntheticPortal: Session = {
      expires: new Date(Date.now() + 86400_000).toISOString(),
      user: {
        id: user.id,
        email: user.email ?? "",
        name:
          (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name) ||
          user.email?.split("@")[0] ||
          "",
        organizationId: orgIds[0],
        accessMode: "portal",
        portalClientIds: [...new Set(portalOnly.map((r) => r.clientId))],
      } as Session["user"] & { organizationId: string; accessMode: "portal"; portalClientIds: string[] },
    };
    return syntheticPortal;
  } catch {
    return next;
  }
}
