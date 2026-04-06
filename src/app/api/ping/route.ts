import { NextResponse } from "next/server";

/** No DB or env required — use to confirm the deployment URL is correct (Vercel vs app vs DATABASE_URL). */
export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "chatbot-platform",
    time: new Date().toISOString(),
  });
}
