"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import PageIntro from "@/components/dashboard/PageIntro";

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
};

export default function ConversationDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [conversation, setConversation] = useState<Conv | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/conversations/${id}`, { credentials: "include" });
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(json?.error || "Failed to load");
          setConversation(null);
          setMessages([]);
          return;
        }
        setConversation(json.data.conversation);
        setMessages(json.data.messages || []);
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
        href="/dashboard/chat-logs"
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
            title={`${conversation.clientName} · ${conversation.channel}`}
            description={
              <>
                <p>
                  Status: <strong className="font-medium text-zinc-800 dark:text-zinc-200">{conversation.status}</strong>
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
                  Read-only transcript for context. Replying from the console is on the roadmap—use WhatsApp Business or
                  your CRM for now when handoff is yes.
                </p>
              </>
            }
            actions={
              <Link
                href={`/dashboard/clients/${conversation.clientId}`}
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
              >
                View business
              </Link>
            }
          />

          <div className="space-y-3 rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Transcript</h2>
            {messages.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">No messages stored for this thread yet.</p>
            ) : (
              <ul className="space-y-4">
                {messages.map((m) => (
                  <li
                    key={m.id}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={
                        m.role === "user"
                          ? "max-w-[90%] rounded-2xl rounded-br-md bg-zinc-800 px-4 py-2.5 text-sm text-white dark:bg-zinc-200 dark:text-zinc-900"
                          : "max-w-[90%] rounded-2xl rounded-bl-md border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-800 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                      }
                    >
                      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                        {m.role === "user" ? "Customer" : "Assistant"}
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
