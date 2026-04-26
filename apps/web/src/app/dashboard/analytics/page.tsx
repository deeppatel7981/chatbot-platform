"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PageIntro from "@/components/dashboard/PageIntro";

export default function AnalyticsPage() {
  const [data, setData] = useState<{
    conversationsTotal: number;
    contactsTotal: number;
    handoffsTotal: number;
    conversationsLast30Days: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/analytics/summary", { credentials: "include" });
        const json = await res.json();
        if (!res.ok) {
          setError(json?.error || "Failed");
          return;
        }
        setData(json.data);
      } catch {
        setError("Network error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const cards: [string, string, number][] = data
    ? [
        ["Conversations (all time)", "Total assistant threads stored in this workspace.", data.conversationsTotal],
        ["Conversations (last 30 days)", "Recent volume—useful for capacity and campaign checks.", data.conversationsLast30Days],
        ["Contacts captured", "People who left contact details through the bot or flows.", data.contactsTotal],
        ["Human handoffs", "Threads flagged for staff follow-up (low confidence or policy).", data.handoffsTotal],
      ]
    : [];

  return (
    <div>
      <PageIntro
        eyebrow="Reporting"
        title="Analytics"
        description={
          <>
            <p>
              High-level counts from your database: how busy channels are, how many contacts you&apos;ve collected, and
              how often conversations need a human. Use it alongside{" "}
              <Link href="/app/conversations" className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-2 dark:text-zinc-100">
                Conversations
              </Link>{" "}
              for detail.
            </p>
          </>
        }
      />

      {error && (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      )}

      {loading && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading metrics…</p>
      )}

      {!loading && data && (
        <div className="grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
          {cards.map(([label, hint, value]) => (
            <div
              key={label}
              className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{label}</p>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{hint}</p>
              <p className="mt-3 text-3xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">{value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
