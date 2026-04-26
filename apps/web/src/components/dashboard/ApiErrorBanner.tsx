"use client";

export default function ApiErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-100">
      <span>{message}</span>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg border border-red-300 bg-white px-3 py-1 text-xs font-semibold text-red-900 hover:bg-red-100 dark:border-red-800 dark:bg-red-950 dark:hover:bg-red-900"
        >
          Retry
        </button>
      ) : null}
    </div>
  );
}
