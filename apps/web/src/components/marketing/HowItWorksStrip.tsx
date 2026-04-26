import Link from "next/link";

const STEPS = [
  {
    title: "Capture inquiries",
    body: "Collect questions and leads from your website chat and WhatsApp in one inbox.",
  },
  {
    title: "Answer instantly",
    body: "Reply using your real business information — brochures, FAQs, and policies.",
  },
  {
    title: "Qualify customers",
    body: "Ask smart follow-ups and spot serious buyers before your team spends time.",
  },
  {
    title: "Send to your team",
    body: "Notify the right person with a clear summary when a human should take over.",
  },
] as const;

/** On-home summary so “How it works” does not duplicate the /solutions nav target. */
export default function HowItWorksStrip() {
  return (
    <section id="how-it-works" className="w-full scroll-mt-24">
      <div className="rounded-2xl border border-zinc-200/80 bg-white/80 p-6 dark:border-zinc-800 dark:bg-zinc-950/80 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">How it works</p>
        <h2 className="mt-1 text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-2xl">From first message to your team in four steps</h2>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
          The detailed product tour and diagrams live on Solutions — here’s the short version for busy owners.
        </p>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li
              key={s.title}
              className="rounded-xl border border-zinc-200/90 bg-zinc-50/80 p-4 dark:border-zinc-700/80 dark:bg-zinc-900/50"
            >
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{i + 1}</span>
              <p className="mt-1 font-medium text-zinc-900 dark:text-zinc-50">{s.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{s.body}</p>
            </li>
          ))}
        </ol>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/solutions#flow"
            className="inline-flex rounded-lg border border-zinc-200 bg-white px-5 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            View product tour →
          </Link>
          <Link
            href="/#live-widget-demo"
            className="inline-flex rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-[var(--primary-hover)]"
          >
            Try live demo
          </Link>
        </div>
      </div>
    </section>
  );
}
