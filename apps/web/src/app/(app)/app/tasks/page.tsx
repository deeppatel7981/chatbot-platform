import Link from "next/link";

/** Placeholder — tasks / follow-ups (LLD §11.5). */
export default function TasksPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Tasks</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Follow-up tasks and overdue items will live here. Use{" "}
        <Link href="/app/leads" className="font-medium text-violet-600 underline">
          Leads
        </Link>{" "}
        for CRM-style actions until this ships.
      </p>
    </div>
  );
}
