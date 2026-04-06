import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: ["@chatbot/core"],
  serverExternalPackages: ["pdf-parse", "pg", "bcryptjs"],
};

export default nextConfig;
