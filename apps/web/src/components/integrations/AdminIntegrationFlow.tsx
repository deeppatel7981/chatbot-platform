const STEPS = [
  {
    n: 1,
    title: "Create the client",
    detail: "Dashboard → Clients → New client. Each brand gets its own widget public ID and optional WhatsApp credentials.",
  },
  {
    n: 2,
    title: "Train the bot",
    detail: "Knowledge base → pick the client → upload PDF, DOCX, or TXT. Chunks are embedded for RAG.",
  },
  {
    n: 3,
    title: "Copy embed code",
    detail: "Integrations → Website widget. One script tag with data-public-id — send this to the merchant or paste it yourself.",
  },
  {
    n: 4,
    title: "(Optional) WhatsApp",
    detail: "Add Meta phone number ID + tokens on the client, then point the Meta webhook to this platform’s URL.",
  },
  {
    n: 5,
    title: "Operate",
    detail: "Conversations, analytics, and Settings (AI model, retention) apply per workspace.",
  },
] as const;

export default function AdminIntegrationFlow() {
  return (
    <ol className="space-y-0">
      {STEPS.map((s, i) => (
        <li key={s.n} className="relative flex gap-4 pb-8 last:pb-0">
          {i < STEPS.length - 1 ? (
            <span
              className="absolute left-[15px] top-8 h-[calc(100%-8px)] w-px bg-zinc-200 dark:bg-zinc-700"
              aria-hidden
            />
          ) : null}
          <span className="relative z-[1] flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900">
            {s.n}
          </span>
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{s.title}</h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{s.detail}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
