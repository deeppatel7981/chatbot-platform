import type { Metadata } from "next";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import { LegalProse } from "@/components/marketing/LegalProse";
import SiteHeader from "@/components/marketing/SiteHeader";
import { APP_DISPLAY_NAME } from "@/lib/branding";

export const metadata: Metadata = {
  title: `Cookie Policy — ${APP_DISPLAY_NAME}`,
  description: `How ${APP_DISPLAY_NAME} uses cookies and similar technologies.`,
};

export default function CookiesPage() {
  return (
    <div className="relative min-h-screen overflow-hidden hero-gradient mesh-bg">
      <SiteHeader />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(250,250,250,0.9))] dark:bg-[linear-gradient(to_bottom,transparent,rgba(9,9,11,0.85))]" />
      <LegalProse title="Cookie Policy">
        <p>
          <strong>Placeholder.</strong> Describe essential cookies (session, security), analytics if any, and marketing cookies once you add them.
        </p>
        <h2>Essential cookies</h2>
        <p>Required for sign-in, security, and basic product function — typically allowed without extra consent banners for strictly necessary use.</p>
        <h2>Analytics</h2>
        <p>If you enable analytics, disclose vendors and retention here and align with your consent banner strategy.</p>
      </LegalProse>
      <MarketingFooter />
    </div>
  );
}
