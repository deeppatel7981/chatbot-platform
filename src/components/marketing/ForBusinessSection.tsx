import Link from "next/link";

/** Public-site block: outcome-focused copy for business owners. */
export default function ForBusinessSection() {
  return (
    <section id="for-business" className="mx-auto mt-20 max-w-5xl px-6 pb-20 sm:px-10 lg:px-12">
      <div className="rounded-3xl border border-zinc-200 bg-white/90 p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90 sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">For your business</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
          Turn chats into revenue—not extra work
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Customers already ask questions on WhatsApp and your site. We help you answer from your real product and policy
          content, escalate only when needed, and keep every brand organized in one console—so you scale support without
          cloning spreadsheets or losing context.
        </p>
        <ul className="mt-6 space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
          <li className="flex gap-2">
            <span className="text-zinc-400" aria-hidden>
              ✓
            </span>
            <span>Same AI context on website chat and WhatsApp—no duplicate setup per channel.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-zinc-400" aria-hidden>
              ✓
            </span>
            <span>Your uploads drive answers—reduces “I don’t know” and builds trust.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-zinc-400" aria-hidden>
              ✓
            </span>
            <span>Handoff signals so your team spends time where money or risk is on the line.</span>
          </li>
        </ul>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/login"
            className="inline-flex rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            Open console
          </Link>
          <Link
            href="/solutions"
            className="inline-flex rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            See how it fits
          </Link>
        </div>
      </div>
    </section>
  );
}
