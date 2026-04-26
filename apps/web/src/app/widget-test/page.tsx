"use client";

import Link from "next/link";
import { Suspense, useEffect, useId, useState } from "react";
import { useSearchParams } from "next/navigation";

function removeWidgetDom() {
  document.getElementById("cw-widget-root")?.remove();
  document.querySelectorAll("script[data-cw-widget-test]").forEach((el) => el.remove());
}

function WidgetTestContent() {
  const searchParams = useSearchParams();
  const qpPublicId = searchParams.get("publicId")?.trim() ?? "";
  const [manualPublicId, setManualPublicId] = useState("");
  const [clients, setClients] = useState<{ name: string; widgetPublicId: string }[]>([]);
  const formId = useId();

  const publicId = qpPublicId || manualPublicId.trim();

  useEffect(() => {
    void fetch("/api/clients", { credentials: "include" })
      .then((r) => r.json())
      .then((j: { data?: { name: string; widgetPublicId: string }[] }) => {
        if (Array.isArray(j?.data)) setClients(j.data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!publicId) {
      removeWidgetDom();
      return;
    }

    removeWidgetDom();
    const s = document.createElement("script");
    s.src = `${window.location.origin}/widget.js`;
    s.setAttribute("data-public-id", publicId);
    s.setAttribute("data-cw-widget-test", "1");
    s.defer = true;
    document.body.appendChild(s);

    return () => {
      removeWidgetDom();
    };
  }, [publicId]);

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-3xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">Demo merchant site</p>
            <h1 className="text-lg font-semibold">Acme Outdoor · Pune</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Same layout as a merchant page — the widget is the real embed.</p>
          </div>
          <Link
            href="/app/widget"
            className="text-sm font-medium text-emerald-700 underline underline-offset-2 dark:text-emerald-400"
          >
            Dashboard embed →
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-base font-semibold">Store content</h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            This block is ordinary page copy. The chat launcher should appear at the <strong>bottom-right</strong> (fixed).
            Open the panel, send a message — it hits{" "}
            <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-800">/api/public/widget/…/chat</code> on this
            host.
          </p>
        </section>

        <section className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-base font-semibold">Widget public ID</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Use a project&apos;s <strong>widget public ID</strong> from{" "}
            <Link href="/app/projects" className="font-medium text-emerald-700 underline dark:text-emerald-400">
              Projects
            </Link>
            . Or open with query:{" "}
            <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-800">/widget-test?publicId=YOUR_UUID</code>
          </p>

          {clients.length > 0 ? (
            <div className="mt-4">
              <label htmlFor={`${formId}-pick`} className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Your workspace projects
              </label>
              <select
                id={`${formId}-pick`}
                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                value={manualPublicId}
                onChange={(e) => setManualPublicId(e.target.value)}
              >
                <option value="">Select a client…</option>
                {clients.map((c) => (
                  <option key={c.widgetPublicId} value={c.widgetPublicId}>
                    {c.name} — {c.widgetPublicId.slice(0, 8)}…
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div className="mt-4">
            <label htmlFor={`${formId}-manual`} className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Or paste public UUID
            </label>
            <input
              id={`${formId}-manual`}
              className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-950"
              placeholder="00000000-0000-4000-8000-000000000000"
              value={qpPublicId ? qpPublicId : manualPublicId}
              onChange={(e) => {
                if (!qpPublicId) setManualPublicId(e.target.value);
              }}
              readOnly={Boolean(qpPublicId)}
            />
          </div>

          {!publicId ? (
            <p className="mt-4 text-sm text-amber-800 dark:text-amber-200">Choose or paste a public ID to load the widget.</p>
          ) : null}
        </section>

        <section className="mt-8 rounded-2xl border border-dashed border-zinc-300 bg-zinc-100/50 p-6 dark:border-zinc-600 dark:bg-zinc-900/50">
          <h2 className="text-base font-semibold">Test on a different domain (real site)</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-zinc-700 dark:text-zinc-300">
            <li>
              Expose this app over <strong>HTTPS</strong> (e.g. deploy to Vercel, or run{" "}
              <code className="rounded bg-white px-1 text-xs dark:bg-zinc-800">ngrok http 3002</code> and use the https URL).
            </li>
            <li>
              In the other site&apos;s HTML (before <code className="rounded bg-white px-1 text-xs dark:bg-zinc-800">&lt;/body&gt;</code>
              ), add:
              <pre className="mt-2 overflow-x-auto rounded-lg bg-zinc-900 p-3 text-xs text-zinc-100">
{`<script src="${origin || "https://YOUR_APP_HOST"}/widget.js" data-public-id="${publicId || "YOUR_PUBLIC_ID"}" defer></script>`}
              </pre>
            </li>
            <li>The public chat API already sends CORS headers for browser calls from merchant origins.</li>
          </ol>
        </section>
      </main>
    </div>
  );
}

export default function WidgetTestPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">Loading…</div>
      }
    >
      <WidgetTestContent />
    </Suspense>
  );
}
