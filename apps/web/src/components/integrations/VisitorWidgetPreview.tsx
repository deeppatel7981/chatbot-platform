"use client";

import { useState } from "react";

/**
 * Visual explanation of public/widget.js: fixed bottom-right launcher + panel (styles match the minimal embed).
 */
export default function VisitorWidgetPreview() {
  const [open, setOpen] = useState(true);

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Shoppers stay on the merchant&apos;s domain. The embed adds a <strong>fixed</strong> launcher and chat panel (no
        iframe to your domain — script runs on their origin and calls your public API).
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            !open ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          }`}
        >
          Show: launcher only
        </button>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            open ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          }`}
        >
          Show: panel open
        </button>
      </div>

      <div className="relative mx-auto max-w-md overflow-hidden rounded-xl border border-zinc-300 bg-zinc-100 shadow-inner dark:border-zinc-600 dark:bg-zinc-800/50">
        <div className="flex items-center gap-2 border-b border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900">
          <span className="h-2 w-2 rounded-full bg-red-400" />
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          <span className="h-2 w-2 rounded-full bg-zinc-400" />
          <span className="ml-2 truncate text-[11px] text-zinc-500">client-store.example / products</span>
        </div>
        <div className="relative min-h-[220px] bg-gradient-to-b from-white to-zinc-50 p-6 dark:from-zinc-900 dark:to-zinc-950">
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Product catalog</p>
          <p className="mt-2 text-xs text-zinc-500">Page content is unchanged — widget floats above it.</p>

          {!open && (
            <button
              type="button"
              className="absolute bottom-4 right-4 rounded-full bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg"
              onClick={() => setOpen(true)}
            >
              Chat
            </button>
          )}

          {open && (
            <div className="absolute bottom-4 right-4 flex w-[min(280px,calc(100%-2rem))] flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-600 dark:bg-zinc-900">
              <div className="cursor-default bg-zinc-900 px-3 py-2 text-xs font-semibold text-white">Chat</div>
              <div className="min-h-[120px] space-y-2 p-2 text-[11px] text-zinc-700 dark:text-zinc-300">
                <div>
                  <strong>You:</strong> Do you deliver to Pune?
                </div>
                <div>
                  <strong>Assistant:</strong> …reply from your knowledge base…
                </div>
              </div>
              <div className="flex gap-2 border-t border-zinc-100 p-2 dark:border-zinc-700">
                <div className="h-8 flex-1 rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800" />
                <button
                  type="button"
                  className="rounded-lg bg-zinc-900 px-3 text-xs font-medium text-white dark:bg-zinc-700"
                  onClick={() => setOpen(false)}
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ul className="list-disc space-y-1 pl-5 text-xs text-zinc-600 dark:text-zinc-400">
        <li>
          <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">visitorId</code> is stored in{" "}
          <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">localStorage</code> per browser — same thread when they
          return.
        </li>
        <li>Styling is minimal by default; you can fork <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">public/widget.js</code>{" "}
          for brand colors.</li>
      </ul>
    </div>
  );
}
