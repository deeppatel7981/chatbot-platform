import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: ["@chatbot/core"],
  serverExternalPackages: ["pdf-parse", "pg", "bcryptjs"],
  async redirects() {
    return [
      { source: "/dashboard", destination: "/app/overview", permanent: false },
      { source: "/dashboard/chat-logs", destination: "/app/conversations", permanent: false },
      { source: "/dashboard/chat-logs/:id", destination: "/app/conversations/:id", permanent: false },
      { source: "/dashboard/clients", destination: "/app/projects", permanent: false },
      { source: "/dashboard/clients/:id/documents", destination: "/app/projects/:id/documents", permanent: false },
      { source: "/dashboard/clients/:id", destination: "/app/projects/:id", permanent: false },
      { source: "/dashboard/contacts", destination: "/app/contacts", permanent: false },
      { source: "/dashboard/leads", destination: "/app/leads", permanent: false },
      { source: "/dashboard/knowledge-base", destination: "/app/knowledge", permanent: false },
      { source: "/dashboard/bot-preview", destination: "/app/widget", permanent: false },
      { source: "/app/widget/preview", destination: "/app/widget", permanent: false },
      { source: "/dashboard/automations", destination: "/app/automations", permanent: false },
      { source: "/dashboard/analytics", destination: "/app/analytics", permanent: false },
      { source: "/dashboard/team", destination: "/app/team", permanent: false },
      { source: "/dashboard/settings", destination: "/app/settings", permanent: false },
      { source: "/dashboard/integrations", destination: "/app/integrations", permanent: false },
      { source: "/dashboard/payments", destination: "/app/payments", permanent: false },
      { source: "/dashboard/help", destination: "/app/help", permanent: false },
    ];
  },
};

export default nextConfig;
