import React, { useCallback, useEffect, useState } from "react";

const REPLY_LANG_KEY = (publicId: string) => `widget-reply-lang:${publicId}`;
const REPLY_LANG_OPTIONS = [
  { value: "english", label: "English" },
  { value: "hindi", label: "Hindi" },
  { value: "hinglish", label: "Hinglish" },
  { value: "match_user", label: "Match me" },
] as const;

type SessionResponse = {
  conversationId?: string;
  project?: { name?: string; welcomeMessage?: string };
  error?: string;
};

type MessageResponse = {
  reply?: string;
  intent?: string;
  leadScore?: number;
  handoff?: boolean;
  error?: string;
};

export type WidgetRootProps = {
  mode: "supabase" | "next";
  publicKey: string;
  publicId: string;
  functionsBase: string;
  supabaseAnonKey: string;
  apiBase: string;
};

function nextChatUrl(siteUrl: string, publicId: string) {
  const base = siteUrl.replace(/\/$/, "");
  return `${base}/api/public/widget/${encodeURIComponent(publicId)}/chat`;
}

export function WidgetRoot({
  mode,
  publicKey,
  publicId,
  functionsBase,
  supabaseAnonKey,
  apiBase,
}: WidgetRootProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [visitorId] = useState(() => `v_${Math.random().toString(36).slice(2, 14)}`);
  const [loading, setLoading] = useState(false);
  const [lastReply, setLastReply] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [replyLanguage, setReplyLanguage] = useState("english");

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(REPLY_LANG_KEY(publicId));
      if (stored && REPLY_LANG_OPTIONS.some((o) => o.value === stored)) {
        setReplyLanguage(stored);
      }
    } catch {
      /* ignore */
    }
  }, [publicId]);

  const fb = functionsBase.replace(/\/$/, "");
  const siteUrl = apiBase.trim();

  const ensureSupabaseSession = useCallback(async () => {
    if (conversationId) return conversationId;
    if (!fb || !publicKey || !supabaseAnonKey) return null;
    setSessionLoading(true);
    setErr(null);
    try {
      const res = await fetch(`${fb}/chat-session-create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          publicKey,
          pageUrl: typeof window !== "undefined" ? window.location.href : "",
          referrer: typeof document !== "undefined" ? document.referrer : "",
        }),
      });
      const json = (await res.json().catch(() => ({}))) as SessionResponse;
      if (!res.ok) {
        setErr(typeof json.error === "string" ? json.error : res.statusText);
        return null;
      }
      const cid = json.conversationId;
      if (typeof cid !== "string") {
        setErr("Invalid session response");
        return null;
      }
      setConversationId(cid);
      const welcome = json.project?.welcomeMessage;
      if (typeof welcome === "string") setLastReply(welcome);
      return cid;
    } catch {
      setErr("Network error (session)");
      return null;
    } finally {
      setSessionLoading(false);
    }
  }, [conversationId, fb, publicKey, supabaseAnonKey]);

  const send = async () => {
    if (!message.trim()) return;
    setLoading(true);
    setErr(null);
    try {
      if (mode === "supabase") {
        const cid = await ensureSupabaseSession();
        if (!cid) {
          setLoading(false);
          return;
        }
        const res = await fetch(`${fb}/chat-message-send`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            conversationId: cid,
            message: message.trim(),
            visitor: {},
          }),
        });
        const json = (await res.json().catch(() => ({}))) as MessageResponse;
        if (!res.ok) {
          setErr(typeof json.error === "string" ? json.error : res.statusText);
          return;
        }
        setLastReply(typeof json.reply === "string" ? json.reply : "");
        setMessage("");
        return;
      }

      if (!siteUrl || !publicId) {
        setErr("Configure data-api-base and data-public-id");
        return;
      }
      const res = await fetch(nextChatUrl(siteUrl, publicId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message.trim(),
          visitorId,
          consent: false,
          replyLanguage,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as MessageResponse;
      if (!res.ok) {
        setErr(typeof json.error === "string" ? json.error : res.statusText);
        return;
      }
      setLastReply(typeof json.reply === "string" ? json.reply : "");
      setMessage("");
    } catch {
      setErr("Network error");
    } finally {
      setLoading(false);
    }
  };

  const missingSupabase =
    mode === "supabase" &&
    (!fb || !publicKey || !supabaseAnonKey);

  const missingNext = mode === "next" && (!siteUrl || !publicId);

  return (
    <div style={{ fontFamily: "system-ui", position: "fixed", bottom: 16, right: 16, zIndex: 99999 }}>
      {open ? (
        <div
          style={{
            width: 320,
            height: 420,
            background: "#111",
            color: "#fafafa",
            borderRadius: 12,
            boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
            padding: 12,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong>Chat</strong>
            <button type="button" onClick={() => setOpen(false)} style={{ background: "transparent", border: 0, color: "#fff", cursor: "pointer" }}>
              ×
            </button>
          </div>
          {missingSupabase ? (
            <p style={{ fontSize: 12, opacity: 0.85, margin: 0 }}>
              Set <code style={{ fontSize: 11 }}>data-functions-base</code>, <code style={{ fontSize: 11 }}>data-public-key</code>, and{" "}
              <code style={{ fontSize: 11 }}>data-supabase-anon-key</code> on the script tag.
            </p>
          ) : missingNext ? (
            <p style={{ fontSize: 12, opacity: 0.85, margin: 0 }}>
              Set <code style={{ fontSize: 11 }}>data-api-base</code> and <code style={{ fontSize: 11 }}>data-public-id</code>.
            </p>
          ) : (
            <>
              <div
                style={{
                  flex: 1,
                  overflow: "auto",
                  fontSize: 13,
                  lineHeight: 1.4,
                  background: "#1a1a1a",
                  borderRadius: 8,
                  padding: 8,
                  minHeight: 120,
                }}
              >
                {sessionLoading ? (
                  <p style={{ margin: 0, opacity: 0.6 }}>Starting chat…</p>
                ) : lastReply ? (
                  <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{lastReply}</p>
                ) : (
                  <p style={{ margin: 0, opacity: 0.6 }}>Say hello…</p>
                )}
              </div>
              {err ? (
                <p style={{ margin: 0, fontSize: 12, color: "#f87171" }} role="alert">
                  {err}
                </p>
              ) : null}
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#a1a1aa" }}>
                <span>Language</span>
                <select
                  value={replyLanguage}
                  onChange={(e) => {
                    const v = e.target.value;
                    setReplyLanguage(v);
                    try {
                      sessionStorage.setItem(REPLY_LANG_KEY(publicId), v);
                    } catch {
                      /* ignore */
                    }
                  }}
                  style={{
                    flex: 1,
                    borderRadius: 8,
                    border: "1px solid #333",
                    padding: "6px 8px",
                    background: "#222",
                    color: "#fff",
                    fontSize: 12,
                  }}
                >
                  {REPLY_LANG_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Message"
                  style={{ flex: 1, borderRadius: 8, border: "1px solid #333", padding: "8px 10px", background: "#222", color: "#fff" }}
                />
                <button
                  type="button"
                  disabled={loading || sessionLoading}
                  onClick={send}
                  style={{
                    borderRadius: 8,
                    border: 0,
                    padding: "8px 14px",
                    background: "#6366f1",
                    color: "#fff",
                    cursor: loading || sessionLoading ? "wait" : "pointer",
                  }}
                >
                  {loading ? "…" : "Send"}
                </button>
              </div>
            </>
          )}
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          border: 0,
          background: "#6366f1",
          color: "#fff",
          cursor: "pointer",
          boxShadow: "0 4px 16px rgba(99,102,241,0.5)",
        }}
        aria-label="Open chat"
      >
        💬
      </button>
    </div>
  );
}
