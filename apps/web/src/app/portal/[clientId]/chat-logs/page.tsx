"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  countConversationsNeedingHandoff,
  filterAndSortConversations,
  type ConversationInboxRow,
  type InboxFilterTab,
  type InboxSortKey,
} from "@chatbot/core";
import { useEffect, useMemo, useState } from "react";
import PageIntro from "@/components/dashboard/PageIntro";
import DashboardEmptyState from "@/components/dashboard/DashboardEmptyState";

type Row = ConversationInboxRow;
type FilterTab = InboxFilterTab;
type SortKey = InboxSortKey;

function statusPill(status: string) {
  const s = status.toLowerCase();
  const cls =
    s === "open"
      ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200"
      : s === "resolved" || s === "closed"
        ? "bg-zinc-500/15 text-zinc-700 dark:text-zinc-300"
        : "bg-violet-500/12 text-violet-900 dark:text-violet-100";
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${cls}`}>{status}</span>;
}

function confidencePill(c: string | null) {
  if (!c) return <span className="text-zinc-400">—</span>;
  const low = c.toLowerCase() === "low";
  const cls = low
    ? "bg-amber-500/15 text-amber-900 dark:text-amber-100"
    : c.toLowerCase() === "high"
      ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200"
      : "bg-zinc-500/12 text-zinc-700 dark:text-zinc-300";
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${cls}`}>{c}</span>;
}

function channelPill(ch: string) {
  const w = ch.toLowerCase() === "whatsapp" ? "WhatsApp" : ch.toLowerCase() === "widget" ? "Website" : ch;
  const cls =
    ch.toLowerCase() === "whatsapp"
      ? "bg-green-500/12 text-green-900 dark:text-green-100"
      : "bg-sky-500/12 text-sky-900 dark:text-sky-100";
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>{w}</span>;
}

export default function PortalChatLogsPage() {
  const params = useParams();
  const clientId = params.clientId as string;
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<FilterTab>("all");
  const [sort, setSort] = useState<SortKey>("newest");

  useEffect(() => {
    (async () => {
      setInitialLoad(true);
      setError(null);
      try {
        const res = await fetch("/api/conversations", { credentials: "include" });
        const json = await res.json();
        if (!res.ok) {
          setError(json?.error || "Failed to load");
          setRows([]);
          return;
        }
        const all = (json.data || []) as Row[];
        setRows(all.filter((r) => r.clientId === clientId));
      } catch {
        setError("Network error");
      } finally {
        setInitialLoad(false);
      }
    })();
  }, [clientId]);

  const filtered = useMemo(
    () => filterAndSortConversations(rows, query, tab, sort),
    [rows, query, tab, sort]
  );

  const handoffCount = useMemo(() => countConversationsNeedingHandoff(rows), [rows]);

  const tabs: { id: FilterTab; label: string }[] = [
    { id: "all", label: "All" },
    { id: "handoff", label: "Needs handoff" },
    { id: "open", label: "Open" },
    { id: "resolved", label: "Resolved" },
    { id: "whatsapp", label: "WhatsApp" },
    { id: "widget", label: "Website" },
  ];

  return (
    <div>
      <PageIntro
        eyebrow="Inbox"
        title="Conversations"
        description={
          <p className="max-w-2xl">
            Threads for <strong className="font-medium text-zinc-800 dark:text-zinc-200">this business only</strong>.
            Handoff means you should reply on WhatsApp or your usual channel.
          </p>
        }
      />

      {error ? (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      {initialLoad && !error ? (
        <div className="rounded-2xl border border-zinc-200/80 bg-white py-14 text-center text-sm text-zinc-500 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          Loading conversations…
        </div>
      ) : null}

      {!initialLoad ? (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-zinc-200/80 bg-white px-3 py-2 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <label className="relative min-w-[200px] flex-1">
              <span className="sr-only">Search conversations</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search channel or ID…"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/80 px-3 py-2 pl-9 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" aria-hidden>
                ⌕
              </span>
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="confidence">Low confidence first</option>
            </select>
          </div>

          <div className="mb-3 flex flex-wrap gap-1.5" role="tablist">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={[
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition",
                  tab === t.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700",
                ].join(" ")}
              >
                {t.label}
              </button>
            ))}
          </div>

          {rows.length > 0 ? (
            <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">{filtered.length}</span> shown
              {query || tab !== "all" ? ` (of ${rows.length})` : ""}
              {handoffCount > 0 ? (
                <>
                  {" "}
                  · <span className="font-medium text-rose-700 dark:text-rose-300">{handoffCount} need handoff</span>
                </>
              ) : null}
            </p>
          ) : null}

          <div className="overflow-x-auto rounded-2xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left dark:border-zinc-800">
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Channel
                  </th>
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Status
                  </th>
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Handoff
                  </th>
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Confidence
                  </th>
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Updated
                  </th>
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    <span className="sr-only">Open</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-3.5 align-middle">{channelPill(r.channel)}</td>
                    <td className="px-4 py-3.5 align-middle">{statusPill(r.status)}</td>
                    <td className="px-4 py-3.5 align-middle">
                      {r.needsHuman ? (
                        <span className="inline-flex rounded-full bg-rose-500/15 px-2.5 py-0.5 text-xs font-medium text-rose-800 dark:text-rose-100">
                          Yes
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-zinc-500/10 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                          No
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 align-middle">{confidencePill(r.lastConfidence)}</td>
                    <td className="px-4 py-3.5 align-middle text-xs tabular-nums text-zinc-600 dark:text-zinc-400">
                      {new Date(r.updatedAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 align-middle text-right">
                      <Link
                        href={`/portal/${clientId}/chat-logs/${r.id}`}
                        className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-[var(--primary-hover)]"
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length === 0 && !error && !initialLoad && (
              <div className="border-t border-zinc-100 p-6 dark:border-zinc-800">
                <DashboardEmptyState
                  title="No conversations yet"
                  description="When shoppers message your widget or WhatsApp, threads appear here."
                  steps={[
                    "Confirm your provider connected the channel for this business.",
                    "Send a test message from your phone or site.",
                    "Refresh this page after a minute if needed.",
                  ]}
                  primaryAction={{ label: "Back to overview", href: `/portal/${clientId}` }}
                  secondaryAction={{ label: "Knowledge", href: `/portal/${clientId}/documents` }}
                />
              </div>
            )}
            {rows.length > 0 && filtered.length === 0 && !error ? (
              <div className="px-4 py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">No threads match this filter.</div>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}
