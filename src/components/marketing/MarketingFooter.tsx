import Link from "next/link";
import { APP_DISPLAY_NAME, CLIENT_BRAND_MARK } from "@/lib/branding";
import { MARKETING_LINKEDIN_URL, MARKETING_SUPPORT_EMAIL, MARKETING_WHATSAPP_E164 } from "@/lib/marketing-constants";

const year = new Date().getFullYear();

const col = "flex flex-col gap-2.5 text-sm";
const h = "text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400";
const link = "text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100";

export default function MarketingFooter() {
  const waHref =
    MARKETING_WHATSAPP_E164 && MARKETING_WHATSAPP_E164.replace(/\D/g, "").length >= 10
      ? `https://wa.me/${MARKETING_WHATSAPP_E164.replace(/\D/g, "")}`
      : null;

  return (
    <footer className="border-t border-zinc-200 bg-zinc-50/90 dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 xl:max-w-7xl xl:px-12 2xl:max-w-[90rem] 2xl:px-16">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xs">
            <Link href="/" className="inline-flex items-center gap-2 font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
                {CLIENT_BRAND_MARK}
              </span>
              {APP_DISPLAY_NAME}
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              WhatsApp-first customer ops for Indian SMEs — website chat, team inbox, and human handoff in one place.
            </p>
          </div>

          <div className="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5 lg:gap-6">
            <div className={col}>
              <p className={h}>Product</p>
              <Link href="/solutions" className={link}>
                Solutions
              </Link>
              <Link href="/pricing" className={link}>
                Pricing
              </Link>
              <Link href="/book-demo" className={link}>
                Book demo
              </Link>
              <Link href="/faq" className={link}>
                FAQ
              </Link>
            </div>
            <div className={col}>
              <p className={h}>Industries</p>
              <Link href="/#industries" className={link}>
                Overview
              </Link>
              <Link href="/#social-proof" className={link}>
                Customers
              </Link>
            </div>
            <div className={col}>
              <p className={h}>Resources</p>
              <Link href="/#how-it-works" className={link}>
                How it works
              </Link>
              <Link href="/contact" className={link}>
                Contact
              </Link>
            </div>
            <div className={col}>
              <p className={h}>Account</p>
              <Link href="/signup" className={link}>
                Start free
              </Link>
              <Link href="/login" className={link}>
                Sign in
              </Link>
            </div>
            <div className={col}>
              <p className={h}>Legal</p>
              <Link href="/privacy" className={link}>
                Privacy
              </Link>
              <Link href="/terms" className={link}>
                Terms
              </Link>
              <Link href="/cookies" className={link}>
                Cookie policy
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-zinc-200 pt-8 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400 md:flex-row md:items-center md:justify-between">
          <p>© {year} {APP_DISPLAY_NAME}. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <a href={`mailto:${MARKETING_SUPPORT_EMAIL}`} className={link}>
              {MARKETING_SUPPORT_EMAIL}
            </a>
            {waHref ? (
              <a href={waHref} target="_blank" rel="noopener noreferrer" className={link}>
                WhatsApp
              </a>
            ) : (
              <span className="text-zinc-400 dark:text-zinc-500" title="Set NEXT_PUBLIC_WHATSAPP_SALES in env">
                WhatsApp (configure)
              </span>
            )}
            <a href={MARKETING_LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className={link}>
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
