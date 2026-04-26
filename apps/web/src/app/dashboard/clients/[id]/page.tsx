"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import PageIntro from "@/components/dashboard/PageIntro";
import MerchantPortalCallout from "@/components/dashboard/MerchantPortalCallout";
import ClientWebSourcesPanel from "@/components/clients/ClientWebSourcesPanel";

import type { ReplyLanguage } from "@/lib/ai/reply-language";

type ClientRow = {
  id: string;
  name: string;
  widgetPublicId: string;
  createdAt?: string;
  whatsappPhoneNumberId: string | null;
  replyLanguage?: ReplyLanguage;
};

export default function ClientDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [client, setClient] = useState<ClientRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyLanguage, setReplyLanguage] = useState<ReplyLanguage>("english");
  const [langSaving, setLangSaving] = useState(false);
  const [langMessage, setLangMessage] = useState<string | null>(null);
  const [showWhatsAppId, setShowWhatsAppId] = useState(false);

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
        const row = json.data as ClientRow;
        setClient(row);
        setReplyLanguage(row.replyLanguage ?? "english");
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

  async function saveReplyLanguage() {
    if (!client) return;
    setLangSaving(true);
    setLangMessage(null);
    try {
      const res = await fetch(`/api/clients/${client.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ replyLanguage }),
      });
      const json = await res.json();
      if (!res.ok) {
        setLangMessage(json?.error || "Could not save");
        return;
      }
      const updated = json.data as ClientRow;
      setClient(updated);
      setReplyLanguage(updated.replyLanguage ?? "english");
      setLangMessage("Saved.");
    } catch {
      setLangMessage("Network error");
    } finally {
      setLangSaving(false);
    }
  }

  return (
    <div>
      <Link
        href="/app/projects"
        className="mb-6 inline-flex text-sm font-medium text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        ← Back to projects
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

          <div className="mb-8 rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Chatbot language</h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Default for <strong>WhatsApp</strong> and for the website widget when the visitor does not pick a language.
              Visitors can still choose &quot;Match my message&quot; or another option in the widget.
            </p>
            <div className="mt-4 flex flex-wrap items-end gap-3">
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-zinc-700 dark:text-zinc-300">Reply in</span>
                <select
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  value={replyLanguage}
                  onChange={(e) => setReplyLanguage(e.target.value as ReplyLanguage)}
                >
                  <option value="english">English</option>
                  <option value="hindi">Hindi (Devanagari)</option>
                  <option value="hinglish">Hinglish (mixed)</option>
                  <option value="match_user">Match customer&apos;s language</option>
                </select>
              </label>
              <button
                type="button"
                disabled={langSaving || replyLanguage === (client.replyLanguage ?? "english")}
                onClick={saveReplyLanguage}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
              >
                {langSaving ? "Saving…" : "Save language"}
              </button>
            </div>
            {langMessage ? (
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{langMessage}</p>
            ) : null}
          </div>

          <div className="mb-8 rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-5 dark:border-emerald-900/40 dark:bg-emerald-950/20">
            <h2 className="text-sm font-semibold text-emerald-950 dark:text-emerald-100">What your merchant sees</h2>
            <MerchantPortalCallout clientId={id} compact />
          </div>

          <ClientWebSourcesPanel clientId={id} />

          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href={`/app/projects/${id}/documents`}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
            >
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">Knowledge & uploads</h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                PDFs, Word (.docx), and text for this business—used when shoppers ask product or policy questions.
              </p>
              <span className="mt-3 inline-flex text-sm font-medium text-zinc-500">Open →</span>
            </Link>
            <Link
              href="/app/widget"
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
            >
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">Website widget</h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Embed script uses this project&apos;s public ID when you pick them under Projects first.
              </p>
              <span className="mt-3 inline-flex text-sm font-medium text-zinc-500">Embed code →</span>
            </Link>
            <Link
              href="/app/integrations"
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
            >
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">Integrations</h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                WhatsApp webhook URL, verify token, and step-by-step for this workspace.
              </p>
              <span className="mt-3 inline-flex text-sm font-medium text-zinc-500">Guide →</span>
            </Link>
            <Link
              href="/app/conversations"
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
            >
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">Conversations</h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Filter mentally by business name—threads list all projects in the workspace.
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
                <dd className="mt-0.5 flex flex-wrap items-center gap-2 text-zinc-800 dark:text-zinc-200">
                  {client.whatsappPhoneNumberId ? (
                    <>
                      <span className="font-mono text-xs break-all">
                        {showWhatsAppId
                          ? client.whatsappPhoneNumberId
                          : `••••••${client.whatsappPhoneNumberId.slice(-4)}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowWhatsAppId((s) => !s)}
                        className="text-xs font-medium text-zinc-600 underline decoration-zinc-400 underline-offset-2 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                      >
                        {showWhatsAppId ? "Hide" : "Show"}
                      </button>
                    </>
                  ) : (
                    "—"
                  )}
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
