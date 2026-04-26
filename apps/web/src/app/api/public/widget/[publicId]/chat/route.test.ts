import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { OPTIONS, POST } from "./route";

describe("widget public chat route", () => {
  beforeEach(() => {
    vi.stubEnv("MOCK_DATA", "true");
    vi.stubEnv("WIDGET_CHAT_EDGE_URL", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("OPTIONS returns 204 with CORS", async () => {
    const res = await OPTIONS();
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
  });

  it("POST returns 400 when message missing", async () => {
    const req = new NextRequest("http://localhost/api/public/widget/x/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitorId: "v1", message: "" }),
    });
    const res = await POST(req, { params: Promise.resolve({ publicId: "any-id" }) });
    expect(res.status).toBe(400);
  });

  it("POST mock path returns reply and correlation id", async () => {
    const req = new NextRequest("http://localhost/api/public/widget/pid/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitorId: "visitor-1", message: "Hello" }),
    });
    const res = await POST(req, { params: Promise.resolve({ publicId: "00000000-0000-0000-0000-000000000001" }) });
    expect(res.status).toBe(200);
    expect(res.headers.get("X-Correlation-Id")).toBeTruthy();
    const json = await res.json();
    expect(json.reply).toContain("Mock reply");
    expect(json.correlationId).toBe(res.headers.get("X-Correlation-Id"));
    expect(json.conversationId).toBeTruthy();
  });
});
