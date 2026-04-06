import { describe, expect, it } from "vitest";
import {
  buildOnboardingStatusFromCounts,
  mockOnboardingStatusPayload,
} from "./onboarding";

describe("buildOnboardingStatusFromCounts", () => {
  it("marks setup complete when client and documents exist", () => {
    const r = buildOnboardingStatusFromCounts(
      { clientCount: 2, documentChunkCount: 10, conversationCount: 0, whatsappConnected: false },
      { mock: false }
    );
    expect(r.hasClient).toBe(true);
    expect(r.hasDocuments).toBe(true);
    expect(r.setupComplete).toBe(true);
    expect(r.mock).toBe(false);
  });

  it("is incomplete without clients", () => {
    const r = buildOnboardingStatusFromCounts(
      { clientCount: 0, documentChunkCount: 5, conversationCount: 0, whatsappConnected: false },
      { mock: false }
    );
    expect(r.hasClient).toBe(false);
    expect(r.setupComplete).toBe(false);
  });

  it("is incomplete without document chunks", () => {
    const r = buildOnboardingStatusFromCounts(
      { clientCount: 1, documentChunkCount: 0, conversationCount: 3, whatsappConnected: true },
      { mock: false }
    );
    expect(r.hasDocuments).toBe(false);
    expect(r.setupComplete).toBe(false);
    expect(r.whatsappConnected).toBe(true);
  });

  it("preserves counts and mock flag", () => {
    const r = buildOnboardingStatusFromCounts(
      { clientCount: 3, documentChunkCount: 100, conversationCount: 42, whatsappConnected: true },
      { mock: true }
    );
    expect(r.mock).toBe(true);
    expect(r.clientCount).toBe(3);
    expect(r.documentChunkCount).toBe(100);
    expect(r.conversationCount).toBe(42);
  });
});

describe("mockOnboardingStatusPayload", () => {
  it("returns a consistent demo shape", () => {
    const a = mockOnboardingStatusPayload();
    const b = mockOnboardingStatusPayload();
    expect(a).toEqual(b);
    expect(a.mock).toBe(true);
    expect(a.setupComplete).toBe(true);
  });
});
