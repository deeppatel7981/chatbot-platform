import { randomUUID } from "crypto";
import { MOCK_ANALYTICS_SUMMARY } from "@chatbot/core";

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

/** Demo analytics; same as `MOCK_ANALYTICS_SUMMARY` in @chatbot/core. */
export const mockAnalytics = MOCK_ANALYTICS_SUMMARY;

const CONTACT_A = "00000000-0000-4000-8000-0000000000c1";
const LEAD_A = "00000000-0000-4000-8000-0000000000d1";

export const mockContactsList = [
  {
    id: CONTACT_A,
    organizationId: MOCK_ORG_ID,
    phone: "+919876543210",
    email: "buyer@example.com",
    name: "Priya M.",
    source: "whatsapp",
    externalId: null as string | null,
    createdAt: now,
  },
];

export const mockLeadsList = [
  {
    id: LEAD_A,
    organizationId: MOCK_ORG_ID,
    contactId: CONTACT_A,
    conversationId: "00000000-0000-4000-8000-000000000011" as string | null,
    title: "Bulk order inquiry",
    status: "new",
    source: "website",
    intent: "purchase",
    assignedToUserId: null as string | null,
    notes: null as string | null,
    createdAt: now,
    updatedAt: now,
  },
];

export const mockAutomationsList = [
  {
    id: "00000000-0000-4000-8000-0000000000e1",
    organizationId: MOCK_ORG_ID,
    key: "after_hours",
    name: "After-hours reply",
    enabled: false,
    config: {} as Record<string, unknown>,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "00000000-0000-4000-8000-0000000000e2",
    organizationId: MOCK_ORG_ID,
    key: "hot_lead_alert",
    name: "Hot lead alert",
    enabled: true,
    config: { notifyEmail: true } as Record<string, unknown>,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "00000000-0000-4000-8000-0000000000e3",
    organizationId: MOCK_ORG_ID,
    key: "faq_deflection",
    name: "FAQ deflection",
    enabled: false,
    config: {},
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "00000000-0000-4000-8000-0000000000e4",
    organizationId: MOCK_ORG_ID,
    key: "brochure_followup",
    name: "Brochure follow-up",
    enabled: false,
    config: {},
    createdAt: now,
    updatedAt: now,
  },
];

export const mockWorkspace = {
  id: MOCK_ORG_ID,
  name: "Demo Workspace",
  slug: "demo-workspace",
  openaiChatModel: null as string | null,
  createdAt: now,
};

export const mockTeamList = [
  {
    membershipId: "00000000-0000-4000-8000-0000000000f1",
    userId: MOCK_USER_ID,
    organizationId: MOCK_ORG_ID,
    role: "owner",
    email: "you@example.com",
    name: "Workspace owner",
    createdAt: now,
  },
];

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
