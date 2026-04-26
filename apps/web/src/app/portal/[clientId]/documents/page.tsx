"use client";

import { useParams } from "next/navigation";
import PageIntro from "@/components/dashboard/PageIntro";
import UploadDocumentForm from "@/components/UploadDocumentForm";
import { appSurfaceCard } from "@/lib/app-typography";

export default function PortalDocumentsPage() {
  const params = useParams();
  const clientId = params.clientId as string;

  return (
    <div>
      <PageIntro
        eyebrow="Knowledge"
        title="Documents for your business"
        description={
          <p className="max-w-xl">
            Files you add here are used only for this brand&apos;s chatbot. Supported: PDF, Word (.docx), and plain text.
          </p>
        }
      />
      <div className={appSurfaceCard}>
        <UploadDocumentForm clientId={clientId} />
      </div>
    </div>
  );
}
