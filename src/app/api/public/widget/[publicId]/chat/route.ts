import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { clients, consentRecords } from "@/lib/db/schema";
import { handleCustomerMessage } from "@/lib/inbound";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit-memory";
import { isMockData } from "@/lib/mock/mode";
import { mockWidgetReply } from "@/lib/mock/fixtures";

/** Per IP + widget id; public endpoint — limits scripted abuse (per server instance). */
const WIDGET_WINDOW_MS = 60_000;
const WIDGET_MAX_PER_WINDOW = 45;
const MESSAGE_MAX_CHARS = 12_000;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  const { publicId } = await params;
  const ip = getClientIp(req);
  const rl = checkRateLimit(`widget:${publicId}:${ip}`, WIDGET_MAX_PER_WINDOW, WIDGET_WINDOW_MS);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many messages. Try again shortly." },
      { status: 429, headers: { ...corsHeaders, "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  const body = await req.json().catch(() => ({}));
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const visitorId = typeof body.visitorId === "string" ? body.visitorId.trim() : "";
  const consent = Boolean(body.consent);

  if (!message || !visitorId) {
    return NextResponse.json({ error: "message and visitorId required" }, { status: 400, headers: corsHeaders });
  }
  if (message.length > MESSAGE_MAX_CHARS) {
    return NextResponse.json(
      { error: `message must be at most ${MESSAGE_MAX_CHARS} characters` },
      { status: 400, headers: corsHeaders }
    );
  }

  if (isMockData()) {
    return NextResponse.json(mockWidgetReply(message), { headers: corsHeaders });
  }

  const db = getDb();
  const [clientRow] = await db.select().from(clients).where(eq(clients.widgetPublicId, publicId)).limit(1);
  if (!clientRow) {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers: corsHeaders });
  }

  if (consent) {
    await db.insert(consentRecords).values({
      organizationId: clientRow.organizationId,
      channel: "widget",
      purpose: "chat_support_and_lead_capture",
      accepted: true,
    });
  }

  const result = await handleCustomerMessage({
    organizationId: clientRow.organizationId,
    clientId: clientRow.id,
    channel: "widget",
    externalUserId: visitorId,
    body: message,
    rawPayload: { visitorId },
  });

  return NextResponse.json(
    {
      reply: result.reply,
      conversationId: result.conversationId,
      needsHuman: result.needsHuman,
    },
    { headers: corsHeaders }
  );
}
