import type { Metadata } from "next";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import { LegalProse } from "@/components/marketing/LegalProse";
import SiteHeader from "@/components/marketing/SiteHeader";
import { APP_DISPLAY_NAME } from "@/lib/branding";

export const metadata: Metadata = {
  title: `Terms of Service — ${APP_DISPLAY_NAME}`,
  description: `Terms governing use of the ${APP_DISPLAY_NAME} platform.`,
};

export default function TermsPage() {
  return (
    <div className="relative min-h-screen overflow-hidden hero-gradient mesh-bg">
      <SiteHeader />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(250,250,250,0.9))] dark:bg-[linear-gradient(to_bottom,transparent,rgba(9,9,11,0.85))]" />
      <LegalProse title="Terms of Service">
        <p>
          These <strong>placeholder terms</strong> are not legal advice. Replace with counsel-reviewed terms before
          charging customers or handling regulated data at scale.
        </p>
        <h2>Using the service</h2>
        <p>You agree to use {APP_DISPLAY_NAME} only for lawful business purposes and to provide accurate information during signup and billing.</p>
        <h2>Acceptable use</h2>
        <p>No spam, no unlawful surveillance, and no attempts to bypass security controls or misuse AI features to deceive end users.</p>
        <h2>Limitation of liability</h2>
        <p>To be defined with counsel — typically capped to fees paid in a period, with exclusions where not allowed by law.</p>
      </LegalProse>
      <MarketingFooter />
    </div>
  );
}
