"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type OnboardingData = {
  mock?: boolean;
  hasClient: boolean;
  hasDocuments: boolean;
  conversationCount: number;
  setupComplete?: boolean;
};

const STEPS: readonly {
  n: number;
  title: string;
  body: string;
  href: string;
  done: (d: OnboardingData) => boolean;
}[] = [
  {
    n: 1,
    title: "Add a project",
    body: "Each business gets its own knowledge and channel config.",
    href: "/app/projects",
    done: (d) => d.hasClient,
  },
  {
    n: 2,
    title: "Upload documents",
    body: "Add FAQs and files so answers match your catalog and policies.",
    href: "/app/knowledge",
    done: (d) => d.hasDocuments,
  },
  {
    n: 3,
    title: "Try the widget",
    body: "Send a test message from the preview or embed—shows up in conversations.",
    href: "/app/widget",
    done: (d) => d.conversationCount > 0,
  },
];

export default function GettingStarted({ refreshKey }: { refreshKey: number }) {
  const [data, setData] = useState<OnboardingData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/onboarding/status", { credentials: "include" });
        const json = await res.json();
        if (!cancelled && res.ok && json.data) setData(json.data);
        else if (!cancelled) setError(true);
      } catch {
        if (!cancelled) setError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const doneCount = data ? STEPS.filter((s) => s.done(data)).length : 0;

  return (
    <section className="mb-10 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Getting started</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {data?.mock
              ? "Preview workspace — progress reflects sample data."
              : "See what’s left before you’re live. Each step opens the right screen."}
          </p>
        </div>
        {data && !data.mock ? (
          <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-400">
            {doneCount}/{STEPS.length} complete
          </span>
        ) : null}
      </div>
      {error ? (
        <p className="mt-4 text-sm text-amber-800 dark:text-amber-200">Could not load progress. Links below still work.</p>
      ) : null}
      <ol className="mt-4 grid gap-4 sm:grid-cols-3">
        {STEPS.map((step) => {
          const complete = data ? step.done(data) : false;
          return (
            <li key={step.n}>
              <Link
                href={step.href}
                className="group relative block rounded-xl border border-zinc-200 bg-zinc-50/90 p-4 shadow-sm transition hover:border-zinc-400 hover:bg-zinc-100/95 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-950/80 dark:hover:border-zinc-500 dark:hover:bg-zinc-800/70"
              >
                <span className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  <span
                    className={
                      complete
                        ? "flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] text-white dark:bg-emerald-500"
                        : "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-zinc-300 bg-white text-[10px] text-zinc-500 dark:border-zinc-600 dark:bg-zinc-900"
                    }
                    aria-hidden
                  >
                    {complete ? "✓" : step.n}
                  </span>
                  Step {step.n}
                </span>
                <p className="mt-1 font-medium text-zinc-900 dark:text-zinc-50">{step.title}</p>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{step.body}</p>
                <span className="mt-2 inline-flex text-sm font-medium text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-200">
                  Go →
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
