"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import ApiErrorBanner from "@/components/dashboard/ApiErrorBanner";
import { AUTOMATION_META } from "@/lib/dashboard/automation-copy";

type AutomationRow = {
  id: string;
  key: string;
  name: string;
  enabled: boolean;
  config: Record<string, unknown>;
  updatedAt: string;
};

export default function AutomationsPage() {
  const [rows, setRows] = useState<AutomationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/automations", { credentials: "include" });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || "Failed to load automations");
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

  async function toggle(id: string, enabled: boolean) {
    setTogglingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/automations/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || "Could not update");
        return;
      }
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...json.data } : r)));
    } catch {
      setError("Network error");
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Playbooks</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Automations</h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Toggle rules for your workspace. Execution logic is expanded over time — today these flags save your preferences.
        </p>
      </header>

      {error ? <ApiErrorBanner message={error} onRetry={load} /> : null}

      {loading ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {rows.map((r) => {
            const meta = AUTOMATION_META[r.key];
            return (
              <div
                key={r.id}
                className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl" aria-hidden>
                      {meta?.icon ?? "⚙️"}
                    </span>
                    <div>
                      <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">{r.name}</h2>
                      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                        {meta?.description ?? `Automation key: ${r.key}`}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={r.enabled}
                    disabled={togglingId === r.id}
                    onClick={() => toggle(r.id, !r.enabled)}
                    className={[
                      "relative h-7 w-12 shrink-0 rounded-full transition-colors",
                      r.enabled ? "bg-emerald-600 dark:bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-600",
                      togglingId === r.id ? "opacity-60" : "",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform",
                        r.enabled ? "left-5" : "left-0.5",
                      ].join(" ")}
                    />
                    <span className="sr-only">{r.enabled ? "On" : "Off"}</span>
                  </button>
                </div>
                <p className="mt-3 text-xs text-zinc-400">Updated {new Date(r.updatedAt).toLocaleString()}</p>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Link
          href="/dashboard/knowledge-base"
          className="inline-flex rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          Upload knowledge
        </Link>
        <Link
          href="/dashboard/integrations"
          className="inline-flex rounded-xl border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          Connect channels
        </Link>
      </div>
    </div>
  );
}
