"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import PageIntro from "@/components/dashboard/PageIntro";

type Client = {
  id: string;
  name: string;
  widgetPublicId: string;
  createdAt?: string;
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/clients", { credentials: "include" });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || res.statusText);
        setClients([]);
      } else {
        setClients(json.data || []);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return (
    <div>
      <PageIntro
        eyebrow="Directory"
        title="Clients"
        description={
          <>
            <p>
              Each row is one business (brand or merchant) in your workspace. You get a dedicated{" "}
              <strong className="font-medium text-zinc-800 dark:text-zinc-200">widget public ID</strong> for website
              embeds, and you can attach WhatsApp Cloud API credentials per client so channels stay isolated.
            </p>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              Add new businesses from the <Link href="/dashboard" className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-2 dark:text-zinc-100">Overview</Link>{" "}
              page (<strong className="font-medium text-zinc-800 dark:text-zinc-200">New client</strong>), then upload
              knowledge and copy embed code under <strong className="font-medium text-zinc-800 dark:text-zinc-200">Website widget</strong>.
            </p>
          </>
        }
        actions={
          <button
            type="button"
            onClick={() => fetchClients()}
            className="inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50 active:scale-[0.98] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
          >
            Refresh
          </button>
        }
      />

      {loading ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
          Loading clients…
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      ) : clients.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/50 px-6 py-12 text-center dark:border-zinc-700 dark:bg-zinc-900/40">
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">No businesses yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
            Create your first client from the Overview page, then return here to see widget IDs and wire WhatsApp.
          </p>
          <Link
            href="/dashboard"
            className="mt-4 inline-flex rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            Go to Overview
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50/90 dark:border-zinc-800 dark:bg-zinc-800/50">
              <tr>
                <th className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-100">Name</th>
                <th className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-100">Widget public ID</th>
                <th className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-100">Created</th>
                <th className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-100">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {clients.map((client) => (
                <tr key={client.id} className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">{client.name}</td>
                  <td className="px-4 py-3 font-mono text-xs break-all text-zinc-600 dark:text-zinc-400">
                    {client.widgetPublicId}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500">
                    {client.createdAt ? new Date(client.createdAt).toLocaleString() : "—"}
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
      )}
    </div>
  );
}
