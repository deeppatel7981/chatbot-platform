import Image from "next/image";
import Link from "next/link";
import SiteHeader from "@/components/marketing/SiteHeader";

const STEPS = [
  {
    title: "1 · Central ops",
    body: "Your team logs into one console: clients, documents, models, and transcripts — no scattered tools.",
    src: "/illustrations/ops-console.svg",
  },
  {
    title: "2 · Customer touchpoints",
    body: "End customers talk on the website widget or WhatsApp. Both feed the same knowledge and policies.",
    src: "/illustrations/channels.svg",
  },
  {
    title: "3 · Safe handoff",
    body: "When confidence drops or policy requires it, conversations surface for staff with context preserved.",
    src: "/illustrations/handoff.svg",
  },
] as const;

export default function SolutionsPage() {
  return (
    <div className="min-h-screen hero-gradient">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl px-6 py-16 sm:px-10 lg:max-w-5xl xl:max-w-6xl xl:px-12 2xl:max-w-7xl">
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Customer use case</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          How we fit your client workflow
        </h1>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
          You sell and support multiple brands. Each brand gets isolated data, a public widget key, and optional WhatsApp
          credentials — while your operators see a single inbox and analytics layer.
        </p>

        <ol className="mt-12 space-y-12">
          {STEPS.map((s) => (
            <li
              key={s.title}
              className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="grid gap-0 md:grid-cols-2 md:items-center">
                <div className="p-8">
                  <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{s.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{s.body}</p>
                </div>
                <div className="relative bg-zinc-50 dark:bg-zinc-950/50">
                  <Image src={s.src} alt="" width={480} height={280} className="h-auto w-full" />
                </div>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-12 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Integration flows (detailed)</h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            After sign-in, <strong className="text-zinc-800 dark:text-zinc-200">Integrations</strong> walks through your
            step-by-step ops flow, what merchants add to their HTML (usually one script), and a live preview of the
            visitor-facing chat widget.
          </p>
          <Link
            href="/login?callbackUrl=%2Fdashboard%2Fintegrations"
            className="mt-4 inline-flex rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            Sign in → integration guide
          </Link>
        </div>

        <div className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-700 dark:bg-zinc-900/80">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">LLM options</h2>
          <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
            Chat uses OpenAI today (configurable per workspace under Settings → AI). Embeddings use{" "}
            <code className="rounded bg-white px-1 dark:bg-zinc-800">text-embedding-3-small</code> for pgvector. For
            India residency or custom models, Bedrock or self-hosted backends can plug into the same orchestration layer.
          </p>
          <Link
            href="/login"
            className="mt-4 inline-flex rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            Open dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
