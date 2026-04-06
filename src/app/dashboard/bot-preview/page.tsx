"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import PageIntro from "@/components/dashboard/PageIntro";

function useOrigin() {
  return useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => ""
  );
}

export default function BotPreviewPage() {
  const origin = useOrigin();
  const [snippet, setSnippet] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/clients", { credentials: "include" });
      const json = await res.json();
      const first = json.data?.[0];
      if (!cancelled && first?.widgetPublicId && origin) {
        setSnippet(`<script src="${origin}/widget.js" data-public-id="${first.widgetPublicId}" defer></script>`);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [origin]);

  return (
    <div>
      <PageIntro
        eyebrow="Website"
        title="Website widget"
        description={
          <>
            <p>
              The embed adds a fixed launcher and chat panel on the merchant&apos;s domain. The script loads from your
              host; the browser calls your public chat API with the client&apos;s public ID—no secrets in the page.
            </p>
            <p className="mt-2">
              Need the full integration story? See{" "}
              <Link href="/dashboard/integrations" className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-500 dark:text-zinc-100">
                Integrations
              </Link>{" "}
              for ops steps and a visitor preview.
            </p>
          </>
        }
      />

      <div className="space-y-6">
        <section className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Public chat endpoint</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Replace <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-800">{"{publicId}"}</code> with the
            value from <strong className="font-medium text-zinc-800 dark:text-zinc-200">Clients</strong> for that
            business.
          </p>
          <code className="mt-3 block overflow-x-auto rounded-xl bg-zinc-100 px-4 py-3 text-xs text-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
            {origin}/api/public/widget/{`{publicId}`}/chat
          </code>
        </section>

        <section className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Embed code</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Place before <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-800">&lt;/body&gt;</code> or via
            your tag manager. A client record must exist so a public ID is available.
          </p>
          <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-xl bg-zinc-100 p-4 text-xs text-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
            {snippet || "Create a business under Clients to generate embed code here."}
          </pre>
        </section>
      </div>
    </div>
  );
}
