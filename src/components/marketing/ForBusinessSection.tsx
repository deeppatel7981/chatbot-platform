import Link from "next/link";

/** Public-site block: outcome-focused copy for business owners. */
export default function ForBusinessSection() {
  return (
    <section id="for-business" className="w-full scroll-mt-24">
      <div className="rounded-2xl border border-zinc-200/80 bg-white/80 p-6 dark:border-zinc-800 dark:bg-zinc-950/80 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">For your business</p>
        <h2 className="mt-1 text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-2xl">
          Turn chats into revenue—not extra work
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Answer from your real product and policy content on WhatsApp and your site. Escalate when needed — one console,
          no duplicate setup per channel.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
          <li className="flex gap-2">
            <span className="text-zinc-400" aria-hidden>
              ✓
            </span>
            <span>Same brain on widget and WhatsApp.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-zinc-400" aria-hidden>
              ✓
            </span>
            <span>Uploads drive answers; clear handoff when confidence is low.</span>
          </li>
        </ul>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/login"
            className="inline-flex rounded-lg bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            Open console
          </Link>
          <Link
            href="/solutions"
            className="inline-flex rounded-lg border border-zinc-200 px-5 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            How it fits
          </Link>
        </div>
      </div>
    </section>
  );
}
