"use client";

import Link from "next/link";

type Onboarding = {
  hasClient: boolean;
  hasDocuments: boolean;
  conversationCount: number;
} | null;

type Summary = {
  handoffsTotal: number;
  conversationsLast30Days: number;
} | null;

const nextSteps = (o: NonNullable<Onboarding>) => {
  const out: { label: string; href: string; done: boolean }[] = [
    { label: "Add a business (Projects)", href: "/app/projects", done: o.hasClient },
    { label: "Upload FAQs or catalog PDFs", href: "/app/knowledge", done: o.hasDocuments },
    { label: "Send a test message from the widget", href: "/app/widget", done: o.conversationCount > 0 },
  ];
  return out;
};

export default function OverviewActionCenter({
  onboarding,
  summary,
}: {
  onboarding: Onboarding;
  summary: Summary;
}) {
  const pending = onboarding ? nextSteps(onboarding).filter((s) => !s.done) : [];
  const handoffs = summary?.handoffsTotal ?? 0;
  const recent = summary?.conversationsLast30Days ?? 0;

  return (
    <section className="mb-10 grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-dashboard-card dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Next best actions</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Finish setup to start capturing real chats.</p>
        <ol className="mt-4 space-y-3">
          {onboarding ? (
            nextSteps(onboarding).map((s) => (
              <li key={s.href} className="flex items-start gap-3">
                <span
                  className={
                    s.done
                      ? "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] text-white"
                      : "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-zinc-300 text-[10px] text-zinc-500 dark:border-zinc-600"
                  }
                  aria-hidden
                >
                  {s.done ? "✓" : ""}
                </span>
                <div className="min-w-0 flex-1">
                  <Link
                    href={s.href}
                    className={`text-sm font-medium ${s.done ? "text-zinc-500 line-through dark:text-zinc-500" : "text-zinc-900 hover:underline dark:text-zinc-50"}`}
                  >
                    {s.label}
                  </Link>
                </div>
              </li>
            ))
          ) : (
            <li className="text-sm text-zinc-500">Loading…</li>
          )}
        </ol>
        {onboarding && pending.length === 0 ? (
          <p className="mt-4 text-sm font-medium text-emerald-800 dark:text-emerald-200">Setup looks complete. Check inbox for new chats.</p>
        ) : null}
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-dashboard-card dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Needs your attention</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Operational items that affect customers today.</p>
        <ul className="mt-4 space-y-3 text-sm">
          {handoffs > 0 ? (
            <li className="flex items-center justify-between gap-3 rounded-xl border border-rose-200/80 bg-rose-50/80 px-3 py-2.5 dark:border-rose-900/50 dark:bg-rose-950/30">
              <span className="font-medium text-rose-950 dark:text-rose-100">{handoffs} conversation{handoffs === 1 ? "" : "s"} flagged for staff</span>
              <Link
                href="/app/conversations"
                className="shrink-0 rounded-lg bg-rose-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-600"
              >
                Open inbox
              </Link>
            </li>
          ) : (
            <li className="rounded-xl border border-zinc-200/80 bg-zinc-50/80 px-3 py-2.5 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-300">
              No handoffs waiting — you’re caught up.
            </li>
          )}
          <li className="flex items-center justify-between gap-2 text-zinc-600 dark:text-zinc-400">
            <span>{recent} conversations in the last 30 days</span>
            <Link href="/app/analytics" className="text-xs font-semibold text-violet-600 hover:underline dark:text-violet-400">
              Analytics
            </Link>
          </li>
        </ul>
      </div>
    </section>
  );
}
