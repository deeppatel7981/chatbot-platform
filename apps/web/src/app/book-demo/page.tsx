"use client";

import { useState } from "react";
import Link from "next/link";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import SiteHeader from "@/components/marketing/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { APP_DISPLAY_NAME } from "@/lib/branding";

export default function BookDemoPage() {
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="relative min-h-screen overflow-hidden hero-gradient mesh-bg">
      <SiteHeader />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(250,250,250,0.9))] dark:bg-[linear-gradient(to_bottom,transparent,rgba(9,9,11,0.85))]" />
      <main className="relative mx-auto max-w-lg px-5 py-14 sm:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Book a live demo</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Walk through WhatsApp + website setup with our team. No obligation — {APP_DISPLAY_NAME} is built for Indian SME
          workflows.
        </p>

        {sent ? (
          <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-6 dark:border-emerald-900/50 dark:bg-emerald-950/40">
            <p className="font-semibold text-emerald-950 dark:text-emerald-100">Request received</p>
            <p className="mt-2 text-sm text-emerald-900/90 dark:text-emerald-200/95">
              We’ll email you shortly to confirm a time. (This demo form is front-end only until you connect CRM or email.)
            </p>
            <Link href="/" className="mt-4 inline-block text-sm font-medium text-emerald-800 underline dark:text-emerald-300">
              Back to home
            </Link>
          </div>
        ) : (
          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label htmlFor="bd-name" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Full name
              </label>
              <Input id="bd-name" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="bd-email" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Work email
              </label>
              <Input id="bd-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="bd-co" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Company
              </label>
              <Input id="bd-co" value={company} onChange={(e) => setCompany(e.target.value)} required autoComplete="organization" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="bd-phone" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Mobile (India)
              </label>
              <Input id="bd-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required autoComplete="tel" placeholder="+91 …" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="bd-notes" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                What should we focus on?
              </label>
              <textarea
                id="bd-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-zinc-400 placeholder:text-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                placeholder="e.g. WhatsApp + website, real estate leads…"
              />
            </div>
            <Button type="submit" className="w-full py-3 text-base">
              Request demo
            </Button>
          </form>
        )}
      </main>
      <MarketingFooter />
    </div>
  );
}
