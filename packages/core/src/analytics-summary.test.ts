import { describe, expect, it } from "vitest";
import {
  MOCK_ANALYTICS_SUMMARY,
  buildAnalyticsSummaryFromCounts,
  mockAnalyticsSummaryPayload,
} from "./analytics-summary";

describe("buildAnalyticsSummaryFromCounts", () => {
  it("passes through valid counts", () => {
    expect(
      buildAnalyticsSummaryFromCounts({
        conversationsTotal: 10,
        contactsTotal: 3,
        handoffsTotal: 1,
        conversationsLast30Days: 4,
      })
    ).toEqual({
      conversationsTotal: 10,
      contactsTotal: 3,
      handoffsTotal: 1,
      conversationsLast30Days: 4,
    });
  });

  it("floors and clamps negatives", () => {
    expect(
      buildAnalyticsSummaryFromCounts({
        conversationsTotal: 9.7,
        contactsTotal: -1,
        handoffsTotal: NaN,
        conversationsLast30Days: Infinity,
      })
    ).toEqual({
      conversationsTotal: 9,
      contactsTotal: 0,
      handoffsTotal: 0,
      conversationsLast30Days: 0,
    });
  });
});

describe("mock payload", () => {
  it("matches exported constant", () => {
    expect(mockAnalyticsSummaryPayload()).toEqual(MOCK_ANALYTICS_SUMMARY);
  });
});
