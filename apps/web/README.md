# Web app (`@chatbot/web`)

Next.js App Router app: `src/`, `middleware.ts`, `next.config.ts`, `public/`.

## Local dev

From the **repository root**:

```bash
npm install
npm run dev
```

This runs `next dev` with `cwd` set to `apps/web` (see `scripts/run-dev.mjs`).

## Vercel

Set the project **Root Directory** to `apps/web`, or keep the root at the repo and use:

- **Install:** `npm ci`
- **Build:** `npm run build` (root script runs `next build` in this workspace).

Ensure environment variables are configured for the deployment that builds `apps/web`.
