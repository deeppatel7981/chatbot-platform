/** Static visual — suggests WhatsApp + lead handoff without backend. */
export default function MarketingWhatsAppPreview() {
  return (
    <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-4 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
      <div className="flex items-center gap-2 border-b border-zinc-100 pb-3 dark:border-zinc-800">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/15 text-lg" aria-hidden>
          💬
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">WhatsApp Business</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Preview — not a live thread</p>
        </div>
      </div>
      <div className="mt-3 space-y-2 text-sm">
        <div className="rounded-lg rounded-tl-sm bg-zinc-100 px-3 py-2 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
          Hi, do you deliver to Pune?
        </div>
        <div className="rounded-lg rounded-tr-sm bg-emerald-50 px-3 py-2 text-zinc-800 dark:bg-emerald-950/40 dark:text-emerald-100">
          Yes — we ship across India. Metro orders usually in 2–4 working days.
        </div>
      </div>
      <div className="mt-3 rounded-lg border border-amber-200/80 bg-amber-50/90 px-3 py-2 text-xs text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
        <strong>New lead</strong> — interested in bulk order · tap to assign
      </div>
    </div>
  );
}
