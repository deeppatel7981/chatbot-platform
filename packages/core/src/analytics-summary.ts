/**
 * Dashboard analytics summary — GET /api/analytics/summary response shape.
 */

export type AnalyticsSummaryPayload = {
  conversationsTotal: number;
  contactsTotal: number;
  handoffsTotal: number;
  conversationsLast30Days: number;
};

function nn(n: number): number {
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.floor(n);
}

/** Build API payload from DB count rows (same shape as mock fixtures). */
export function buildAnalyticsSummaryFromCounts(input: {
  conversationsTotal: number;
  contactsTotal: number;
  handoffsTotal: number;
  conversationsLast30Days: number;
}): AnalyticsSummaryPayload {
  return {
    conversationsTotal: nn(input.conversationsTotal),
    contactsTotal: nn(input.contactsTotal),
    handoffsTotal: nn(input.handoffsTotal),
    conversationsLast30Days: nn(input.conversationsLast30Days),
  };
}

/** Demo workspace numbers (aligned with MOCK_DATA fixtures). */
export const MOCK_ANALYTICS_SUMMARY: AnalyticsSummaryPayload = {
  conversationsTotal: 12,
  contactsTotal: 8,
  handoffsTotal: 2,
  conversationsLast30Days: 5,
};

export function mockAnalyticsSummaryPayload(): AnalyticsSummaryPayload {
  return { ...MOCK_ANALYTICS_SUMMARY };
}
