# Referral, Loyalty, and Pharmacist Persistence Runbook

This runbook defines the production persistence and adapter path for retention and consultation features. It keeps the current customer-facing functionality working while making clear what must move from local/mock storage to production storage before go-live.

## Architecture

```
Customer app / web account UI
-> Next.js server services
-> Provider registry
-> AccountProvider / ReferralProvider / PharmacistProvider
-> production adapter or Prisma-backed service store
-> PostgreSQL and merchant backend references
```

Pharmacist access is web-only. Mobile apps are customer-only: customers can view their hair and skin test results, pharmacist notes, and recommended products, but pharmacists do not use the mobile app.

## Current Functional State

- Referral profile/program/ledger behavior is service-owned under `apps/next/server/services/referral`.
- Loyalty wallet, loyalty history, and loyalty checkout application are exposed through `AccountProvider`.
- Hair/skin test history and detail are exposed to customers through `AccountProvider`.
- Pharmacist search, QR resolve, draft, and submit flows are exposed through `PharmacistProvider`.
- Current mock/development paths are acceptable for functional smoke, but production must persist these records in tenant-scoped storage.

## Production Persistence Ownership

| Domain | Provider Boundary | Production Store | Notes |
|---|---|---|---|
| Referral program settings | `ReferralProvider.getProgram` | PostgreSQL `ReferralProgram` or tenant config | Tenant scoped; marketer/admin editable |
| Referral profiles | `ReferralProvider.getProfile`, admin referral services | PostgreSQL `ReferralProfile` | Unique per `tenantId + userId`, unique code per tenant |
| Referral ledger | `ReferralProvider.createPendingAttribution` and order settlement jobs | PostgreSQL `ReferralLedgerEntry` | Idempotent by `tenantId + orderId + profileId` |
| Loyalty wallet | `AccountProvider.getLoyaltyWallet` | PostgreSQL `LoyaltyWallet` | Tenant scoped, one wallet per customer |
| Loyalty history | `AccountProvider.listLoyaltyHistory` | PostgreSQL `LoyaltyLedgerEntry` | Append-only; never overwrite historical deltas |
| Loyalty checkout application | `AccountProvider.applyOrderLoyalty` | Transaction across wallet + ledger + order quote | Must rollback on failed order placement |
| Customer test history | `AccountProvider.listTests`, `AccountProvider.getTest` | PostgreSQL `ConsultationTest` | Customer-visible, pharmacist-authored |
| Pharmacist consultation submit | `PharmacistProvider.submitConsultation` | PostgreSQL `ConsultationTest` + recommendation join table | Web-only pharmacist console |
| Recommended products | `PharmacistProvider.submitConsultation` | Join table to canonical product IDs and merchant external IDs | Customer app reads these through account test detail |

## Required Tenant Scoping

Every production table for these domains must include `tenantId` and all service/provider reads must scope by tenant before shared infrastructure is introduced.

Minimum unique constraints:

- `ReferralProfile`: `tenantId + userId`, `tenantId + code`
- `ReferralLedgerEntry`: `tenantId + orderId + profileId`
- `LoyaltyWallet`: `tenantId + userId`
- `LoyaltyLedgerEntry`: append-only id plus indexed `tenantId + userId`
- `ConsultationTest`: id plus indexed `tenantId + customerUserId`
- `ConsultationRecommendation`: `tenantId + consultationId + productId`

## Referral Production Rules

- Referral codes must be generated server-side and normalized to uppercase.
- A referral code cannot be changed if it would collide inside the tenant.
- Pending attribution is created during checkout/order placement.
- Approval or payout must happen after the merchant order reaches the agreed eligible state.
- Referral ledger entries must keep order ID, profile ID, code, subtotal, currency, reward amounts, status, and timestamps.
- Duplicate order retries must not create duplicate ledger rows.

## Loyalty Production Rules

- Loyalty wallet mutations must be transactional with an append-only ledger entry.
- Points redemption and points earning must be part of the same order placement transaction boundary or reconciled by an explicit recovery job.
- If order placement fails after points are reserved, points must be released or compensated.
- Expiration must be ledger-backed; do not mutate history rows to hide expired points.
- The customer app reads wallet and history through `AccountProvider`; no client-side points calculation is authoritative.

## Pharmacist Consultation Production Rules

- Pharmacist console access is web-only and requires `pharmacist` or `admin` role.
- Customers can view completed hair/skin test results and recommendations on web/mobile.
- Submitted consultation records must store:
  - tenant ID
  - customer user ID
  - pharmacist user ID/name
  - branch ID/name
  - template type: `skin` or `hair`
  - title, summary, notes
  - metrics
  - questionnaire answers
  - recommended product IDs
  - created/published timestamps
- Recommended product IDs must map to canonical catalog IDs and preserve merchant external IDs when available.
- Drafts can remain in the pharmacist provider, but submitted consultations must be durable before they appear in the customer account.

## Adapter Path

Preferred v1 path:

1. Keep provider contracts stable.
2. Add Prisma-backed production adapters or service stores for referral, loyalty, and consultations.
3. Keep mock adapters for test/dev only.
4. Register production adapters through the provider registry based on environment/config.
5. Add migration/seed scripts for first-client bootstrap.

Do not add direct database reads to shared screens or UI. Do not let mobile call pharmacist APIs directly for staff operations.

## Verification Before Go-Live

```bash
yarn verify:retention-consultation
node scripts/guard-checks.mjs
```

Additional production checks when Prisma persistence lands:

- [ ] Create referral profile, validate code, place order with code, verify one pending ledger entry.
- [ ] Retry the same order placement, verify no duplicate referral ledger entry.
- [ ] Redeem loyalty points during checkout, verify wallet and ledger update atomically.
- [ ] Force order placement failure after loyalty reservation, verify points are released or compensated.
- [ ] Submit a skin consultation as pharmacist on web, verify customer sees it on web/mobile account.
- [ ] Submit a hair consultation as pharmacist on web, verify customer sees questionnaire answers and recommended products.
- [ ] Confirm pharmacist APIs reject customer sessions.
- [ ] Confirm mobile customer app cannot access pharmacist-only workflows.
