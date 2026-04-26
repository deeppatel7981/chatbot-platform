"use client";

import { useState } from "react";

type Props = {
  conversationId: string;
  isOpen: boolean;
  onSent: () => void | Promise<void>;
};

export default function ConversationStaffReplyForm({ conversationId, isOpen, onSent }: Props) {
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  if (!isOpen) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Reopen the thread to send another team message.
      </p>
    );
  }

  async function send() {
    const text = body.trim();
    if (!text) {
      setNote("Enter a message.");
      return;
    }
    setBusy(true);
    setNote(null);
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text, resolveHandoff: true }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setNote(typeof json?.error === "string" ? json.error : "Could not send");
        return;
      }
      setBody("");
      setNote("Sent. The customer will see this in the website widget on the next refresh (within a few seconds).");
      await onSent();
    } catch {
      setNote("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/25">
      <h2 className="text-sm font-semibold text-emerald-950 dark:text-emerald-100">Team reply</h2>
      <p className="mt-1 text-xs text-emerald-900/80 dark:text-emerald-200/90">
        For <strong>website chat</strong>, your message appears in the visitor&apos;s widget automatically. For{" "}
        <strong>WhatsApp</strong>, we also send this text on the thread when a phone number is on file.
      </p>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        placeholder="Write what the customer should see…"
        className="mt-3 w-full rounded-xl border border-emerald-200/90 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 dark:border-emerald-800 dark:bg-zinc-950 dark:text-zinc-100"
      />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => void send()}
          className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-500"
        >
          {busy ? "Sending…" : "Send to customer"}
        </button>
      </div>
      {note ? (
        <p className="mt-2 text-xs text-emerald-900 dark:text-emerald-200" role="status">
          {note}
        </p>
      ) : null}
    </div>
  );
}
