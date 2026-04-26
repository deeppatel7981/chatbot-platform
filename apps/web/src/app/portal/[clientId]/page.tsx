import Link from "next/link";
import { redirect } from "next/navigation";
import { getAccessFromSession } from "@/lib/access-scope";
import { getAppSession } from "@/lib/get-session";
import PageIntro from "@/components/dashboard/PageIntro";
import { appSurfaceCardPaddingSm } from "@/lib/app-typography";

async function loadConversationCount(
  clientId: string,
  organizationId: string
): Promise<{ total: number; handoff: number }> {
  const { isMockData } = await import("@/lib/mock/mode");
  if (isMockData()) {
    const { mockConversations } = await import("@/lib/mock/fixtures");
    const rows = mockConversations.filter((c) => c.clientId === clientId);
    const handoff = rows.filter((r) => r.needsHuman).length;
    return { total: rows.length, handoff };
  }
  const { getDb } = await import("@/lib/db/client");
  const { conversations } = await import("@/lib/db/schema");
  const { eq, and, sql } = await import("drizzle-orm");
  const db = getDb();
  const base = and(eq(conversations.clientId, clientId), eq(conversations.organizationId, organizationId));
  const [t] = await db.select({ n: sql<number>`count(*)::int` }).from(conversations).where(base);
  const [h] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(conversations)
    .where(and(base, eq(conversations.needsHuman, true)));
  return { total: t?.n ?? 0, handoff: h?.n ?? 0 };
}

export default async function PortalClientHome({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const session = await getAppSession();
  const scope = getAccessFromSession(session);
  if (!scope?.organizationId) {
    redirect("/login");
  }
  const { total, handoff } = await loadConversationCount(clientId, scope.organizationId);

  return (
    <div>
      <PageIntro
        eyebrow="Overview"
        title="Your chatbot"
        description={
          <p className="max-w-xl">
            This portal shows only this business: conversations, knowledge uploads, and thread status. Workspace billing,
            team, and integrations stay with your provider.
          </p>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href={`/portal/${clientId}/chat-logs`}
          className={`${appSurfaceCardPaddingSm} transition hover:border-emerald-300 dark:hover:border-emerald-800`}
        >
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Conversations</h2>
          <p className="mt-2 text-2xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">{total}</p>
          <p className="mt-1 text-xs text-zinc-500">
            {handoff > 0 ? (
              <span className="font-medium text-rose-700 dark:text-rose-300">{handoff} need handoff</span>
            ) : (
              "No open handoffs flagged."
            )}
          </p>
          <span className="mt-3 inline-block text-sm font-medium text-emerald-800 dark:text-emerald-300">Open →</span>
        </Link>
        <Link
          href={`/portal/${clientId}/documents`}
          className={`${appSurfaceCardPaddingSm} transition hover:border-emerald-300 dark:hover:border-emerald-800`}
        >
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Knowledge</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Upload PDF, Word, or text so answers match your real catalog and policies.
          </p>
          <span className="mt-3 inline-block text-sm font-medium text-emerald-800 dark:text-emerald-300">Manage →</span>
        </Link>
      </div>
    </div>
  );
}
