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

const features = [
  ["RAG & retrieval", "Vector search over your uploads."],
  ["Multi-channel", "Widget + WhatsApp in one thread model."],
  ["Human handoff", "Escalate when confidence is low."],
] as const;

export default function MarketingHero() {
  const reduceMotion = useReducedMotion();
  const variants = reduceMotion ? undefined : container;
  const itemVar = reduceMotion ? undefined : item;

  return (
    <>
      <motion.div
        className="flex flex-col"
        initial={reduceMotion ? false : "hidden"}
        animate="show"
        variants={variants}
      >
        <motion.p
          variants={itemVar}
          className="mb-4 inline-flex w-fit items-center rounded-full border border-zinc-200/80 bg-white/70 px-4 py-1.5 text-xs font-medium text-zinc-600 shadow-sm backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-300"
        >
          WhatsApp · Embeddable widget · RAG
        </motion.p>

        <motion.h1
          variants={itemVar}
          className="max-w-3xl text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl dark:text-zinc-50"
        >
          Run customer ops with an AI layer that{" "}
          <span className="text-emerald-700 dark:text-emerald-400">your team can trust</span>
          .
        </motion.h1>

        <motion.p
          variants={itemVar}
          className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400"
        >
          One console for clients, documents, conversations, and analytics — tuned for clear handoffs and
          compliance-minded defaults.
        </motion.p>

        <motion.div variants={itemVar} className="mt-10 flex flex-wrap items-center gap-4">
          <motion.div whileHover={reduceMotion ? undefined : { scale: 1.03 }} whileTap={reduceMotion ? undefined : { scale: 0.98 }}>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-8 py-3.5 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              Sign in to dashboard
            </Link>
          </motion.div>
          <motion.div whileHover={reduceMotion ? undefined : { scale: 1.03 }} whileTap={reduceMotion ? undefined : { scale: 0.98 }}>
            <Link
              href="/solutions"
              className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-8 py-3.5 text-sm font-medium text-zinc-800 shadow-sm transition hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              How it works
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>

      <ul className="mt-16 grid gap-4 sm:grid-cols-3">
        {features.map(([t, d], i) => (
          <motion.li
            key={t}
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ delay: i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            whileHover={reduceMotion ? undefined : { y: -6, transition: { duration: 0.2 } }}
            className="cursor-default rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
          >
            <p className="font-semibold text-zinc-900 dark:text-zinc-50">{t}</p>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{d}</p>
          </motion.li>
        ))}
      </ul>

      <InteractiveDemoChat id="live-widget-demo" />
    </>
  );
}
