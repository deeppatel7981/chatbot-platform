"use client";

import Image from "next/image";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

const PANELS = [
  {
    id: "ops",
    label: "Your team",
    title: "One console for every brand you run",
    copy: "Add clients, upload PDFs and FAQs, pick an LLM tier, and watch conversations — without giving each merchant a separate login unless you want to.",
    img: "/illustrations/ops-console.svg",
    cta: { href: "/dashboard/integrations", text: "See integrations" },
  },
  {
    id: "customers",
    label: "Your customers",
    title: "Widget + WhatsApp, same brain",
    copy: "Shoppers stay on the site they trust; WhatsApp users get the same answers. Public APIs are keyed by client — no secrets in the browser.",
    img: "/illustrations/channels.svg",
    cta: { href: "/solutions#flow", text: "Read the flow" },
  },
  {
    id: "trust",
    label: "Trust & escalation",
    title: "Hand off with context",
    copy: "When retrieval is weak or policy demands a human, staff get the thread, confidence signals, and retention settings aligned to DPDP-style practice.",
    img: "/illustrations/handoff.svg",
    cta: { href: "/login", text: "Try the console" },
  },
] as const;

export default function HomeJourney() {
  const [open, setOpen] = useState<(typeof PANELS)[number]["id"]>("ops");
  const reduceMotion = useReducedMotion();

  const active = PANELS.find((p) => p.id === open) ?? PANELS[0];

  return (
    <section id="how-it-fits" className="scroll-mt-24 border-t border-zinc-200/70 pt-12 dark:border-zinc-800">
      <h2 className="text-center text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-2xl">
        How it fits your team
      </h2>
      <p className="mx-auto mt-1 max-w-md text-center text-sm text-zinc-600 dark:text-zinc-400">
        Operators, customers, or trust — pick a lens.
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {PANELS.map((p) => {
          const selected = open === p.id;
          return (
            <motion.button
              key={p.id}
              type="button"
              onClick={() => setOpen(p.id)}
              whileHover={reduceMotion ? undefined : { scale: 1.04 }}
              whileTap={reduceMotion ? undefined : { scale: 0.97 }}
              className={[
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                selected
                  ? "bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900"
                  : "border border-zinc-200 bg-white/80 text-zinc-700 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-200 dark:hover:border-zinc-600",
              ].join(" ")}
            >
              {p.label}
            </motion.button>
          );
        })}
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-zinc-200/80 bg-white/90 shadow-md dark:border-zinc-800 dark:bg-zinc-900/90">
        <div className="grid items-stretch gap-0 lg:grid-cols-2">
          <div className="relative flex min-h-[200px] flex-col justify-center p-6 sm:p-8">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active.id}
                initial={reduceMotion ? false : { opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, x: 12 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              >
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{active.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{active.copy}</p>
                <motion.div whileHover={reduceMotion ? undefined : { scale: 1.02 }} whileTap={reduceMotion ? undefined : { scale: 0.98 }} className="mt-6 w-fit">
                  <Link
                    href={active.cta.href}
                    className="inline-flex rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                  >
                    {active.cta.text}
                  </Link>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="relative min-h-[200px] overflow-hidden bg-zinc-50 dark:bg-zinc-950/50">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.img}
                initial={reduceMotion ? false : { opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                <Image src={active.img} alt="" fill className="object-cover object-center" sizes="(max-width: 1024px) 100vw, 50vw" />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
