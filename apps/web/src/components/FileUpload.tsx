"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function FileUpload({ clientId }: { clientId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("clientId", clientId);

    const res = await fetch("/api/process-upload", {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    const result = await res.json();
    setUploading(false);
    setMessage(result?.error ? `❌ ${result.error}` : "✅ Upload complete");
  };

  return (
    <div className="max-w-md space-y-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <input
        type="file"
        accept=".pdf,.docx,.txt"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="block w-full text-sm text-zinc-700 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-1.5 file:text-sm file:font-medium dark:text-zinc-300 dark:file:bg-zinc-800"
      />
      <Button type="button" onClick={handleUpload} disabled={!file || uploading}>
        {uploading ? "Uploading..." : "Upload"}
      </Button>
      {message && <p className="text-sm">{message}</p>}
    </div>
  );
}
