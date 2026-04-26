import { createHmac, timingSafeEqual } from "crypto";

/**
 * Verifies Meta / WhatsApp Cloud API `X-Hub-Signature-256` on webhook POST bodies.
 * @see https://developers.facebook.com/docs/graph-api/webhooks/getting-started#validate-payloads
 */
export function verifyMetaWebhookSignature256(
  rawBody: string,
  signatureHeader: string | null | undefined,
  appSecret: string
): boolean {
  if (!appSecret || !signatureHeader?.startsWith("sha256=")) {
    return false;
  }
  const receivedHex = signatureHeader.slice("sha256=".length).trim();
  if (!/^[0-9a-f]+$/i.test(receivedHex)) {
    return false;
  }
  const expectedHex = createHmac("sha256", appSecret).update(rawBody, "utf8").digest("hex");
  try {
    return timingSafeEqual(Buffer.from(receivedHex, "hex"), Buffer.from(expectedHex, "hex"));
  } catch {
    return false;
  }
}
