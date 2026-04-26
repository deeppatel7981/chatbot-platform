import { describe, expect, it } from "vitest";
import { createHmac } from "crypto";
import { verifyMetaWebhookSignature256 } from "./meta-webhook-signature";

describe("verifyMetaWebhookSignature256", () => {
  const secret = "test_app_secret";
  const body = '{"object":"whatsapp_business_account","entry":[]}';

  it("accepts a valid signature", () => {
    const sig = `sha256=${createHmac("sha256", secret).update(body, "utf8").digest("hex")}`;
    expect(verifyMetaWebhookSignature256(body, sig, secret)).toBe(true);
  });

  it("rejects wrong secret", () => {
    const sig = `sha256=${createHmac("sha256", secret).update(body, "utf8").digest("hex")}`;
    expect(verifyMetaWebhookSignature256(body, sig, "other_secret")).toBe(false);
  });

  it("rejects tampered body", () => {
    const sig = `sha256=${createHmac("sha256", secret).update(body, "utf8").digest("hex")}`;
    expect(verifyMetaWebhookSignature256(body + " ", sig, secret)).toBe(false);
  });

  it("rejects missing or malformed header", () => {
    expect(verifyMetaWebhookSignature256(body, null, secret)).toBe(false);
    expect(verifyMetaWebhookSignature256(body, "md5=abc", secret)).toBe(false);
  });
});
