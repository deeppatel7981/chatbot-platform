"use client";

import { useCallback, useEffect, useState } from "react";

type WebSourceRow = {
  id: string;
  url: string;
  enabled: boolean;
  refreshOnNewConversation: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function ClientWebSourcesPanel({ clientId }: { clientId: string }) {
  const [rows, setRows] = useState<WebSourceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setNote(null);
    try {
      const res = await fetch(`/api/clients/${clientId}/web-sources`, { credentials: "include" });
      const json = await res.json();
      if (!res.ok) {
        setNote(typeof json?.error === "string" ? json.error : "Could not load");
        setRows([]);
        return;
      }
      setRows(Array.isArray(json.data) ? json.data : []);
    } catch {
      setNote("Network error");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function addUrl() {
    const u = url.trim();
    if (!u) {
      setNote("Enter a URL (https://…)");
      return;
    }
    setBusy(true);
    setNote(null);
    try {
      const res = await fetch(`/api/clients/${clientId}/web-sources`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: u, refreshOnNewConversation: true }),
      });
      const json = await res.json();
      if (!res.ok) {
        setNote(typeof json?.error === "string" ? json.error : "Could not add");
        return;
      }
      setUrl("");
      setNote(
        typeof json.data?.chunkCount === "number"
          ? `Added and indexed ${json.data.chunkCount} chunk(s).`
          : "Added."
      );
      await load();
    } catch {
      setNote("Network error");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Remove this URL and delete its RAG chunks for this client?")) return;
    setBusy(true);
    setNote(null);
    try {
      const res = await fetch(`/api/clients/${clientId}/web-sources/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setNote(typeof json?.error === "string" ? json.error : "Could not remove");
        return;
      }
      await load();
    } catch {
      setNote("Network error");
    } finally {
      setBusy(false);
    }
  }

  async function refreshOne(id: string) {
    setBusy(true);
    setNote(null);
    try {
      const res = await fetch(`/api/clients/${clientId}/web-sources/${id}/refresh`, {
        method: "POST",
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) {
        setNote(typeof json?.error === "string" ? json.error : "Refresh failed");
        return;
      }
      setNote(`Refreshed (${json.data?.chunkCount ?? 0} chunks).`);
      await load();
    } catch {
      setNote("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mb-8 rounded-2xl border border-sky-200/80 bg-sky-50/50 p-5 dark:border-sky-900/40 dark:bg-sky-950/20">
      <h2 className="text-sm font-semibold text-sky-950 dark:text-sky-100">Web knowledge (allowlisted)</h2>
      <p className="mt-1 text-xs text-sky-900/85 dark:text-sky-200/90">
        Only add pages you are <strong>allowed</strong> to copy (your site, partner agreements, or public terms).
        Each <strong>new customer conversation</strong> re-fetches these URLs into RAG so answers stay current. Optional
        env: <code className="rounded bg-white/80 px-1 text-[0.65rem] dark:bg-zinc-900">WEB_FETCH_ALLOWED_HOSTS</code>{" "}
        to restrict hosts.
      </p>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
        <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs font-medium text-sky-900 dark:text-sky-200">
          Page URL
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/pricing"
            className="rounded-lg border border-sky-200 bg-white px-3 py-2 font-mono text-sm text-zinc-900 dark:border-sky-800 dark:bg-zinc-950 dark:text-zinc-100"
          />
        </label>
        <button
          type="button"
          disabled={busy}
          onClick={() => void addUrl()}
          className="shrink-0 rounded-lg bg-sky-800 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-900 disabled:opacity-50 dark:bg-sky-600 dark:hover:bg-sky-500"
        >
          {busy ? "Working…" : "Add & index"}
        </button>
      </div>

      {note ? (
        <p className="mt-2 text-xs text-sky-900 dark:text-sky-200" role="status">
          {note}
        </p>
      ) : null}

      {loading ? (
        <p className="mt-4 text-sm text-sky-800/80 dark:text-sky-300/80">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="mt-4 text-sm text-sky-800/80 dark:text-sky-300/80">No web sources yet.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {rows.map((r) => (
            <li
              key={r.id}
              className="flex flex-col gap-2 rounded-lg border border-sky-200/70 bg-white/90 px-3 py-2 text-sm dark:border-sky-900/50 dark:bg-zinc-950/80 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="min-w-0 break-all font-mono text-xs text-zinc-800 dark:text-zinc-200">{r.url}</span>
              <div className="flex shrink-0 flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void refreshOne(r.id)}
                  className="rounded-md border border-sky-300 px-2 py-1 text-xs font-medium text-sky-900 hover:bg-sky-100 disabled:opacity-50 dark:border-sky-700 dark:text-sky-100 dark:hover:bg-sky-900/40"
                >
                  Refresh now
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void remove(r.id)}
                  className="rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-800 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-200 dark:hover:bg-red-950/40"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
