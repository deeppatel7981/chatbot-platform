import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { users, organizationMembers } from "@/lib/db/schema";
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

          return {
            id: user.id,
            email: user.email,
            name: user.name ?? user.email,
            organizationId: membership?.organizationId ?? "",
          };
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
        token.organizationId = (user as { organizationId: string }).organizationId;
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        (session.user as { organizationId?: string }).organizationId = token.organizationId as string;
      }
      return session;
    },
  },
};
