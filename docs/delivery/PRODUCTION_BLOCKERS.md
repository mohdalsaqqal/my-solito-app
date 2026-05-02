# Known Non-UI Production Blockers

Last reviewed: 2026-04-30

This document lists production blockers that are NOT visible as broken UI or functionality
but will prevent a successful production deployment. Each blocker includes the detection
command and resolution steps.

## 1. Auth Secrets

### BETTER_AUTH_SECRET must be set

**Detection**: `REQUIRE_PRODUCTION_AUTH=true` (or `NODE_ENV=production`) without
`BETTER_AUTH_SECRET` → app crashes with `A valid BETTER_AUTH_SECRET is required`.

**Resolution**: Generate 48-byte base64url secret:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```
Set in production env.

### AUTH_SESSION_SECRET must be strong

**Detection**: In release mode, `isAuthSecretStrongEnough()` rejects secrets < 32 chars
or containing `change-me` / `placeholder` keyword.

**Resolution**: Generate a strong random secret, set `AUTH_SESSION_SECRET` in production env.

### TRUSTED_REQUEST_BYPASS_SECRET must be set

**Detection**: Server-to-server mutation calls (checkout/order placement) fail with 403
when the trusted bypass header doesn't match.

**Resolution**: Set `TRUSTED_REQUEST_BYPASS_SECRET` to a strong random value shared
between services that need to call mutation endpoints.

## 2. Database

### Postgres required for production

**Detection**: `DATABASE_URL` must point to a running Postgres instance. In-memory mock
stores are dev-only and do not survive restarts.

**Resolution**:
```bash
npx prisma migrate deploy
npx prisma generate
```

### Prisma migrations must be applied

**Detection**: Missing tables → Prisma errors at runtime. CMS config, release blocks,
audit logs, and referral records all require Postgres tables.

**Resolution**: Run migrations before first deploy and after every schema change.

## 3. External Integrations

### Odoo ERP credentials

**Detection**: `USE_MOCK=false` without valid Odoo env vars → product/catalog API fails.

**Env vars required**: `ODOO_BASE_URL`, `ODOO_DB`, `ODOO_API_KEY`

**Resolution**: Set real Odoo endpoint + credentials, verify with `yarn verify:functional-storefront`.

### Payment gateway credentials

**Detection**: Mock payment adapter works for dev. Production needs real gateway credentials
for online-card payments. Webhook settlement requires `NETWORKS_WEBHOOK_SECRET`.

**Env vars required**: `NETWORKS_BASE_URL`, `NETWORKS_API_KEY`, `NETWORKS_WEBHOOK_SECRET`,
`NETWORKS_MERCHANT_ID`

**Resolution**: Set real Networks (or custom) payment gateway credentials. Verify
webhook route is reachable from gateway IPs.

### Search provider

**Detection**: `USE_TRANSLATION_MOCK=true` in production → search suggestions are hardcoded
mock data (dev only).

**Resolution**: Deploy Meilisearch instance, configure `MEILISEARCH_HOST` +
`MEILISEARCH_API_KEY`, set `USE_TRANSLATION_MOCK=false`.

### Notification provider (push notifications)

**Detection**: Push notification registration and order-status notifications fail silently
without FCM (Android) / APNs (iOS) credentials.

**Resolution**: Set up Firebase project for FCM, Apple Push Notification service for APNs.
Configure credentials in EAS secrets and server env.

## 4. Infrastructure

### Vercel deployment

**Detection**: Next.js app not deployed → web storefront unreachable.

**Required**: Vercel project with correct build settings, environment variables,
and custom domain. Build command must include `npx prisma generate`.

### EAS Build / Submit (Expo)

**Detection**: `eas build` fails without Apple Developer account (iOS) or Google Play
Console access (Android).

**Required**: EAS project linked, provisioning profiles (iOS), keystore (Android).
Push notification credentials configured in EAS secrets.

### CDN cache invalidation

**Detection**: `CDN_PURGE_URL` empty → admin cache flush actions skip CDN purge.
Content changes may not propagate to cached pages.

**Resolution**: Configure CDN purge endpoint URL and `CDN_PURGE_SECRET`.

## 5. Security

### AUTH_COOKIE_SECURE must be true in production

**Detection**: `AUTH_COOKIE_SECURE=true` in `.env` → secure cookie flag enforced.
Without it, session cookies are sent over HTTP.

### CORS / Trusted Origins

**Detection**: Better Auth validates request origins against `getBetterAuthTrustedOrigins()`.
Requests from untrusted origins are rejected.

**Resolution**: Set `BETTER_AUTH_TRUSTED_ORIGINS` to comma-separated list of allowed
origins (e.g., `https://store.example.com,https://admin.example.com`).

## Verification

```bash
# Check auth secret strength (release mode)
REQUIRE_PRODUCTION_AUTH=true node -e "
  const { isBetterAuthConfigValid } = require('./apps/next/.next/server/app/api/_lib/security-policy.js');
  console.log(isBetterAuthConfigValid() ? 'AUTH OK' : 'AUTH FAIL');
"

# Check DB connectivity
npx prisma db push --skip-generate

# Full functional smoke (requires running server)
yarn verify:functional-storefront
```
