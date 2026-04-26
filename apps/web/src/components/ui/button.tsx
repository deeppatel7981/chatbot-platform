import React from "react";

type Variant = "primary" | "secondary" | "accent";

const variantClass: Record<Variant, string> = {
  /** Default app actions — primary token (blue); AA contrast with white label text. */
  primary: [
    "bg-primary text-primary-foreground shadow-sm shadow-primary/15",
    "hover:bg-[var(--primary-hover)]",
  ].join(" "),
  /** Secondary / cancel — outline, no fill competition with primary. */
  secondary: [
    "border border-zinc-300 bg-white text-zinc-800 shadow-sm",
    "hover:bg-zinc-50 hover:border-zinc-400",
    "dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800",
  ].join(" "),
  /** Brand accent (emerald) — spice; maps to --accent in globals. */
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
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-900",
      "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
      variantClass[variant],
      className,
    ].join(" ")}
    {...props}
  />
);
