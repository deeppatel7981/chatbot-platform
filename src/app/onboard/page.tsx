"use client";

import OnboardingWizard from "@/components/onboarding/OnboardingWizard";

export default function OnboardPage() {
  return (
    <div className="relative min-h-screen overflow-hidden hero-gradient mesh-bg">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-200/50 via-transparent to-transparent dark:from-zinc-800/20" />
      <OnboardingWizard />
    </div>
  );
}
