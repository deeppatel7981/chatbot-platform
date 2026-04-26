/**
 * Shared typography + surface classes for dashboard and portal shells.
 * Keeps rhythm consistent (whitespace, hierarchy) per front-end design rules.
 */
export const appPageEyebrow = "text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400";

export const appPageTitle = "text-[length:var(--app-page-title-size)] font-bold leading-[var(--app-page-title-leading)] tracking-[var(--app-page-title-tracking)] text-zinc-900 dark:text-zinc-50";

export const appPageBody = "text-sm leading-relaxed text-zinc-600 dark:text-zinc-400";

/** Primary content card: border + shadow aligned across app */
export const appSurfaceCard =
  "rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-dashboard-card dark:border-zinc-800 dark:bg-zinc-900";

export const appSurfaceCardPaddingSm = "rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-dashboard-card dark:border-zinc-800 dark:bg-zinc-900";

/** List row / tappable card — same shadow rhythm, compact padding */
export const appSurfaceRow =
  "rounded-2xl border border-zinc-200/80 bg-white px-4 py-4 shadow-dashboard-card transition dark:border-zinc-800 dark:bg-zinc-900";
