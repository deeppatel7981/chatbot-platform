import Link from "next/link";
import type { ReactNode } from "react";

export type DashboardEmptyAction = {
  label: string;
  href: string;
};

export type DashboardEmptyStateProps = {
  title: string;
  description: ReactNode;
  primaryAction: DashboardEmptyAction;
  secondaryAction?: DashboardEmptyAction;
  /** Short numbered path — keep each item one line. */
  steps?: readonly string[];
};

export default function DashboardEmptyState({
  title,
  description,
  primaryAction,
  secondaryAction,
  steps,
}: DashboardEmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-300 bg-gradient-to-b from-zinc-50/90 to-white px-6 py-10 dark:border-zinc-600 dark:from-zinc-900/60 dark:to-zinc-950/90">
      <p className="text-center text-base font-semibold text-zinc-900 dark:text-zinc-50">{title}</p>
      <div className="mx-auto mt-2 max-w-lg text-center text-sm text-zinc-600 dark:text-zinc-400">{description}</div>
      {steps && steps.length > 0 ? (
        <ol className="mx-auto mt-6 max-w-md list-decimal space-y-2 pl-5 text-left text-sm text-zinc-700 dark:text-zinc-300">
          {steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      ) : null}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href={primaryAction.href}
          className="inline-flex rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          {primaryAction.label}
        </Link>
        {secondaryAction ? (
          <Link
            href={secondaryAction.href}
            className="inline-flex rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
          >
            {secondaryAction.label}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
