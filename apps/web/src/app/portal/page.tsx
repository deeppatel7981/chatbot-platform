import Link from "next/link";
import { redirect } from "next/navigation";
import { and, eq, inArray } from "drizzle-orm";
import { getAccessFromSession } from "@/lib/access-scope";
import { getDb } from "@/lib/db/client";
import { clients } from "@/lib/db/schema";
import { getAppSession } from "@/lib/get-session";
import { appSurfaceCard, appSurfaceRow } from "@/lib/app-typography";
import { isMockData } from "@/lib/mock/mode";
import { mockClients } from "@/lib/mock/fixtures";
import PageIntro from "@/components/dashboard/PageIntro";

export default async function PortalPickerPage() {
  const session = await getAppSession();
  const scope = getAccessFromSession(session);
  if (!session?.user?.organizationId || !scope) {
    redirect("/login");
  }

  if (scope.mode === "full" && scope.portalClientIds.length === 0) {
    redirect("/app/overview");
  }

  if (scope.portalClientIds.length === 1) {
    redirect(`/portal/${scope.portalClientIds[0]}`);
  }

  let rows: { id: string; name: string }[] = [];
  if (isMockData()) {
    rows = mockClients
      .filter((c) => scope.portalClientIds.includes(c.id))
      .map((c) => ({ id: c.id, name: c.name }));
  } else {
    const db = getDb();
    rows = await db
      .select({ id: clients.id, name: clients.name })
      .from(clients)
      .where(
        and(eq(clients.organizationId, scope.organizationId), inArray(clients.id, scope.portalClientIds))
      );
  }

  if (rows.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 sm:py-16">
        <div className={appSurfaceCard}>
          <PageIntro
            eyebrow="Access"
            title="No portal access yet"
            description={
              <p>
                Your account is not linked to a business. Ask your workspace admin to turn on{" "}
                <strong className="font-medium text-zinc-800 dark:text-zinc-200">merchant portal access</strong> for you
                in project settings (team / portal permissions).
              </p>
            }
            actions={
              <Link
                href="/login"
                className="inline-flex rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              >
                Back to sign in
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:py-12">
      <PageIntro
        eyebrow="Portal"
        title="Choose your business"
        description={<p>Each area is sandboxed to that brand only — no workspace admin tools here.</p>}
      />
      <ul className="mt-2 space-y-3">
        {rows.map((r) => (
          <li key={r.id}>
            <Link
              href={`/portal/${r.id}`}
              className={`block text-sm font-semibold text-zinc-900 hover:border-emerald-400 hover:bg-emerald-50/50 dark:text-zinc-50 dark:hover:border-emerald-600 dark:hover:bg-emerald-950/25 ${appSurfaceRow}`}
            >
              {r.name} →
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
