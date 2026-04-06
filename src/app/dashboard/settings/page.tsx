"use client";

import { useEffect, useState } from "react";
import PageIntro from "@/components/dashboard/PageIntro";

type AiModelsPayload = {
  envDefaultModel: string;
  selectedModel: string;
  orgOverride: string | null;
  embeddingModel: string;
  provider: string;
  availableChatModels: { id: string; label: string; description: string }[];
};

export default function SettingsPage() {
  const [days, setDays] = useState(365);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [ai, setAi] = useState<AiModelsPayload | null>(null);
  const [aiPick, setAiPick] = useState<string>("__env__");
  const [aiLoading, setAiLoading] = useState(true);
  const [aiSaving, setAiSaving] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/settings/retention", { credentials: "include" });
        const json = await res.json();
        if (res.ok && json.data?.messageRetentionDays != null) {
          setDays(json.data.messageRetentionDays);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setAiLoading(true);
      try {
        const res = await fetch("/api/settings/ai", { credentials: "include" });
        const json = await res.json();
        if (res.ok && json.data) {
          setAi(json.data);
          setAiPick(json.data.orgOverride ?? "__env__");
        }
      } finally {
        setAiLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/settings/retention", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ messageRetentionDays: days }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || "Failed");
        return;
      }
      setMessage("Saved.");
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  };

  const saveAi = async () => {
    setAiSaving(true);
    setAiMessage(null);
    setAiError(null);
    try {
      const useEnv = aiPick === "__env__";
      const res = await fetch("/api/settings/ai", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ openaiChatModel: useEnv ? null : aiPick }),
      });
      const json = await res.json();
      if (!res.ok) {
        setAiError(json?.error || "Failed");
        return;
      }
      if (json.data) {
        setAi((prev) =>
          prev
            ? {
                ...prev,
                selectedModel: json.data.selectedModel,
                orgOverride: json.data.orgOverride,
              }
            : prev
        );
        setAiPick(json.data.orgOverride ?? "__env__");
      }
      setAiMessage("AI settings saved.");
    } catch {
      setAiError("Network error");
    } finally {
      setAiSaving(false);
    }
  };

  return (
    <div className="space-y-10">
      <PageIntro
        eyebrow="Workspace"
        title="Settings"
        description={
          <>
            <p>
              Policies and model defaults apply to your whole workspace. Message retention helps with compliance (e.g.
              limiting how long conversation text is kept). AI settings control which chat model generates replies—embeddings
              for search are listed separately.
            </p>
          </>
        }
      />

      <div className="max-w-lg rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Data retention</h2>
        <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          How many days to retain message content before it can be purged (aligned with DPDP-style minimization). Adjust to
          match your policy and legal review.
        </p>
        <label className="mb-2 mt-4 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Message retention (days)
        </label>
        <input
          type="number"
          min={1}
          max={3650}
          className="mb-4 w-full rounded-lg border border-zinc-200 px-3 py-2 text-zinc-900 shadow-sm transition focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400/30 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-500 dark:focus:ring-zinc-500/30"
          value={days}
          disabled={loading}
          onChange={(e) => setDays(parseInt(e.target.value, 10) || 1)}
        />
        <button
          type="button"
          onClick={save}
          disabled={saving || loading}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50 active:scale-[0.98] dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        {message && <p className="mt-3 text-sm text-green-700 dark:text-green-400">{message}</p>}
        {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
      </div>

      <div className="max-w-2xl rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">AI &amp; LLM</h2>
        <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Customer-facing replies use the chat model below. Knowledge retrieval uses embeddings (
          <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-800">{ai?.embeddingModel ?? "text-embedding-3-small"}</code>
          ) so uploads stay searchable—changing the chat model does not re-embed documents automatically.
        </p>

        {aiLoading ? (
          <p className="mt-4 text-sm text-zinc-500">Loading…</p>
        ) : (
          <>
            <label className="mb-2 mt-4 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Chat model
            </label>
            <select
              className="mb-2 w-full max-w-md rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 shadow-sm focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400/30 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-500 dark:focus:ring-zinc-500/30"
              value={aiPick}
              onChange={(e) => setAiPick(e.target.value)}
            >
              <option value="__env__">Use server default ({ai?.envDefaultModel ?? "gpt-4o-mini"})</option>
              {ai?.availableChatModels.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
            {aiPick !== "__env__" && ai?.availableChatModels.find((m) => m.id === aiPick) ? (
              <p className="mb-4 text-xs text-zinc-500">
                {ai.availableChatModels.find((m) => m.id === aiPick)?.description}
              </p>
            ) : null}
            {aiPick === "__env__" ? (
              <p className="mb-4 text-xs text-zinc-500">
                Uses <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">OPENAI_CHAT_MODEL</code> from the server
                environment when no workspace override is set.
              </p>
            ) : null}
            <p className="mb-4 text-xs text-zinc-500">
              Active model: <strong className="text-zinc-700 dark:text-zinc-300">{ai?.selectedModel}</strong> · Provider:{" "}
              {ai?.provider}
            </p>
            <button
              type="button"
              onClick={saveAi}
              disabled={aiSaving}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50 active:scale-[0.98] dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              {aiSaving ? "Saving…" : "Save AI settings"}
            </button>
            {aiMessage && <p className="mt-3 text-sm text-green-700 dark:text-green-400">{aiMessage}</p>}
            {aiError && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{aiError}</p>}
          </>
        )}
      </div>

      <div className="max-w-2xl rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/50 p-6 dark:border-zinc-600 dark:bg-zinc-900/40">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Team &amp; access</h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Invite colleagues, separate agent vs admin roles, and API keys for automation—these controls will live here so
          your whole support team can use the console safely.
        </p>
        <p className="mt-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">Coming in a future release.</p>
      </div>
    </div>
  );
}
