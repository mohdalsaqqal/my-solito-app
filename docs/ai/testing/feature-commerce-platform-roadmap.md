---
phase: testing
title: Commerce Platform Roadmap Testing Strategy
description: Critical tests and CI gates for Part 1 delivery and Part 2 seams
---

# Commerce Platform Roadmap Testing Strategy

## Test Coverage Goals

- Cover critical Part 1 commerce paths.
- Cover provider contract behavior for mock-now/Odoo-later and payment readiness.
- Cover role-based account/admin access.
- Cover architecture guardrails that prevent layer leaks and SaaS scope creep.
- Cover v1 managed platform requirements for CMS blocks, search/facets, product detail, checkout, payment, tenant provisioning, and API validation.
- Cover native smoke flows with Maestro once v1 mobile scope is approved.
- Cover explicit commerce audit outcomes so existing contracts/services are hardened instead of duplicated.

## Unit Tests

### Auth And Roles

- [ ] Session resolution returns normalized app identity.
- [ ] Role mapping denies unauthorized admin access.
- [ ] Customer account access cannot reach admin-only data.
- [x] Pharmacist service denies customer role before provider access.

### Catalog Providers

- [ ] Mock catalog adapter satisfies provider contract.
- [ ] Odoo-ready adapter mapping handles product, price, stock, and disabled/missing data.
- [ ] Shopify REST adapter mapping handles product, variant, price, stock, and disabled/missing data.
- [ ] Custom PostgreSQL adapter mapping handles product, variant, price, stock, and disabled/missing data.
- [ ] Services consume provider output, not adapter-specific shapes.

### Search

- [ ] Search provider supports full-text search, typo tolerance, facets, filters, and empty-state behavior.
- [ ] Meilisearch adapter details do not leak into UI or shared screens.
- [ ] Indexing handles product update, disable, out-of-stock, and delete events.

### Notifications

- [ ] Notification provider sends order-status push/email messages through normalized inputs.
- [ ] Notification adapters do not leak provider-specific payloads into services or shared screens.
- [ ] Native push registration and order deep-link targets are tested once mobile scope lands.

### Checkout And Payment

- [ ] Checkout quote handles empty cart, invalid products, invalid coupons, and stale quote state.
- [x] Order placement delegates final creation/write-back through `OrderProvider.place`.
- [ ] Cash-on-delivery creates valid order payment state.
- [ ] Card gateway readiness path validates provider errors and pending/failed states.
- [ ] Payment provider or order-provider payment surface has contract tests for pending, requires-action, captured, failed, refunded, and webhook settlement states.

### CMS/Admin

- [ ] CMS reads normalize Prisma content into UI-safe blocks.
- [ ] Admin writes require correct role/permission.
- [ ] Mock CMS fallback is explicit and not treated as canonical production content.
- [ ] CMS editor supports Hero, ProductGrid, Banner, Countdown, TextSection, Newsletter, FAQ, and Testimonials blocks.
- [ ] CMS supports page zones, global header/footer/announcement settings, media, draft, schedule, publish, and preview flows.
- [ ] If Payload CMS becomes canonical, collection access control is covered by tests.
- [ ] CMS block renderer tests prove required blocks reuse existing renderers where appropriate and only add new types for real gaps.

### Assisted Consultation

- [x] QR resolve trims staff-entered QR input before provider lookup.
- [x] Consultation submit uses staff session identity and normalizes product recommendation ids.
- [x] Validation schema accepts `qrCode` and rejects legacy `barcode`.
- [x] Validation schema accepts `recommendedProductIds` used by live draft/submit routes.
- [ ] Route tests cover pharmacist/customer/admin authorization for each consultation endpoint.
- [ ] Persistence tests cover Prisma-backed consultation and recommendation history once implemented.

## Integration Tests

- [ ] Cart to checkout to order placement with cash-on-delivery.
- [x] Order placement route preserves existing quote validation and successful order placement after provider-backed write-back.
- [ ] Custom payment gateway pending/failed/success state mapping.
- [ ] Customer account order history after order placement.
- [ ] Admin order visibility and role enforcement.
- [ ] CMS publish/read storefront flow.
- [ ] Provider registry swaps mock catalog to Odoo-ready contract without UI/service changes.
- [ ] Provider registry swaps search implementation without UI/service changes.
- [ ] Inventory sync webhook/polling updates normalized inventory state.
- [ ] Order write-back handles merchant backend retry/failure states.
- [ ] `new-client.ts` dry run produces expected config references without writing secrets.

## End-to-End Tests

- [ ] Customer browse -> cart -> checkout -> cash-on-delivery order.
- [ ] Customer search/filter -> product detail -> cart.
- [ ] Customer login -> account -> orders.
- [ ] Admin login -> CMS/order management.
- [ ] Critical mobile/shared screen smoke where Expo scope applies.
- [ ] Native deep link opens matching product/order/account route when mobile scope lands.
- [ ] Push notification opens order status detail when mobile scope lands.

## Test Data

- Stable mock catalog fixtures.
- Checkout fixtures for in-stock, out-of-stock, invalid price, and multi-currency rejection.
- Auth fixtures for customer/admin/unauthorized users.
- CMS fixtures for published, draft, preview, and fallback content.

## Test Reporting & Coverage

- Required baseline: `yarn guard:checks`.
- Required Next baseline for architecture/build behavior: `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false`.
- Add focused service/API tests for each architecture fix.
- CI should block direct adapter leaks and known forbidden layer inversions.
- Web E2E baseline: Playwright for checkout, search, account, admin, and CMS critical paths.
- Mobile E2E baseline: Maestro for approved native critical paths.
- Performance baseline: Lighthouse storefront score at least 90.
- Security baseline: Zod validation coverage for API endpoints plus dependency scanning and CodeQL in CI.

## Manual Testing

- Verify customer storefront and checkout.
- Verify admin access and CMS workflows.
- Verify no Part 1 UI exposes tenant SaaS management, merchant billing, seller onboarding, or payout operations.

## Performance Testing

- Smoke-test cacheable storefront reads.
- Check checkout/order flows under repeated request load once provider contracts stabilize.

## Bug Tracking

- Treat auth, payment, checkout, provider registry, and layer inversion regressions as release blockers.
