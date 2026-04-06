"use client";

import PageIntro from "@/components/dashboard/PageIntro";
import UploadWithClientSelect from "./UploadWithClientSelect";

export default function KnowledgeBasePage() {
  return (
    <div>
      <PageIntro
        eyebrow="Retrieval & RAG"
        title="Knowledge base"
        description={
          <>
            <p>
              Documents you upload are chunked, embedded, and searched when customers ask questions. Better uploads mean
              more accurate answers and fewer handoffs.
            </p>
            <ul className="mt-3 list-inside list-disc space-y-1 text-zinc-600 dark:text-zinc-400">
              <li>Pick the client (business) this content belongs to—isolation is per client.</li>
              <li>Supported types include PDF, DOCX, and plain text.</li>
              <li>After upload, new conversations can ground replies in this material automatically.</li>
            </ul>
          </>
        }
      />

      <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Upload for a client</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Select a business, choose a file, then submit. Processing runs on the server and updates the search index.
        </p>
        <div className="mt-6">
          <UploadWithClientSelect />
        </div>
      </div>
    </div>
  );
}
