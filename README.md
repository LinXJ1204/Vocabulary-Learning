# English Vocabulary Builder

Monorepo scaffold for a Domain-Driven Design (DDD) English vocabulary learning platform.

## Structure
- `apps/api`: Express + TypeScript (DDD modular monolith)
- `apps/web`: Next.js (App Router)
- `packages/shared-types`: shared DTOs/types
- `packages/ts-config`: shared TypeScript configs
- `packages/eslint-config`: shared ESLint config

## Dev (later, after installing deps)
### Local setup (Postgres + API + Web)

1) Install dependencies

```bash
pnpm install
```

2) Start Postgres (host port 5435)

```bash
docker compose up -d
```

3) Configure env

- Copy `env.example` to:
  - `apps/api/.env`
  - `apps/web/.env.local`

- For Google login, you must set these in `apps/api/.env`:
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `JWT_SECRET`

  And in Google Cloud Console, add an **Authorized redirect URI**:
  - `http://localhost:4000/auth/google/callback`

  If you're not running on localhost (e.g. testing on phone/PWA), set:
  - `API_BASE_URL` to your API's reachable URL (ex: `http://192.168.1.10:4000`)
  - `WEB_BASE_URL` to your web's reachable URL (ex: `http://192.168.1.10:3000`)
  And add the matching redirect URI: `${API_BASE_URL}/auth/google/callback`

4) Run Prisma migrations (API)

```bash
pnpm --filter @evb/api prisma:migrate
```

5) Start dev servers

```bash
pnpm dev
```

### Quick test

- Health check:

```bash
curl "http://localhost:4000/health"
```

- Manual E2E (Google login + Postgres):
  - Start API + Web (`pnpm dev`)
  - Open `http://localhost:3000/words`
  - Click **使用 Google 登入**
  - Add a word and refresh — it should persist in Postgres

## EC2 (pull images)

Use `docker-compose.ec2.yml` to run on EC2. This file expects image tags via env vars:

- `EVB_API_IMAGE` (ex: `ghcr.io/you/evb-api:prod`)
- `EVB_WEB_IMAGE` (ex: `ghcr.io/you/evb-web:prod`)

Required env for the stack (in an `.env` next to `docker-compose.ec2.yml`):

- `PUBLIC_BASE_URL` (ex: `https://vocab.yourdomain.com`)
- `PUBLIC_HOST` (ex: `vocab.yourdomain.com`)
- `CADDY_EMAIL`
- `JWT_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

Start:

```bash
docker compose -f docker-compose.ec2.yml pull
docker compose -f docker-compose.ec2.yml up -d
```
