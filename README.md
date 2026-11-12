# The Roaming Birds — Trek Booking (MERN + Gemini AI)

Everything the site shows (treks, contacts, pickups, blog, stats) comes from MongoDB through the Express API. Nothing is hardcoded in the client.

## Setup

1. Copy `.env-sample` to `.env` in the repo root and fill in the values. The backend reads only this file.
2. Copy `client/.env-sample` to `client/.env.development` and set `VITE_API_URL=http://localhost:8000`.
3. Install dependencies:
   ```bash
   npm install && npm install --prefix client
   ```
4. Load the trek data, site settings and blog posts, and build the AI knowledge index:
   ```bash
   npm run seed
   ```
5. Start the app:
   ```bash
   npm run dev                      # API on :8000
   npm run dev --prefix client      # web on :5173
   ```

To make a user an admin, set `user_role: 1` on their document in the `users` collection.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run seed` | Upserts treks (by slug), site settings and blog posts, then rebuilds the AI index |
| `npm run reindex` | Rebuilds only the AI knowledge chunks and embeddings |

## Architecture

- **API** (`backend/`): Express + Mongoose. Config is validated in `backend/config/env.js`.
  - `/api/package`: list and filter treks (`get-packages`, `filters`), get one by id or slug, admin create, update and delete
  - `/api/booking`: booking is saved as Pending; the user submits a UPI reference; an admin marks it advance-paid or paid, which confirms it
  - `/api/settings`: brand, contacts, UPI details, pickups and homepage content (admin editable)
  - `/api/blog`, `/api/contact`, `/api/admin/stats`
  - `/api/ai`: `chat`, `usage`, `sessions` (chat history)
- **AI assistant** (`backend/services/ai/`): Gemini function calling over live database data.
  - Tools: `searchTreks`, `getTrekDetails`, `searchKnowledge` (RAG), `getSiteInfo`, and `getMyBookings` (signed-in users only).
  - Embeddings are stored in the `knowledgechunks` collection and searched with cosine similarity. If embedding fails, it falls back to MongoDB text search. Set `QDRANT_URL` to use Qdrant instead.
  - If a model fails, it switches to the next one in `GEMINI_FALLBACK_MODELS`; overloaded models are skipped for 60 seconds.
- **Limits and cache**: Upstash Redis provides the per-minute and daily AI limits and a 5-minute cache for packages and settings. Without Redis, everything falls back to in-memory.
- **Email**: Resend sends booking received, booking confirmed, the trek reminder (an hourly cron job checks for treks within `TREK_REMINDER_HOURS`) and contact-form notifications.
  - With `EMAIL_FROM=onboarding@resend.dev`, Resend only delivers to your own Resend account address. Verify a domain to email customers.
