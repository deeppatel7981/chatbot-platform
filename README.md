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
| `npm run db:push` | Push Drizzle schema to `DATABASE_URL` |
| `npm run db:migrate` | Run Drizzle migrations |

## Deploy fast (recommended)

**Vercel** (hosting) + **Supabase** (Postgres): minimal ops, same stack you use locally.

1. **Supabase**: create project → enable `vector` extension → copy DB URL.  
2. **Schema**: `MOCK_DATA=false npm run db:push` against that URL once.  
3. **Vercel**: import repo → set env vars → deploy.

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

Optional: `OPENAI_CHAT_MODEL`, WhatsApp and AWS keys for webhooks/S3—see `.env.example`.

### Region / latency

In the Vercel project **Settings → Functions**, pick a region close to your users (e.g. **Mumbai `bom1`** for India).

## Docs

- [Fast deploy (Vercel + Supabase)](docs/deploy-fast.md)
- [Front-end product requirements](docs/frontend-product-requirements.md)
- [AWS SaaS implementation plan](docs/engineering-aws-saas-implementation.md) (optional later path)

## Monorepo

- `packages/core` — shared domain logic (`@chatbot/core`), unit-tested without React.
