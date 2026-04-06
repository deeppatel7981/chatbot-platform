import React from "react";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className = "", ...props }, ref) => (
    <input
      ref={ref}
      className={[
        "w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 transition",
        "placeholder:text-zinc-400",
        "hover:border-zinc-300",
        "focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400/25",
        "dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:border-zinc-600 dark:focus:border-zinc-500 dark:focus:ring-zinc-500/20",
        className,
      ].join(" ")}
      {...props}
    />
  )
);
Input.displayName = "Input";
