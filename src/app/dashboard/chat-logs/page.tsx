"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PageIntro from "@/components/dashboard/PageIntro";

type Row = {
  id: string;
  channel: string;
  status: string;
  needsHuman: boolean;
  lastConfidence: string | null;
  updatedAt: string;
  clientName: string;
  clientId: string;
};

export default function ChatLogsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/conversations", { credentials: "include" });
        const json = await res.json();
        if (!res.ok) {
          setError(json?.error || "Failed to load");
          return;
        }
        setRows(json.data || []);
      } catch {
        setError("Network error");
      }
    })();
  }, []);

  return (
    <div>
      <PageIntro
        eyebrow="Inbox"
        title="Conversations"
        description={
          <>
            <p>
              Every thread from the website widget and WhatsApp appears here. Use it to see which brand the chat belongs
              to, whether a human should take over, and how confident the last model reply was.
            </p>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              <strong className="font-medium text-zinc-800 dark:text-zinc-200">Handoff</strong> = flagged for staff when
              confidence is low or policy requires it. <strong className="font-medium text-zinc-800 dark:text-zinc-200">Confidence</strong>{" "}
              reflects the model&apos;s self-assessment on the last turn. Open a row to read the transcript.
            </p>
          </>
        }
      />

      {error && (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-2xl border border-zinc-200/80 bg-white p-2 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left dark:border-zinc-800">
              <th className="p-3 font-semibold text-zinc-900 dark:text-zinc-100">Business</th>
              <th className="p-3 font-semibold text-zinc-900 dark:text-zinc-100">Channel</th>
              <th className="p-3 font-semibold text-zinc-900 dark:text-zinc-100">Status</th>
              <th className="p-3 font-semibold text-zinc-900 dark:text-zinc-100">Handoff</th>
              <th className="p-3 font-semibold text-zinc-900 dark:text-zinc-100">Confidence</th>
              <th className="p-3 font-semibold text-zinc-900 dark:text-zinc-100">Updated</th>
              <th className="p-3 font-semibold text-zinc-900 dark:text-zinc-100">
                <span className="sr-only">Open</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {rows.map((r) => (
              <tr key={r.id} className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                <td className="p-3 text-zinc-900 dark:text-zinc-100">{r.clientName}</td>
                <td className="p-3 capitalize text-zinc-700 dark:text-zinc-300">{r.channel}</td>
                <td className="p-3 capitalize text-zinc-700 dark:text-zinc-300">{r.status}</td>
                <td className="p-3 text-zinc-700 dark:text-zinc-300">{r.needsHuman ? "Yes" : "No"}</td>
                <td className="p-3 text-zinc-700 dark:text-zinc-300">{r.lastConfidence ?? "—"}</td>
                <td className="p-3 text-xs text-zinc-500">{new Date(r.updatedAt).toLocaleString()}</td>
                <td className="p-3">
                  <Link
                    href={`/dashboard/chat-logs/${r.id}`}
                    className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-500 dark:text-zinc-100"
                  >
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && !error && (
          <div className="px-4 py-10 text-center">
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">No conversations yet</p>
            <p className="mt-2 max-w-md mx-auto text-sm text-zinc-500 dark:text-zinc-400">
              When shoppers use the widget or WhatsApp, threads will show up here. Configure channels under{" "}
              <Link href="/dashboard/clients" className="font-medium text-zinc-800 underline decoration-zinc-300 underline-offset-2 dark:text-zinc-200">
                Clients
              </Link>{" "}
              and{" "}
              <Link href="/dashboard/integrations" className="font-medium text-zinc-800 underline decoration-zinc-300 underline-offset-2 dark:text-zinc-200">
                Integrations
              </Link>
              .
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
