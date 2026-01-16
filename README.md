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

2) Start Postgres (host port 5433)

```bash
docker compose up -d
```

3) Configure env

- Copy `env.example` to:
  - `apps/api/.env`
  - `apps/web/.env.local`

4) Run Prisma migrations (API)

```bash
pnpm --filter @evb/api prisma:migrate
```

5) Start dev servers

```bash
pnpm dev
```

### Quick test

- Add a word:

```bash
curl -X POST "http://localhost:4000/vocabulary/words" \
  -H "content-type: application/json" \
  -d '{"userId":"demo-user-id","text":"hello"}'
```

- List words:

```bash
curl "http://localhost:4000/vocabulary/words?userId=demo-user-id"
```
