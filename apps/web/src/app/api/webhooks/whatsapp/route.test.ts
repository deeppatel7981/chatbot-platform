import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "./route";

describe("WhatsApp webhook GET (Meta verify)", () => {
  beforeEach(() => {
    vi.stubEnv("MOCK_DATA", "true");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns hub.challenge when verify token is mock", async () => {
    const url = new URL("http://localhost/api/webhooks/whatsapp");
    url.searchParams.set("hub.mode", "subscribe");
    url.searchParams.set("hub.verify_token", "mock");
    url.searchParams.set("hub.challenge", "CHALLENGE_OK");
    const req = new NextRequest(url);
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("CHALLENGE_OK");
  });

  it("returns 403 for bad mode", async () => {
    const url = new URL("http://localhost/api/webhooks/whatsapp");
    url.searchParams.set("hub.mode", "nope");
    url.searchParams.set("hub.verify_token", "mock");
    url.searchParams.set("hub.challenge", "x");
    const req = new NextRequest(url);
    const res = await GET(req);
    expect(res.status).toBe(403);
  });
});
