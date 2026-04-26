"use client";

import Link from "next/link";
import { useState } from "react";

const TABS = [
  {
    id: "realestate",
    label: "Real estate",
    headline: "Answer property inquiries instantly",
    bullets: ["Share brochure and site visit details", "Capture budget and location preferences", "Notify sales for hot leads"],
    sampleQs: ["What projects are available in Whitefield?", "Can I schedule a site visit?", "Send me the price list"],
  },
  {
    id: "clinics",
    label: "Clinics",
    headline: "Help patients before the phone rings",
    bullets: ["Doctor timings and availability", "Directions and parking", "Escalate urgent cases to staff"],
    sampleQs: ["What are your OPD timings?", "Do you accept insurance?", "I need an appointment tomorrow"],
  },
  {
    id: "coaching",
    label: "Coaching",
    headline: "Admissions and course FAQs on autopilot",
    bullets: ["Fees, batches, and syllabus", "Parent and student queries", "Route serious leads to counselors"],
    sampleQs: ["When does the next batch start?", "What is the fee structure?", "Do you offer demo classes?"],
  },
  {
    id: "exporters",
    label: "Exporters",
    headline: "Qualify inquiries from every channel",
    bullets: ["MOQ, HS codes, and shipping basics", "Share catalog PDFs", "Alert export desk for qualified leads"],
    sampleQs: ["What is your MOQ?", "Do you ship to the EU?", "Send catalog for stainless steel fittings"],
  },
  {
    id: "d2c",
    label: "D2C",
    headline: "Support that feels on-brand",
    bullets: ["Order status and returns policy", "Product recommendations from your catalog", "Hand off to CX when needed"],
    sampleQs: ["Where is my order?", "What sizes do you have?", "I want to return an item"],
  },
] as const;

export default function IndustryTabsSection() {
  const [active, setActive] = useState<(typeof TABS)[number]["id"]>("realestate");
  const tab = TABS.find((t) => t.id === active) ?? TABS[0];

  return (
    <section id="industries" className="w-full scroll-mt-24">
      <p className="text-center text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Industries</p>
      <h2 className="mt-2 text-center text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">Built for how you sell and support</h2>
      <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-zinc-600 dark:text-zinc-400">
        Pick a vertical to see example questions and outcomes — templates in the product speed up setup.
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {TABS.map((t) => {
          const on = active === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActive(t.id)}
              className={[
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                on
                  ? "bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900"
                  : "border border-zinc-200 bg-white/90 text-zinc-700 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-200",
              ].join(" ")}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="mt-8 rounded-2xl border border-zinc-200/90 bg-white/95 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/90 sm:p-8">
        <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{tab.headline}</h3>
        <ul className="mt-4 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
          {tab.bullets.map((b) => (
            <li key={b} className="flex gap-2">
              <span className="text-emerald-600 dark:text-emerald-400" aria-hidden>
                ✓
              </span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Sample questions</p>
        <ul className="mt-2 space-y-1.5 text-sm italic text-zinc-600 dark:text-zinc-400">
          {tab.sampleQs.map((q) => (
            <li key={q}>“{q}”</li>
          ))}
        </ul>
        <div className="mt-6">
          <Link
            href="/signup"
            className="inline-flex rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400"
          >
            Explore {tab.label} template
          </Link>
        </div>
      </div>
    </section>
  );
}
