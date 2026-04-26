import React from "react";

type Variant = "primary" | "secondary" | "accent";

const variantClass: Record<Variant, string> = {
  /** Default app actions — high contrast, neutral (Notion/Linear-style). */
  primary: [
    "bg-zinc-900 text-white shadow-sm shadow-zinc-900/10",
    "hover:bg-zinc-800",
    "dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white",
  ].join(" "),
  /** Secondary / cancel — outline, no fill competition with primary. */
  secondary: [
    "border border-zinc-300 bg-white text-zinc-800 shadow-sm",
    "hover:bg-zinc-50 hover:border-zinc-400",
    "dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800",
  ].join(" "),
  /** Brand accent — use sparingly (e.g. one CTA per view). */
  accent: [
    "bg-emerald-600 text-white shadow-sm shadow-emerald-900/10",
    "hover:bg-emerald-700",
    "dark:bg-emerald-500 dark:hover:bg-emerald-400",
  ].join(" "),
};

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

export const Button = ({ className = "", variant = "primary", disabled, ...props }: Props) => (
  <button
    disabled={disabled}
    className={[
      "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition duration-200",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-zinc-500 dark:focus-visible:ring-offset-zinc-900",
      "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
      variantClass[variant],
      className,
    ].join(" ")}
    {...props}
  />
);
