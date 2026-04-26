# Deploy fast (Vercel + Supabase)

Goal: ship the app with **minimal ops**—hosted Postgres + Next.js on Vercel. You can revisit AWS later.

## 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. **Project Settings → Database** — copy the **URI** for your app:
   - For **Vercel** (serverless), use the **connection pooler** string (often port `6543`) if Supabase shows it—fewer connection issues under load.
   - Append SSL if required: many strings already include `?sslmode=require`.

3. Apply **versioned migrations** from your machine (or CI once):

   ```bash
   # .env.local with DATABASE_URL pointing at Supabase
   MOCK_DATA=false npm run db:migrate
   ```

   The first migration creates `vector` and all tables. For schema changes later: `npm run db:generate`, commit `drizzle/`, then `npm run db:migrate` (not `db:push` in production).

## 2. Vercel

1. Import the GitHub repo → Framework Preset: **Next.js**.
2. **Settings → General → Root Directory** — pick **one** of these (both work if committed `vercel.json` files match):

   - **Recommended:** **`apps/web`**. In the same **Root Directory** section, turn **on** *Include source files outside of the Root Directory in the Build Step* so `packages/core` is visible. `apps/web/vercel.json` installs/builds the workspace via `npm --prefix ../..` (no `cd ..`, which Vercel can block).

   - **Alternative:** leave Root Directory at the **repository root** (`.`). The root **`vercel.json`** sets `outputDirectory` to **`apps/web/.next`** so Vercel reads the Next build output after `npm run build`. Set **Framework Preset** to **Next.js** in the dashboard if it is not detected automatically.

3. **Environment variables** (Production / Preview):

   | Variable | Notes |
   |----------|--------|
   | `DATABASE_URL` | Supabase Postgres URI (pooler URL for production). |
   | `NEXTAUTH_SECRET` | `openssl rand -base64 32` — required in prod. |
   | `NEXTAUTH_URL` | `https://your-app.vercel.app` (or custom domain). |
   | `MOCK_DATA` | `false` for real data. |
   | `OPENAI_API_KEY` | Required for chat/RAG features. |
   | `OPENAI_CHAT_MODEL` | Optional; default e.g. `gpt-4o-mini`. |
   | `NEXT_PUBLIC_SUPABASE_URL` | Optional — `https://xxx.supabase.co` from **API** settings. |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Optional — publishable/anon key for the Supabase JS client. |
   | `WHATSAPP_VERIFY_TOKEN` | Optional — Meta webhook verify token (or use per-client token in DB). |
   | `WHATSAPP_APP_SECRET` | Optional but recommended — Meta app secret for `X-Hub-Signature-256` on `/api/webhooks/whatsapp`. |

   Drizzle still uses **`DATABASE_URL`** only. The `NEXT_PUBLIC_SUPABASE_*` vars enable **`@supabase/supabase-js`** in the browser when you use `getSupabaseBrowserClient()` (e.g. Storage or Supabase Auth later).

4. Deploy. First signup/login will create users in **your** Postgres via **NextAuth** + credentials unless you add Supabase Auth.

### Two chat / RAG stacks (do not mix by accident)

| Path | Where it runs | Knowledge + RAG |
|------|----------------|-----------------|
| **Default (this repo)** | Next.js `POST /api/public/widget/{publicId}/chat` (+ WhatsApp webhook on the same host) | Drizzle DB `document_chunks` + pgvector; dashboard uploads hit `process-upload` (PDF, .docx, .txt). |
| **Supabase LLD** | Edge `chat-session-create` / `chat-message-send` | `knowledge_chunks` with embeddings from `process-knowledge` (set **`OPENAI_API_KEY`** on those Edge functions). `chat-message-send` uses RPC `match_knowledge_chunks`, then falls back to latest chunks + FAQs if no vector hits. |

Apply SQL under `supabase/migrations/` to the Supabase project when you use the LLD path (includes `match_knowledge_chunks`). The Next and Supabase schemas are **not** the same database in typical setups—pick one product path per merchant or sync data yourself.

## 3. Optional

- **Custom domain**: Vercel Domains + set `NEXTAUTH_URL` to the canonical URL.
- **S3 / SES**: Leave unset until you need uploads or email; the app degrades gracefully where coded.
- **WhatsApp**: Point Meta to `https://your-domain/api/webhooks/whatsapp`. Set `WHATSAPP_VERIFY_TOKEN` (or per-client verify token in the DB). Set `WHATSAPP_APP_SECRET` from Meta **App settings → Basic** so POST payloads are checked (`X-Hub-Signature-256`).

## 4. What you are *not* locked into

- DB is **Postgres**; Drizzle schema can move to RDS later.
- Hosting can move from Vercel to Node on ECS later with the same env vars.
