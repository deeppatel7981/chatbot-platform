import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { organizations, auditLogs } from "@/lib/db/schema";
import { getAppSession } from "@/lib/get-session";
import { requireFullOrgApi } from "@/lib/require-full-org-api";
import { isMockData } from "@/lib/mock/mode";
import { getMockOpenaiChatModel, setMockOpenaiChatModel } from "@/lib/mock/ai-settings-store";
import { CHAT_MODEL_OPTIONS, isAllowedChatModel, resolveChatModel } from "@/lib/ai/chat-models";

const EMBEDDING_MODEL = "text-embedding-3-small";

export async function GET() {
  const session = await getAppSession();
  const blocked = requireFullOrgApi(session);
  if (blocked) return blocked;
  const orgId = session?.user?.organizationId;
  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const envDefault = process.env.OPENAI_CHAT_MODEL ?? "gpt-4o-mini";

  if (isMockData()) {
    const selected = getMockOpenaiChatModel();
    return NextResponse.json({
      data: {
        provider: "openai",
        embeddingModel: EMBEDDING_MODEL,
        envDefaultModel: envDefault,
        selectedModel: resolveChatModel(selected),
        orgOverride: selected,
        availableChatModels: CHAT_MODEL_OPTIONS,
      },
    });
  }

  const db = getDb();
  const [org] = await db
    .select({ openaiChatModel: organizations.openaiChatModel })
    .from(organizations)
    .where(eq(organizations.id, orgId))
    .limit(1);

  return NextResponse.json({
    data: {
      provider: "openai",
      embeddingModel: EMBEDDING_MODEL,
      envDefaultModel: envDefault,
      selectedModel: resolveChatModel(org?.openaiChatModel),
      orgOverride: org?.openaiChatModel ?? null,
      availableChatModels: CHAT_MODEL_OPTIONS,
    },
  });
}

export async function PATCH(req: Request) {
  const session = await getAppSession();
  const blocked = requireFullOrgApi(session);
  if (blocked) return blocked;
  const orgId = session?.user?.organizationId;
  if (!orgId || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const raw = body.openaiChatModel;
  const useDefault = raw === null || raw === "" || raw === undefined;
  const nextModel: string | null = useDefault ? null : String(raw).trim();

  if (!useDefault && nextModel && !isAllowedChatModel(nextModel)) {
    return NextResponse.json({ error: "Invalid chat model" }, { status: 400 });
  }

  if (isMockData()) {
    setMockOpenaiChatModel(nextModel);
    return NextResponse.json({
      ok: true,
      data: {
        orgOverride: nextModel,
        selectedModel: resolveChatModel(nextModel),
      },
    });
  }

  const db = getDb();
  await db
    .update(organizations)
    .set({ openaiChatModel: nextModel })
    .where(eq(organizations.id, orgId));

  await db.insert(auditLogs).values({
    organizationId: orgId,
    userId: session.user.id,
    action: "ai.chat_model.update",
    resource: "organization",
    payload: { openaiChatModel: nextModel },
  });

  return NextResponse.json({
    ok: true,
    data: {
      orgOverride: nextModel,
      selectedModel: resolveChatModel(nextModel),
    },
  });
}
