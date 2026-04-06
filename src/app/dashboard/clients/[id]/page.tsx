"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import PageIntro from "@/components/dashboard/PageIntro";

type ClientRow = {
  id: string;
  name: string;
  widgetPublicId: string;
  createdAt?: string;
  whatsappPhoneNumberId: string | null;
};

export default function ClientDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [client, setClient] = useState<ClientRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/clients/${id}`, { credentials: "include" });
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(json?.error || "Not found");
          setClient(null);
          return;
        }
        setClient(json.data);
      } catch {
        if (!cancelled) setError("Network error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div>
      <Link
        href="/dashboard/clients"
        className="mb-6 inline-flex text-sm font-medium text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        ← Back to clients
      </Link>

      {error ? (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : client ? (
        <>
          <PageIntro
            eyebrow="Business"
            title={client.name}
            description={
              <>
                <p>
                  This is the hub for one brand or store. Use the links below to train the bot on their documents, copy
                  the website widget, or finish WhatsApp setup in Integrations.
                </p>
              </>
            }
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href={`/dashboard/clients/${id}/documents`}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
            >
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">Knowledge & uploads</h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                PDFs and text for this business only—used when shoppers ask product or policy questions.
              </p>
              <span className="mt-3 inline-flex text-sm font-medium text-zinc-500">Open →</span>
            </Link>
            <Link
              href="/dashboard/bot-preview"
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
            >
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">Website widget</h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Embed script uses this client&apos;s public ID when you pick them in Clients first.
              </p>
              <span className="mt-3 inline-flex text-sm font-medium text-zinc-500">Embed code →</span>
            </Link>
            <Link
              href="/dashboard/integrations"
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
            >
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">Integrations</h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                WhatsApp webhook URL, verify token, and step-by-step for this workspace.
              </p>
              <span className="mt-3 inline-flex text-sm font-medium text-zinc-500">Guide →</span>
            </Link>
            <Link
              href="/dashboard/chat-logs"
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
            >
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">Conversations</h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Filter mentally by business name—threads list all clients in the workspace.
              </p>
              <span className="mt-3 inline-flex text-sm font-medium text-zinc-500">Inbox →</span>
            </Link>
          </div>

          <div className="mt-8 rounded-2xl border border-zinc-200/80 bg-zinc-50/80 p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Technical IDs</h3>
            <dl className="mt-3 space-y-2 text-sm">
              <div>
                <dt className="text-zinc-500 dark:text-zinc-400">Widget public ID</dt>
                <dd className="mt-0.5 font-mono text-xs break-all text-zinc-800 dark:text-zinc-200">{client.widgetPublicId}</dd>
              </div>
              <div>
                <dt className="text-zinc-500 dark:text-zinc-400">WhatsApp (phone number ID)</dt>
                <dd className="mt-0.5 text-zinc-800 dark:text-zinc-200">
                  {client.whatsappPhoneNumberId || "—"}
                </dd>
              </div>
              {client.createdAt ? (
                <div>
                  <dt className="text-zinc-500 dark:text-zinc-400">Created</dt>
                  <dd className="mt-0.5 text-zinc-800 dark:text-zinc-200">
                    {new Date(client.createdAt).toLocaleString()}
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>
        </>
      ) : null}
    </div>
  );
}
