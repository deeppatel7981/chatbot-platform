"use client";

import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { motion } from "framer-motion";
import InteractiveDemoChat from "@/components/marketing/InteractiveDemoChat";

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

const featureLabels = ["RAG & retrieval", "Multi-channel", "Human handoff"] as const;

export default function MarketingHero() {
  const reduceMotion = useReducedMotion();
  const variants = reduceMotion ? undefined : container;
  const itemVar = reduceMotion ? undefined : item;

  return (
    <div className="flex flex-col gap-10 xl:grid xl:grid-cols-[minmax(0,1fr)_minmax(18rem,26rem)] xl:items-start xl:gap-12 2xl:grid-cols-[minmax(0,1fr)_minmax(20rem,28rem)] 2xl:gap-16">
      <motion.div
        className="flex min-w-0 flex-col"
        initial={reduceMotion ? false : "hidden"}
        animate="show"
        variants={variants}
      >
        <motion.p
          variants={itemVar}
          className="mb-3 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
        >
          WhatsApp · Widget · RAG
        </motion.p>

        <motion.h1
          variants={itemVar}
          className="max-w-2xl text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl lg:max-w-3xl lg:text-[2.75rem] lg:leading-[1.1] xl:max-w-4xl dark:text-zinc-50"
        >
          Customer ops with an AI layer{" "}
          <span className="text-emerald-700 dark:text-emerald-400">your team can trust</span>.
        </motion.h1>

        <motion.p
          variants={itemVar}
          className="mt-4 max-w-xl text-base leading-relaxed text-zinc-600 lg:max-w-2xl dark:text-zinc-400"
        >
          One console for clients, documents, and conversations — with clear handoffs when it matters.
        </motion.p>

        <motion.p variants={itemVar} className="mt-5 text-sm text-zinc-500 dark:text-zinc-500">
          {featureLabels.map((t, i) => (
            <span key={t}>
              {i > 0 ? " · " : null}
              <span className="font-medium text-zinc-700 dark:text-zinc-300">{t}</span>
            </span>
          ))}
        </motion.p>

        <motion.div variants={itemVar} className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            Sign in
          </Link>
          <Link
            href="/solutions"
            className="inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white px-6 py-2.5 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            How it works
          </Link>
        </motion.div>
      </motion.div>

      <InteractiveDemoChat id="live-widget-demo" className="mt-0 w-full max-w-lg shrink-0 justify-self-end xl:mt-0 xl:max-w-none 2xl:sticky 2xl:top-28" />
    </div>
  );
}
