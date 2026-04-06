# Deploy fast (Vercel + Supabase)

Goal: ship the app with **minimal ops**—hosted Postgres + Next.js on Vercel. You can revisit AWS later.

## 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. **SQL → New query** — enable pgvector (required for embeddings):

   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

3. **Project Settings → Database** — copy the **URI** for your app:
   - For **Vercel** (serverless), use the **connection pooler** string (often port `6543`) if Supabase shows it—fewer connection issues under load.
   - Append SSL if required: many strings already include `?sslmode=require`.

4. Apply the schema from your machine (or CI once):

   ```bash
   # .env.local with DATABASE_URL pointing at Supabase
   MOCK_DATA=false npm run db:push
   ```

   Or run SQL migrations if you prefer `db:migrate`.

## 2. Vercel

1. Import the GitHub repo → Framework Preset: **Next.js**.
2. **Environment variables** (Production / Preview):

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

   Drizzle still uses **`DATABASE_URL`** only. The `NEXT_PUBLIC_SUPABASE_*` vars enable **`@supabase/supabase-js`** in the browser when you use `getSupabaseBrowserClient()` (e.g. Storage or Supabase Auth later).

3. Deploy. First signup/login will create users in **your** Postgres via **NextAuth** + credentials unless you add Supabase Auth.

## 3. Optional

- **Custom domain**: Vercel Domains + set `NEXTAUTH_URL` to the canonical URL.
- **S3 / SES**: Leave unset until you need uploads or email; the app degrades gracefully where coded.
- **WhatsApp**: Set `WHATSAPP_VERIFY_TOKEN` and point Meta to `https://your-domain/api/webhooks/whatsapp`.

## 4. What you are *not* locked into

- DB is **Postgres**; Drizzle schema can move to RDS later.
- Hosting can move from Vercel to Node on ECS later with the same env vars.
