# Chatbot platform

Next.js (App Router) admin + marketing site, API routes, Drizzle ORM + Postgres (pgvector). Auth via NextAuth (credentials).

## Local development

```bash
npm install
cp .env.example .env.local
# Set MOCK_DATA=true for demo mode without a database (login: any email + password "admin")
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Purpose |
|--------|---------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run test` | Vitest (app + `@chatbot/core`) |
| `npm run db:generate` | Generate SQL migrations from `apps/web/src/lib/db/schema.ts` → `drizzle/` |
| `npm run db:migrate` | Apply pending migrations to `DATABASE_URL` (production path) |
| `npm run db:push` | Dev-only: sync schema without migration files (avoid in prod) |

## Deploy fast (recommended)

**Vercel** (hosting) + **Supabase** (Postgres): minimal ops, same stack you use locally.

1. **Supabase**: create project → copy DB URL (migrations run `CREATE EXTENSION vector`).  
2. **Schema**: `MOCK_DATA=false npm run db:migrate` once against that URL (from your machine or CI).  
3. **Vercel**: import repo → either set **Root Directory** to `apps/web` and enable *Include source files outside of the Root Directory*, **or** keep the repo root and rely on root `vercel.json` (`outputDirectory`: `apps/web/.next`) → set env vars → deploy.

Full checklist: **[docs/deploy-fast.md](docs/deploy-fast.md)**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Required Vercel environment variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Supabase Postgres URI (pooler recommended for serverless) |
| `NEXTAUTH_SECRET` | e.g. `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://your-project.vercel.app` or custom domain |
| `MOCK_DATA` | `false` in production |
| `OPENAI_API_KEY` | Chat / RAG |

**Optional (Supabase client in the browser):** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` — same values as in the Supabase dashboard **API** page. Use `apps/web/src/lib/supabase` (`getSupabaseBrowserClient`) when you add Storage, Realtime, or Supabase Auth. Drizzle does not use these.

Optional: `OPENAI_CHAT_MODEL`, WhatsApp and AWS keys for webhooks/S3—see `.env.example`.

### Region / latency

In the Vercel project **Settings → Functions**, pick a region close to your users (e.g. **Mumbai `bom1`** for India).

## Docs

- [Fast deploy (Vercel + Supabase)](docs/deploy-fast.md)
- [Front-end product requirements](docs/frontend-product-requirements.md)
- [AWS SaaS implementation plan](docs/engineering-aws-saas-implementation.md) (optional later path)
- [What we sell (product summary)](docs/what-we-sell.txt)

## Monorepo layout

| Path | Role |
|------|------|
| `apps/web` | Next.js app (`@chatbot/web`): dashboard, portal, API routes, widget static assets |
| `packages/core` | Shared domain logic (`@chatbot/core`), unit-tested without React |
| `drizzle/` | Generated Postgres migrations (source of truth for schema alongside `apps/web/src/lib/db/schema.ts`) |
| `supabase/` | Supabase SQL + Edge Functions (RAG helpers, etc.) used alongside or after Drizzle migrations |
| `scripts/` | Dev helpers, seed, pgvector enable |
| `samples/` | Example uploads / fixtures for local testing |
| `infra/` | Terraform for optional AWS path |
