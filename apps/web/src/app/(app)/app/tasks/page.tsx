import Link from "next/link";
import PlaceholderScreen from "@/components/dashboard/PlaceholderScreen";

/** Follow-ups / tasks (roadmap). Clear placeholder — Tesler’s Law: surface complexity honestly. */
export default function TasksPage() {
  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-amber-200/90 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
        <span className="font-semibold">Coming soon</span>
        <span className="text-amber-900/90 dark:text-amber-200/90">
          {" "}
          — follow-up tasks and overdue items will live here. Nothing is missing from your setup; this module is not
          shipped yet.
        </span>
      </div>

      <PlaceholderScreen
        title="Tasks"
        description="When we ship this, you’ll see follow-ups tied to conversations and leads in one queue — with snooze, assignee, and due dates."
        actions={[
          { label: "Open conversations", href: "/app/conversations", variant: "primary" },
          { label: "Open leads", href: "/app/leads", variant: "secondary" },
        ]}
      />

      <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
        Prefer email today?{" "}
        <Link href="/app/integrations" className="font-medium text-zinc-700 underline dark:text-zinc-300">
          Integrations
        </Link>{" "}
        includes handoff patterns you can use now.
      </p>
    </div>
  );
}
