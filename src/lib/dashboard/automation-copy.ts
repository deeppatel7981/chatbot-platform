/** Static UX copy for automation keys (API returns name from DB; this adds icon + blurb). */
export const AUTOMATION_META: Record<
  string,
  { icon: string; description: string }
> = {
  after_hours: { icon: "🌙", description: "Instant acknowledgement when your team is offline." },
  hot_lead_alert: { icon: "🔔", description: "Notify staff when buying intent is detected." },
  faq_deflection: { icon: "💬", description: "Answer common questions from your knowledge base first." },
  brochure_followup: { icon: "📎", description: "Send a PDF link when someone asks for a catalog." },
};
