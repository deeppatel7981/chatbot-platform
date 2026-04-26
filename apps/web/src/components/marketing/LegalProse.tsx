import type { ReactNode } from "react";

export function LegalProse({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="relative mx-auto max-w-3xl px-5 py-14 sm:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{title}</h1>
      <div className="mt-8 space-y-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-zinc-900 [&_h2]:dark:text-zinc-100 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mt-1">
        {children}
      </div>
    </main>
  );
}
