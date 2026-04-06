import type { Metadata } from "next";
import { APP_DISPLAY_NAME } from "@/lib/branding";

export const metadata: Metadata = {
  title: `Create workspace — ${APP_DISPLAY_NAME}`,
  description: `Start free — create your ${APP_DISPLAY_NAME} workspace for WhatsApp and website customer ops.`,
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
