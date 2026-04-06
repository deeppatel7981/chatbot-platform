/**
 * Plain-language value for the merchant / operator using the console.
 */
export default function BusinessBenefitsCard() {
  return (
    <section className="mb-10 rounded-2xl border border-zinc-200 bg-gradient-to-b from-white to-zinc-50/80 p-6 shadow-sm dark:border-zinc-800 dark:from-zinc-950 dark:to-zinc-900/80 sm:p-8">
      <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        How this helps your business
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        You sell or support customers on <strong className="font-medium text-zinc-800 dark:text-zinc-200">WhatsApp</strong>{" "}
        and your <strong className="font-medium text-zinc-800 dark:text-zinc-200">website</strong>. This product connects
        both to the same brain: your uploaded policies and catalogs, so shoppers get instant answers 24/7—and your team
        sees when a conversation needs a human.
      </p>
      <ul className="mt-5 grid gap-3 text-sm text-zinc-700 dark:text-zinc-300 sm:grid-cols-2">
        <li className="flex gap-2 rounded-xl border border-zinc-200/80 bg-white/80 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-950/50">
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">1.</span>
          <span>
            <strong className="font-medium text-zinc-900 dark:text-zinc-50">Fewer missed chats</strong> — widget + WhatsApp
            in one system, so nothing falls through when staff are busy.
          </span>
        </li>
        <li className="flex gap-2 rounded-xl border border-zinc-200/80 bg-white/80 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-950/50">
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">2.</span>
          <span>
            <strong className="font-medium text-zinc-900 dark:text-zinc-50">Answers from your docs</strong> — upload FAQs
            and PDFs so the bot quotes your real policies, not generic text.
          </span>
        </li>
        <li className="flex gap-2 rounded-xl border border-zinc-200/80 bg-white/80 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-950/50">
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">3.</span>
          <span>
            <strong className="font-medium text-zinc-900 dark:text-zinc-50">Clear handoffs</strong> — see which threads
            need staff and open the transcript before you reply on WhatsApp or phone.
          </span>
        </li>
        <li className="flex gap-2 rounded-xl border border-zinc-200/80 bg-white/80 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-950/50">
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">4.</span>
          <span>
            <strong className="font-medium text-zinc-900 dark:text-zinc-50">One place to run brands</strong> — add each
            store or label under Clients with separate knowledge and widget IDs.
          </span>
        </li>
      </ul>
    </section>
  );
}
