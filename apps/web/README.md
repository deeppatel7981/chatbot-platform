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

**Option A (recommended):** **Settings → General → Root Directory** = **`apps/web`**. Enable **Include source files outside of the Root Directory in the Build Step** (needed for `packages/core`). This folder’s `vercel.json` runs `npm ci --prefix ../..` and `npm --prefix ../.. run build -w @chatbot/web` so the workspace resolves and `.next` stays here.

**Option B:** Root Directory = **repository root**. Use the root **`vercel.json`** (`outputDirectory`: `apps/web/.next`) so Vercel picks up the Next output after `npm run build`.

Clear any mistaken **Output Directory** override (e.g. a bare `.next`) unless it matches where `next build` actually writes.

Ensure environment variables are configured for the deployment that builds `apps/web`.
