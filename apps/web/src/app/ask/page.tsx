"use client";

import { useEffect, useState } from "react";
import PageIntro from "@/components/dashboard/PageIntro";
import { appSurfaceCard } from "@/lib/app-typography";

type MatchChunk = {
  chunk: string;
  metadata?: { filename?: string };
  similarity?: number;
};

export default function AskPage() {
  const [query, setQuery] = useState("");
  const [chunks, setChunks] = useState<MatchChunk[]>([]);
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>("");

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/clients", { credentials: "include" });
      const json = await res.json();
      if (!res.ok) {
        console.warn(json?.error || "Could not load projects (sign in required)");
        return;
      }
      const data = json.data || [];
      setClients(data);
      if (data[0]?.id) setSelectedClient(data[0].id);
    })();
  }, []);

  const handleAsk = async () => {
    if (!query || !selectedClient) return;

    setLoading(true);
    const res = await fetch("/api/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        query,
        clientId: selectedClient,
      }),
    });

    const data = await res.json();
    setChunks(data.chunks || []);
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <PageIntro
        eyebrow="Debug"
        title="Ask the knowledge base"
        description={
          <p>
            Run a retrieval match against embeddings for the selected project. Sign in required; use for internal QA,
            not end customers.
          </p>
        }
      />

      <div className={`space-y-4 ${appSurfaceCard}`}>
        <div>
          <label htmlFor="ask-project" className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Project
          </label>
          <select
            id="ask-project"
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 shadow-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="ask-query" className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Question
          </label>
          <input
            id="ask-query"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 shadow-sm placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            placeholder="e.g. What’s the onboarding process?"
          />
        </div>
        <button
          type="button"
          onClick={() => void handleAsk()}
          className="inline-flex rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          disabled={loading || !selectedClient}
        >
          {loading ? "Searching…" : "Ask"}
        </button>
      </div>

      {chunks.length > 0 ? (
        <div className="mt-8 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Top matches</h2>
          {chunks.map((chunk, i) => (
            <div key={i} className={appSurfaceCard}>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Similarity: {typeof chunk.similarity === "number" ? chunk.similarity.toFixed(3) : "—"}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-zinc-800 dark:text-zinc-200 whitespace-pre-line">{chunk.chunk}</p>
              {chunk.metadata?.filename ? (
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">File: {chunk.metadata.filename}</p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
