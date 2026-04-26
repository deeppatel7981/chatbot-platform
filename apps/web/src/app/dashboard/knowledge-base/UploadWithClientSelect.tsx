"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import DashboardEmptyState from "@/components/dashboard/DashboardEmptyState";
import UploadDocumentForm from "@/components/UploadDocumentForm";

type DocRow = {
  id: string;
  chunk?: string;
  metadata?: { filename?: string };
  created_at?: string;
};

export default function UploadWithClientSelect() {
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [refresh, setRefresh] = useState(0);
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setClientsLoading(true);
      try {
        const res = await fetch("/api/clients", { credentials: "include" });
        const { data } = await res.json();
        const list = data || [];
        setClients(list);
        if (list[0]?.id) setSelectedClient(list[0].id);
        else setSelectedClient("");
      } finally {
        setClientsLoading(false);
      }
    })();
  }, [refresh]);

  useEffect(() => {
    if (!selectedClient) {
      setDocs([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setDocsLoading(true);
      try {
        const res = await fetch(`/api/client-documents?clientId=${selectedClient}`, { credentials: "include" });
        const json = await res.json();
        if (!cancelled && res.ok) setDocs(json.data || []);
        else if (!cancelled) setDocs([]);
      } catch {
        if (!cancelled) setDocs([]);
      } finally {
        if (!cancelled) setDocsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedClient, refresh]);

  if (clientsLoading) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/40">
        Loading clients…
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <DashboardEmptyState
        title="Add a client before uploading"
        description="Knowledge is stored per client. Create at least one business, then refresh this page or return from Overview."
        steps={[
          "Overview → New client.",
          "Pick a name — uploads unlock here immediately.",
        ]}
        primaryAction={{ label: "Add client on Overview", href: "/dashboard" }}
        secondaryAction={{ label: "Clients list", href: "/dashboard/clients" }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <label htmlFor="kb-client" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Client
        </label>
        <select
          id="kb-client"
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/30 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-500 dark:focus:ring-zinc-500/30"
          value={selectedClient}
          onChange={(e) => setSelectedClient(e.target.value)}
        >
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      {clients.length > 0 && selectedClient ? (
        <UploadDocumentForm clientId={selectedClient} onSuccess={() => setRefresh((r) => r + 1)} />
      ) : null}

      {selectedClient ? (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-700 dark:bg-zinc-900/40">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Indexed material for this client</h3>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
            Chunks created from your uploads—used when shoppers ask questions.
          </p>
          {docsLoading ? (
            <p className="mt-3 text-sm text-zinc-500">Loading…</p>
          ) : docs.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
              No chunks yet. Upload a PDF or text file above.{" "}
              <Link href={`/dashboard/clients/${selectedClient}`} className="font-medium text-zinc-900 underline dark:text-zinc-100">
                Client hub
              </Link>
            </p>
          ) : (
            <ul className="mt-3 max-h-56 space-y-2 overflow-y-auto text-sm">
              {docs.map((d) => (
                <li
                  key={d.id}
                  className="rounded-lg border border-zinc-200/80 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-950"
                >
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">
                    {d.metadata?.filename ?? "Document chunk"}
                  </span>
                  {d.created_at ? (
                    <span className="ml-2 text-xs text-zinc-500">{new Date(d.created_at).toLocaleString()}</span>
                  ) : null}
                  {d.chunk ? (
                    <p className="mt-1 line-clamp-2 text-xs text-zinc-600 dark:text-zinc-400">{d.chunk}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
