/**
 * Pure workspace onboarding / setup status — used by GET /api/onboarding/status.
 * Keeps API route thin and fully unit-testable without DB.
 */

export type OnboardingStatusPayload = {
  mock: boolean;
  hasClient: boolean;
  hasDocuments: boolean;
  conversationCount: number;
  clientCount: number;
  documentChunkCount: number;
  whatsappConnected: boolean;
  setupComplete: boolean;
};

export type OnboardingCounts = {
  clientCount: number;
  documentChunkCount: number;
  conversationCount: number;
  whatsappConnected: boolean;
};

export function buildOnboardingStatusFromCounts(
  counts: OnboardingCounts,
  options: { mock: boolean }
): OnboardingStatusPayload {
  const hasClient = counts.clientCount > 0;
  const hasDocuments = counts.documentChunkCount > 0;
  return {
    mock: options.mock,
    hasClient,
    hasDocuments,
    conversationCount: counts.conversationCount,
    clientCount: counts.clientCount,
    documentChunkCount: counts.documentChunkCount,
    whatsappConnected: counts.whatsappConnected,
    setupComplete: hasClient && hasDocuments,
  };
}

/** Fixture-aligned mock payload for MOCK_DATA / demo workspaces. */
export function mockOnboardingStatusPayload(): OnboardingStatusPayload {
  return buildOnboardingStatusFromCounts(
    {
      clientCount: 1,
      documentChunkCount: 24,
      conversationCount: 1,
      whatsappConnected: false,
    },
    { mock: true }
  );
}
