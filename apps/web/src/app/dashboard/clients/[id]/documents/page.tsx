"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import FileUpload from "@/components/FileUpload";
import PageIntro from "@/components/dashboard/PageIntro";
import { appSurfaceCard } from "@/lib/app-typography";

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
      <Link
        href={`/app/projects/${clientId}`}
        className="mb-6 inline-flex text-sm font-medium text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        ← Back to project
      </Link>

      <PageIntro
        eyebrow="Knowledge"
        title="Documents"
        description={
          <p>
            Uploads are chunked and embedded for RAG. Supported: <strong className="font-medium text-zinc-800 dark:text-zinc-200">.txt</strong>,{" "}
            <strong className="font-medium text-zinc-800 dark:text-zinc-200">.pdf</strong>,{" "}
            <strong className="font-medium text-zinc-800 dark:text-zinc-200">.docx</strong>. Larger files may take a
            minute to appear in search.
          </p>
        }
      />

      <div className={`mt-6 ${appSurfaceCard}`}>
        <FileUpload clientId={clientId} />
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Uploaded files</h2>
        {loading ? (
          <ul className="mt-4 space-y-3" aria-busy="true" aria-label="Loading documents">
            {[1, 2, 3].map((i) => (
              <li
                key={i}
                className="h-20 animate-pulse rounded-2xl border border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/40"
              />
            ))}
          </ul>
        ) : documents.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/80 px-6 py-12 text-center dark:border-zinc-600 dark:bg-zinc-900/40">
            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">No documents yet</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
              Use the uploader above — chunks will show here once processing finishes.
            </p>
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {documents.map((doc) => (
              <li
                key={doc.id}
                className="rounded-2xl border border-zinc-200/80 bg-white px-5 py-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-950"
              >
                <p className="font-semibold text-zinc-900 dark:text-zinc-50">{doc.metadata?.filename || "Unnamed file"}</p>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Uploaded {new Date(doc.created_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
