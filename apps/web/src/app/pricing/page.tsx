import type { Metadata } from "next";
import Link from "next/link";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import SiteHeader from "@/components/marketing/SiteHeader";
import { APP_DISPLAY_NAME } from "@/lib/branding";

export const metadata: Metadata = {
  title: `Pricing — ${APP_DISPLAY_NAME}`,
  description: `Simple INR plans for WhatsApp and website customer ops. ${APP_DISPLAY_NAME} — no token pricing on public pages.`,
};

const PLANS = [
  {
    name: "Starter",
    price: "Free to start",
    detail: "Best for solo owners testing web + WhatsApp in one place.",
    bullets: ["1 workspace", "Website widget + WhatsApp path", "Basic knowledge upload", "Email support"],
    cta: { label: "Start free", href: "/signup" },
    variant: "default" as const,
  },
  {
    name: "Growth",
    price: "Custom (INR / mo)",
    detail: "Teams that need handoffs, alerts, and more content.",
    bullets: ["Multiple seats", "Priority onboarding help", "Team notifications", "Usage aligned to your volume"],
    cta: { label: "Book demo", href: "/book-demo" },
    variant: "featured" as const,
  },
  {
    name: "Pro",
    price: "Talk to sales",
    detail: "Multiple brands, SLAs, and deeper support.",
    bullets: ["Dedicated success touchpoint", "Custom rollout", "Volume pricing", "Security review"],
    cta: { label: "Contact sales", href: "/contact" },
    variant: "default" as const,
  },
];

export default function PricingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden hero-gradient mesh-bg">
      <SiteHeader />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(250,250,250,0.9))] dark:bg-[linear-gradient(to_bottom,transparent,rgba(9,9,11,0.85))]" />
      <main className="relative mx-auto max-w-6xl px-5 py-14 sm:px-8 xl:max-w-7xl xl:px-12">
        <p className="text-sm font-medium uppercase tracking-wide text-primary">Pricing</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
          Plans that stay in plain language
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
          We publish directionally simple tiers — final INR pricing depends on seats, channels, and volume. No public “token
          units.”
        </p>
        <ul className="mt-10 grid gap-6 lg:grid-cols-3">
          {PLANS.map((p) => (
            <li
              key={p.name}
              className={[
                "flex flex-col rounded-2xl border p-6 shadow-sm",
                p.variant === "featured"
                  ? "border-primary/35 ring-2 ring-primary/15 bg-primary/10 dark:border-primary/40 dark:bg-primary/15"
                  : "border-zinc-200 bg-white/90 dark:border-zinc-800 dark:bg-zinc-950/80",
              ].join(" ")}
            >
              {p.variant === "featured" ? (
                <span className="mb-2 w-fit rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-semibold text-white">Popular</span>
              ) : null}
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{p.name}</h2>
              <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">{p.price}</p>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{p.detail}</p>
              <ul className="mt-4 flex-1 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
                {p.bullets.map((b) => (
                  <li key={b} className="flex gap-2">
                    <span className="text-primary" aria-hidden>
                      ✓
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
              <Link
                href={p.cta.href}
                className={[
                  "mt-6 inline-flex justify-center rounded-lg px-4 py-2.5 text-center text-sm font-semibold",
                  p.variant === "featured"
                    ? "bg-primary text-primary-foreground hover:bg-[var(--primary-hover)]"
                    : "border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800",
                ].join(" ")}
              >
                {p.cta.label}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Questions? Read the <Link href="/faq" className="font-medium text-primary underline">FAQ</Link>{" "}
          or <Link href="/contact" className="font-medium text-primary underline">contact us</Link>.
        </p>
      </main>
      <MarketingFooter />
    </div>
  );
}
