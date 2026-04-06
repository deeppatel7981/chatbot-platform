"use client";

import Link from "next/link";
import PageIntro from "@/components/dashboard/PageIntro";

export default function PaymentsPage() {
  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Billing & commerce"
        title="Payments"
        description={
          <>
            <p>
              This area is for two things: <strong className="font-medium text-zinc-800 dark:text-zinc-200">your</strong>{" "}
              subscription or usage billing for this platform, and{" "}
              <strong className="font-medium text-zinc-800 dark:text-zinc-200">end-customer</strong> payments (orders,
              links, or WhatsApp-native flows) that you may connect per merchant later.
            </p>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              No payment processor is wired in this build yet—the sections below describe what we&apos;ll surface here
              when you connect a provider (e.g. Razorpay, Stripe, or Meta payments where supported).
            </p>
          </>
        }
      />

      <section className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Workspace billing</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Manage your plan, invoices, and payment method for using this console (seats, message volume, or
          model-usage tiers—exact model TBD). When enabled, you&apos;ll see status, next invoice date, and a link to your
          billing portal.
        </p>
        <div className="mt-6 rounded-xl border border-dashed border-zinc-300 bg-zinc-50/80 px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-600 dark:bg-zinc-950/50 dark:text-zinc-400">
          Billing portal — connect a provider to activate.
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Customer &amp; WhatsApp payments</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          For each <strong className="font-medium text-zinc-800 dark:text-zinc-200">client</strong>, you may eventually
          attach payment links, order flows, or WhatsApp Commerce handoffs so the bot can send a secure pay link or
          confirm COD—always with explicit human or policy rules for money movement.
        </p>
        <ul className="mt-4 list-inside list-disc space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
          <li>Shareable payment links from your gateway (tracked per conversation).</li>
          <li>Optional UPI / cards via India-ready providers alongside WhatsApp messaging.</li>
          <li>Audit trail: tie a payment intent to a thread ID for support.</li>
        </ul>
        <div className="mt-6 rounded-xl border border-dashed border-zinc-300 bg-zinc-50/80 px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-600 dark:bg-zinc-950/50 dark:text-zinc-400">
          Merchant payment settings — configure per client when integrations ship.
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-zinc-50/90 p-6 dark:border-zinc-700 dark:bg-zinc-900/80 sm:p-8">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Interested in payments?</h2>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
          Tell us your gateway (Razorpay, Stripe, etc.) and whether you need pay-by-link in chat—we&apos;ll prioritize the
          roadmap. Meanwhile you can run checkout on your own site and use this product for questions and handoff.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href="mailto:support@example.com?subject=Payments%20on%20IndusCart%20console"
            className="inline-flex rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            Email us
          </a>
          <Link
            href="/solutions"
            className="inline-flex rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
          >
            Read setup guide
          </Link>
        </div>
        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-500">
          Replace the email address in code with your real support inbox when you deploy.
        </p>
      </section>
    </div>
  );
}
