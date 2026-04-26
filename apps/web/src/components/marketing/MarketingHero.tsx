"use client";

import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { motion } from "framer-motion";
import InteractiveDemoChat from "@/components/marketing/InteractiveDemoChat";
import MarketingWhatsAppPreview from "@/components/marketing/MarketingWhatsAppPreview";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

const CHIPS = [
  "Works with WhatsApp",
  "English console; Hindi / Hinglish replies",
  "Human handoff",
  "Go live fast",
] as const;

export default function MarketingHero() {
  const reduceMotion = useReducedMotion();
  const variants = reduceMotion ? undefined : container;
  const itemVar = reduceMotion ? undefined : item;

  return (
    <div className="flex flex-col gap-10 xl:grid xl:grid-cols-[minmax(0,1fr)_minmax(20rem,28rem)] xl:items-start xl:gap-12 2xl:gap-16">
      <motion.div
        className="flex min-w-0 flex-col"
        initial={reduceMotion ? false : "hidden"}
        animate="show"
        variants={variants}
      >
        <motion.p
          variants={itemVar}
          className="mb-3 text-xs font-medium uppercase tracking-wide text-emerald-800 dark:text-emerald-400/90"
        >
          WhatsApp-first AI for Indian businesses
        </motion.p>

        <motion.h1
          variants={itemVar}
          className="max-w-2xl text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl lg:max-w-3xl lg:text-[2.75rem] lg:leading-[1.1] xl:max-w-4xl dark:text-zinc-50"
        >
          Capture more leads. Reply faster.{" "}
          <span className="text-emerald-700 dark:text-emerald-400">Follow up automatically.</span>
        </motion.h1>

        <motion.p
          variants={itemVar}
          className="mt-4 max-w-xl text-base leading-relaxed text-zinc-600 lg:max-w-2xl dark:text-zinc-400"
        >
          An India-first customer operations platform for SMEs across WhatsApp and your website. Answer FAQs, qualify
          leads, and hand off hot prospects to your team — without losing context.
        </motion.p>

        <motion.div variants={itemVar} className="mt-5 flex flex-wrap gap-2">
          {CHIPS.map((t) => (
            <span
              key={t}
              className="rounded-full border border-zinc-200/90 bg-white/90 px-3 py-1 text-xs font-medium text-zinc-700 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-300"
            >
              {t}
            </span>
          ))}
        </motion.div>

        <motion.div variants={itemVar} className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-[10px] bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400"
          >
            Start free
          </Link>
          <Link
            href="/book-demo"
            className="inline-flex items-center justify-center rounded-[10px] border border-zinc-300 bg-white px-6 py-2.5 text-sm font-semibold text-zinc-900 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            Book live demo
          </Link>
        </motion.div>
        <motion.p variants={itemVar} className="mt-3 text-sm">
          <Link
            href="/#how-it-works"
            className="font-medium text-emerald-800 underline decoration-emerald-300 underline-offset-2 hover:text-emerald-900 dark:text-emerald-400 dark:decoration-emerald-700"
          >
            See how it works
          </Link>
        </motion.p>
      </motion.div>

      <div className="flex w-full max-w-xl flex-col gap-4 justify-self-end xl:max-w-none 2xl:sticky 2xl:top-28">
        <InteractiveDemoChat id="live-widget-demo" className="w-full shrink-0" />
        <MarketingWhatsAppPreview />
      </div>
    </div>
  );
}
