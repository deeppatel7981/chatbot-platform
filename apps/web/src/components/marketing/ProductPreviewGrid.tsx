import Link from "next/link";

const CARDS = [
  {
    title: "Shared team inbox",
    body: "Website and WhatsApp threads in one place — assign, resolve, and hand off without losing context.",
    abbr: "In",
  },
  {
    title: "AI FAQ assistant",
    body: "Answers from your uploads and policies — not generic fluff — with guardrails you control.",
    abbr: "FAQ",
  },
  {
    title: "Follow-up automation",
    body: "Remind your team about hot leads and no-reply conversations without building complex workflows.",
    abbr: "Fu",
  },
  {
    title: "Lead dashboard",
    body: "See new inquiries, status, and who owns the next step — built for SMEs, not enterprise CRM complexity.",
    abbr: "Le",
  },
  {
    title: "Knowledge upload",
    body: "Brochures, FAQs, and product lists — the bot grounds replies in what you actually sell.",
    abbr: "Kb",
  },
  {
    title: "Human handoff",
    body: "When confidence is low or the customer asks for a person, route to the right teammate instantly.",
    abbr: "Hh",
  },
] as const;

export default function ProductPreviewGrid() {
  return (
    <section className="w-full">
      <p className="text-center text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Product</p>
      <h2 className="mt-2 text-center text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
        Everything you need to run customer conversations
      </h2>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map((c) => (
          <li
            key={c.title}
            className="flex flex-col rounded-2xl border border-zinc-200/90 bg-white/90 p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-[10px] font-semibold uppercase tracking-wide text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              {c.abbr}
            </span>
            <h3 className="mt-3 font-semibold text-zinc-900 dark:text-zinc-50">{c.title}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{c.body}</p>
            <Link href="/solutions" className="mt-4 text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400">
              Learn more →
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
