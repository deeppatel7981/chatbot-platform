"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import PageIntro from "@/components/dashboard/PageIntro";
import ConversationStaffReplyForm from "@/components/conversations/ConversationStaffReplyForm";

type Msg = { id: string; role: string; body: string; createdAt: string };
type Conv = {
  id: string;
  channel: string;
  status: string;
  needsHuman: boolean;
  lastConfidence: string | null;
  updatedAt: string;
  createdAt?: string;
  clientName: string;
  clientId: string;
  contactPhone?: string | null;
};

function channelLabel(channel: string): string {
  const c = channel.toLowerCase();
  if (c === "whatsapp") return "WhatsApp";
  if (c === "widget") return "Website chat";
  return channel;
}

function waMeUrl(phone: string | null | undefined): string | null {
  const digits = phone?.replace(/\D/g, "");
  if (!digits || digits.length < 10) return null;
  return `https://wa.me/${digits}`;
}

function transcriptRoleLabel(role: string): string {
  if (role === "user") return "Customer";
  if (role === "staff") return "Team";
  return "Assistant";
}

export default function PortalConversationDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const clientId = params.clientId as string;
  const [conversation, setConversation] = useState<Conv | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadConversation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/conversations/${id}`, { credentials: "include" });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || "Failed to load");
        setConversation(null);
        setMessages([]);
        return;
      }
      setConversation(json.data.conversation);
      setMessages(json.data.messages || []);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [id, clientId]);

  useEffect(() => {
    void loadConversation();
  }, [loadConversation]);

  async function patchConversation(body: Record<string, unknown>) {
    setActionBusy(true);
    setActionMessage(null);
    try {
      const res = await fetch(`/api/conversations/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) {
        setActionMessage(json?.error || "Could not update");
        return;
      }
      if (json.data?.conversation) {
        setConversation(json.data.conversation as Conv);
      } else {
        await loadConversation();
      }
      setActionMessage("Updated.");
    } catch {
      setActionMessage("Network error");
    } finally {
      setActionBusy(false);
    }
  }

  const waLink = conversation ? waMeUrl(conversation.contactPhone) : null;
  const isOpen = conversation?.status?.toLowerCase() !== "closed";
  const ch = conversation?.channel?.toLowerCase() ?? "";

  return (
    <div>
      <Link
        href={`/portal/${clientId}/chat-logs`}
        className="mb-6 inline-flex text-sm font-medium text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        ← Back to conversations
      </Link>

      {error ? (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-zinc-500">Loading thread…</p>
      ) : conversation ? (
        <>
          <PageIntro
            eyebrow="Thread"
            title={`${conversation.clientName} · ${channelLabel(conversation.channel)}`}
            description={
              <>
                <p>
                  Status:{" "}
                  <strong className="font-medium text-zinc-800 dark:text-zinc-200">{conversation.status}</strong>
                  {" · "}
                  Handoff:{" "}
                  <strong className="font-medium text-zinc-800 dark:text-zinc-200">
                    {conversation.needsHuman ? "Yes" : "No"}
                  </strong>
                  {" · "}
                  Last confidence:{" "}
                  <strong className="font-medium text-zinc-800 dark:text-zinc-200">
                    {conversation.lastConfidence ?? "—"}
                  </strong>
                </p>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                  Use <strong className="font-medium text-zinc-800 dark:text-zinc-200">Team reply</strong> to message the
                  customer in the same website widget thread (and on WhatsApp when a phone is on file).
                </p>
              </>
            }
            actions={
              <>
                <Link
                  href={`/portal/${clientId}`}
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                >
                  Overview
                </Link>
                <Link
                  href={`/portal/${clientId}/documents`}
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                >
                  Knowledge uploads
                </Link>
              </>
            }
          />

          <section className="mb-8 rounded-2xl border border-zinc-200/80 bg-gradient-to-b from-zinc-50/90 to-white p-5 shadow-sm dark:border-zinc-800 dark:from-zinc-900/60 dark:to-zinc-950/90 sm:p-6">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">What to do next</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-zinc-700 dark:text-zinc-300">
              {conversation.needsHuman ? (
                <>
                  <li>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">Reply from this page</span> using Team
                    reply, or externally if you prefer.
                    {ch === "whatsapp" && waLink ? (
                      <>
                        {" "}
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-emerald-700 underline decoration-emerald-600/40 underline-offset-2 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
                        >
                          Open WhatsApp
                        </a>{" "}
                        (from saved contact phone).
                      </>
                    ) : ch === "whatsapp" && !waLink ? (
                      <span className="text-zinc-500 dark:text-zinc-400">
                        {" "}
                        No phone on file for this contact — use WhatsApp Business on your phone with the customer&apos;s
                        number from your own records.
                      </span>
                    ) : (
                      <span className="text-zinc-500 dark:text-zinc-400">
                        {" "}
                        Website chat: the visitor sees your team message in the widget within a few seconds.
                      </span>
                    )}
                  </li>
                  <li>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">Log the outcome</span> in your CRM or
                    shared sheet so your team sees ownership.
                  </li>
                  <li>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">Improve the bot</span> — upload FAQs
                    or policy docs for this business so the next similar question is answered automatically.
                  </li>
                </>
              ) : conversation.lastConfidence === "low" || conversation.lastConfidence === "medium" ? (
                <>
                  <li>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">Skim the last assistant reply</span> for
                    factual risk; low or medium confidence means retrieval was weak or the model hedged.
                  </li>
                  <li>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">Add or refine uploads</span> for this
                    client (PDF / DOCX / TXT) so answers stay grounded.
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">Spot-check tone and facts</span> on
                    the latest assistant message.
                  </li>
                  <li>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">Keep knowledge fresh</span> when
                    prices, SKUs, or policies change.
                  </li>
                </>
              )}
            </ol>

            {messages.length === 0 ? (
              <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
                No messages in storage yet — if you expected history, confirm the channel is saving to this workspace and
                refresh in a moment.
              </p>
            ) : null}

            <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-zinc-200/80 pt-5 dark:border-zinc-700/80">
              {isOpen ? (
                <button
                  type="button"
                  disabled={actionBusy}
                  onClick={() => void patchConversation({ needsHuman: false, status: "closed" })}
                  className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                >
                  {actionBusy ? "Saving…" : "Mark done & close thread"}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={actionBusy}
                  onClick={() => void patchConversation({ status: "open" })}
                  className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                >
                  {actionBusy ? "Saving…" : "Reopen thread"}
                </button>
              )}
              {actionMessage ? (
                <span className="text-sm text-zinc-600 dark:text-zinc-400" role="status">
                  {actionMessage}
                </span>
              ) : null}
            </div>
          </section>

          <div className="mb-8">
            <ConversationStaffReplyForm conversationId={id} isOpen={isOpen} onSent={() => void loadConversation()} />
          </div>

          <div className="space-y-3 rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Transcript</h2>
            {messages.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">No messages stored for this thread yet.</p>
            ) : (
              <ul className="space-y-4">
                {messages.map((m) => (
                  <li key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={
                        m.role === "user"
                          ? "max-w-[90%] rounded-2xl rounded-br-md bg-zinc-800 px-4 py-2.5 text-sm text-white dark:bg-zinc-200 dark:text-zinc-900"
                          : m.role === "staff"
                            ? "max-w-[90%] rounded-2xl rounded-bl-md border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100"
                            : "max-w-[90%] rounded-2xl rounded-bl-md border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-800 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                      }
                    >
                      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                        {transcriptRoleLabel(m.role)}
                      </span>
                      {m.body}
                      <span className="mt-2 block text-[10px] text-zinc-500 dark:text-zinc-400">
                        {new Date(m.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
