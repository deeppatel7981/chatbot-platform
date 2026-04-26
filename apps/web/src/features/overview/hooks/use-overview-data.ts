"use client";

import { useQueries, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

type Summary = {
  conversationsTotal: number;
  contactsTotal: number;
  handoffsTotal: number;
  conversationsLast30Days: number;
};

type OnboardingPayload = {
  mock?: boolean;
  hasClient: boolean;
  hasDocuments: boolean;
  conversationCount: number;
  documentChunkCount?: number;
  whatsappConnected?: boolean;
};

export function useOverviewData() {
  const queryClient = useQueryClient();

  const [summaryQuery, onboardingQuery] = useQueries({
    queries: [
      {
        queryKey: ["overview", "summary"],
        queryFn: async (): Promise<Summary | null> => {
          const res = await fetch("/api/analytics/summary", { credentials: "include" });
          const json = await res.json();
          if (!res.ok || !json.data) return null;
          return json.data as Summary;
        },
        staleTime: 30_000,
      },
      {
        queryKey: ["overview", "onboarding-status"],
        queryFn: async (): Promise<OnboardingPayload | null> => {
          const res = await fetch("/api/onboarding/status", { credentials: "include" });
          const json = await res.json();
          if (!res.ok || !json.data) return null;
          return json.data as OnboardingPayload;
        },
        staleTime: 30_000,
      },
    ],
  });

  const invalidateOverview = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["overview"] });
  }, [queryClient]);

  return {
    summary: summaryQuery.data ?? null,
    onboarding: onboardingQuery.data ?? null,
    isLoading: summaryQuery.isLoading || onboardingQuery.isLoading,
    invalidateOverview,
  };
}
