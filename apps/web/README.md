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

In the Vercel project **Settings → General → Root Directory**, set **`apps/web`**.

This directory includes `vercel.json`, which runs a workspace install/build from the monorepo root (`cd ../.. && npm ci` then `npm run build -w @chatbot/web`), so `@chatbot/core` resolves and Next writes `.next` next to `package.json` here.

If Root Directory stays at the repo root, the build can succeed but deploy fails because Vercel looks for `.next` at the wrong path.

Ensure environment variables are configured for the deployment that builds `apps/web`.
