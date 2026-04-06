import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { clients } from "@/lib/db/schema";
import { insertDocumentChunk } from "@/lib/db/document-chunks";
import { embedText } from "@/lib/embeddings";
import { chunkText } from "@/lib/text-chunk";
import { getAppSession } from "@/lib/get-session";
import { uploadBufferToS3 } from "@/lib/s3-upload";
import { randomUUID } from "crypto";
import { isMockData } from "@/lib/mock/mode";

async function extractTextFromFile(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());
  if (ext === "txt") {
    return buffer.toString("utf-8");
  }
  if (ext === "pdf") {
    const pdfParse = (await import("pdf-parse")).default;
    const data = await pdfParse(buffer);
    return typeof data.text === "string" ? data.text : "";
  }
  throw new Error("Unsupported file type (use .txt or .pdf)");
}

export async function POST(req: NextRequest) {
  const session = await getAppSession();
  const orgId = session?.user?.organizationId;
  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const clientId = formData.get("clientId") as string;

  if (!file || !clientId) {
    return NextResponse.json({ error: "Missing file or clientId" }, { status: 400 });
  }

  if (isMockData()) {
    return NextResponse.json({ data: { chunkIds: ["mock-chunk-1"], s3uri: null } });
  }

  try {
    const db = getDb();
    const [clientRow] = await db
      .select()
      .from(clients)
      .where(and(eq(clients.id, clientId), eq(clients.organizationId, orgId)))
      .limit(1);
    if (!clientRow) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const s3uri = await uploadBufferToS3({
      key: `orgs/${orgId}/clients/${clientId}/${randomUUID()}-${file.name}`,
      body: buf,
      contentType: file.type || "application/octet-stream",
    });

    const text = await extractTextFromFile(file);
    if (!text.trim()) {
      return NextResponse.json({ error: "File is empty or unreadable" }, { status: 400 });
    }

    const chunks = chunkText(text);
    const inserted: string[] = [];
    for (const chunk of chunks) {
      const embedding = await embedText(chunk);
      const { id } = await insertDocumentChunk({
        clientId,
        chunk,
        embedding,
        metadata: { filename: file.name, s3uri },
      });
      inserted.push(id);
    }

    return NextResponse.json({ data: { chunkIds: inserted, s3uri } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message || "Server error" }, { status: 500 });
  }
}
