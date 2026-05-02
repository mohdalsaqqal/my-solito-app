# Client Handoff Pack

Last updated: 2026-04-30

Single-source handoff document for client onboarding. Covers env vars, Odoo mapping, payment gateway contract, known non-UI limitations, and referral/loyalty/pharmacist acceptance notes.

## 1. Environment Variables

All env vars the client must configure before go-live. See `.env.example` for the canonical template.

### Auth & Security

| Variable | Required | Notes |
|---|---|---|
| `AUTH_SESSION_SECRET` | Production | Min 32 chars, strong random. Used for legacy session signing. |
| `BETTER_AUTH_SECRET` | Production | Min 32 chars. Better Auth session/token signing. Generate: `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"` |
| `BETTER_AUTH_URL` | Production | Base URL of the deployed app (e.g., `https://store.client.com`). |
| `BETTER_AUTH_TRUSTED_ORIGINS` | Production | Comma-separated allowed origins (e.g., `https://store.client.com,https://admin.client.com`). |
| `AUTH_COOKIE_SECURE` | Production | Must be `true` in production (enforces secure cookie flag). |
| `REQUIRE_PRODUCTION_AUTH` | Production | Must be `true` in production (blocks weak secrets). |
| `PREVIEW_TOKEN_SECRET` | Production | Strong random for CMS draft preview. |
| `TRUSTED_REQUEST_BYPASS_SECRET` | Production | Shared secret for server-to-server mutation calls (checkout, order placement). |

### Database

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | Always | Postgres connection string. Never use default credentials in production. |
| `RATE_LIMIT_STORE` | Production | Set to `prisma` for shared rate limiting across instances. |

### Provider Mock Toggle

| Variable | Required | Notes |
|---|---|---|
| `USE_MOCK` | Production | Must be `false`. Controls Odoo/Shopify/PostgreSQL adapter routing. |
| `STRICT_PROVIDER_READINESS` | Production | Must be `true`. Fails fast at startup if mock adapters are active in production. |

### Odoo ERP

| Variable | Required | Notes |
|---|---|---|
| `ODOO_BASE_URL` | If Odoo backend | Odoo instance URL, no trailing slash. |
| `ODOO_DB` | If Odoo backend | Odoo database name. |
| `ODOO_API_KEY` | If Odoo backend | Odoo API key or session token. |

### Payment Gateway (Custom/Networks)

| Variable | Required | Notes |
|---|---|---|
| `USE_CUSTOM_PAYMENT` | Production | `true` for custom gateway, `false` for Networks. |
| `CUSTOM_PAYMENT_BASE_URL` | If custom gateway | Payment provider base URL. |
| `CUSTOM_PAYMENT_API_KEY` | If custom gateway | Payment provider API key. |
| `CUSTOM_PAYMENT_WEBHOOK_SECRET` | If custom gateway | HMAC secret for webhook verification. |
| `CUSTOM_PAYMENT_PROVIDER_NAME` | If custom gateway | Provider identifier (e.g., `custom_gateway`). |
| `NETWORKS_BASE_URL` | If Networks | Networks API URL. |
| `NETWORKS_API_KEY` | If Networks | Networks merchant API key. |
| `NETWORKS_WEBHOOK_SECRET` | If Networks | Networks webhook HMAC secret. |
| `NETWORKS_MERCHANT_ID` | If Networks | Networks merchant ID. |

### Search (Meilisearch)

| Variable | Required | Notes |
|---|---|---|
| `USE_MEILISEARCH` | For search | `true` to route through Meilisearch. |
| `MEILISEARCH_HOST` | If Meilisearch | Meilisearch instance URL. |
| `MEILISEARCH_API_KEY` | If Meilisearch | Meilisearch API key. |
| `MEILISEARCH_PRODUCTS_INDEX` | If Meilisearch | Index name. Supports `{tenantId}` and `{storeId}` placeholders. |

### Notifications (Push)

| Variable | Required | Notes |
|---|---|---|
| `USE_EXPO_PUSH` | For push | `true` after EAS push credentials configured. |
| `EXPO_PUSH_ACCESS_TOKEN` | If push | Expo push access token. |

### Translation

| Variable | Required | Notes |
|---|---|---|
| `USE_TRANSLATION_MOCK` | Production | `false` when Crowdin is configured. |
| `CROWDIN_PROJECT_ID` | If Crowdin | Crowdin project identifier. |
| `CROWDIN_TOKEN` | If Crowdin | Crowdin API token. |
| `CROWDIN_MT_ENGINE_ID` | If Crowdin | Machine translation engine ID. |

### CDN

| Variable | Required | Notes |
|---|---|---|
| `CDN_PURGE_URL` | If CDN | Cache purge endpoint URL. |
| `CDN_PURGE_SECRET` | If CDN | Purge endpoint secret. |

### Shopify (Alternative Backend)

| Variable | Required | Notes |
|---|---|---|
| `SHOPIFY_STORE_DOMAIN` | If Shopify | Client store domain. |
| `SHOPIFY_ADMIN_ACCESS_TOKEN` | If Shopify | Shopify admin API token. |
| `SHOPIFY_ADMIN_API_VERSION` | If Shopify | API version (e.g., `2026-01`). |
| `SHOPIFY_WEBHOOK_SECRET` | If Shopify | Webhook verification secret. |

### Custom PostgreSQL Backend

| Variable | Required | Notes |
|---|---|---|
| `MERCHANT_POSTGRES_URL` | If PG backend | PostgreSQL connection string. |
| `MERCHANT_POSTGRES_SCHEMA` | If PG backend | Schema name (default `public`). |
| `MERCHANT_POSTGRES_SSL` | If PG backend | SSL requirement (`true`/`false`). |
| `MERCHANT_POSTGRES_READONLY` | If PG backend | Read-only access flag. |

### Client-Facing URLs

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Always | Public API base URL for web client. |
| `EXPO_PUBLIC_API_BASE_URL` | Always | Public API base URL for mobile app. |

## 2. Odoo ERP Integration

Full runbook: `docs/delivery/runbooks/odoo-connection.md`

### Architecture

```
Storefront UI → Next.js server services → Provider registry → Odoo adapter → Odoo REST API
```

### Provider Contracts

- `ProductProvider` — `list()`, `get(id)` — product catalog reads
- `CategoryProvider` — `list()`, `tree()`, `getBySlug(slug)` — category hierarchy
- `BrandProvider` — `list()`, `getBySlug(slug)` — brand listing

### Required Odoo REST Endpoints

The Odoo instance must expose these custom REST endpoints with `X-API-Key` auth and `?db=` query param:

| Endpoint | Response | Notes |
|---|---|---|
| `GET /api/products` | `OdooProduct[]` | Supports `brand`, `category`, `ids`, `on_sale`, `sort`, `limit` filters |
| `GET /api/products/:id` | `OdooProduct` | Returns 404 if not found |
| `GET /api/categories` | `OdooCategory[]` | Includes `parent_id` and `children` for tree building |
| `GET /api/brands` | `OdooBrand[]` | Includes `slug` for routing |

### Key Data Mappings

- Odoo `id` → canonical `id` (always string)
- `list_price` → `price`, `standard_price` → `compareAtPrice` (when higher)
- `name_ar` → Arabic localized name (falls back to `name`)
- `parent_id` → category tree linking (client-side)
- `active: false` → excluded from storefront display
- `sale_ok: false` or `type: service` → excluded from storefront display

### Order Write-Back

Order write-back is a separate adapter concern. `OrderProvider.place(input)` contract requires:
- Idempotency via `pricingQuoteId` + order identity
- Platform order ID preserved in Odoo custom fields
- Fail-closed: partial orders must not be created
- Full field mapping in `docs/delivery/runbooks/odoo-connection.md` lines 301-318

### Verification

```bash
node scripts/smoke-odoo-connection.mjs           # Static contract smoke
node scripts/smoke-odoo-connection.mjs --health  # Live API check (needs Odoo)
node scripts/smoke-odoo-connection.mjs --full    # Full adapter execution
yarn verify:functional-storefront                 # Web storefront end-to-end
```

## 3. Payment Gateway Contract

Contract file: `packages/providers/contracts/PaymentProvider.ts`

### PaymentProvider Interface

```ts
type PaymentProvider = {
  createIntent(input: PaymentProviderIntentInput, context): Promise<ProviderResult<PaymentProviderIntent>>
  getIntent?(intentId: string, context): Promise<ProviderResult<PaymentProviderIntent>>
  handleWebhook?(input: PaymentProviderWebhookInput, context): Promise<ProviderResult<PaymentProviderWebhookResult>>
  health?(context): Promise<ProviderResult<{ configured: boolean; provider: string }>>
}
```

### PaymentProviderIntentInput

| Field | Type | Required | Notes |
|---|---|---|---|
| `orderId` | string | Yes | Platform order ID |
| `customerUserId` | string? | No | Authenticated user ID |
| `method` | OrderPaymentMethod | Yes | `cod`, `online-card`, `pay-at-branch` |
| `amount` | number | Yes | Order total in minor units |
| `currency` | string | Yes | ISO 4217 currency code |
| `returnUrl` | string? | No | Post-payment redirect URL |
| `cancelUrl` | string? | No | Cancellation redirect URL |
| `idempotencyKey` | string | Yes | Prevents duplicate charges on retry |

### PaymentProviderIntent (Response)

| Field | Type | Notes |
|---|---|---|
| `id` | string | Payment intent ID |
| `provider` | string | `mock`, `custom_gateway`, `cod` |
| `method` | OrderPaymentMethod | Payment method |
| `status` | PaymentProviderIntentStatus | `not_required`, `pending`, `requires_action`, `authorized`, `captured`, `failed`, `cancelled` |
| `amount` | number | Confirmed amount |
| `currency` | string | Confirmed currency |
| `paymentUrl` | string? | Redirect URL for hosted payment page |
| `clientToken` | string? | Client-side token for SDK integration |
| `expiresAt` | string? | Intent expiry timestamp |
| `settlement` | PaymentSettlementRecord? | Settlement state after webhook |

### Webhook Integration

Webhook route: `POST /api/payments/custom/webhook`

```ts
type PaymentProviderWebhookInput = {
  rawBody: string
  headers: Record<string, string>  // HMAC verification
}

type PaymentProviderWebhookResult = {
  orderId?: string
  intentId?: string
  settlement?: PaymentSettlementRecord
}
```

### Custom Gateway Adapter

Package: `packages/adapters/custom-payment/`

Env vars: `CUSTOM_PAYMENT_BASE_URL`, `CUSTOM_PAYMENT_API_KEY`, `CUSTOM_PAYMENT_WEBHOOK_SECRET`, `CUSTOM_PAYMENT_PROVIDER_NAME`

The adapter is a scaffold. Implement `createIntent`, `getIntent`, and `handleWebhook` against the client's real gateway API. The mock adapter (`USE_CUSTOM_PAYMENT=true` with no base URL) returns COD-like responses for dev/testing.

### Mock Payment Flow

When `USE_CUSTOM_PAYMENT=true` and `CUSTOM_PAYMENT_BASE_URL` is unset or points to localhost:
- `createIntent` returns `status: 'not_required'` for COD
- For online-card: returns `status: 'authorized'` with a mock settlement
- Webhook endpoint accepts mock payloads

## 4. Known Non-UI Production Blockers

Full document: `docs/delivery/PRODUCTION_BLOCKERS.md`

Summary of 15 blockers across 5 categories:

### Auth Secrets (3 blockers)
- `BETTER_AUTH_SECRET` must be set (app crashes at init otherwise)
- `AUTH_SESSION_SECRET` must be strong (≥32 chars, no `change-me`/`placeholder`)
- `TRUSTED_REQUEST_BYPASS_SECRET` must be set (server-to-server calls fail with 403)

### Database (2 blockers)
- Postgres required for production (in-memory stores are dev-only)
- Prisma migrations must be applied (`npx prisma migrate deploy`)

### External Integrations (4 blockers)
- Odoo ERP credentials (`ODOO_BASE_URL`, `ODOO_DB`, `ODOO_API_KEY`)
- Payment gateway credentials (Networks or custom gateway)
- Search provider (Meilisearch — `USE_TRANSLATION_MOCK=false`)
- Notification provider (FCM for Android, APNs for iOS)

### Infrastructure (3 blockers)
- Vercel deployment (Next.js app, build must include `npx prisma generate`)
- EAS Build/Submit (Apple Developer account, Google Play Console, provisioning)
- CDN cache invalidation (`CDN_PURGE_URL` + `CDN_PURGE_SECRET`)

### Security (2 blockers)
- `AUTH_COOKIE_SECURE=true` in production
- CORS/Trusted Origins configured via `BETTER_AUTH_TRUSTED_ORIGINS`

## 5. Referral, Loyalty, and Pharmacist Workflow Acceptance

Full runbook: `docs/delivery/runbooks/referral-loyalty-pharmacist-tests.md`

### Referral — Acceptance Status

| Criterion | Status | Notes |
|---|---|---|
| Store manager configures referral settings | Verified | API + CMS lifecycle smoke pass |
| Store manager creates/updates referral profiles | Verified | Admin API route tests pass |
| Customer views referral summary | Verified | Web functional smoke pass |
| Customer validates/applies referral code | Verified | Web functional smoke pass |
| Checkout quote includes follower discount | Verified | Checkout quote route tests pass |
| Order placement records pending attribution | Verified | Order placement route tests pass |
| Production persistence and tenant scoping | **Pre-release** | Persistence layer defined; tenant isolation not yet provisioned |

### Loyalty — Acceptance Status

| Criterion | Status | Notes |
|---|---|---|
| Customer views tier, points, barcode, history | Verified | Web functional smoke pass |
| Checkout shows redemption options | Verified | Web functional smoke pass |
| Order placement applies redemption | Verified | Order placement route tests pass |
| Earning/spending rules sourced from CMS/service | Verified | Configuration-driven, not hardcoded |
| Production persistence, expiry jobs, rollback | **Pre-release** | Persistence layer defined; expiry cron, rollback, and fraud controls not yet provisioned |

### Hair/Skin Tests & Pharmacist — Acceptance Status

| Criterion | Status | Notes |
|---|---|---|
| Customer views test history from account | Verified | Web functional smoke pass |
| Customer opens test detail with metrics/recommendations | Verified | Web functional smoke pass |
| Customer adds recommended products to cart | Verified | Web functional smoke pass |
| Pharmacist searches customers | Verified | Pharmacist browser smoke pass |
| Pharmacist resolves QR codes | Verified | Pharmacist browser smoke pass |
| Pharmacist creates consultation draft | Verified | Pharmacist browser smoke pass |
| Pharmacist submits completed consultation | Verified | Pharmacist browser smoke pass |
| Hair/skin templates explicitly modeled | Verified | Templates defined, not just generic test titles |
| Production persistence and audit trail | **Pre-release** | Persistence layer defined; audit logging not yet provisioned |

### Verification Commands

```bash
yarn verify:retention-consultation    # Focused service/API tests
yarn verify:functional-storefront     # Web end-to-end smoke (includes referral + loyalty checkout)
yarn verify:pharmacist-browser        # Web pharmacist browser-click smoke
yarn verify:expo-functional           # Expo static app/config checks
```

### Pre-Release Items Requiring Client Environment

- Production persistence provisioning (tenant DB, connection pooling)
- Expiry/scheduled jobs for loyalty point expiry
- Referral attribution fraud controls
- Audit trail logging for pharmacist consultations
- Client-specific questionnaire content beyond current hair/skin template identity

## 6. Related Documents

| Document | Purpose |
|---|---|
| `docs/delivery/PRODUCTION_BLOCKERS.md` | 15 non-UI production blockers with detection/resolution |
| `docs/delivery/runbooks/odoo-connection.md` | Odoo ERP connection runbook with full data mapping |
| `docs/delivery/runbooks/referral-loyalty-pharmacist-tests.md` | Retention and consultation acceptance criteria |
| `docs/delivery/runbooks/client-onboarding.md` | Phase-by-phase onboarding workflow |
| `docs/delivery/runbooks/client-agreement-checklist.md` | Commercial/legal frame checklist |
| `docs/delivery/BLOCKERS.md` | Current delivery blockers |
| `.env.example` | Canonical env var template |
| `packages/providers/contracts/PaymentProvider.ts` | Payment provider contract |
| `packages/providers/contracts/OrderProvider.ts` | Order provider contract |
