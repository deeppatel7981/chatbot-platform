"use client";

import { useState } from "react";

type Props = {
  text: string;
  className?: string;
  label?: string;
};

export default function CopyButton({ text, className = "", label = "Copy" }: Props) {
  const [done, setDone] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    } catch {
      setDone(false);
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className={[
        "inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50 active:scale-[0.98] dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700",
        className,
      ].join(" ")}
    >
      {done ? "Copied" : label}
    </button>
  );
}
