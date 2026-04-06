# @chatbot/core

Framework-agnostic domain logic for the chatbot platform: **pure functions** and types that are easy to unit test (no React, no Next.js, no DB).

- **Onboarding status** — `buildOnboardingStatusFromCounts`, `mockOnboardingStatusPayload`
- **Analytics summary** — `buildAnalyticsSummaryFromCounts`, `MOCK_ANALYTICS_SUMMARY`, `mockAnalyticsSummaryPayload`
- **Conversations inbox** — `filterAndSortConversations`, `countConversationsNeedingHandoff`

Import from the Next app as `@chatbot/core` (workspace package).

Tests live next to sources: `*.test.ts`. Run all tests from the repo root:

```bash
npm run test
```

Run only core tests:

```bash
npm run test:core
```
