"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import NewClientModal from "@/components/NewClientModal";
import ClientTable from "@/components/ClientTable";
import BusinessBenefitsCard from "@/components/dashboard/BusinessBenefitsCard";
import { CLIENT_BRAND_NAME } from "@/lib/branding";

const CARDS = [
  {
    title: "Clients",
    desc: "Create each merchant or brand: isolated data, WhatsApp credentials, and a unique widget public ID for embeds.",
    action: "Open",
    href: "/dashboard/clients",
    abbr: "Cl",
  },
  {
    title: "Knowledge base",
    desc: "Upload PDFs and text so answers come from your documents—vector search powers retrieval for the bot.",
    action: "Upload",
    href: "/dashboard/knowledge-base",
    abbr: "Kb",
  },
  {
    title: "Website widget",
    desc: "Copy one script tag for the customer site. Shoppers chat without leaving the page; same thread model as WhatsApp.",
    action: "Embed",
    href: "/dashboard/bot-preview",
    abbr: "Wi",
  },
  {
    title: "Conversations",
    desc: "See widget and WhatsApp threads, handoff flags, and model confidence—pick up where automation stops.",
    action: "Browse",
    href: "/dashboard/chat-logs",
    abbr: "Co",
  },
  {
    title: "Analytics",
    desc: "Conversation volume, contacts, and handoffs over time—useful for staffing and improving prompts.",
    action: "View",
    href: "/dashboard/analytics",
    abbr: "An",
  },
  {
    title: "Integrations",
    desc: "End-to-end setup: ops checklist, HTML snippet for merchants, and visitor-side widget preview.",
    action: "Guide",
    href: "/dashboard/integrations",
    abbr: "In",
  },
  {
    title: "Payments",
    desc: "Plan for workspace billing and customer checkout flows (cards, UPI, WhatsApp Commerce)—roadmap and settings.",
    action: "Open",
    href: "/dashboard/payments",
    abbr: "Pay",
  },
] as const;

const SETUP_STEPS = [
  { n: 1, title: "Add a client", body: "Each business gets its own knowledge and channel config.", href: "/dashboard/clients" },
  { n: 2, title: "Upload documents", body: "Train retrieval for that client’s catalog and policies.", href: "/dashboard/knowledge-base" },
  { n: 3, title: "Install the widget", body: "Paste the script or send Integrations steps to the merchant.", href: "/dashboard/bot-preview" },
] as const;

type Summary = {
  conversationsTotal: number;
  contactsTotal: number;
  handoffsTotal: number;
  conversationsLast30Days: number;
};

export default function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/analytics/summary", { credentials: "include" });
        const json = await res.json();
        if (!cancelled && res.ok && json.data) setSummary(json.data);
      } catch {
        /* overview still works without stats */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 py-3 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-300"
      >
        <span className="text-zinc-800 dark:text-zinc-200">
          <strong className="font-semibold text-zinc-900 dark:text-zinc-100">Tip:</strong> try the live widget demo on the{" "}
          <Link
            href="/login"
            className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-500 dark:text-zinc-100 dark:decoration-zinc-600"
          >
            sign-in
          </Link>{" "}
          page or on{" "}
          <Link
            href="/#live-widget-demo"
            className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-500 dark:text-zinc-100 dark:decoration-zinc-600"
          >
            the homepage
          </Link>
          .
        </span>
      </motion.div>

      <header className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl space-y-2">
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{CLIENT_BRAND_NAME}</p>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Overview</h1>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Run AI-assisted support across WhatsApp and your website from one console: onboard brands, ground answers in
            uploads, embed the widget, then monitor conversations and analytics.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 active:scale-[0.98] dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          <span className="text-lg leading-none">+</span>
          New client
        </button>
      </header>

      <BusinessBenefitsCard />

      {summary ? (
        <section className="mb-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: "All conversations", value: summary.conversationsTotal },
            { label: "Last 30 days", value: summary.conversationsLast30Days },
            { label: "Contacts", value: summary.contactsTotal },
            { label: "Human handoffs", value: summary.handoffsTotal },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
            >
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{s.label}</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">{s.value}</p>
            </div>
          ))}
        </section>
      ) : null}

      <section className="mb-10 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Suggested setup</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          New workspace? Follow these steps—each link opens the right screen.
        </p>
        <ol className="mt-4 grid gap-4 sm:grid-cols-3">
          {SETUP_STEPS.map((step) => (
            <li key={step.n}>
              <Link
                href={step.href}
                className="group block rounded-xl border border-zinc-200 bg-zinc-50/90 p-4 shadow-sm transition hover:border-zinc-400 hover:bg-zinc-100/95 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-950/80 dark:hover:border-zinc-500 dark:hover:bg-zinc-800/70"
              >
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Step {step.n}</span>
                <p className="mt-1 font-medium text-zinc-900 dark:text-zinc-50">{step.title}</p>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{step.body}</p>
                <span className="mt-2 inline-flex text-sm font-medium text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-200">
                  Go →
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <h2 className="mb-4 text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">All areas</h2>
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map(({ title, desc, action, href, abbr }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.3 }}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
          >
            <Link
              href={href}
              className="group flex h-full flex-col rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-[10px] font-semibold uppercase tracking-wide text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                {abbr}
              </div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{desc}</p>
              <span className="mt-4 inline-flex items-center text-sm font-medium text-zinc-500 transition group-hover:text-zinc-900 dark:group-hover:text-zinc-200">
                {action}
                <span className="ml-1 transition-transform group-hover:translate-x-0.5" aria-hidden>
                  →
                </span>
              </span>
            </Link>
          </motion.div>
        ))}
      </section>

      <h2 className="mb-4 mt-14 text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Onboarded clients</h2>
      <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
        Businesses you manage in this workspace. Use <strong className="font-medium text-zinc-800 dark:text-zinc-200">New client</strong>{" "}
        to add another brand or store.
      </p>
      <ClientTable refreshKey={refreshKey} />
      <NewClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => setRefreshKey((k) => k + 1)}
      />
    </>
  );
}
