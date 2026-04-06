import { randomUUID } from "crypto";

export const MOCK_ORG_ID = "00000000-0000-4000-8000-000000000001";
export const MOCK_USER_ID = "00000000-0000-4000-8000-000000000002";
export const MOCK_CLIENT_ID = "00000000-0000-4000-8000-000000000003";
export const MOCK_WIDGET_PUBLIC_ID = "00000000-0000-4000-8000-000000000004";

const now = new Date().toISOString();

export const mockClients = [
  {
    id: MOCK_CLIENT_ID,
    organizationId: MOCK_ORG_ID,
    name: "IndusCart",
    widgetPublicId: MOCK_WIDGET_PUBLIC_ID,
    whatsappPhoneNumberId: null as string | null,
    whatsappAccessToken: null as string | null,
    whatsappVerifyToken: null as string | null,
    createdAt: now,
  },
];

export const mockConversations = [
  {
    id: "00000000-0000-4000-8000-000000000010",
    channel: "widget",
    status: "open",
    needsHuman: false,
    lastConfidence: "high",
    createdAt: now,
    updatedAt: now,
    clientName: "IndusCart",
    clientId: MOCK_CLIENT_ID,
  },
  {
    id: "00000000-0000-4000-8000-000000000011",
    channel: "whatsapp",
    status: "open",
    needsHuman: true,
    lastConfidence: "low",
    createdAt: now,
    updatedAt: now,
    clientName: "IndusCart",
    clientId: MOCK_CLIENT_ID,
  },
];

/** Sample transcript lines for conversation detail UI (mock mode). */
export const mockConversationMessages: Record<
  string,
  { id: string; role: string; body: string; createdAt: string }[]
> = {
  "00000000-0000-4000-8000-000000000010": [
    {
      id: "00000000-0000-4000-8000-0000000000a1",
      role: "user",
      body: "Do you deliver to Pune?",
      createdAt: now,
    },
    {
      id: "00000000-0000-4000-8000-0000000000a2",
      role: "assistant",
      body:
        "Yes — we ship across India including Pune. Orders placed before 2pm IST usually dispatch next business day. Want a tracking link after you order?",
      createdAt: now,
    },
  ],
  "00000000-0000-4000-8000-000000000011": [
    {
      id: "00000000-0000-4000-8000-0000000000b1",
      role: "user",
      body: "I need a refund for order #4521. The item arrived damaged.",
      createdAt: now,
    },
    {
      id: "00000000-0000-4000-8000-0000000000b2",
      role: "assistant",
      body:
        "I’m sorry to hear that. I’ve flagged this for our team to review photos and your order details. Someone will reply on WhatsApp shortly.",
      createdAt: now,
    },
  ],
};

export const mockAnalytics = {
  conversationsTotal: 12,
  contactsTotal: 8,
  handoffsTotal: 2,
  conversationsLast30Days: 5,
};

export const mockMatchChunks = [
  {
    id: "00000000-0000-4000-8000-000000000020",
    chunk:
      "IndusCart: business hours 9–6 IST. WhatsApp and web orders; returns within 7 days; PAN-India delivery tracking.",
    metadata: { filename: "faq.txt" },
    similarity: 0.91,
  },
];

export const mockDocumentRows = [
  {
    id: "00000000-0000-4000-8000-000000000030",
    chunk: "Sample uploaded content (mock).",
    metadata: { filename: "sample.txt" },
    created_at: now,
  },
];

export function mockWidgetReply(message: string) {
  return {
    reply: `Mock reply: you said “${message.slice(0, 80)}${message.length > 80 ? "…" : ""}”. Connect a real database for full RAG.`,
    conversationId: "00000000-0000-4000-8000-000000000040",
    needsHuman: false,
  };
}

export function mockNewClient(name: string) {
  return {
    id: randomUUID(),
    organizationId: MOCK_ORG_ID,
    name,
    widgetPublicId: randomUUID(),
    whatsappPhoneNumberId: null,
    whatsappAccessToken: null,
    whatsappVerifyToken: null,
    createdAt: new Date().toISOString(),
  };
}
