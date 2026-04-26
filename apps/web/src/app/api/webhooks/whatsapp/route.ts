import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { clients } from "@/lib/db/schema";
import { handleCustomerMessage } from "@/lib/inbound";
import { verifyMetaWebhookSignature256 } from "@/lib/meta-webhook-signature";
import { isMockData } from "@/lib/mock/mode";
import { logStructured, newCorrelationId } from "@/lib/structured-log";

/** Meta webhook verification (GET). */
export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("hub.mode");
  const token = req.nextUrl.searchParams.get("hub.verify_token");
  const challenge = req.nextUrl.searchParams.get("hub.challenge");

  if (mode !== "subscribe" || !token || !challenge) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  if (isMockData() && (token === process.env.WHATSAPP_VERIFY_TOKEN || token === "mock")) {
    return new NextResponse(challenge, { status: 200 });
  }

  const envToken = process.env.WHATSAPP_VERIFY_TOKEN;
  if (envToken && token === envToken) {
    return new NextResponse(challenge, { status: 200 });
  }

  if (isMockData()) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const db = getDb();
  const rows = await db.select().from(clients).where(eq(clients.whatsappVerifyToken, token)).limit(1);
  if (rows.length) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

type WaPayload = {
  entry?: Array<{
    changes?: Array<{
      value?: {
        metadata?: { phone_number_id?: string };
        messages?: Array<{
          id?: string;
          from?: string;
          type?: string;
          text?: { body?: string };
        }>;
        contacts?: Array<{ profile?: { name?: string }; wa_id?: string }>;
      };
    }>;
  }>;
};

export async function POST(req: NextRequest) {
  const correlationId = newCorrelationId();
  try {
    if (isMockData()) {
      return NextResponse.json({ ok: true });
    }

    const rawBody = await req.text();
    const appSecret = process.env.WHATSAPP_APP_SECRET?.trim();
    if (appSecret) {
      const sig = req.headers.get("x-hub-signature-256");
      if (!verifyMetaWebhookSignature256(rawBody, sig, appSecret)) {
        logStructured("whatsapp_webhook_signature_invalid", { correlationId });
        return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
      }
    } else {
      logStructured("whatsapp_webhook_signature_skipped", {
        correlationId,
        reason: "WHATSAPP_APP_SECRET unset",
      });
    }

    let body: WaPayload;
    try {
      body = JSON.parse(rawBody) as WaPayload;
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const change = body.entry?.[0]?.changes?.[0]?.value;
    const phoneNumberId = change?.metadata?.phone_number_id;
    const msg = change?.messages?.[0];
    const waMessageId = typeof msg?.id === "string" ? msg.id : undefined;
    const from = msg?.from;
    const textBody = msg?.type === "text" ? msg.text?.body : undefined;
    const profileName = change?.contacts?.[0]?.profile?.name;

    if (!phoneNumberId || !from || !textBody) {
      return NextResponse.json({ ok: true });
    }

    const db = getDb();
    const [clientRow] = await db
      .select()
      .from(clients)
      .where(eq(clients.whatsappPhoneNumberId, phoneNumberId))
      .limit(1);

    if (!clientRow?.whatsappAccessToken) {
      logStructured("whatsapp_webhook_no_client", { correlationId, phoneNumberId });
      return NextResponse.json({ ok: true });
    }

    await handleCustomerMessage({
      organizationId: clientRow.organizationId,
      clientId: clientRow.id,
      channel: "whatsapp",
      externalUserId: from,
      phone: from,
      name: profileName,
      body: textBody,
      correlationId,
      whatsappInboundMessageId: waMessageId,
      rawPayload: change as unknown as Record<string, unknown>,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    logStructured("whatsapp_webhook_error", {
      correlationId,
      message: e instanceof Error ? e.message : String(e),
    });
    return NextResponse.json({ ok: true });
  }
}
