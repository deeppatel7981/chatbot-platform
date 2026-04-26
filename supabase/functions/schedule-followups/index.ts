/**
 * Backend LLD §10.4 — schedule-followups
 * POST with header x-cron-secret: INTERNAL_CRON_SECRET (or Bearer same).
 */
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { handleOptions, jsonResponse } from "../_shared/http.ts";
import { requireInternalSecret } from "../_shared/auth.ts";
import { serviceClient } from "../_shared/supabase.ts";

Deno.serve(async (req: Request) => {
  const opt = handleOptions(req);
  if (opt) return opt;
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  if (!requireInternalSecret(req)) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  try {
    const supabase = serviceClient();
    const now = new Date().toISOString();

    const { data: overdue, error } = await supabase
      .from("tasks")
      .select("id")
      .eq("status", "open")
      .lt("due_at", now);

    if (error) {
      console.error("[schedule-followups] query", error);
      return jsonResponse({ error: "query failed" }, 500);
    }

    let marked = 0;
    for (const t of overdue ?? []) {
      const { error: u } = await supabase.from("tasks").update({ status: "overdue" }).eq("id", t.id);
      if (!u) marked += 1;
    }

    return jsonResponse({
      ok: true,
      markedOverdue: marked,
      hint: "Add lead-based task creation in a later migration when rules are defined.",
    });
  } catch (e) {
    console.error("[schedule-followups]", e);
    return jsonResponse({ error: "internal error" }, 500);
  }
});
