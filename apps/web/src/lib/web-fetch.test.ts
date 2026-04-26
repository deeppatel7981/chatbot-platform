import { describe, expect, it, afterEach } from "vitest";
import { assertFetchableHttpUrl } from "./web-fetch";

describe("assertFetchableHttpUrl", () => {
  afterEach(() => {
    delete process.env.WEB_FETCH_ALLOWED_HOSTS;
  });

  it("accepts public https URL", () => {
    const u = assertFetchableHttpUrl("https://example.com/path?q=1");
    expect(u.hostname).toBe("example.com");
  });

  it("rejects localhost", () => {
    expect(() => assertFetchableHttpUrl("http://localhost:3000/")).toThrow(/blocked/i);
  });

  it("rejects private 10.x", () => {
    expect(() => assertFetchableHttpUrl("http://10.0.0.1/")).toThrow(/blocked/i);
  });

  it("honors WEB_FETCH_ALLOWED_HOSTS", () => {
    process.env.WEB_FETCH_ALLOWED_HOSTS = "good.example";
    expect(() => assertFetchableHttpUrl("https://evil.com/")).toThrow(/WEB_FETCH_ALLOWED_HOSTS/i);
    expect(assertFetchableHttpUrl("https://good.example/page").hostname).toBe("good.example");
  });
});
