---
phase: implementation
title: Commerce Platform Roadmap Implementation Guide
description: Implementation notes for Part 1 delivery and Part 2 seams
---

# Commerce Platform Roadmap Implementation Guide

## Development Setup

- Follow `AGENTS.md` startup and navigation order.
- Run `npx ai-devkit@latest lint` before lifecycle work.
- Run `yarn guard:checks` as minimum verification.
- For Next architecture/build changes, also run `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false`.

## Code Structure

- `apps/next`: Next app, server layer, route handlers, server actions, services.
- `packages/app`: shared screens and flows.
- `packages/ui`: shared UI components and reusables.
- `packages/providers`: contracts and registry.
- `packages/adapters`: external integrations and mock implementations.
- `packages/tokens`: design tokens.

## Implementation Notes

### Part 1 Rules

- Build single-client commerce features only.
- Keep store context internal and defaulted.
- Do not expose tenant admin, merchant billing, seller onboarding, or payout features.
- Keep provider seams future-ready but deployment/config driven.

### Provider Contracts

- Catalog: mock now, Odoo-ready adapter later.
- Payment: cash-on-delivery active now, card gateway contract ready.
- Shipping: provider contract ready for future provider config.
- CMS: Prisma-backed custom CMS through services.

### Patterns & Best Practices

- UI never imports adapters.
- Services import providers, not adapters.
- Route handlers stay thin.
- Shared `packages/` code has no `process.env`.
- Tests should lock fixed boundary violations so regressions fail quickly.

## Integration Points

- Odoo adapter should map external catalog/order/stock data into internal provider contracts.
- Payment gateway adapter should map provider statuses into internal checkout/order states.
- Auth should issue identities while app-owned roles/permissions decide authorization.
- CMS should normalize database rows into UI-safe blocks before shared UI renders them.

## Error Handling

- Provider failures should return typed service errors.
- Production-like auth/payment secrets should fail closed.
- Mock fallback must be explicit, never accidental for production canonical reads.

## Performance Considerations

- Keep cacheable public reads behind server services.
- Keep request-bound flows dynamic only when they require request state.
- Do not call internal route handlers over HTTP from Server Components.

## Security Notes

- Enforce role-based access for customer/admin areas.
- Keep payment and auth secrets server-only.
- Validate checkout/payment inputs at service and route boundaries.
- Avoid exposing provider configuration or tenant seams to public/client code in Part 1.

## Phase 6 Implementation Check - 2026-04-26

### Alignment Found

- Auth provider identity is normalized through `apps/next/server/services/auth/auth-session-adapter.service.ts`.
- Business role mapping is app-owned through `apps/next/server/services/auth/auth-role-resolution.service.ts` and `AppAuthRoleMapping`.
- Release-like auth behavior fails closed for weak/missing Better Auth identity paths and does not accept legacy fallback.
- Provider registry already exposes mock-now/Odoo-later catalog seams and mock/payment-networks order seams.
- Store context seam exists in `apps/next/server/services/_lib/storefront-service-context.ts`.
- Customer QR and pharmacist consultation primitives exist across account UI, pharmacist UI, API routes, provider contract, and mock adapter.
- Cash-on-delivery and card/payment-network readiness exist in order provider contracts.

### Deviations / Gaps

| Severity | Area | Finding | Fix Direction |
|---|---|---|---|
| HIGH | Consultation service boundary | Pharmacist route handlers call `pharmacistProvider` directly and own payload shaping. This keeps business orchestration in BFF routes instead of `apps/next/server/services`. | Add `apps/next/server/services/consultation/` or `pharmacist/consultation.service.ts`; routes should only auth, parse input, call service, and return response. |
| HIGH | Consultation persistence | Current consultation records and recommendations are mock adapter state, not Prisma-backed production data. Customer account history is not yet a canonical production consultation store. | Add Prisma-backed consultation/recommendation models and service orchestration; keep mock adapter as seed/fallback only. |
| MEDIUM | Roles | Current `AuthRole` supports `customer`, `pharmacist`, `admin`, `marketing`, `catalog`, `support`, and `ops`; it does not model generic `staff` or `beauty_consultant`. | Extend app-owned role/permission model before claiming Part 1 staff/beauty-consultant readiness. |
| MEDIUM | Validation drift | `validation-schemas.ts` defines pharmacist schemas using `barcode` and `recommendations`, while live routes use `qrCode` and `recommendedProductIds`, and those schemas are not used by the live pharmacist routes inspected. | Align schemas with route contracts and use them at the route boundary. |
| MEDIUM | Authorization granularity | Pharmacist routes check only `session.role === 'pharmacist' || 'admin'`; design calls for app-owned permissions such as consultation create/recommendation write. | Introduce permission helpers for consultation actions and reuse them in routes/services. |
| LOW | Part 2 naming | Store context seam exists, but tenant/store/client naming remains open. | Decide naming before adding more store-scoped models. |

### Next Lifecycle Step

Return to Phase 4 for implementation slices:

1. Move pharmacist/consultation business orchestration behind server services.
2. Align and enforce pharmacist validation schemas.
3. Extend app-owned roles/permissions for staff and beauty consultant.
4. Design Prisma-backed consultation/recommendation persistence before production claim.

## Phase 4 Execution Update - 2026-04-26

### Completed

- Added `apps/next/server/services/pharmacist/pharmacist-consultation.service.ts`.
- Added TDD coverage in `pharmacist-consultation.service.test.ts` for role denial, QR normalization, and consultation submission normalization.
- Updated pharmacist API routes to delegate provider/business orchestration to the service:
  - customer search
  - customer profile
  - product search
  - consultation draft
  - consultation submit
  - QR resolve
- Added a guard that blocks direct `pharmacistProvider` orchestration under `apps/next/app/api/pharmacist`.

### Verification

- Red test failed first with missing service module.
- Focused pharmacist service tests passed: `5/5`.
- `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false` passed.
- `yarn guard:checks` passed.
- `npx ai-devkit@latest lint --feature commerce-platform-roadmap` passed with the known no-dedicated-worktree warning.

## Phase 4 Execution Update - 2026-04-26: Validation Alignment

### Completed

- Updated `PharmacistScanResolveBodySchema` to validate the live `qrCode` contract and trim input.
- Added `PharmacistConsultationBodySchema` for live consultation payloads:
  - `customerId`
  - `title`
  - `summary`
  - `notes`
  - `metrics`
  - `recommendedProductIds`
- Kept `PharmacistConsultationSubmitBodySchema` as an alias of the canonical consultation body schema.
- Updated pharmacist QR, draft, and submit routes to validate request bodies before calling server services.
- Added `validation-schemas.test.ts` coverage for QR and recommendation id contracts.

### Verification

- Red test failed first because `PharmacistConsultationBodySchema` did not exist.
- Focused validation/pharmacist tests passed: `8/8`.
- `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false` passed.
- `yarn guard:checks` passed.
- Source search found no remaining `barcode` or legacy `recommendations:` contract usage in pharmacist validation/routes.
- `npx ai-devkit@latest lint --feature commerce-platform-roadmap` passed with the known no-dedicated-worktree warning.

## Phase 4 Execution Update - 2026-04-27: Explicit Commerce Audit Matrix

### Task Queue

| Task | Status |
|---|---|
| Produce explicit commerce implementation matrix | done |
| Convert confirmed gaps into implementation tasks | done |
| Add guards/tests for each fixed gap | in progress |

### Audit Matrix

| Area | Existing File / Module | Gap | Action | Owner Layer | Verification |
|---|---|---|---|---|---|
| Provider contracts inventory | `packages/providers/contracts/CartProvider.ts`, `OrderProvider.ts`, `ProductProvider.ts`, `CatalogProviders.ts`, `CMSProvider.ts` | Core cart/order/product/catalog/CMS contracts exist; do not add duplicate names. | Harden existing contracts first; create new contracts only for true gaps. | `packages/providers/contracts` | Provider contract tests and `yarn guard:checks`. |
| Catalog/product contract shape | `ProductProvider.ts`, `CatalogProviders.ts` | Product has price, stock, and optional integration snapshot; variants, facet metadata, disabled state, and richer backend references are under-specified for Odoo/Shopify/PostgreSQL. | Extend current product/catalog contracts or clarify their split before adding adapters. | `packages/providers/contracts` | Contract tests for products, variants, inventory, disabled/missing data, and backend IDs. |
| Order write-back | `apps/next/server/services/orders/place-order.service.ts`, `packages/providers/contracts/OrderProvider.ts` | `OrderProvider.place` exists, but `placeOrder()` currently builds an order summary and persists to `.tmp/mock-orders.json`; merchant backend write-back is not provider-backed. | Refactor order placement to delegate final order creation/write-back through `OrderProvider.place` or a justified order service provider boundary. | `apps/next/server/services/orders`, `packages/providers` | Red test proving `orderProvider.place` is called; focused order placement tests; Next typecheck. |
| Payment boundary | `OrderProvider.ts`, `apps/next/server/services/payments/networks-webhook.service.ts`, `packages/adapters/payment-networks` | Payment initiation/settlement exist as optional order provider methods; standalone `PaymentProvider` decision remains open; Paymob is not present. | Audit gateway complexity. Keep payment on `OrderProvider` for v1 unless Paymob/custom gateway requirements justify `PaymentProvider`. | `packages/providers/contracts`, `apps/next/server/services/payments` | Contract tests for pending, requires-action, captured, failed, refunded, webhook settlement. |
| Search provider | `apps/next/server/services/search/search.service.ts` | Search service builds in-memory suggestions from public catalog data; no `SearchProvider`, facets/index health, typo tolerance, or Meilisearch adapter. | Add `SearchProvider` and move search behavior behind provider contract; keep UI consuming normalized service payload. | `packages/providers/contracts`, `apps/next/server/services/search`, `packages/adapters` | Red service/provider tests for provider delegation, facets, empty state, adapter isolation. |
| Notification provider | none found in provider contracts | No `NotificationProvider`; order-status push/email not provider-backed. | Add `NotificationProvider` contract before native push/email implementation. | `packages/providers/contracts`, future adapter folder | Contract tests for normalized order-status notification payloads. |
| Provider registry readiness | `packages/providers/registry.ts` | Readiness tracks existing domains but not search or notifications; cart/CMS remain development-only mock-backed. | Add readiness metadata when Search/Notification providers land; keep strict readiness checks for release-required domains. | `packages/providers` | Registry tests covering readiness and release-like violations. |
| Existing adapters | `packages/adapters/mock`, `odoo-erp`, `payment-networks`, `translation-crowdin` | Odoo and payment-networks exist; Shopify, custom PostgreSQL, Meilisearch, Paymob, and notification adapters are missing. | Add adapters only after corresponding provider contracts are stable. | `packages/adapters` | Adapter contract tests; no service/UI direct imports. |
| CMS block coverage | `packages/app/lib/cms/blocks.ts`, `packages/app/features/home/renderers/*`, `HomeBlocksRenderer.tsx` | Hero, product rail/slider, banners, flash sale/countdown, newsletter CTA, top brands, UGC, recently viewed exist. FAQ and Testimonials are not explicit block types/renderers. ProductGrid may be covered by product rail only if grid requirements match. | Add FAQ and Testimonials block types/renderers; add ProductGrid only if audit proves ProductRail cannot satisfy grid needs. | `packages/app/lib/cms`, `packages/app/features/home/renderers`, `packages/ui/components` | Block renderer tests; `yarn guard:checks`; Next typecheck if app boundary changes. |
| CMS persistence | `CMSProvider.ts`, existing CMS services | Provider contract exposes `getHome()` only; mutable production CMS persistence is Prisma-owned by AGENTS, but provider contract does not express pages/zones/global settings workflow. | Harden CMS services/Prisma models before widening CMS provider surface; do not treat mock CMS as production source. | `apps/next/server/services/cms`, Prisma, `packages/providers/contracts` | CMS service tests for read/write/preview/publish/fallback. |
| Shared shop screen | `packages/app/screens/ShopScreen.tsx` | Existing screen covers filters, sorting, pagination, sale/bundle filters; not provider-aware directly, which is good. Uses `Platform.OS`/web URL state inside shared screen, which should be reviewed against cross-platform rules. | Keep screen; audit URL state/native behavior and move platform-specific behavior to a native/web boundary if needed. | `packages/app/screens` | Screen tests for filters/sorting and cross-platform smoke. |
| Shared search screen | `packages/app/screens/SearchResultsScreen.tsx` | Existing screen renders suggestions/products; lacks true facets/sorting UI tied to `SearchProvider`. Imports `next/link`, which is web-only in shared package. | Keep screen but replace web-only link path with shared navigation/link wrapper and add facets when provider supports them. | `packages/app/screens` | Shared screen contract test; guard against web-only imports in `packages/app`. |
| Shared product screen | `packages/app/screens/ProductScreen.tsx` | Existing PDP handles product details, related/complete set, add-to-cart. Variants/options are inferred from product name, not provider-normalized variant data. Uses `Platform.OS` in shared screen. | Keep screen; feed provider-normalized variants/options and review platform-specific code. | `packages/app/screens`, product services | PDP tests for variants, inventory, add-to-cart, and native/web behavior. |
| Shared checkout screen | `packages/app/screens/CheckoutScreen.tsx` | Existing checkout supports fulfillment, COD/card methods, quote, loyalty, place order. It uses localStorage and `Platform.OS` in shared screen. | Keep screen; verify native-safe behavior and push web persistence into a platform boundary if needed. | `packages/app/screens`, checkout services | Checkout screen tests and Playwright checkout flow. |
| Shared order/account screens | `OrdersScreen.tsx`, `OrderDetailScreen.tsx`, `AccountScreen.tsx` | Existing screens are present; notification entry points and order-status event richness need audit. | Harden existing screens after notification/order-status provider design. | `packages/app/screens` | Account/order screen tests and E2E order history. |
| Provisioning | none found in target service list | `new-client.ts`/provisioning path is not implemented. | Design script/service after provider/config requirements settle; emit config/secret references only. | scripts or `apps/next/server/services` if server-owned | Dry-run test proving no real secrets are written. |

### Confirmed Next Implementation Candidates

1. Order write-back: refactor `placeOrder()` to use `OrderProvider.place`.
2. Search provider: introduce `SearchProvider` and update search service to delegate.
3. Notification provider: introduce contract for order-status notifications.
4. CMS blocks: add FAQ and Testimonials after renderer/component audit.
5. Shared screen hygiene: remove web-only imports and review `Platform.OS` usage in shared screens.

### Phase 5 Reconciled Execution Order - 2026-04-27

1. Start with order write-back because the audit found a concrete live gap: `placeOrder()` persists `.tmp/mock-orders.json` instead of delegating final creation/write-back through `OrderProvider.place`.
2. Use TDD for the order slice:
   - failing service test for provider delegation
   - smallest service/provider change
   - regression guard or focused test for the write-back boundary
3. Continue with `SearchProvider` only after order write-back lands.
4. Add `NotificationProvider` before native push/email implementation.
5. Treat CMS FAQ/Testimonials and shared-screen hygiene as follow-up hardening slices after the provider boundary work.

## Phase 4 Execution Update - 2026-04-27: Order Write-Back

### Completed

- Added TDD coverage in `apps/next/server/services/orders/place-order.service.test.ts` proving `placeOrder()` delegates final order creation/write-back to `OrderProvider.place`.
- Updated `apps/next/server/services/orders/place-order.service.ts` to call `orderProvider.place` instead of persisting `.tmp/mock-orders.json` directly.
- Widened `PlaceOrderInput` with optional normalized `order` data so merchant adapters can receive complete write-back payloads.
- Added `mockOrderAdapter.place()` as the local provider-backed write path.
- Added a guard in `scripts/guard-checks.mjs` that blocks direct mock order persistence from returning to `place-order.service.ts`.

### Verification

- Red test failed first because `placeOrder()` returned a locally generated `ord-*` id instead of the provider-created order id.
- Focused order service test passed: `3/3`.
- Focused order route test passed: `6/6`.
- `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false` passed.
- `yarn guard:checks` passed.
- `npx ai-devkit@latest lint --feature commerce-platform-roadmap` passed with the known no-dedicated-worktree warning.

### Notes

- Local Prisma was unavailable at `localhost:5432` during focused tests; auth role resolution logged fallback errors, but the tests passed.
- Next implementation candidate is `SearchProvider` plus search service delegation.
