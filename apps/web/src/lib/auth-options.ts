import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { ensureNextAuthUrlFromVercel } from "@/lib/vercel-env";
import { getDb } from "@/lib/db/client";

ensureNextAuthUrlFromVercel();
import { users, organizationMembers, clientPortalAccess } from "@/lib/db/schema";
import { isMockData } from "@/lib/mock/mode";
import { MOCK_ORG_ID, MOCK_USER_ID } from "@/lib/mock/fixtures";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const email = credentials?.username?.trim().toLowerCase();
          const password = credentials?.password ?? "";
          if (!email || !password) return null;

          if (isMockData()) {
            if (password !== "admin") return null;
            return {
              id: MOCK_USER_ID,
              email,
              name: email.split("@")[0] || "User",
              organizationId: MOCK_ORG_ID,
              accessMode: "full" as const,
              portalClientIds: [] as string[],
            };
          }

          const db = getDb();
          const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
          if (!user) return null;

          const ok = await bcrypt.compare(password, user.passwordHash);
          if (!ok) return null;

          const [membership] = await db
            .select()
            .from(organizationMembers)
            .where(eq(organizationMembers.userId, user.id))
            .limit(1);

          const portalRows = await db
            .select({
              clientId: clientPortalAccess.clientId,
              organizationId: clientPortalAccess.organizationId,
            })
            .from(clientPortalAccess)
            .where(eq(clientPortalAccess.userId, user.id));

          const portalForOrg = membership
            ? portalRows.filter((r) => r.organizationId === membership.organizationId)
            : portalRows;
          const portalClientIds = [...new Set(portalForOrg.map((r) => r.clientId))];

          if (membership) {
            return {
              id: user.id,
              email: user.email,
              name: user.name ?? user.email,
              organizationId: membership.organizationId,
              accessMode: "full" as const,
              portalClientIds,
            };
          }

          if (portalRows.length > 0) {
            const orgIds = [...new Set(portalRows.map((r) => r.organizationId))];
            if (orgIds.length !== 1) {
              console.error("[auth] portal user spans multiple organizations — fix client_portal_access rows");
              return null;
            }
            return {
              id: user.id,
              email: user.email,
              name: user.name ?? user.email,
              organizationId: orgIds[0],
              accessMode: "portal" as const,
              portalClientIds: [...new Set(portalRows.map((r) => r.clientId))],
            };
          }

          return null;
        } catch (err) {
          console.error("[auth] authorize failed:", err);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  // Required for JWT sessions; set NEXTAUTH_SECRET in production.
  secret:
    process.env.NEXTAUTH_SECRET ||
    (process.env.NODE_ENV === "development" ? "local-dev-only-set-nextauth-secret-in-env" : undefined),
  callbacks: {
    async jwt({ token, user }) {
      if (user && "organizationId" in user) {
        const u = user as {
          organizationId: string;
          accessMode?: "full" | "portal";
          portalClientIds?: string[];
        };
        token.organizationId = u.organizationId;
        token.sub = user.id;
        token.accessMode = u.accessMode ?? "full";
        token.portalClientIds = u.portalClientIds ?? [];
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.organizationId = token.organizationId as string;
        session.user.accessMode = (token.accessMode as "full" | "portal" | undefined) ?? "full";
        session.user.portalClientIds = (token.portalClientIds as string[] | undefined) ?? [];
      }
      return session;
    },
  },
};
