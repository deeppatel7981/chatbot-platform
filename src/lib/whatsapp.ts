/**
 * WhatsApp Cloud API outbound text message.
 * @see https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-messages
 */
export async function sendWhatsAppText(params: {
  to: string;
  text: string;
  phoneNumberId: string;
  accessToken: string;
}): Promise<void> {
  const { to, text, phoneNumberId, accessToken } = params;
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
    console.error("WhatsApp send failed:", res.status, err);
  }
}
