import type { Metadata } from "next";
import { APP_DISPLAY_NAME } from "@/lib/branding";

export const metadata: Metadata = {
  title: `Book a demo — ${APP_DISPLAY_NAME}`,
  description: `Schedule a live walkthrough of ${APP_DISPLAY_NAME} for your team.`,
};

export default function BookDemoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
