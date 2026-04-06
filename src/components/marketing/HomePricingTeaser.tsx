import Link from "next/link";

const PLANS = [
  {
    name: "Starter",
    price: "₹0",
    period: "to start",
    blurb: "Solo operators trying website + WhatsApp in one inbox.",
    cta: "Start free",
    href: "/signup",
    style: "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950",
    featured: false,
  },
  {
    name: "Growth",
    price: "Custom",
    period: "INR / month",
    blurb: "Growing teams that need handoffs, knowledge upload, and alerts.",
    cta: "Book demo",
    href: "/book-demo",
    style: "border-emerald-200 ring-2 ring-emerald-500/20 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/30",
    featured: true,
  },
  {
    name: "Pro",
    price: "Talk to us",
    period: "volume & SLA",
    blurb: "Multiple brands, priority support, and onboarding help.",
    cta: "Talk to sales",
    href: "/contact",
    style: "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950",
    featured: false,
  },
] as const;

export default function HomePricingTeaser() {
  return (
    <section id="pricing-teaser" className="w-full scroll-mt-24">
      <p className="text-center text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Pricing</p>
      <h2 className="mt-2 text-center text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
        Simple plans — no token math
      </h2>
      <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-zinc-600 dark:text-zinc-400">
        Public pricing stays in plain INR. Final numbers depend on channels and seats — see the full comparison.
      </p>
      <ul className="mt-8 grid gap-4 lg:grid-cols-3">
        {PLANS.map((p) => (
          <li
            key={p.name}
            className={`flex flex-col rounded-2xl border p-6 shadow-sm ${p.style}`}
          >
            {p.featured ? (
              <span className="mb-2 w-fit rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-semibold text-white dark:bg-emerald-500">Popular</span>
            ) : null}
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{p.name}</p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
              {p.price}
              <span className="ml-1 text-base font-normal text-zinc-500 dark:text-zinc-400"> {p.period}</span>
            </p>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{p.blurb}</p>
            <Link
              href={p.href}
              className={`mt-6 inline-flex justify-center rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition ${
                p.featured
                  ? "bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400"
                  : "border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              {p.cta}
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-center">
        <Link href="/pricing" className="text-sm font-medium text-emerald-700 underline-offset-2 hover:underline dark:text-emerald-400">
          View full pricing & FAQs →
        </Link>
      </p>
    </section>
  );
}
