import Link from "next/link";

const ITEMS = [
  {
    q: "Does this work with WhatsApp?",
    a: "Yes — connect WhatsApp Business alongside your website widget so customers reach you where they already are.",
  },
  {
    q: "Can my team take over conversations?",
    a: "Absolutely. You choose when the bot steps aside and staff continue with full thread context.",
  },
  {
    q: "Do I need coding knowledge?",
    a: "No. Setup is guided with plain-language steps; technical details stay under the hood.",
  },
  {
    q: "How long does setup take?",
    a: "Many teams get a first version live in well under an hour — depending on how much content you upload.",
  },
] as const;

export default function MarketingFAQTeaser() {
  return (
    <section className="w-full">
      <p className="text-center text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">FAQ</p>
      <h2 className="mt-2 text-center text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
        Questions business owners ask first
      </h2>
      <div className="mx-auto mt-8 max-w-2xl space-y-2">
        {ITEMS.map((item) => (
          <details
            key={item.q}
            className="group rounded-xl border border-zinc-200/90 bg-white/90 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/80"
          >
            <summary className="cursor-pointer list-none font-medium text-zinc-900 outline-none marker:content-none dark:text-zinc-50 [&::-webkit-details-marker]:hidden">
              <span className="flex items-center justify-between gap-2">
                {item.q}
                <span className="text-zinc-400 transition group-open:rotate-180" aria-hidden>
                  ▼
                </span>
              </span>
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{item.a}</p>
          </details>
        ))}
      </div>
      <p className="mt-6 text-center">
        <Link href="/faq" className="text-sm font-medium text-emerald-700 underline-offset-2 hover:underline dark:text-emerald-400">
          See all questions →
        </Link>
      </p>
    </section>
  );
}
