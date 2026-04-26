import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { GET, OPTIONS } from "./route";

describe("widget public messages route", () => {
  beforeEach(() => {
    vi.stubEnv("MOCK_DATA", "true");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("OPTIONS returns 204 with CORS", async () => {
    const res = await OPTIONS();
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
  });

  it("GET returns 400 when query missing", async () => {
    const req = new NextRequest("http://localhost/api/public/widget/x/messages");
    const res = await GET(req, { params: Promise.resolve({ publicId: "x" }) });
    expect(res.status).toBe(400);
  });

  it("GET mock returns transcript for widget conversation", async () => {
    const url =
      "http://localhost/api/public/widget/00000000-0000-4000-8000-000000000004/messages?visitorId=v1&conversationId=00000000-0000-4000-8000-000000000010";
    const req = new NextRequest(url);
    const res = await GET(req, {
      params: Promise.resolve({ publicId: "00000000-0000-4000-8000-000000000004" }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json.messages)).toBe(true);
    expect(json.messages.length).toBeGreaterThan(0);
  });
});
