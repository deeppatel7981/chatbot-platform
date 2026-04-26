"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import DashboardEmptyState from "@/components/dashboard/DashboardEmptyState";

type Client = {
  id: string;
  name: string;
  widgetPublicId: string;
  createdAt: string;
};

type Props = {
  refreshKey?: number;
};

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-100 bg-zinc-50/80 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-800/50">
        <div className="h-4 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
      </div>
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4 px-4 py-4">
            <div className="h-4 flex-1 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
            <div className="h-4 w-24 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
            <div className="h-4 w-28 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ClientTable({ refreshKey }: Props) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchClients = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/clients", { credentials: "include" });
        const json = await res.json();
        if (!res.ok) {
          if (mounted) setError(json?.error || "Could not load clients");
          setClients([]);
        } else if (mounted) {
          const rows = (json.data || []).map((c: Client & { created_at?: string }) => ({
            ...c,
            createdAt: c.createdAt || (c as { created_at?: string }).created_at || new Date().toISOString(),
          }));
          setClients(rows);
        }
      } catch {
        setError("Network error");
        setClients([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchClients();
    return () => {
      mounted = false;
    };
  }, [refreshKey]);

  if (loading) return <TableSkeleton />;

  if (clients.length === 0) {
    if (error) {
      return (
        <div className="rounded-2xl border border-red-200 bg-red-50/90 px-6 py-8 text-center text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          <span className="font-medium">Could not load clients.</span> {error}
        </div>
      );
    }
    return (
      <DashboardEmptyState
        title="No clients yet"
        description="Use New client on Overview to add a business. This table fills in once the first client exists."
        steps={[
          "Overview → New client.",
          "Return here for widget public ID and links.",
        ]}
        primaryAction={{ label: "Go to Overview", href: "/dashboard" }}
        secondaryAction={{ label: "Knowledge base", href: "/dashboard/knowledge-base" }}
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-zinc-200 bg-zinc-50/90 dark:border-zinc-800 dark:bg-zinc-800/50">
          <tr>
            <th className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-100">Business</th>
            <th className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-100">Widget public ID</th>
            <th className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-100">Created</th>
            <th className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-100">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {clients.map((client) => (
            <tr
              key={client.id}
              className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
            >
              <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">{client.name}</td>
              <td className="px-4 py-3 font-mono text-xs text-zinc-600 break-all dark:text-zinc-400">
                {client.widgetPublicId}
              </td>
              <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                {new Date(client.createdAt).toLocaleString()}
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/dashboard/clients/${client.id}`}
                  className="text-sm font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-500 dark:text-zinc-100"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
