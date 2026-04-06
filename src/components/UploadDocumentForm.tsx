"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  clientId: string;
  onSuccess?: () => void;
}

export default function UploadDocumentForm({ clientId, onSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
    setStatus(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setStatus("Please select a file.");
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("clientId", clientId);
      const res = await fetch("/api/process-upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const json = await res.json();
      if (res.ok) {
        setStatus("✅ Upload and processing complete!");
        setFile(null);
        if (onSuccess) onSuccess();
      } else {
        setStatus(json.error || "Upload failed");
      }
    } catch (err: unknown) {
      setStatus(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="file"
        accept=".pdf,.docx,.txt"
        onChange={handleFileChange}
        className="block w-full rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-zinc-800 hover:file:bg-zinc-200 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100 dark:file:bg-zinc-800 dark:file:text-zinc-100"
        disabled={loading}
      />
      <Button type="submit" disabled={loading || !file}>
        {loading ? "Uploading..." : "Upload Document"}
      </Button>
      {status && <div className="text-sm text-center mt-2">{status}</div>}
    </form>
  );
}
