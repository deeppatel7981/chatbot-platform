import Link from "next/link";
import { redirect } from "next/navigation";
import { and, eq, inArray } from "drizzle-orm";
import { getAccessFromSession } from "@/lib/access-scope";
import { getDb } from "@/lib/db/client";
import { clients } from "@/lib/db/schema";
import { getAppSession } from "@/lib/get-session";
import { isMockData } from "@/lib/mock/mode";
import { mockClients } from "@/lib/mock/fixtures";

export default async function PortalPickerPage() {
  const session = await getAppSession();
  const scope = getAccessFromSession(session);
  if (!session?.user?.organizationId || !scope) {
    redirect("/login");
  }

  if (scope.mode === "full" && scope.portalClientIds.length === 0) {
    redirect("/dashboard");
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
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">No portal access</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Your account is not linked to a business yet. Ask your workspace admin to add you under{" "}
          <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-800">client_portal_access</code>.
        </p>
        <Link href="/login" className="mt-6 inline-block text-sm font-medium text-emerald-700 underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Merchant portal</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Choose your business — each area is sandboxed.</p>
      <ul className="mt-8 space-y-3">
        {rows.map((r) => (
          <li key={r.id}>
            <Link
              href={`/portal/${r.id}`}
              className="block rounded-xl border border-zinc-200 bg-white px-4 py-4 text-sm font-semibold text-zinc-900 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50/40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/30"
            >
              {r.name} →
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
