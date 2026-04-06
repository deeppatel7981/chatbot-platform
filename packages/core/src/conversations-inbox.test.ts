import { describe, expect, it } from "vitest";
import {
  countConversationsNeedingHandoff,
  filterAndSortConversations,
  type ConversationInboxRow,
} from "./conversations-inbox";

const base = (overrides: Partial<ConversationInboxRow> = {}): ConversationInboxRow => ({
  id: "a",
  channel: "widget",
  status: "open",
  needsHuman: false,
  lastConfidence: "high",
  updatedAt: "2025-01-02T12:00:00.000Z",
  clientName: "Acme",
  clientId: "c1",
  ...overrides,
});

describe("countConversationsNeedingHandoff", () => {
  it("counts rows with needsHuman true", () => {
    expect(
      countConversationsNeedingHandoff([
        { needsHuman: true },
        { needsHuman: false },
        { needsHuman: true },
      ])
    ).toBe(2);
  });
});

describe("filterAndSortConversations", () => {
  const rows: ConversationInboxRow[] = [
    base({
      id: "1",
      clientName: "Zed",
      channel: "whatsapp",
      needsHuman: true,
      lastConfidence: "low",
      updatedAt: "2025-01-01T10:00:00.000Z",
    }),
    base({
      id: "2",
      clientName: "Alpha",
      channel: "widget",
      status: "open",
      needsHuman: false,
      lastConfidence: "high",
      updatedAt: "2025-01-03T10:00:00.000Z",
    }),
    base({
      id: "3",
      clientName: "Beta",
      status: "resolved",
      lastConfidence: "medium",
      updatedAt: "2025-01-02T10:00:00.000Z",
    }),
  ];

  it("filters by search on client name", () => {
    const out = filterAndSortConversations(rows, "alp", "all", "newest");
    expect(out.map((r) => r.id)).toEqual(["2"]);
  });

  it("filters handoff tab", () => {
    const out = filterAndSortConversations(rows, "", "handoff", "newest");
    expect(out.map((r) => r.id)).toEqual(["1"]);
  });

  it("sorts newest first", () => {
    const out = filterAndSortConversations(rows, "", "all", "newest");
    expect(out.map((r) => r.id)).toEqual(["2", "3", "1"]);
  });

  it("sorts by confidence low first", () => {
    const out = filterAndSortConversations(rows, "", "all", "confidence");
    expect(out[0].lastConfidence).toBe("low");
  });
});
