# Evolucent

A transparent evolution of civic funding. Evolucent is a civic crowdfunding platform that connects communities with public infrastructure projects, enabling transparent contributions and real-time progress tracking.

## Tech Stack

- **Framework:** Next.js (App Router) with React 19 and TypeScript
- **Database:** PostgreSQL via Neon (serverless) with Prisma ORM
- **Auth:** NextAuth v5 with Google OAuth
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **State:** Zustand + TanStack React Query
- **PWA:** Installable progressive web app via `@ducanh2912/next-pwa`
- **Ghanaian languages (Khaya AI):** GhanaNLP translation + TTS for Twi, Ewe, Ga, Dagbani, and Fante; browser TTS for English

## Khaya AI (GhanaNLP)

Project listening features use **Khaya** (GhanaNLP): server routes **`/api/translate-project`** (English → target language via `translation-api.ghananlp.org/v1/translate`) and **`/api/tts`** (WAV audio via `.../tts/v1/tts`). The UI components **`ProjectLanguageReader`** and **`KhayaAIPlayer`** orchestrate translate-then-speak; English uses the browser **`speechSynthesis`** API instead of Khaya TTS.

Configure **`GHANANLP_API_KEY`** in `.env` (see `.env.example`). More detail: [docs/khaya-ai.md](docs/khaya-ai.md).

## Getting Started

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) PostgreSQL database
- Google OAuth credentials

### Setup

1. Clone the repo and install dependencies:

   ```bash
   npm install
   ```

2. Copy the example env file and fill in your values:

   ```bash
   cp .env.example .env
   ```

3. Push the Prisma schema to your database and seed it:

   ```bash
   npx prisma db push
   npx prisma db seed
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

   Open [https://localhost:3000](https://localhost:3000) to view the app.

## Scripts

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start dev server (HTTPS)             |
| `npm run build`   | Generate Prisma client + build       |
| `npm run start`   | Start production server              |
| `npm run lint`    | Run ESLint                           |

## PWA

Evolucent is a Progressive Web App. In production builds, a service worker is generated automatically. The app can be installed on mobile and desktop for a native-like experience. PWA caching is disabled in development to avoid stale assets.

Icon placeholders are at `public/icons/icon-192x192.png` and `public/icons/icon-512x512.png` — replace these with actual app icons before deploying.

## Project Structure

```
app/            # Next.js App Router pages and layouts
components/     # React components (site-header, offline-indicator, ui/)
lib/            # Utilities (cn helper, Prisma client)
prisma/         # Schema and seed script
public/         # Static assets and PWA manifest
auth.ts         # NextAuth configuration
```
