import type { ReactNode } from "react";

type Props = {
  /** Small label above the title, e.g. workspace area */
  eyebrow?: string;
  title: string;
  /** Main explanatory copy — string or paragraphs */
  description: ReactNode;
  /** Right-aligned actions (buttons, links) */
  actions?: ReactNode;
};

/**
 * Consistent dashboard page title + description block.
 */
export default function PageIntro({ eyebrow, title, description, actions }: Props) {
  return (
    <header className="mb-8 flex flex-col gap-4 border-b border-zinc-200/80 pb-8 dark:border-zinc-800/80 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 max-w-3xl space-y-2">
        {eyebrow ? (
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{eyebrow}</p>
        ) : null}
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{title}</h1>
        <div className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{description}</div>
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2 sm:pt-1">{actions}</div> : null}
    </header>
  );
}
