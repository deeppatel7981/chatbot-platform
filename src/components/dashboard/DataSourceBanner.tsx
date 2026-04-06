"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "dashboard-data-source-banner-dismissed";

type HealthState =
  | { status: "loading" }
  | { status: "mock"; hint?: string }
  | { status: "connected"; hint?: string }
  | { status: "error"; message: string; hint?: string };

/**
 * Surfaces whether APIs use fixtures or Postgres. Compact for operators; dismissible after first read.
 */
export default function DataSourceBanner() {
  const [health, setHealth] = useState<HealthState>({ status: "loading" });
  const [dismissed, setDismissed] = useState(false);
  const [showTech, setShowTech] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem(STORAGE_KEY) === "1") {
      setDismissed(true);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/health");
        const json = (await res.json()) as {
          database?: string;
          hint?: string;
          error?: string;
        };
        if (cancelled) return;
        if (!res.ok || json.database === "error") {
          setHealth({
            status: "error",
            message: json.error || "Database unavailable",
            hint: json.hint,
          });
          return;
        }
        if (json.database === "mock") {
          setHealth({ status: "mock", hint: json.hint });
          return;
        }
        setHealth({ status: "connected", hint: json.hint });
      } catch {
        if (!cancelled) setHealth({ status: "error", message: "Could not reach /api/health" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const dismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  if (health.status === "loading") return null;

  if (dismissed && health.status === "mock") return null;

  if (health.status === "mock") {
    return (
      <div
        className="mb-5 rounded-xl border border-amber-200/80 bg-amber-50/90 px-3 py-2.5 text-sm text-amber-950 dark:border-amber-900/45 dark:bg-amber-950/30 dark:text-amber-100"
        role="status"
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <p className="font-medium">You’re viewing sample data</p>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => setShowTech((v) => !v)}
              className="text-xs font-medium text-amber-900 underline decoration-amber-300 underline-offset-2 hover:decoration-amber-600 dark:text-amber-200"
            >
              {showTech ? "Hide" : "Technical"} details
            </button>
            <button
              type="button"
              onClick={dismiss}
              className="rounded-lg px-2 py-0.5 text-xs font-medium text-amber-900 hover:bg-amber-100/80 dark:text-amber-100 dark:hover:bg-amber-900/50"
            >
              Dismiss
            </button>
          </div>
        </div>
        <p className="mt-1 text-xs leading-relaxed opacity-95">
          Numbers and lists are for preview. Connect your database to see your workspace.
        </p>
        {showTech ? (
          <p className="mt-2 rounded-lg bg-amber-100/60 p-2 font-mono text-[11px] leading-relaxed dark:bg-amber-900/40">
            Set <code className="text-inherit">MOCK_DATA=false</code>, configure <code className="text-inherit">DATABASE_URL</code>, run{" "}
            <code className="text-inherit">npm run db:push</code>, restart the app, then sign in again.
          </p>
        ) : null}
      </div>
    );
  }

  if (health.status === "error") {
    return (
      <div
        className="mb-5 rounded-xl border border-red-200/90 bg-red-50/95 px-3 py-2.5 text-sm text-red-950 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-100"
        role="alert"
      >
        <p className="font-medium">Database not reachable</p>
        <p className="mt-1 font-mono text-xs opacity-90">{health.message}</p>
        {health.hint ? <p className="mt-2 text-xs leading-relaxed opacity-95">{health.hint}</p> : null}
      </div>
    );
  }

  return (
    <div
      className="mb-5 rounded-xl border border-emerald-200/70 bg-emerald-50/85 px-3 py-2 text-sm text-emerald-950 dark:border-emerald-900/35 dark:bg-emerald-950/25 dark:text-emerald-100"
      role="status"
    >
      <p>
        <span className="font-medium">Live data</span>
        <span className="text-emerald-900/90 dark:text-emerald-200/95"> — Dashboard lists and metrics use your connected database.</span>
      </p>
      {health.hint ? <p className="mt-1 text-xs opacity-90">{health.hint}</p> : null}
    </div>
  );
}
