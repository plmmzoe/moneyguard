# MoneyGuard AI

Evidence-based behavioral intervention for your wallet. MoneyGuard AI analyzes your purchase intent in real time, predicts regret, and guides you to smarter financial decisions—before you checkout.

- **Web app:** Dashboard, spending analysis, savings goals, and profile—all backed by Supabase.
- **Chrome extension:** Detects checkout-like pages, offers AI (Gemini) cart analysis, and lets you log decisions and update savings without leaving the tab.

## Features

- **Impulse detection** — Identifies high-risk spending moments before you complete a purchase.
- **Cool-off guidance** — Encourages a short pause so you can decide with a clearer head.
- **Regret prediction** — Uses behavioral context to reflect how you might feel about the purchase later.
- **Value assessment** — AI-powered cart analysis (e.g. share of monthly budget, alternatives).
- **Savings goals** — Track goals and log “saved” amounts when you skip a purchase (extension or web).
- **Shared auth** — One account for web and extension; session synced via Supabase and `chrome.storage.local`.

## Stack

- **Framework:** [Next.js](https://nextjs.org/)
- **Auth & database:** [Supabase](https://supabase.com/)
- **AI analysis:** [Google Gemini](https://ai.google.dev/) (cart analysis and prompts)
- **UI:** [Tailwind](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)
- **Extension:** Chrome Manifest V3, built with [Vite](https://vitejs.dev/)

## Prerequisites

- [Node.js](https://nodejs.org/) ≥ 20
- [pnpm](https://pnpm.io/) (or npm / Yarn)
- [Supabase](https://supabase.com/) project (for auth and data)

## Quick start

### 1. Clone and install

```bash
git clone https://github.com/YOUR_ORG/moneyguard
cd moneyguard
pnpm install
```

### 2. Environment variables

Copy the example env and fill in at least the Supabase and app URL values:

```bash
cp .env.local.example .env.local
```

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SITE_URL` | Yes | App URL (add to Supabase Auth → URL Configuration → Redirect URLs) |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes (server) | Supabase service role key for server-side operations |
| Gemini / Paddle | Optional | See `.env.local.example` for optional API keys (e.g. Paddle, Gemini) if you use those flows |

### 3. Run the web app

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up or log in via Supabase to use the dashboard, analyze, savings, and profile.

### 4. Build and load the Chrome extension

From the repo root:

```bash
pnpm run build:extension
```

Then in Chrome:

1. Open `chrome://extensions/`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select the **`dist-extension`** folder.

The extension uses the same Supabase project and auth as the web app. For full extension behavior (popup, content script, permission/analysis UIs, background messages), see **[extension/README.md](extension/README.md)**.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Next.js dev server |
| `pnpm build` | Build Next.js for production |
| `pnpm start` | Run production Next.js server |
| `pnpm run build:extension` | Build the Chrome extension into `dist-extension/` |
| `pnpm lint` | Run ESLint |

## Project structure

- **`src/`** — Next.js app (dashboard, analyze, savings, profile, onboarding, auth, API routes).
- **`extension/`** — Chrome extension (popup, content script, background, UIs); see [extension/README.md](extension/README.md).
- **`shared/`** — Shared auth helpers and types used by both web app and extension.
- **`supabase/`** — Supabase config and migrations.

## Get help

- Extension behavior and build: [extension/README.md](extension/README.md)
- Supabase: [Supabase Docs](https://supabase.com/docs)
- Next.js: [Next.js Docs](https://nextjs.org/docs)
