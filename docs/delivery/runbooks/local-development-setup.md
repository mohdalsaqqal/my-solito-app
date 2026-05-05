# Local Development Setup

This runbook covers how to get the project running locally from scratch.

## Prerequisites

- Node.js 20+
- Yarn (installed globally)
- PostgreSQL running locally on port 5432
- Git

## 1. Clone and Install

```bash
git clone <repo-url>
cd my-solito-app
yarn install
```

## 2. Environment Setup

Copy the example env file:

```bash
cp .env.example apps/next/.env
```

The default local database URL is already set:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/real_commerce
```

Set the required secrets (use any value locally):

```
BETTER_AUTH_SECRET=any-local-secret-min-32-chars-long
AUTH_SESSION_SECRET=any-local-secret
PREVIEW_TOKEN_SECRET=any-local-secret
```

## 3. Run Database Migrations

Apply all migrations to your local PostgreSQL:

```bash
yarn --cwd apps/next prisma migrate deploy
```

If you get `P3005` (schema not empty with no migration history), reset and reapply:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/real_commerce" \
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/real_commerce" \
npx prisma migrate reset --force --schema apps/next/prisma/schema.prisma
```

## 4. Seed Admin User

Create your local admin account:

```bash
ADMIN_EMAIL=admin@example.com \
ADMIN_PASSWORD=your-local-password \
yarn seed:admin
```

## 5. Start the Dev Server

```bash
yarn web        # Next.js at http://localhost:3000
yarn native     # Expo dev server (separate terminal)
```

## 6. Verify Everything Works

```bash
yarn guard:checks        # token/className/hex/env guards
yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false  # type check
yarn --cwd apps/next test:api   # API route tests
```

---

## Database Overview

| Environment | Database | Who uses it |
|---|---|---|
| Local dev | PostgreSQL `localhost:5432/real_commerce` | You, on your machine |
| Production | Neon `my-solito-db` (us-east-1) | Vercel deployment |

### Adding a New Migration

After changing `apps/next/prisma/schema.prisma`:

```bash
# Generate and apply migration locally
yarn --cwd apps/next prisma migrate dev --name describe_your_change

# Apply to production (after deploying)
yarn --cwd apps/next prisma migrate deploy
```

### Resetting Local Database

Safe to do anytime — no real data is lost:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/real_commerce" \
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/real_commerce" \
npx prisma migrate reset --force --schema apps/next/prisma/schema.prisma
```

Then re-seed admin:

```bash
ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=yourpassword yarn seed:admin
```

---

## Production Database (Neon)

**Project:** `my-solito-db` (Neon, us-east-1)

Connection strings are stored in Vercel env vars — never commit them. To pull them locally for debugging:

```bash
vercel env pull .env.production.local
```

To run migrations against production:

```bash
DATABASE_URL="<neon-pooled-url>" \
DIRECT_URL="<neon-direct-url>" \
npx prisma migrate deploy --schema apps/next/prisma/schema.prisma
```

To seed production admin (run once, then clear from terminal history):

```bash
ADMIN_EMAIL=your@email.com \
ADMIN_PASSWORD="StrongPassword123!" \
DATABASE_URL="<neon-direct-url>" \
DIRECT_URL="<neon-direct-url>" \
yarn seed:admin
```

---

## Common Issues

### `psql: command not found`
psql is not in PATH. Use Prisma CLI instead for DB operations — all commands above use `npx prisma`.

### `P3005 — schema not empty`
The DB has tables but no Prisma migration history. Run `migrate reset --force` for local, or `migrate resolve --applied` for production.

### `P1014 — table does not exist`
Migrations haven't been run yet. Run `prisma migrate deploy`.

### Auth redirecting to login on every request
Check `REQUIRE_PRODUCTION_AUTH` — set to `false` for local dev.

### Mock data showing instead of real data
`USE_MOCK=true` in your `.env`. Set to `false` and configure real adapter env vars when ready.

---

## Key Commands Reference

| Command | What it does |
|---|---|
| `yarn web` | Start Next.js dev server |
| `yarn native` | Start Expo dev server |
| `yarn test` | Run all tests |
| `yarn --cwd apps/next test:api` | API route tests only |
| `yarn e2e` | Playwright e2e suite |
| `yarn guard:checks` | Run all guard scripts |
| `yarn guard:hygiene` | Repo hygiene check |
| `yarn verify:delivery` | Named delivery gates |
| `yarn seed:admin` | Seed admin user (needs ADMIN_EMAIL + ADMIN_PASSWORD) |
| `vercel env pull` | Pull Vercel env vars locally |
| `vercel deploy` | Deploy preview to Vercel |
| `vercel --prod` | Deploy to production |
