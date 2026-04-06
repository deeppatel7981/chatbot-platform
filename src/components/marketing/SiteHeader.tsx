"use client";

import Link from "next/link";
import { APP_DISPLAY_NAME, CLIENT_BRAND_MARK } from "@/lib/branding";
import { useReducedMotion } from "framer-motion";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

const links: { href: string; label: string; primary?: boolean }[] = [
  { href: "/#for-business", label: "Business" },
  { href: "/solutions", label: "Solutions" },
  { href: "/login", label: "Sign in", primary: true },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/70 bg-white/85 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/85">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-5 py-3 sm:px-8 lg:px-10">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          <motion.span
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-xs font-bold text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900"
            whileHover={reduceMotion ? undefined : { scale: 1.04 }}
            whileTap={reduceMotion ? undefined : { scale: 0.97 }}
          >
            {CLIENT_BRAND_MARK}
          </motion.span>
          <span>{APP_DISPLAY_NAME}</span>
        </Link>

        <nav className="hidden items-center gap-5 text-sm font-medium md:flex">
          <Link
            href="/#for-business"
            className="text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Business
          </Link>
          <Link
            href="/solutions"
            className="text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Solutions
          </Link>
          <Link
            href="/login"
            className="rounded-lg bg-zinc-900 px-3.5 py-1.5 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            Sign in
          </Link>
        </nav>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white p-2 text-zinc-800 shadow-sm md:hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Menu</span>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="mobile-menu"
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-zinc-200 bg-white md:hidden dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="flex flex-col gap-1 px-6 py-4">
              {links.map((l) =>
                l.primary ? (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="rounded-lg bg-zinc-900 py-3 text-center text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
                  >
                    {l.label}
                  </Link>
                ) : (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="rounded-xl py-3 text-center font-medium text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900"
                  >
                    {l.label}
                  </Link>
                )
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
