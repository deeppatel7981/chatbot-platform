"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import FileUpload from "@/components/FileUpload";

export default function ClientDocumentsPage() {
  const params = useParams();
  const clientId = params.id as string;
  const [documents, setDocuments] = useState<
    { id: string; metadata?: { filename?: string }; created_at: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocs = async () => {
      const res = await fetch(`/api/client-documents?clientId=${clientId}`, { credentials: "include" });
      const json = await res.json();
      setDocuments(json.data || []);
      setLoading(false);
    };

    if (clientId) fetchDocs();
  }, [clientId]);

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Documents</h1>
      <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">Uploads and chunks for this client.</p>
      <FileUpload clientId={clientId} />

      <div className="mt-6">
        {loading ? (
          <p>Loading documents...</p>
        ) : documents.length === 0 ? (
          <p>No document chunks yet. Upload .txt, .pdf, or .docx.</p>
        ) : (
          <ul className="space-y-2">
            {documents.map((doc) => (
              <li key={doc.id} className="p-4 bg-white rounded shadow border">
                <p className="font-semibold">{doc.metadata?.filename || "Unnamed file"}</p>
                <p className="text-sm text-gray-500">
                  Uploaded on {new Date(doc.created_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
