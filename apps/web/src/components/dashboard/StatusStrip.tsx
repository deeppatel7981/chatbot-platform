"use client";

import Link from "next/link";

export type StatusStripSummary = {
  handoffsTotal: number;
} | null;

export type StatusStripOnboarding = {
  hasClient: boolean;
  hasDocuments: boolean;
  conversationCount: number;
  documentChunkCount?: number;
  whatsappConnected?: boolean;
  mock?: boolean;
} | null;

const cardBase =
  "flex min-h-[5.5rem] flex-1 flex-col justify-between rounded-2xl border p-4 transition hover:-translate-y-px hover:border-zinc-300 dark:hover:border-zinc-600";

export default function StatusStrip({
  summary,
  onboarding,
}: {
  summary: StatusStripSummary;
  onboarding: StatusStripOnboarding;
}) {
  const chunks = onboarding?.documentChunkCount ?? 0;
  const widgetLive = (onboarding?.conversationCount ?? 0) > 0;
  const waOk = onboarding?.whatsappConnected === true;
  const handoffs = summary?.handoffsTotal ?? 0;

  const items = [
    {
      key: "widget",
      title: "Website widget",
      status: widgetLive ? "Live" : "Not live yet",
      statusClass: widgetLive
        ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200"
        : "bg-amber-500/15 text-amber-900 dark:text-amber-100",
      cta: widgetLive ? "Test" : "Install",
      href: "/dashboard/bot-preview",
    },
    {
      key: "whatsapp",
      title: "WhatsApp",
      status: waOk ? "Connected" : "Not connected",
      statusClass: waOk
        ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200"
        : "bg-zinc-500/15 text-zinc-800 dark:text-zinc-200",
      cta: waOk ? "Manage" : "Connect",
      href: "/dashboard/integrations",
    },
    {
      key: "knowledge",
      title: "Knowledge",
      status: chunks > 0 ? `${chunks} indexed blocks` : "Nothing uploaded",
      statusClass:
        chunks > 0
          ? "bg-violet-500/12 text-violet-900 dark:text-violet-100"
          : "bg-amber-500/15 text-amber-900 dark:text-amber-100",
      cta: chunks > 0 ? "Add more" : "Upload",
      href: "/dashboard/knowledge-base",
    },
    {
      key: "inbox",
      title: "Inbox",
      status: handoffs > 0 ? `${handoffs} need review` : "All clear",
      statusClass:
        handoffs > 0
          ? "bg-rose-500/12 text-rose-900 dark:text-rose-100"
          : "bg-emerald-500/12 text-emerald-800 dark:text-emerald-200",
      cta: handoffs > 0 ? "Review" : "Open",
      href: "/dashboard/chat-logs",
    },
  ];

  return (
    <section aria-label="Workspace status" className="mb-8">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Setup & health</p>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {items.map((item) => (
          <div
            key={item.key}
            className={`${cardBase} min-w-[140px] border-zinc-200/90 bg-white shadow-dashboard-card dark:border-zinc-800 dark:bg-zinc-950`}
          >
            <div>
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{item.title}</p>
              <p className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${item.statusClass}`}>
                {item.status}
              </p>
            </div>
            <Link
              href={item.href}
              className="mt-3 inline-flex w-fit rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              {item.cta}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
