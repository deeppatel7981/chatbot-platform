import { logStructured } from "@/lib/structured-log";

/**
 * Mark the inbound user message as read and show the typing indicator while the bot prepares a reply.
 * @see https://developers.facebook.com/docs/whatsapp/cloud-api/typing-indicators/
 */
export async function sendWhatsAppReadAndTyping(params: {
  phoneNumberId: string;
  accessToken: string;
  messageId: string;
  correlationId?: string;
  clientId?: string;
}): Promise<void> {
  const { phoneNumberId, accessToken, messageId, correlationId, clientId } = params;
  if (!messageId) return;

  const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      status: "read",
      message_id: messageId,
      typing_indicator: { type: "text" },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    logStructured("whatsapp_graph_typing_failed", {
      correlationId,
      clientId,
      status: res.status,
      detail: err.slice(0, 800),
    });
  }
}

/**
 * WhatsApp Cloud API outbound text message.
 * @see https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-messages
 */
export async function sendWhatsAppText(params: {
  to: string;
  text: string;
  phoneNumberId: string;
  accessToken: string;
  correlationId?: string;
  clientId?: string;
}): Promise<void> {
  const { to, text, phoneNumberId, accessToken, correlationId, clientId } = params;
  if (!to) return;

  const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: to.replace(/\D/g, ""),
      type: "text",
      text: { body: text.slice(0, 4096) },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    logStructured("whatsapp_graph_send_failed", {
      correlationId,
      clientId,
      status: res.status,
      detail: err.slice(0, 800),
    });
  }
}
