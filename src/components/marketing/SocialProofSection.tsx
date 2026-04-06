const INDUSTRIES = [
  {
    title: "Real estate",
    useCase: "Property inquiries & site visits",
    quote: "“We never miss a WhatsApp lead now.”",
    icon: "⌂",
  },
  {
    title: "Clinics",
    useCase: "Timings & appointments",
    quote: "“Patients get answers before we pick up the phone.”",
    icon: "◆",
  },
  {
    title: "Coaching",
    useCase: "Admissions & course FAQs",
    quote: "“Parents ask the same questions — the bot handles them.”",
    icon: "◇",
  },
  {
    title: "Manufacturing",
    useCase: "Catalog & export inquiries",
    quote: "“Inquiries from the website and WhatsApp land in one place.”",
    icon: "▣",
  },
  {
    title: "D2C brands",
    useCase: "Orders & support",
    quote: "“Our team only steps in when it matters.”",
    icon: "◎",
  },
] as const;

export default function SocialProofSection() {
  return (
    <section id="social-proof" className="w-full scroll-mt-24">
      <p className="text-center text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Social proof</p>
      <h2 className="mt-2 text-center text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
        Trusted by growing Indian businesses
      </h2>
      <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-zinc-600 dark:text-zinc-400">
        Teams use one inbox for website chat and WhatsApp — with clear handoff when a human is needed.
      </p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {INDUSTRIES.map((c) => (
          <li
            key={c.title}
            className="flex flex-col rounded-2xl border border-zinc-200/90 bg-white/90 p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 text-lg text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200" aria-hidden>
              {c.icon}
            </span>
            <p className="mt-3 font-semibold text-zinc-900 dark:text-zinc-50">{c.title}</p>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{c.useCase}</p>
            <p className="mt-3 text-sm italic leading-relaxed text-zinc-700 dark:text-zinc-300">{c.quote}</p>
            <span className="mt-4 text-xs font-medium text-emerald-700 dark:text-emerald-400">Illustrative quotes — replace with real customers.</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
