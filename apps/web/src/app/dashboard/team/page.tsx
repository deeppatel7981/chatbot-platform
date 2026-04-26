"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import ApiErrorBanner from "@/components/dashboard/ApiErrorBanner";

type MemberRow = {
  membershipId: string;
  userId: string;
  organizationId: string;
  role: string;
  email: string;
  name: string | null;
  createdAt: string;
};

function initials(n: string | null, email: string) {
  if (n?.trim()) {
    const parts = n.trim().split(/\s+/);
    return parts
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("");
  }
  return email.slice(0, 2).toUpperCase();
}

export default function TeamPage() {
  const [rows, setRows] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/team", { credentials: "include" });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || "Failed to load team");
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

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <header className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Workspace</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Team</h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            People in this workspace. Invites and role editing will arrive in a later release.
          </p>
        </header>
        <button
          type="button"
          disabled
          className="inline-flex shrink-0 cursor-not-allowed rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          title="Coming soon"
        >
          Invite teammate
        </button>
      </div>

      {error ? <ApiErrorBanner message={error} onRetry={load} /> : null}

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-dashboard-card dark:border-zinc-800 dark:bg-zinc-950">
        {loading ? (
          <p className="px-4 py-10 text-center text-sm text-zinc-500">Loading…</p>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/90 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {rows.map((r) => (
                <tr key={r.membershipId}>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-xs font-bold text-violet-900 dark:text-violet-100">
                        {initials(r.name, r.email)}
                      </div>
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-zinc-50">{r.name ?? r.email}</p>
                        <p className="text-xs text-zinc-500">Joined {new Date(r.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-zinc-600 dark:text-zinc-400">{r.email}</td>
                  <td className="px-4 py-3.5">
                    <span className="rounded-full bg-violet-500/15 px-2.5 py-0.5 text-xs font-medium capitalize text-violet-900 dark:text-violet-100">
                      {r.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/dashboard/settings"
          className="inline-flex rounded-xl border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          Workspace settings
        </Link>
        <Link
          href="/dashboard/help"
          className="inline-flex rounded-xl border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          Help center
        </Link>
      </div>
    </div>
  );
}
