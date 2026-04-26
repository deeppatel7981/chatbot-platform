"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import ApiErrorBanner from "@/components/dashboard/ApiErrorBanner";
import DashboardEmptyState from "@/components/dashboard/DashboardEmptyState";

type ContactRow = {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  source: string | null;
  createdAt: string;
};

export default function ContactsPage() {
  const [rows, setRows] = useState<ContactRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [source, setSource] = useState("");
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/contacts", { credentials: "include" });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || "Failed to load contacts");
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

  async function createContact(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() && !phone.trim() && !email.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || undefined,
          phone: phone.trim() || undefined,
          email: email.trim() || undefined,
          source: source.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || "Could not create contact");
        return;
      }
      setRows((prev) => [json.data, ...prev]);
      setModalOpen(false);
      setName("");
      setPhone("");
      setEmail("");
      setSource("");
    } catch {
      setError("Network error");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <header className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Directory</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Contacts</h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            <strong className="font-medium text-zinc-800 dark:text-zinc-200">Contact</strong> = someone you can reach again.{" "}
            <strong className="font-medium text-zinc-800 dark:text-zinc-200">Lead</strong> = opportunity to close — see the Leads
            page.
          </p>
        </header>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex shrink-0 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          Add contact
        </button>
      </div>

      {error ? <ApiErrorBanner message={error} onRetry={load} /> : null}

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-dashboard-card dark:border-zinc-800 dark:bg-zinc-950">
        {loading ? (
          <p className="px-4 py-10 text-center text-sm text-zinc-500">Loading…</p>
        ) : rows.length === 0 ? (
          <div className="border-t border-zinc-100 p-6 dark:border-zinc-800">
            <DashboardEmptyState
              title="No contacts saved yet"
              description={
                <>
                  <strong className="font-medium text-zinc-800 dark:text-zinc-200">Contacts</strong> are people you can reach again (name, phone, email). Use{" "}
                  <strong className="font-medium text-zinc-800 dark:text-zinc-200">Add contact</strong> above, or they will appear as shoppers message you on the widget or WhatsApp.
                </>
              }
              steps={[
                "Click Add contact to enter someone manually (at least one of name, phone, or email).",
                "Go live with the widget or WhatsApp — new threads create contact records over time.",
                "Use Leads when an inquiry should move through a pipeline with status.",
              ]}
              primaryAction={{ label: "Open conversations", href: "/app/conversations" }}
              secondaryAction={{ label: "Leads pipeline", href: "/app/leads" }}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/90 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">{r.name ?? "—"}</td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{r.phone ?? "—"}</td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{r.email ?? "—"}</td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{r.source ?? "—"}</td>
                    <td className="px-4 py-3 text-xs tabular-nums text-zinc-600 dark:text-zinc-400">{new Date(r.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/app/conversations"
          className="inline-flex rounded-xl border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          Conversations
        </Link>
        <Link
          href="/app/leads"
          className="inline-flex rounded-xl border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          Leads
        </Link>
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50 p-4 backdrop-blur-[2px]">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-modal-title"
            className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
          >
            <h2 id="contact-modal-title" className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Add contact
            </h2>
            <p className="mt-1 text-sm text-zinc-500">At least one of name, phone, or email.</p>
            <form onSubmit={createContact} className="mt-4 space-y-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
                placeholder="Name"
              />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
                placeholder="Phone"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
                placeholder="Email"
              />
              <input
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
                placeholder="Source (optional)"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
                >
                  {creating ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
