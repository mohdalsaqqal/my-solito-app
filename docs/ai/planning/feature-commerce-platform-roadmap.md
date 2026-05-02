---
phase: planning
title: Commerce Platform Roadmap Plan
description: Delivery plan for managed web/native commerce platform v1 and future platform seams
---

# Commerce Platform Roadmap Plan

## Milestones

- [ ] Milestone 1: Freeze v1 source-of-truth decisions and resolve architecture conflicts.
- [ ] Milestone 2: Complete provider/service/adapter boundary cleanup.
- [ ] Milestone 3: Ship must-have storefront commerce flows: CMS blocks, product listing/search, product detail, cart, checkout, COD.
- [ ] Milestone 4: Ship CMS/editor v1 for pages, blocks, zones, media, draft/publish, and globals.
- [ ] Milestone 5: Add universal backend integration adapters: Odoo, Shopify REST, custom PostgreSQL.
- [ ] Milestone 6: Add platform operations: tenant provisioning, Sentry, CI gates, secrets, scanning.
- [ ] Milestone 7: Add native app baseline: deep links, push, EAS build/update, critical shared flows.
- [ ] Milestone 8: Verify performance, security, reliability, and test gates.
- [ ] Milestone 9: Document post-v1 multi-tenant and marketplace expansion without building it in v1.

## Current Status - 2026-04-27

- [x] Existing `commerce-platform-roadmap` lifecycle docs validated with `npx ai-devkit@latest lint --feature commerce-platform-roadmap`.
- [x] New managed commerce platform requirements ingested into Phase 1 docs.
- [x] Architecture conflicts recorded instead of silently overriding `AGENTS.md`.
- [x] Prior Phase 4 pharmacist/consultation service-boundary and validation slices remain recorded as completed.
- [x] Phase 2 requirements review completed: requirements are template-complete and AGENTS-aligned.
- [x] Phase 3 design review completed: design is AGENTS-aligned and covers active requirements.
- [x] Phase 4 explicit commerce audit matrix produced.
- [x] Phase 5 planning reconciliation completed: confirmed gaps are now ordered into an implementation queue.
- [x] Phase 4 order write-back slice completed with TDD and guard coverage.
- [ ] Phase 4 next implementation slice: add/formalize `SearchProvider` and delegate search service behavior to it.

## Phase 1: Scope And Architecture Decisions

- [ ] Decide CMS canonical architecture: current Prisma custom CMS, Payload CMS migration, or Payload editor over Prisma-owned content.
- [ ] Decide shared UI architecture: keep current RNR-centered UI or plan a Tamagui migration.
- [ ] Decide Expo baseline for Solito v5 compatibility.
- [ ] Decide Redis responsibility: sessions, cache, queues, rate limits, or selected subset.
- [ ] Decide whether GraphQL Mesh is adapter-internal or a future architecture rule change.
- [ ] Decide whether tRPC adapters are in v1 or deferred.
- [ ] Define v1 launch checklist from Must/Should/Could priorities.
- [ ] Define explicit v1 non-goals: no self-serve onboarding, marketplace, A/B testing, payouts, seller onboarding, or merchant billing.

## Phase 2: Boundary Cleanup

- [x] Move shared business helpers out of API `_lib` when services consume them.
- [x] Move pharmacist/consultation route orchestration behind server services.
- [x] Align and enforce pharmacist validation schemas.
- [ ] Enforce services -> providers -> adapters direction across catalog, payment, search, CMS, notifications, and provisioning.
- [ ] Remove direct adapter imports outside allowed adapter/provider layers.
- [ ] Add guard coverage for search/CMS/payment/provider boundaries as they land.

## Explicit Commerce Audit

Use this audit before implementation so the platform work hardens existing commerce code instead of creating duplicate contracts or parallel services.

### Existing But Needs Hardening

- [ ] Audit existing provider contracts:
  - `CartProvider`
  - `OrderProvider`
  - `ProductProvider`
  - `CatalogProviders`
  - `CMSProvider`
- [ ] Decide whether `ProductProvider` + `CatalogProviders` should remain separate or be clarified under one commerce catalog contract.
- [ ] Verify catalog/product contracts expose products, variants, prices, inventory, backend IDs, disabled state, and provider metadata needed by Odoo/Shopify/PostgreSQL.
- [x] Verify `OrderProvider` supports order creation write-back through `placeOrder()` service delegation.
- [ ] Verify `OrderProvider` supports order status sync, payment settlement, and merchant backend references.
- [ ] Verify existing services cover the required orchestration without a duplicate `commerce/` service folder:
  - `apps/next/server/services/cart`
  - `apps/next/server/services/catalog`
  - `apps/next/server/services/checkout`
  - `apps/next/server/services/orders`
  - `apps/next/server/services/payments`
  - `apps/next/server/services/product`
  - `apps/next/server/services/search`
- [ ] Add focused gaps to existing service folders before introducing any new top-level `commerce/` namespace.

### Missing Or Under-Specified Provider Contracts

- [ ] Add or formalize `SearchProvider` for full-text search, typo tolerance, facets, filters, indexing, and index health.
- [ ] Add or formalize `NotificationProvider` for push notifications and email, with order-status notification support.
- [ ] Decide whether payment remains on `OrderProvider` or becomes a standalone `PaymentProvider`.
- [ ] If standalone, define `PaymentProvider` for cash-on-delivery, gateway payment attempts, pending/success/failed states, refunds, and webhook settlement.
- [ ] Add provider readiness/capability metadata for catalog, payment, search, notification, CMS, and order write-back.

### Missing Or Incomplete Adapters

- [ ] Audit existing `packages/adapters/mock`, `odoo-erp`, and `payment-networks` before adding new adapter folders.
- [ ] Add `packages/adapters/shopify/` for Shopify REST API catalog, inventory, and order write-back mapping.
- [ ] Add `packages/adapters/postgresql/` for merchant custom PostgreSQL catalog/order integration.
- [ ] Add `packages/adapters/meilisearch/` behind `SearchProvider`.
- [ ] Add `packages/adapters/paymob/` behind payment provider contract if Paymob is the first gateway.
- [ ] Decide whether cash-on-delivery is a standalone adapter, a built-in provider mode, or part of the mock/payment adapter surface.
- [ ] Add contract tests for every adapter so UI/services consume normalized provider output only.

### Commerce CMS Block Audit

- [ ] Map required blocks to existing renderers before creating new types:
  - Hero -> existing `renderHeroBlock`
  - ProductGrid -> compare with existing `renderProductRailBlock`; add grid only if layout/data needs differ.
  - Banner -> compare with existing feature/offer/brand banner renderers.
  - Countdown -> compare with existing `renderFlashSaleBlock`; add standalone countdown only if not sale-bound.
  - Recently viewed -> existing `renderRecentlyViewedBlock`
- [ ] Add missing `NewsletterBlock` renderer and normalized block type if not already covered elsewhere.
- [ ] Add missing `FAQBlock` renderer and normalized block type.
- [ ] Add missing `TestimonialsBlock` renderer and normalized block type.
- [ ] Ensure new block types follow the existing `packages/app/features/home/renderers/` dispatch pattern.
- [ ] Ensure CMS block data is normalized by server services before shared UI renders it.

### Shared Commerce Screens Audit

- [ ] Verify existing `ShopScreen` covers product listing requirements.
- [ ] Verify existing `SearchResultsScreen` covers search, facets, sorting, and empty states.
- [ ] Verify existing `ProductScreen` covers images, variants, price, inventory, and backend IDs.
- [ ] Verify existing `CartScreen` covers cart state, pricing, invalid item recovery, and guest/auth behavior.
- [ ] Verify existing `CheckoutScreen` covers guest/auth checkout, COD, gateway readiness, and validation errors.
- [ ] Verify existing `OrdersScreen` and `OrderDetailScreen` cover order history and status events.
- [ ] Verify existing `AccountScreen` covers account/order/notification entry points without leaking admin data.
- [ ] Add missing shared screens only after proving existing screens cannot be extended cleanly.

### Audit Output

- [x] Produce a short implementation matrix with columns: area, existing file, gap, action, owner layer, verification.
- [x] Convert only confirmed gaps into Phase 4 implementation tasks.
- [x] Add guard/test coverage for the order write-back gap.
- [ ] Add guards/tests as each remaining gap is fixed so duplicate contracts and layer leaks cannot return.

## Phase 5 Planning Reconciliation - 2026-04-27

### Completed

- Phase 2 requirements review is complete and AGENTS-aligned.
- Phase 3 design review is complete and AGENTS-aligned.
- Phase 4 explicit commerce audit matrix is complete.
- Confirmed gaps are converted into an implementation queue.

### In Progress

- Phase 4 implementation planning for concrete code slices.
- First slice selected: order creation/write-back must go through `OrderProvider.place`.

### Blocked

- No documentation blocker.
- Implementation should start with failing tests before changing order placement behavior.

### Confirmed Phase 4 Implementation Queue

1. Order write-back through `OrderProvider.place`.
2. `SearchProvider` contract plus search service delegation.
3. `NotificationProvider` contract for order-status push/email.
4. FAQ and Testimonials CMS block audit/implementation.
5. Shared screen hygiene for web-only imports and direct `Platform.OS` usage.

### Next Recommended Tasks

1. Add a failing order placement test proving `placeOrder()` delegates final order creation to `OrderProvider.place` and does not directly persist `.tmp/mock-orders.json`.
2. Implement the smallest provider-backed order placement path, including mock adapter support if the current mock provider shape needs widening.
3. Add a boundary guard or focused regression test so order placement services cannot drift back to direct file-backed write-back.

### Risk Notes

- Keep payment on `OrderProvider` for v1 unless Paymob/custom gateway behavior requires a standalone `PaymentProvider`.
- Build `SearchProvider` only after the order write-back slice lands; it is the next broadest data-flow boundary.
- Add `NotificationProvider` before native push/email work so mobile implementation does not define the provider contract accidentally.

## Phase 4 Implementation Update - 2026-04-27: Order Write-Back

### Completed

- Added a red test proving `placeOrder()` must call `OrderProvider.place` and pass normalized order data.
- Updated `placeOrder()` so final order creation/write-back goes through `orderProvider.place`.
- Extended `PlaceOrderInput` with optional normalized `order` data for merchant/backend write-back.
- Added `mockOrderAdapter.place()` so local/dev order writes remain provider-backed.
- Added a `yarn guard:checks` rule blocking direct mock order persistence in `place-order.service.ts`.

### Next

- Start the `SearchProvider` slice:
  1. Add a failing search service/provider delegation test.
  2. Define the smallest `SearchProvider` contract for query, facets, filters, and empty state.
  3. Move current in-memory search behavior behind the provider boundary before adding Meilisearch.

## Phase 3: Storefront Must-Haves

- [ ] Implement/verify CMS block renderer coverage for Hero, ProductGrid, Banner, Countdown, TextSection, Newsletter, FAQ, Testimonials.
- [ ] Implement product listing search and faceted filters through a search provider.
- [ ] Implement product detail images, variants, and inventory provider status.
- [ ] Verify guest/authenticated cart and checkout flow.
- [ ] Verify cash-on-delivery order placement.
- [ ] Define custom gateway provider state machine and error handling.
- [ ] Add SEO metadata and structured data for web.

## Phase 4: CMS And Content Management

- [ ] Add or verify multi-page CMS support.
- [ ] Add page zones and global settings for header, footer, and announcement bar.
- [ ] Add media library and image optimization workflow.
- [ ] Add scheduling/draft-publish workflow.
- [ ] Add access control for CMS collections or equivalent service-level permissions.
- [ ] Add tests for publish/read/preview/schedule/fallback flows.

## Phase 5: Backend Integration

- [ ] Define catalog/order/inventory contract for Odoo.
- [ ] Define Shopify REST adapter contract mapping.
- [ ] Define custom PostgreSQL adapter contract mapping.
- [ ] Add inventory sync design for webhook and polling.
- [ ] Add order write-back retry/error model.
- [ ] Add provider readiness flags for production release gates.

## Phase 6: Platform Operations

- [ ] Design `new-client.ts` inputs/outputs.
- [ ] Generate tenant config without writing secrets to source.
- [ ] Add deployment metadata for web/admin.
- [ ] Add EAS app/build config generation path.
- [ ] Add Sentry web/API/native setup.
- [ ] Add Dependabot, Socket.dev, and CodeQL CI gates if not present.
- [ ] Confirm CI runs lint, guard, typecheck, tests, and builds.

## Phase 7: Native App Scope

- [ ] Decide minimum v1 mobile flow coverage.
- [ ] Add push notification registration and order status notification flow.
- [ ] Add universal/deep link mapping aligned with web URLs.
- [ ] Add EAS Update workflow.
- [ ] Add Maestro smoke tests for critical flows.
- [ ] Test performance on mid-range Android.

## Phase 8: Security And Compliance

- [ ] Ensure all API endpoints validate with Zod schemas.
- [ ] Confirm secrets flow through Infisical/Doppler or deployment secret stores.
- [ ] Add/verify secure headers: CSP and HSTS.
- [ ] Define PostgreSQL RLS target and service-level authorization baseline.
- [ ] Verify Better Auth identity boundary and app-owned roles/permissions.
- [ ] Add audit checklist for provider config and tenant provisioning.

## Dependencies

- CMS implementation depends on resolving Payload vs Prisma ownership.
- Tamagui implementation depends on an approved UI-system migration plan.
- Native Solito app planning depends on resolved Expo SDK baseline.
- Search implementation depends on a provider contract and indexing model.
- Payment gateway implementation depends on provider state machine and secret handling.
- Tenant provisioning depends on deployment targets, secret provider, Sentry, and EAS decisions.

## Risks & Mitigation

- Risk: submitted stack conflicts cause architecture drift. Mitigation: Phase 2 review must resolve conflicts before implementation.
- Risk: Payload/Tamagui adoption bypasses existing repo rules. Mitigation: update `AGENTS.md` only after explicit architecture approval.
- Risk: GraphQL Mesh becomes an external BFF. Mitigation: keep it adapter/service-internal unless platform model changes.
- Risk: search provider leaks Meilisearch specifics into UI. Mitigation: provider contract and service normalization.
- Risk: tenant provisioning stores secrets in generated files. Mitigation: store secret references only.
- Risk: mobile scope balloons v1. Mitigation: define minimum native flows before implementation.
- Risk: isolated tenant deployments block future multi-tenancy. Mitigation: keep store/tenant context internal and typed from v1.

## Verification Gates

- `npx ai-devkit@latest lint --feature commerce-platform-roadmap`
- `yarn guard:checks`
- `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false` for Next architecture/build changes
- Focused Vitest suites for changed services/providers/routes
- Playwright E2E for critical web checkout/admin/CMS flows
- Maestro E2E for native critical smoke flows once native scope lands
- Lighthouse score at least 90 for web storefront
