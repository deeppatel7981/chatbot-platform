import type { Metadata } from "next";
import Link from "next/link";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import SiteHeader from "@/components/marketing/SiteHeader";
import { APP_DISPLAY_NAME } from "@/lib/branding";
import { MARKETING_SUPPORT_EMAIL, MARKETING_WHATSAPP_E164 } from "@/lib/marketing-constants";

export const metadata: Metadata = {
  title: `Contact — ${APP_DISPLAY_NAME}`,
  description: `Reach ${APP_DISPLAY_NAME} for sales, support, and partnerships.`,
};

export default function ContactPage() {
  const wa =
    MARKETING_WHATSAPP_E164 && String(MARKETING_WHATSAPP_E164).replace(/\D/g, "").length >= 10
      ? `https://wa.me/${String(MARKETING_WHATSAPP_E164).replace(/\D/g, "")}`
      : null;

  return (
    <div className="relative min-h-screen overflow-hidden hero-gradient mesh-bg">
      <SiteHeader />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(250,250,250,0.9))] dark:bg-[linear-gradient(to_bottom,transparent,rgba(9,9,11,0.85))]" />
      <main className="relative mx-auto max-w-2xl px-5 py-14 sm:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Contact</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Sales, partnerships, or product questions — we respond during India business hours.
        </p>
        <ul className="mt-8 space-y-4 text-sm">
          <li className="rounded-xl border border-zinc-200 bg-white/90 p-4 dark:border-zinc-800 dark:bg-zinc-950/80">
            <p className="font-medium text-zinc-900 dark:text-zinc-50">Email</p>
            <a href={`mailto:${MARKETING_SUPPORT_EMAIL}`} className="mt-1 text-emerald-700 hover:underline dark:text-emerald-400">
              {MARKETING_SUPPORT_EMAIL}
            </a>
          </li>
          <li className="rounded-xl border border-zinc-200 bg-white/90 p-4 dark:border-zinc-800 dark:bg-zinc-950/80">
            <p className="font-medium text-zinc-900 dark:text-zinc-50">WhatsApp</p>
            {wa ? (
              <a href={wa} target="_blank" rel="noopener noreferrer" className="mt-1 text-emerald-700 hover:underline dark:text-emerald-400">
                Open WhatsApp chat
              </a>
            ) : (
              <p className="mt-1 text-zinc-500">Set <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">NEXT_PUBLIC_WHATSAPP_SALES</code> to show a button.</p>
            )}
          </li>
          <li className="rounded-xl border border-zinc-200 bg-white/90 p-4 dark:border-zinc-800 dark:bg-zinc-950/80">
            <p className="font-medium text-zinc-900 dark:text-zinc-50">Book time</p>
            <Link href="/book-demo" className="mt-1 inline-block text-emerald-700 hover:underline dark:text-emerald-400">
              Schedule a live demo →
            </Link>
          </li>
        </ul>
      </main>
      <MarketingFooter />
    </div>
  );
}
