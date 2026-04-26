const STATS = [
  { label: "< 30 min setup", sub: "guided steps" },
  { label: "24/7 instant replies", sub: "on your content" },
  { label: "Built for Indian SMEs", sub: "INR · local hours" },
  { label: "Web + WhatsApp", sub: "one inbox" },
] as const;

export default function MarketingHeroStats() {
  return (
    <div className="grid grid-cols-2 gap-3 border-y border-zinc-200/80 py-6 dark:border-zinc-800 lg:grid-cols-4">
      {STATS.map((s) => (
        <div key={s.label} className="text-center sm:text-left">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{s.label}</p>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{s.sub}</p>
        </div>
      ))}
    </div>
  );
}
