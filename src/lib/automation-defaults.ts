import { eq } from "drizzle-orm";
import type { getDb } from "@/lib/db/client";
import { automations } from "@/lib/db/schema";

type Db = ReturnType<typeof getDb>;

const TEMPLATES: readonly { key: string; name: string; config: Record<string, unknown> }[] = [
  { key: "after_hours", name: "After-hours reply", config: {} },
  { key: "hot_lead_alert", name: "Hot lead alert", config: {} },
  { key: "faq_deflection", name: "FAQ deflection", config: {} },
  { key: "brochure_followup", name: "Brochure follow-up", config: {} },
];

/** Insert missing automation rows for an org (idempotent). */
export async function ensureDefaultAutomations(db: Db, organizationId: string): Promise<void> {
  const existing = await db
    .select({ key: automations.key })
    .from(automations)
    .where(eq(automations.organizationId, organizationId));
  const have = new Set(existing.map((r) => r.key));
  for (const t of TEMPLATES) {
    if (have.has(t.key)) continue;
    await db.insert(automations).values({
      organizationId,
      key: t.key,
      name: t.name,
      enabled: false,
      config: t.config,
    });
  }
}

export function defaultAutomationTemplates() {
  return TEMPLATES;
}
