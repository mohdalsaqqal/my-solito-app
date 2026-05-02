# 05 Backend Integration

Status: `[~]`

## Goal

Keep all external systems behind provider contracts and adapters: Odoo, Shopify, PostgreSQL, payments, search, CMS, and notifications.

## Current State

- [x] Provider registry exists.
- [x] Catalog/order/payment/search/notification/referral/account/pharmacist provider seams exist.
- [~] Odoo adapter exists; production runbook and static smoke complete. Live verification requires client Odoo credentials/endpoints.
- [x] Odoo/merchant backend order write-back expectations are documented and enforced by static smoke.
- [~] Referral, loyalty, and pharmacist flows are provider-backed; production persistence path is documented, but Prisma-backed adapters/stores are not implemented yet.
- [~] Shopify adapter scope is documented/static-smoked; implementation is not built yet.
- [~] Custom PostgreSQL adapter mapping is documented/static-smoked; implementation is not built yet.
- [~] Meilisearch adapter is implemented behind `SearchProvider`; production indexing pipeline and live health checks remain.

## Tasks

- [x] Write Odoo connection runbook and smoke script.
- [x] Define order write-back expectations for merchant backend/Odoo custom adapter.
- [x] Define production persistence/adapter path for referral profiles, loyalty wallet/history, and pharmacist consultations.
- [x] Define Shopify adapter scope.
- [x] Define custom PostgreSQL adapter contract mapping.
- [x] Add Meilisearch adapter behind `SearchProvider`.

## Verification

```bash
node scripts/guard-checks.mjs
yarn verify:retention-consultation
node scripts/smoke-odoo-connection.mjs
yarn verify:shopify-scope
yarn verify:postgresql-mapping
yarn verify:meilisearch-adapter
node scripts/verify-delivery.mjs --profile backend
```

Add adapter-specific smoke commands as adapters become active.

## Blockers

- Client Odoo credentials/endpoints.
