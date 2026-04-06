"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import NewClientModal from "@/components/NewClientModal";
import ClientTable from "@/components/ClientTable";
import BusinessBenefitsCard from "@/components/dashboard/BusinessBenefitsCard";
import GettingStarted from "@/components/dashboard/GettingStarted";
import OverviewActionCenter from "@/components/dashboard/OverviewActionCenter";
import StatusStrip from "@/components/dashboard/StatusStrip";
import { CLIENT_BRAND_NAME } from "@/lib/branding";

const CARDS = [
  {
    title: "Clients",
    desc: "Each store or brand gets its own assistant, content, and embed code.",
    action: "Open",
    href: "/dashboard/clients",
    abbr: "Cl",
  },
  {
    title: "Knowledge base",
    desc: "Upload FAQs and PDFs so replies match your real policies.",
    action: "Upload",
    href: "/dashboard/knowledge-base",
    abbr: "Kb",
  },
  {
    title: "Website widget",
    desc: "One script tag — shoppers chat without leaving your site.",
    action: "Embed",
    href: "/dashboard/bot-preview",
    abbr: "Wi",
  },
  {
    title: "Conversations",
    desc: "Widget and WhatsApp threads with handoff flags in one inbox.",
    action: "Browse",
    href: "/dashboard/chat-logs",
    abbr: "Co",
  },
  {
    title: "Analytics",
    desc: "Volume, contacts, and handoffs over time.",
    action: "View",
    href: "/dashboard/analytics",
    abbr: "An",
  },
  {
    title: "Integrations",
    desc: "Channels, snippet, and end-to-end setup checklist.",
    action: "Guide",
    href: "/dashboard/integrations",
    abbr: "In",
  },
  {
    title: "Payments",
    desc: "Billing and commerce payments (roadmap).",
    action: "Open",
    href: "/dashboard/payments",
    abbr: "Pay",
  },
] as const;

type Summary = {
  conversationsTotal: number;
  contactsTotal: number;
  handoffsTotal: number;
  conversationsLast30Days: number;
};

type OnboardingPayload = {
  mock?: boolean;
  hasClient: boolean;
  hasDocuments: boolean;
  conversationCount: number;
  documentChunkCount?: number;
  whatsappConnected?: boolean;
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [onboarding, setOnboarding] = useState<OnboardingPayload | null>(null);
  const [onboardedBanner, setOnboardedBanner] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const q = new URLSearchParams(window.location.search);
    if (q.get("onboarded") === "1") setOnboardedBanner(true);
  }, []);

  const dismissOnboarded = () => {
    setOnboardedBanner(false);
    router.replace("/dashboard", { scroll: false });
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [sumRes, obRes] = await Promise.all([
          fetch("/api/analytics/summary", { credentials: "include" }),
          fetch("/api/onboarding/status", { credentials: "include" }),
        ]);
        const sumJson = await sumRes.json();
        const obJson = await obRes.json();
        if (!cancelled && sumRes.ok && sumJson.data) setSummary(sumJson.data);
        if (!cancelled && obRes.ok && obJson.data) setOnboarding(obJson.data);
      } catch {
        /* overview still works */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const firstName = session?.user?.name?.split(/\s+/)[0] || session?.user?.email?.split("@")[0] || "there";

  return (
    <>
      {onboardedBanner ? (
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3 rounded-xl border border-emerald-200/90 bg-emerald-50/95 px-3 py-2.5 text-sm text-emerald-950 dark:border-emerald-900/50 dark:bg-emerald-950/35 dark:text-emerald-100">
          <p>
            <strong className="font-semibold">Welcome aboard.</strong> Your first client is being created from onboarding — add
            knowledge and connect channels when you are ready.
          </p>
          <button
            type="button"
            onClick={dismissOnboarded}
            className="shrink-0 rounded-lg px-2 py-1 text-xs font-medium text-emerald-900 hover:bg-emerald-100/80 dark:text-emerald-200 dark:hover:bg-emerald-900/50"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 rounded-xl border border-zinc-200/90 bg-zinc-50/90 px-3 py-2 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-300"
      >
        <span className="text-zinc-800 dark:text-zinc-200">
          <strong className="font-semibold text-zinc-900 dark:text-zinc-100">Tip:</strong> Try the live widget on{" "}
          <Link
            href="/login"
            className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-500 dark:text-zinc-100 dark:decoration-zinc-600"
          >
            Sign in
          </Link>{" "}
          or the{" "}
          <Link
            href="/#live-widget-demo"
            className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-500 dark:text-zinc-100 dark:decoration-zinc-600"
          >
            homepage demo
          </Link>
          .
        </span>
      </motion.div>

      <header className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl space-y-2">
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{CLIENT_BRAND_NAME}</p>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"},{" "}
            {firstName}
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Your workspace is almost ready. Finish setup, connect channels, and start capturing live customer conversations.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 active:scale-[0.98] dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          <span className="text-lg leading-none">+</span>
          New client
        </button>
      </header>

      <StatusStrip
        summary={summary ? { handoffsTotal: summary.handoffsTotal } : null}
        onboarding={onboarding}
      />

      {summary ? (
        <section className="mb-10">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">At a glance</p>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { label: "All conversations", value: summary.conversationsTotal },
              { label: "Last 30 days", value: summary.conversationsLast30Days },
              { label: "Contacts", value: summary.contactsTotal },
              { label: "Human handoffs", value: summary.handoffsTotal },
            ].map((s) => (
              <div
                key={s.label}
                className="min-h-[5.5rem] rounded-2xl border border-zinc-200 bg-white px-5 py-4 shadow-dashboard-card dark:border-zinc-800 dark:bg-zinc-950"
              >
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{s.label}</p>
                <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-50">{s.value}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <OverviewActionCenter
        onboarding={onboarding}
        summary={summary ? { handoffsTotal: summary.handoffsTotal, conversationsLast30Days: summary.conversationsLast30Days } : null}
      />

      <GettingStarted refreshKey={refreshKey} />

      <div className="mb-10 flex flex-wrap gap-2">
        <span className="w-full text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Quick actions</span>
        {[
          { href: "/dashboard/knowledge-base", label: "Add FAQs" },
          { href: "/dashboard/bot-preview", label: "Test widget" },
          { href: "/dashboard/leads", label: "View leads" },
          { href: "/dashboard/integrations", label: "Install widget" },
          { href: "/dashboard/help", label: "Help" },
        ].map((q) => (
          <Link
            key={q.href}
            href={q.href}
            className="inline-flex rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            {q.label}
          </Link>
        ))}
      </div>

      <BusinessBenefitsCard compact />

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
              className="group flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
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
        Businesses in this workspace. Use <strong className="font-medium text-zinc-800 dark:text-zinc-200">New client</strong> to add
        another brand or store.
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
