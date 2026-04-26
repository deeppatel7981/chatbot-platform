import type { Metadata } from "next";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import { LegalProse } from "@/components/marketing/LegalProse";
import SiteHeader from "@/components/marketing/SiteHeader";
import { APP_DISPLAY_NAME } from "@/lib/branding";

export const metadata: Metadata = {
  title: `Privacy Policy — ${APP_DISPLAY_NAME}`,
  description: `How ${APP_DISPLAY_NAME} handles data for customer operations and AI-assisted conversations.`,
};

export default function PrivacyPage() {
  return (
    <div className="relative min-h-screen overflow-hidden hero-gradient mesh-bg">
      <SiteHeader />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(250,250,250,0.9))] dark:bg-[linear-gradient(to_bottom,transparent,rgba(9,9,11,0.85))]" />
      <LegalProse title="Privacy Policy">
        <p>
          This is a <strong>placeholder privacy policy</strong> for {APP_DISPLAY_NAME}. Replace with counsel-reviewed text
          before production. It describes how you collect, use, and protect customer and end-user data when operating
          WhatsApp and website chat.
        </p>
        <h2>Data we process</h2>
        <p>Workspace account data, conversation content you choose to retain, uploaded documents, and integration metadata needed to run the service.</p>
        <h2>Your responsibilities</h2>
        <p>As the business operator, you should obtain appropriate consent from your customers and comply with applicable laws (including India DPDP when applicable).</p>
        <h2>Contact</h2>
        <p>For privacy requests, use the contact options listed on the marketing site footer once your support email is configured.</p>
      </LegalProse>
      <MarketingFooter />
    </div>
  );
}
