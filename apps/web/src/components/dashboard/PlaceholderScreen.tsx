import Link from "next/link";

type Action = { label: string; href: string; variant?: "primary" | "secondary" };

export default function PlaceholderScreen({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions: Action[];
}) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/50 px-6 py-16 text-center dark:border-zinc-700 dark:bg-zinc-950/40">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{title}</h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{description}</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {actions.map((a) => (
          <Link
            key={a.href + a.label}
            href={a.href}
            className={
              a.variant === "primary"
                ? "inline-flex rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                : "inline-flex rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
            }
          >
            {a.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
