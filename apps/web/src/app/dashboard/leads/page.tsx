"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import ApiErrorBanner from "@/components/dashboard/ApiErrorBanner";
import DashboardEmptyState from "@/components/dashboard/DashboardEmptyState";

type LeadRow = {
  id: string;
  title: string;
  status: string;
  source: string | null;
  intent: string | null;
  updatedAt: string;
};

const STATUS_OPTIONS = ["new", "contacted", "qualified", "won", "lost"] as const;

export default function LeadsPage() {
  const [rows, setRows] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSource, setNewSource] = useState("");
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/leads", { credentials: "include" });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || "Failed to load leads");
        return;
      }
      setRows(json.data || []);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function updateStatus(id: string, status: string) {
    setSavingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || "Update failed");
        return;
      }
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...json.data } : r)));
    } catch {
      setError("Network error");
    } finally {
      setSavingId(null);
    }
  }

  async function createLead(e: React.FormEvent) {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          source: newSource.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || "Could not create lead");
        return;
      }
      setRows((prev) => [json.data, ...prev]);
      setModalOpen(false);
      setNewTitle("");
      setNewSource("");
    } catch {
      setError("Network error");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <header className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Pipeline</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Leads</h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Track inquiries and follow-ups. Data loads from your workspace (sample data when demo mode is on).
          </p>
        </header>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex shrink-0 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          Add lead
        </button>
      </div>

      {error ? <ApiErrorBanner message={error} onRetry={load} /> : null}

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-dashboard-card dark:border-zinc-800 dark:bg-zinc-950">
        {loading ? (
          <p className="px-4 py-10 text-center text-sm text-zinc-500">Loading…</p>
        ) : rows.length === 0 ? (
          <div className="border-t border-zinc-100 p-6 dark:border-zinc-800">
            <DashboardEmptyState
              title="No leads in the pipeline yet"
              description={
                <>
                  A <strong className="font-medium text-zinc-800 dark:text-zinc-200">lead</strong> is an opportunity to track (status, source). Add one with{" "}
                  <strong className="font-medium text-zinc-800 dark:text-zinc-200">Add lead</strong> above, or generate demand from live chats and automations.
                </>
              }
              steps={[
                "Click Add lead to create your first row manually.",
                "Open Conversations when the widget or WhatsApp is live — follow-ups often start there.",
                "Use Automations to capture structured intents later.",
              ]}
              primaryAction={{ label: "Open conversations", href: "/dashboard/chat-logs" }}
              secondaryAction={{ label: "Automations", href: "/dashboard/automations" }}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/90 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Intent</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40">
                    <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">{r.title}</td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{r.source ?? "—"}</td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{r.intent ?? "—"}</td>
                    <td className="px-4 py-3">
                      <label className="sr-only" htmlFor={`status-${r.id}`}>
                        Status for {r.title}
                      </label>
                      <select
                        id={`status-${r.id}`}
                        value={r.status}
                        disabled={savingId === r.id}
                        onChange={(e) => updateStatus(r.id, e.target.value)}
                        className="rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-xs font-medium text-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
                      >
                        {[...new Set([...STATUS_OPTIONS, r.status])].map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs tabular-nums text-zinc-500">
                      {new Date(r.updatedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/dashboard/chat-logs"
          className="inline-flex rounded-xl border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          Conversations
        </Link>
        <Link
          href="/dashboard/automations"
          className="inline-flex rounded-xl border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          Automations
        </Link>
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50 p-4 backdrop-blur-[2px]">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="lead-modal-title"
            className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
          >
            <h2 id="lead-modal-title" className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              New lead
            </h2>
            <form onSubmit={createLead} className="mt-4 space-y-4">
              <div>
                <label htmlFor="lead-title" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Title
                </label>
                <input
                  id="lead-title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
                  placeholder="e.g. Bulk order — Pune"
                  required
                />
              </div>
              <div>
                <label htmlFor="lead-source" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Source (optional)
                </label>
                <input
                  id="lead-source"
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
                  placeholder="website, whatsapp, …"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
                >
                  {creating ? "Saving…" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
