"use client";


import { useEffect, useState } from "react";

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
        console.warn(json?.error || "Could not load clients (sign in required)");
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
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Ask a Question</h1>
      <label className="block text-sm font-medium mb-1">Select Client</label>
      <select
        className="border rounded px-3 py-2 w-full mb-2"
        value={selectedClient}
        onChange={e => setSelectedClient(e.target.value)}
      >
        {clients.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full border rounded px-4 py-2"
        placeholder="e.g. What’s the onboarding process?"
      />
      <button
        onClick={handleAsk}
        className="bg-black text-white px-4 py-2 rounded"
        disabled={loading || !selectedClient}
      >
        {loading ? "Searching..." : "Ask"}
      </button>

      {chunks.length > 0 && (
        <div className="mt-6 space-y-4">
          <h2 className="text-lg font-medium">Top Matches:</h2>
          {chunks.map((chunk, i) => (
            <div key={i} className="p-4 bg-gray-100 rounded border">
              <p className="text-xs text-gray-500 mb-1">
                Similarity: {typeof chunk.similarity === "number" ? chunk.similarity.toFixed(3) : "—"}
              </p>
              <p className="text-sm text-gray-700 whitespace-pre-line">{chunk.chunk}</p>
              {chunk.metadata?.filename && (
                <p className="mt-1 text-xs text-gray-500">📄 {chunk.metadata.filename}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
