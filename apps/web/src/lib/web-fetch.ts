/**
 * Server-side HTTP fetch for allowlisted knowledge URLs.
 * Blocks obvious SSRF targets; admins must only add sites they are permitted to copy.
 */

const DEFAULT_MAX_BYTES = 1_500_000;
const DEFAULT_TIMEOUT_MS = 12_000;

function isBlockedHostname(host: string): boolean {
  const h = host.toLowerCase();
  if (h === "localhost" || h === "127.0.0.1" || h === "0.0.0.0" || h === "[::1]") return true;
  if (h.endsWith(".localhost")) return true;
  if (h === "metadata.google.internal") return true;
  if (h.endsWith(".internal")) return true;
  if (h.startsWith("10.")) return true;
  if (h.startsWith("192.168.")) return true;
  if (h.startsWith("169.254.")) return true;
  if (h.startsWith("172.")) {
    const parts = h.split(".");
    if (parts.length >= 2) {
      const second = Number(parts[1]);
      if (!Number.isNaN(second) && second >= 16 && second <= 31) return true;
    }
  }
  return false;
}

/** Optional comma-separated hostnames (e.g. `example.com,www.acme.com`). When set, URL host must match one entry. */
function hostAllowedByEnv(host: string): boolean {
  const raw = process.env.WEB_FETCH_ALLOWED_HOSTS?.trim();
  if (!raw) return true;
  const entries = raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (entries.length === 0) return true;
  const h = host.toLowerCase();
  return entries.some((e) => e === h || (e.startsWith("*.") && h.endsWith(e.slice(1))));
}

export function assertFetchableHttpUrl(raw: string): URL {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > 4096) {
    throw new Error("Invalid URL");
  }
  let u: URL;
  try {
    u = new URL(trimmed);
  } catch {
    throw new Error("Invalid URL");
  }
  if (u.username || u.password) {
    throw new Error("URLs with credentials are not allowed");
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") {
    throw new Error("Only http(s) URLs are allowed");
  }
  if (isBlockedHostname(u.hostname)) {
    throw new Error("That host is blocked for safety (private/local networks)");
  }
  if (!hostAllowedByEnv(u.hostname)) {
    throw new Error("URL host is not in WEB_FETCH_ALLOWED_HOSTS");
  }
  return u;
}

export function htmlToPlainText(html: string, maxLen = 500_000): string {
  let s = html.slice(0, maxLen);
  s = s.replace(/<script[\s\S]*?<\/script>/gi, " ");
  s = s.replace(/<style[\s\S]*?<\/style>/gi, " ");
  s = s.replace(/<noscript[\s\S]*?<\/noscript>/gi, " ");
  s = s.replace(/<[^>]+>/g, " ");
  s = s.replace(/&nbsp;/gi, " ");
  s = s.replace(/&amp;/gi, "&");
  s = s.replace(/&lt;/gi, "<");
  s = s.replace(/&gt;/gi, ">");
  s = s.replace(/&quot;/gi, '"');
  s = s.replace(/&#(\d+);/g, (_, n) => {
    const code = Number(n);
    return Number.isFinite(code) && code > 0 ? String.fromCharCode(code) : "";
  });
  s = s.replace(/\s+/g, " ").trim();
  return s;
}

export async function fetchUrlAsPlainText(url: URL): Promise<string> {
  if (process.env.WEB_FETCH_ENABLED === "false") {
    throw new Error("Web fetch is disabled (WEB_FETCH_ENABLED=false)");
  }
  const maxBytes = Number(process.env.WEB_FETCH_MAX_BYTES) || DEFAULT_MAX_BYTES;
  const timeoutMs = Number(process.env.WEB_FETCH_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS;

  const res = await fetch(url.toString(), {
    method: "GET",
    redirect: "follow",
    signal: AbortSignal.timeout(timeoutMs),
    headers: {
      "User-Agent":
        process.env.WEB_FETCH_USER_AGENT?.trim() ||
        "ChatbotPlatform-KnowledgeBot/1.0 (server-side RAG ingest; contact your workspace admin)",
      Accept: "text/html, text/plain;q=0.9, application/xhtml+xml;q=0.8",
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const ct = res.headers.get("content-type") || "";
  if (!/text\/html|text\/plain|application\/xhtml\+xml/i.test(ct)) {
    throw new Error("Unsupported content type (only HTML or plain text)");
  }

  const buf = await res.arrayBuffer();
  if (buf.byteLength > maxBytes) {
    throw new Error(`Response larger than ${maxBytes} bytes`);
  }

  const raw = new TextDecoder("utf-8", { fatal: false }).decode(buf);
  if (/text\/html|application\/xhtml/i.test(ct)) {
    return htmlToPlainText(raw);
  }
  return raw.replace(/\r\n/g, "\n").trim();
}
