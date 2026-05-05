# Staging Deployment Runbook

Purpose: make every client deploy reviewable in staging before production DNS, store submission, or live payment/Odoo credentials.

## Required Inputs

| Input | Owner | Notes |
|---|---|---|
| Client slug | Platform operator | Lowercase URL-safe tenant id. |
| Staging domain | Platform operator | Example: `client-staging.example.com`. |
| Postgres staging database | Platform operator | Neon Postgres recommended for preview; separate from production. |
| Vercel project or environment | Platform operator | Isolated project preferred for first clients. |
| Expo EAS project | Platform operator/client | Required before preview build and push smoke. |
| Odoo sandbox | Client | Optional until client backend is ready. |
| Payment gateway sandbox | Client | Optional until gateway is ready. |

## 1. Generate Client Config

```bash
npx tsx scripts/new-client.ts \
  --slug client-slug \
  --name "Client Name" \
  --domains "client-staging.example.com" \
  --output clients/client-slug
```

Generated files stay local and secret-managed. Do not commit `clients/`.

## 2. Provision Staging Database

Create a dedicated Neon Postgres database for preview. Use the pooled connection string for runtime traffic and the direct connection string for Prisma migrations/admin tooling. Set:

```bash
DATABASE_URL=postgresql://user:password@host:5432/client_staging
DIRECT_URL=postgresql://user:password@host:5432/client_staging
TENANT_ID=client-slug
```

Run migrations from `apps/next`:

```bash
yarn workspace next-app prisma:generate
yarn --cwd apps/next prisma migrate deploy
```

Before destructive migration attempts, take a backup per `docs/delivery/runbooks/backup-recovery.md`.

## 3. Configure Vercel Staging

Create or link the Vercel project:

```bash
vercel link
```

Set staging env vars from generated `.env` through the Vercel dashboard or CLI:

```bash
vercel env add DATABASE_URL preview
vercel env add DIRECT_URL preview
vercel env add TENANT_ID preview
vercel env add BETTER_AUTH_SECRET preview
vercel env add AUTH_SESSION_SECRET preview
vercel env add PREVIEW_TOKEN_SECRET preview
vercel env add TRUSTED_REQUEST_BYPASS_SECRET preview
vercel env add BETTER_AUTH_URL preview
vercel env add BETTER_AUTH_TRUSTED_ORIGINS preview
```

Set app URLs:

```bash
NEXT_PUBLIC_API_BASE_URL=https://client-staging.example.com
EXPO_PUBLIC_API_BASE_URL=https://client-staging.example.com
REQUIRE_PRODUCTION_AUTH=true
AUTH_COOKIE_SECURE=true
STRICT_PROVIDER_READINESS=true
```

For an admin/CMS preview before live commerce credentials exist, explicitly keep commerce mock-backed while Prisma-backed admin/auth/CMS use Neon:

```bash
USE_MOCK=true
STRICT_PROVIDER_READINESS=false
USE_MEILISEARCH=false
USE_EMAIL_NOTIFICATIONS=false
USE_EXPO_PUSH=false
ENABLE_HSTS=false
RATE_LIMIT_STORE=prisma
```

Deploy preview:

```bash
vercel deploy
```

Bootstrap the preview admin user once after migrations succeed. Use strong temporary shell env values and clear them after the command:

```bash
ADMIN_EMAIL=admin@example.com \
ADMIN_PASSWORD="replace-with-strong-password" \
yarn seed:admin
```

Optional pharmacist bootstrap:

```bash
ADMIN_EMAIL=admin@example.com \
ADMIN_PASSWORD="replace-with-strong-password" \
PHARMACIST_EMAIL=pharmacist@example.com \
PHARMACIST_PASSWORD="replace-with-strong-password" \
yarn seed:admin
```

Promote only after verification:

```bash
vercel promote <deployment-url>
```

## 4. Configure Expo Preview

Link the Expo project and verify `eas.json` preview profile exists:

```bash
cd apps/expo
npx eas-cli@latest init
```

Set app config values for the client:

- app name
- slug
- iOS bundle id
- Android package
- icon/splash
- `EXPO_PUBLIC_API_BASE_URL`

Build preview:

```bash
npx eas-cli@latest build --profile preview --platform all
```

OTA update for JS-only staging fixes:

```bash
npx eas-cli@latest update --channel preview --message "Staging QA fix"
```

## 5. Adapter Readiness

Until client credentials arrive, staging can run with mock-backed catalog/payment/search seams only if the handoff explicitly says those integrations are pending.

When credentials exist:

```bash
node scripts/smoke-odoo-connection.mjs
yarn verify:payments-checkout
yarn verify:search-discovery
yarn verify:notifications
```

Live Odoo/payment vendor smoke must be recorded in the client handoff notes.

## 6. Staging Verification

Run local gates before deploy:

```bash
yarn verify:devops-deployment
yarn verify:delivery:quality
```

Run against staging after deploy:

```bash
FUNCTIONAL_BASE_URL=https://client-staging.example.com yarn verify:functional-storefront
FUNCTIONAL_BASE_URL=https://client-staging.example.com yarn e2e:a11y
```

Manual Expo preview smoke:

- install preview build on iOS/Android
- login/register
- browse/search/product/cart/checkout
- account orders/referral/loyalty/tests
- push registration if EAS project id and credentials exist

## 7. Rollback

Web:

```bash
vercel rollback
```

Mobile:

```bash
npx eas-cli@latest update:republish --channel preview
```

Database:

- restore staging database from latest backup
- rerun `prisma migrate deploy`
- rerun functional smoke

## Done Means

- Generated client config exists locally or in secret manager.
- Staging database migrated.
- Vercel preview deployment reachable.
- Expo preview build or documented credential blocker exists.
- `yarn verify:devops-deployment` passes.
- `yarn verify:delivery:quality` passes locally before client review.
- Staging URL functional smoke passes or blocker is recorded in `docs/delivery/BLOCKERS.md`.
