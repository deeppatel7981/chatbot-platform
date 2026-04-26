import type { Metadata } from "next";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import SiteHeader from "@/components/marketing/SiteHeader";
import { APP_DISPLAY_NAME } from "@/lib/branding";

export const metadata: Metadata = {
  title: `FAQ — ${APP_DISPLAY_NAME}`,
  description: `Common questions about WhatsApp, handoff, setup time, languages, and onboarding for ${APP_DISPLAY_NAME}.`,
};

const FAQ = [
  {
    q: "Does this work with WhatsApp?",
    a: "Yes. You can run website chat and WhatsApp Business toward the same knowledge and inbox, so customers use the channel they prefer.",
  },
  {
    q: "Can my team take over conversations?",
    a: "Yes. Staff can join the thread with full context when the customer asks for a human or when you set rules to escalate.",
  },
  {
    q: "Do I need coding knowledge?",
    a: "No. Setup is designed in plain language. Technical configuration stays optional and behind the scenes.",
  },
  {
    q: "How long does setup take?",
    a: "Many teams get a first useful version live in well under an hour, depending on how much content you upload and how many channels you connect.",
  },
  {
    q: "Can I upload brochures and FAQs?",
    a: "Yes. Uploads and structured FAQs help the assistant stay grounded in your real policies and catalog.",
  },
  {
    q: "Does it support Hindi or Gujarati?",
    a: "The product is localization-ready; language rollout can follow your priority markets. Ask us about your timeline on a demo call.",
  },
  {
    q: "Is there onboarding support?",
    a: "Growth and Pro customers can get guided onboarding. Starter is self-serve with in-product guidance.",
  },
  {
    q: "Can multiple staff members use it?",
    a: "Yes. You can add teammates and assign conversations so the right person follows up.",
  },
] as const;

export default function FAQPage() {
  return (
    <div className="relative min-h-screen overflow-hidden hero-gradient mesh-bg">
      <SiteHeader />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(250,250,250,0.9))] dark:bg-[linear-gradient(to_bottom,transparent,rgba(9,9,11,0.85))]" />
      <main className="relative mx-auto max-w-[80ch] px-5 py-14 sm:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Frequently asked questions</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">Straight answers for business owners — not engineering jargon.</p>
        <div className="mt-8 space-y-2">
          {FAQ.map((item) => (
            <details
              key={item.q}
              className="group rounded-xl border border-zinc-200/90 bg-white/90 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/80"
            >
              <summary className="cursor-pointer list-none font-medium text-zinc-900 marker:content-none dark:text-zinc-50 [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between gap-2">
                  {item.q}
                  <span className="text-zinc-400 transition group-open:rotate-180" aria-hidden>
                    ▼
                  </span>
                </span>
              </summary>
              <p className="mt-2 text-base leading-relaxed text-zinc-600 dark:text-zinc-400">{item.a}</p>
            </details>
          ))}
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
