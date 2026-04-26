"use client";

import Link from "next/link";
import { APP_DISPLAY_NAME, CLIENT_BRAND_MARK } from "@/lib/branding";
import { useReducedMotion } from "framer-motion";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { MARKETING_WHATSAPP_E164 } from "@/lib/marketing-constants";

const NAV = [
  { href: "/solutions", label: "Solutions" },
  { href: "/#industries", label: "Industries" },
  { href: "/pricing", label: "Pricing" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#social-proof", label: "Customers" },
  { href: "/faq", label: "FAQ" },
] as const;

const waHref =
  MARKETING_WHATSAPP_E164 && String(MARKETING_WHATSAPP_E164).replace(/\D/g, "").length >= 10
    ? `https://wa.me/${String(MARKETING_WHATSAPP_E164).replace(/\D/g, "")}`
    : null;

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const headerSurface = scrolled
    ? "border-zinc-200/90 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
    : "border-zinc-200/70 bg-white/85 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/85";

  return (
    <header className={`sticky top-0 z-50 border-b transition-colors duration-200 ${headerSurface}`}>
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-5 py-3 sm:px-8 xl:max-w-7xl xl:px-12 2xl:max-w-[90rem] 2xl:px-16">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          <motion.span
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-xs font-bold text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900"
            whileHover={reduceMotion ? undefined : { scale: 1.04 }}
            whileTap={reduceMotion ? undefined : { scale: 0.97 }}
          >
            {CLIENT_BRAND_MARK}
          </motion.span>
          <span className="hidden sm:inline">{APP_DISPLAY_NAME}</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex xl:gap-2" aria-label="Primary">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-2.5 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/80 dark:hover:text-zinc-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {waHref ? (
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg p-2 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
              aria-label="WhatsApp sales"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.123 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </a>
          ) : null}
          <Link
            href="/book-demo"
            className="hidden rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50 lg:inline-flex dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            Book demo
          </Link>
          <Link
            href="/signup"
            className="inline-flex rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-[var(--primary-hover)]"
          >
            Start free
          </Link>
          <Link
            href="/login"
            className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Sign in
          </Link>
        </div>

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
            className="fixed inset-x-0 top-[57px] z-40 max-h-[min(85vh,calc(100dvh-57px))] overflow-y-auto border-b border-zinc-200 bg-white shadow-lg md:hidden dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="flex flex-col gap-0 px-4 py-3">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl py-3.5 text-center text-base font-medium text-zinc-800 dark:text-zinc-100"
                >
                  {item.label}
                </Link>
              ))}
              <div className="my-2 border-t border-zinc-200 dark:border-zinc-800" />
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="rounded-xl py-3.5 text-center font-medium text-zinc-700 dark:text-zinc-300"
              >
                Sign in
              </Link>
              <Link
                href="/book-demo"
                onClick={() => setOpen(false)}
                className="rounded-xl py-3.5 text-center font-medium text-zinc-800 dark:text-zinc-200"
              >
                Book demo
              </Link>
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="mt-1 rounded-xl bg-primary py-4 text-center text-base font-semibold text-primary-foreground"
              >
                Start free
              </Link>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
