import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { clients } from "@/lib/db/schema";
import { handleCustomerMessage } from "@/lib/inbound";
import { isMockData } from "@/lib/mock/mode";

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
  try {
    if (isMockData()) {
      return NextResponse.json({ ok: true });
    }
    const body = (await req.json()) as WaPayload;
    const change = body.entry?.[0]?.changes?.[0]?.value;
    const phoneNumberId = change?.metadata?.phone_number_id;
    const msg = change?.messages?.[0];
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
      console.warn("No client configured for phone_number_id", phoneNumberId);
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
      rawPayload: change as unknown as Record<string, unknown>,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("WhatsApp webhook error:", e);
    return NextResponse.json({ ok: true });
  }
}
