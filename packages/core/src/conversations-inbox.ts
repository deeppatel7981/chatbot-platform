/**
 * Inbox filtering & sorting — shared by the Conversations UI (and testable without React).
 */

export type ConversationInboxRow = {
  id: string;
  channel: string;
  status: string;
  needsHuman: boolean;
  lastConfidence: string | null;
  updatedAt: string;
  clientName: string;
  clientId: string;
};

export type InboxFilterTab = "all" | "handoff" | "open" | "resolved" | "whatsapp" | "widget";
export type InboxSortKey = "newest" | "oldest" | "confidence";

const CONF_RANK: Record<string, number> = { low: 0, medium: 1, high: 2 };

function confidenceRank(c: string | null | undefined): number {
  if (c == null || c === "") return 99;
  return CONF_RANK[c.toLowerCase()] ?? 99;
}

export function countConversationsNeedingHandoff(rows: Pick<ConversationInboxRow, "needsHuman">[]): number {
  return rows.filter((r) => r.needsHuman).length;
}

export function filterAndSortConversations(
  rows: ConversationInboxRow[],
  query: string,
  tab: InboxFilterTab,
  sort: InboxSortKey
): ConversationInboxRow[] {
  let list = [...rows];
  const q = query.trim().toLowerCase();
  if (q) {
    list = list.filter(
      (r) =>
        r.clientName.toLowerCase().includes(q) ||
        r.channel.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
    );
  }
  if (tab === "handoff") list = list.filter((r) => r.needsHuman);
  if (tab === "open") list = list.filter((r) => r.status.toLowerCase() === "open");
  if (tab === "resolved") list = list.filter((r) => ["resolved", "closed"].includes(r.status.toLowerCase()));
  if (tab === "whatsapp") list = list.filter((r) => r.channel.toLowerCase() === "whatsapp");
  if (tab === "widget") list = list.filter((r) => r.channel.toLowerCase() === "widget");

  list.sort((a, b) => {
    if (sort === "newest") return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    if (sort === "oldest") return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
    return confidenceRank(a.lastConfidence) - confidenceRank(b.lastConfidence);
  });

  return list;
}
