"use client";

import Image from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";
import PageIntro from "@/components/dashboard/PageIntro";
import CopyButton from "@/components/CopyButton";
import AdminIntegrationFlow from "@/components/integrations/AdminIntegrationFlow";
import MerchantSiteChanges from "@/components/integrations/MerchantSiteChanges";
import VisitorWidgetPreview from "@/components/integrations/VisitorWidgetPreview";

function useOrigin() {
  return useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => ""
  );
}

const TABS = [
  { id: "overview", label: "Overview & flows" },
  { id: "widget", label: "Website widget" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "ai", label: "AI & LLM" },
] as const;

export default function IntegrationsPage() {
  const origin = useOrigin();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("overview");
  const [publicId, setPublicId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/clients", { credentials: "include" });
      const json = await res.json();
      const first = json.data?.[0];
      if (!cancelled && first?.widgetPublicId) setPublicId(first.widgetPublicId);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const widgetSnippet =
    publicId && origin
      ? `<script src="${origin}/widget.js" data-public-id="${publicId}" defer></script>`
      : `<!-- Create a client first, then paste your public ID -->\n<script src="${origin || "https://your-domain.com"}/widget.js" data-public-id="YOUR_PUBLIC_ID" defer></script>`;

  const chatUrl =
    publicId && origin
      ? `${origin}/api/public/widget/${publicId}/chat`
      : `${origin || "https://your-domain.com"}/api/public/widget/{publicId}/chat`;

  const webhookUrl = origin ? `${origin}/api/webhooks/whatsapp` : "https://your-domain.com/api/webhooks/whatsapp";

  return (
    <div>
      <PageIntro
        eyebrow="Setup"
        title="Integrations"
        description={
          <>
            <p>
              How <strong className="font-medium text-zinc-800 dark:text-zinc-200">you</strong> onboard each merchant
              (client record, knowledge, channels), what <strong className="font-medium text-zinc-800 dark:text-zinc-200">they</strong> add to
              their site (usually one script), and what <strong className="font-medium text-zinc-800 dark:text-zinc-200">shoppers</strong> see in
              the widget. Use the tabs for deep links and copy-ready snippets.
            </p>
          </>
        }
      />

      <div className="mb-8 flex flex-wrap gap-2 rounded-2xl border border-zinc-200 bg-zinc-50/80 p-1 dark:border-zinc-800 dark:bg-zinc-900/50">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={[
              "rounded-xl px-4 py-2 text-sm font-semibold transition",
              tab === t.id
                ? "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200/80 dark:bg-zinc-800 dark:text-zinc-50 dark:ring-zinc-600"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="space-y-10">
          <section className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Your integration flow (ops team)</h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              From zero to live messages — all under your workspace.
            </p>
            <div className="mt-6">
              <AdminIntegrationFlow />
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">What the merchant changes (website)</h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Typically <strong>one script line</strong> in their layout or tag manager. No database access for them.
            </p>
            <div className="mt-6">
              <MerchantSiteChanges embedSnippet={widgetSnippet} />
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">What visitors see (client-side)</h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Matches the behaviour of <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-800">public/widget.js</code>{" "}
              — fixed bottom-right launcher and chat panel.
            </p>
            <div className="mt-6">
              <VisitorWidgetPreview />
            </div>
          </section>

          <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-200">
            Next: use <strong>Website widget</strong> for exact embed + API details, <strong>WhatsApp</strong> for Meta
            webhook, <strong>AI &amp; LLM</strong> for models.
          </div>
        </div>
      )}

      {tab === "widget" && (
        <div className="grid gap-8 lg:grid-cols-[1fr_280px] lg:items-start">
          <div className="space-y-6 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Embed on your customer&apos;s site</h2>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-zinc-600 dark:text-zinc-400">
                <li>Create a <strong className="text-zinc-800 dark:text-zinc-200">client</strong> (business) in Clients.</li>
                <li>Add the script before <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">&lt;/body&gt;</code>.</li>
                <li>
                  The widget calls your hosted <strong className="text-zinc-800 dark:text-zinc-200">public chat API</strong>{" "}
                  — no API keys in the browser.
                </li>
              </ol>
            </div>
            <div>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Embed code</span>
                <CopyButton text={widgetSnippet} />
              </div>
              <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl bg-zinc-950 p-4 text-xs text-zinc-100">
                {widgetSnippet}
              </pre>
            </div>
            <div>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Public chat endpoint</span>
                <CopyButton text={chatUrl} label="Copy URL" />
              </div>
              <code className="block break-all rounded-xl bg-zinc-100 px-3 py-2 text-xs text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                {chatUrl}
              </code>
              <p className="mt-2 text-xs text-zinc-500">
                POST JSON: <code className="rounded bg-zinc-200/60 px-1 dark:bg-zinc-700">message</code>,{" "}
                <code className="rounded bg-zinc-200/60 px-1 dark:bg-zinc-700">visitorId</code>, optional{" "}
                <code className="rounded bg-zinc-200/60 px-1 dark:bg-zinc-700">consent</code>.
              </p>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <Image
              src="/illustrations/channels.svg"
              alt=""
              width={480}
              height={280}
              className="h-auto w-full"
            />
            <p className="border-t border-zinc-100 p-4 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              Visitors stay on the brand&apos;s domain; messages hit your RAG pipeline and inbox.
            </p>
          </div>
        </div>
      )}

      {tab === "whatsapp" && (
        <div className="grid gap-8 lg:grid-cols-[1fr_280px] lg:items-start">
          <div className="space-y-6 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">WhatsApp Cloud API</h2>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-zinc-600 dark:text-zinc-400">
                <li>In Meta Developer Console, set the webhook URL to the value below (HTTPS required).</li>
                <li>Use the same <strong className="text-zinc-800 dark:text-zinc-200">verify token</strong> you saved on the client record.</li>
                <li>Subscribe to <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">messages</code> fields.</li>
              </ol>
            </div>
            <div>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Webhook URL</span>
                <CopyButton text={webhookUrl} label="Copy" />
              </div>
              <code className="block break-all rounded-xl bg-zinc-100 px-3 py-2 text-xs text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                {webhookUrl}
              </code>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Inbound messages use the same RAG + safety path as the widget, so policies stay consistent across channels.
            </p>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <Image src="/illustrations/channels.svg" alt="" width={480} height={280} className="h-auto w-full opacity-90" />
            <p className="border-t border-zinc-100 p-4 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              Phone numbers and tokens are stored per client — isolate brands at the data layer.
            </p>
          </div>
        </div>
      )}

      {tab === "ai" && (
        <div className="grid gap-8 lg:grid-cols-[1fr_280px] lg:items-start">
          <div className="space-y-6 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Models & retrieval</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-600 dark:text-zinc-400">
                <li>
                  <strong className="text-zinc-800 dark:text-zinc-200">Chat:</strong> choose an OpenAI chat model in{" "}
                  <strong className="text-zinc-800 dark:text-zinc-200">Settings → AI</strong> (workspace default). Falls
                  back to <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">OPENAI_CHAT_MODEL</code> in env.
                </li>
                <li>
                  <strong className="text-zinc-800 dark:text-zinc-200">Embeddings:</strong>{" "}
                  <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">text-embedding-3-small</code> (1536d) for
                  pgvector — set <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">OPENAI_API_KEY</code>.
                </li>
                <li>
                  <strong className="text-zinc-800 dark:text-zinc-200">Future:</strong> AWS Bedrock can sit behind the same
                  orchestration layer for region residency if you need it.
                </li>
              </ul>
            </div>
            <div className="rounded-xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
              Customer-facing quality is a mix of <strong>good uploads</strong> (Knowledge) and <strong>model tier</strong>.
              Start with GPT-4o mini; move to GPT-4o when you need sharper answers.
            </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <Image src="/illustrations/ops-console.svg" alt="" width={480} height={280} className="h-auto w-full" />
            <p className="border-t border-zinc-100 p-4 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              All traffic is tied to your org and client IDs for clean reporting.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
