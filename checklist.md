# Commerce Platform Delivery Checklist

Last reviewed: 2026-05-05

This file is the production-readiness tracker. `AGENTS.md` remains the sole source of truth for architecture rules; this checklist records delivery status against the commerce platform lifecycle.

Legend:
- `[x]` Done and backed by repo code/docs.
- `[~]` Partial or started; not release-complete.
- `[ ]` Not yet implemented or not yet verified.

## Working Rule

- [x] Review this file before starting any substantial implementation, review, architecture, or delivery-readiness task.
- [x] Update this file after finishing substantial work when a status, blocker, verification result, or next step changes.
- [x] Keep `SESSION-STATE.md`, `RECENT_CONTEXT.md`, and `MEMORY.md` in sync after substantial work.
- [x] Treat `AGENTS.md` as authoritative when this checklist and architecture rules disagree.
- [x] Use `docs/delivery/` for aspect tracking, blocker tracking, and named verification gates.

## 1. Product & Business Foundation

- [x] Vision and value proposition recorded for managed branded web + native commerce.
- [x] Target customer profile captured: mid-market merchants with existing backends and regional payment needs.
- [x] Revenue model captured: setup fee, monthly platform fee, adapter/block work, optional source-code buyout.
- [~] Legal/contracts have a client agreement checklist; final signed templates still require legal review.
- [x] Client onboarding process has an executable runbook under `docs/delivery/runbooks/client-onboarding.md`.
- [x] SLA/support expectations are documented.
- [x] Source-code buyout handoff package is documented.

## 2. Architecture & Design System

- [x] `AGENTS.md` is the architecture source of truth.
- [x] Monorepo boundaries are defined: `apps/next`, `apps/expo`, `packages/app`, `packages/ui`, `packages/providers`, `packages/adapters`.
- [x] Canonical data flow is enforced by guards: UI -> Next server layer -> services -> provider registry -> adapters.
- [x] Design token usage is guarded for shared packages.
- [x] Active shared UI contract is RNR-centered with `packages/ui/components` and `packages/ui/reusables`.
- [x] Architecture/design-system delivery gate is documented in `docs/delivery/runbooks/architecture-design-system.md`.
- [x] Expo-facing shared package typecheck is promoted into the current delivery gate.
- [x] Solito navigation skill is installed for cross-platform navigation guidance.
- [x] Prisma/Postgres is the canonical mutable CMS persistence rule.
- [x] Tenant-readiness rules are captured in `AGENTS.md` and `docs/saas-migration.md`.
- [ ] tRPC is not installed or formalized yet; if adopted, update `AGENTS.md` with a narrow internal-client bridge allowance.
- [x] Public GraphQL remains disallowed.
- [ ] GraphQL Mesh is deferred; no adapter-confined Mesh implementation exists.

## 3. Core Development Domains

### 3.1 Storefront Web + Native

- [x] Shared storefront/account screens exist in `packages/app/screens`.
- [x] Web app uses Next.js App Router under `apps/next/app`.
- [~] Native Expo app shell exists under `apps/expo`; static app/config smoke and Expo typecheck pass, while device flows, push, deep links, and store distribution are not complete.
- [~] SEO/SSR foundation exists through Next.js; structured commerce metadata needs a dedicated audit.
- [~] Shared screen hygiene improved by removing `next/link` imports from shared screens; direct `Platform.OS` usage remains a cleanup backlog.

### 3.2 CMS & Content Management

- [x] Prisma CMS models exist for multiple home/content surfaces.
- [x] CMS reads/writes are service-owned under `apps/next/server/services/cms`.
- [x] Homepage block renderer dispatch pattern exists in `packages/app/features/home`.
- [x] Admin CMS UI exists under `apps/next/app/admin`.
- [x] Draft/preview/publish/rollback flows have service coverage and CMS lifecycle smoke verification through `yarn verify:cms-lifecycle`.
- [x] Media-library limitations are documented in `docs/delivery/runbooks/cms-store-manager.md` for first client delivery.
- [x] Testimonials are represented by the existing `ugc_gallery`/`TestimonialsBlock` path. FAQ accordion block implemented (2026-04-30): `faq_accordion` type, `FaqAccordion` component in @real/ui/components, renderer + dispatch, seed data with 4 FAQ items.

### 3.3 Backend Integration

- [x] Provider registry and contract package exist in `packages/providers`.
- [x] Product/catalog, cart, order, CMS, auth, account, review, menu, release, promotion, referral, admin, search, payment, and notification contracts/adapters have repo surfaces.
- [x] Order write-back now delegates through `OrderProvider.place`.
- [x] Search now has a `SearchProvider` contract and mock adapter behind the provider registry.
- [x] `PaymentProvider` contract exists for payment intents and custom gateway readiness.
- [x] `NotificationProvider` exists with mock delivery and Expo push adapter readiness.
- [x] Referral, loyalty, and pharmacist/test flows are provider-backed with Prisma production storage (2026-05-01: ReferralProfile, ReferralLedgerEntry, ReferralProgram models created. Stores migrated from JSON files to Prisma. AdminUserOverride model replaces admin-user-overrides.json. `withTenant()` utility for per-transaction tenant scoping. RLS policies active on all 24 commerce/CMS tables.)
- [~] Odoo adapter exists under `packages/adapters/odoo-erp`; catalog read path and order write-back expectations are documented/static-smoked, while live client Odoo verification remains.
- [~] Shopify REST adapter scope is documented/static-smoked; implementation is not built yet.
- [~] Custom PostgreSQL adapter mapping is documented/static-smoked; implementation is not built yet.
- [~] Meilisearch adapter is implemented behind `SearchProvider`; indexing pipeline, facets, filters, sorting, typo tolerance, and health settings are locally verified, while live Meilisearch provisioning remains.
- [~] Generic custom payment gateway adapter exists; Paymob-specific adapter is not implemented.

### 3.4 User & Account Management

- [x] Better Auth foundation exists in `apps/next/lib/auth.ts`.
- [x] Better Auth session/role normalization lives under `apps/next/server/services/auth`.
- [x] App-owned RBAC via Prisma role mapping is documented and implemented.
- [x] Account and order history screens exist in shared app code.
- [x] Referral account summary exists and focused tests pass; production persistence path is documented.
- [~] Loyalty wallet/history/redemption exists and focused tests pass; production persistence path is documented, while expiry/rollback/fraud controls remain.
- [x] Hair/skin tests expose explicit template identity with pharmacist consultation support; questionnaire payloads are preserved through the service path and customer test detail type.
- [x] Tenant-aware user membership model exists in Prisma schema/migration through `Tenant` and `TenantUser`.

### 3.5 Payments & Checkout

- [x] Cart, checkout, and order services/screens exist.
- [x] Checkout quote and order placement use server-owned service boundaries.
- [x] COD/custom payment direction is captured in requirements.
- [x] Payment orchestration creates provider-backed payment intents during order placement; redirects/webhooks and reconciliation are verified locally.
- [x] Referral discounts and loyalty redemption are wired into quote/order paths; combined checkout smoke and reconciliation rules pass.
- [~] Order write-back is provider-backed; Odoo/custom backend idempotency, status mapping, and failure expectations are documented, while live backend retry/dead-letter operations still need client integration.

### 3.6 Search & Discovery

- [x] Search screen and search page/service exist.
- [x] Search service delegates discovery to `SearchProvider`.
- [x] Guard blocks reintroducing direct public catalog discovery in the search service.
- [~] Meilisearch adapter exists behind `SearchProvider`; indexing dry-run, facets, filters, typo tolerance, sorting config, and health checks pass locally, while live provider health requires provisioned Meilisearch.

### 3.7 Notifications

- [~] Push notification provider/service is implemented with mock delivery, Expo token registration, order-status trigger, admin controls, and retry/dead-letter status; physical-device push smoke remains.
- [~] Email notification adapter is implemented behind `NotificationProvider` with admin template/campaign controls; live vendor sandbox verification remains.
- [x] Order-status notification workflow is provider-backed from admin status updates.
- [x] Admin notification control center exists under `/admin/marketing/notifications` for templates, channel toggles, test sends, campaigns, and delivery status.

## 4. Quality & Testing

- [x] Service/API tests run through `yarn --cwd apps/next test:api`.
- [x] Architecture guard exists through `yarn guard:checks`.
- [x] Agent-doc guard exists through `yarn guard:agent-docs`.
- [x] Hygiene guard exists through `yarn guard:hygiene`.
- [x] Playwright a11y smoke exists through `yarn e2e:a11y`.
- [x] Full API suite passes: 225/225 through the current quality profile.
- [x] Current delivery profile passes through `node scripts/verify-delivery.mjs --profile current`.
- [x] Client-reviewable quality profile passes through `yarn verify:delivery:quality`, including CMS lifecycle smoke and production Next build.
- [ ] Maestro native E2E is not implemented.
- [x] Lighthouse CI implemented (2026-05-01: lighthouserc.json with performance/accessibility/best-practices/SEO budgets. CI job added to .github/workflows/ci.yml — runs after build using @lhci/cli autorun.)
- [x] Socket.dev/CodeQL/dependency scanning configured (.github/workflows/security.yml — CodeQL + Dependency Review + Gitleaks). Hosted run confirmation is deployment-dependent.
- [ ] Penetration test has not been performed. (Requires external security specialist — not code-actionable.)

## 5. DevOps & Deployment

- [x] GitHub Actions CI workflow exists.
- [x] Vercel/Next build scripts exist.
- [x] EAS/Expo app shell exists.
- [~] Environment example and Better Auth secret contracts exist; Infisical/Doppler integration is not implemented.
- [x] `new-client.ts` provisioning automation exists with dry-run, generated env, and custom output support.
- [~] Per-client database/app provisioning automation has a generated config/runbook path; Vercel Preview + Neon preview DB were provisioned for the first hosted preview on 2026-05-05. Preview is Ready but currently Vercel Deployment Protection-gated for public browser/API smoke. EAS/store provisioning still requires credentials.
- [x] Automated Postgres backups and PITR are documented in `docs/delivery/runbooks/backup-recovery.md`.
- [x] EAS Build/Submit/Update rollout runbook exists in `docs/eas-runbook.md`; real Expo project/store credentials still need client setup.
- [x] Per-client staging deployment process is documented in `docs/delivery/runbooks/staging-deployment.md`.
- [x] DevOps deploy-readiness smoke passes through `yarn verify:devops-deployment`.
- [x] Deploy profile passes through `yarn verify:delivery --profile deploy`.

## 6. Operations & Observability

- [x] Error handling and guardrails exist in services/routes. Sentry integration complete (2026-05-01: @sentry/nextjs installed, client/server/edge configs with env-var DSN, instrumentation hook, dormant until SENTRY_DSN is set).
- [~] Centralized logging/alerting vendor is not implemented; incident routing runbook exists.
- [~] Uptime monitoring runbook exists; hosted monitor setup still requires vendor choice/credentials.
- [x] Rate limiting exists with production-ready defaults (2026-05-01: 8 endpoint categories configured — auth 5/10min, register 3/10min, reset 2/15min, session 60/min, checkout 20/min, search 60/min, general 30/min, cart 20/min. Prisma-backed store for production, in-memory fallback for dev.)
- [x] Health endpoint exists at `GET /api/health` with runtime, provider, search, and notification readiness.
- [x] Incident response and rollback runbook exists in `docs/delivery/runbooks/incident-response.md`.
- [x] Operations/observability smoke passes through `yarn verify:operations-observability`.
- [x] Provider health dashboard/status page is implemented (2026-05-01: `/admin/operations/health` — overall system status + per-component cards for runtime, providers, search, notifications. Uses existing `/api/health` endpoint. Refresh button, expandable metadata details, color-coded status pills.)

## 7. Security & Compliance

- [x] Zod validation is widely used in API routes.
- [x] Better Auth uses secure production secret enforcement.
- [x] Release-like environments reject legacy auth fallback.
- [x] Server-side authorization patterns exist for protected routes/services.
- [x] HTTPS/security header direction is captured in production docs.
- [x] CSP/security headers are configured in `apps/next/next.config.mjs`.
- [x] HSTS is opt-in through `ENABLE_HSTS=true` and documented for post-HTTPS readiness.
- [~] Tenant context exists at server/provider boundary. (2026-05-01: Schema + RLS done — 24 commerce/CMS tables have tenantId with composite unique constraints. RLS policies active on all 24 tables. `withTenant()` utility in server/lib/prisma.ts. Service-level query scoping still needed.)
- [x] PostgreSQL row-level security is implemented. (2026-05-01: RLS enabled on all 24 commerce/CMS tables with `USING (tenantId = COALESCE(current_setting('app.current_tenant_id', true), 'default'))` policies. `withTenant()` utility for per-transaction tenant scoping.)
- [x] CodeQL, Dependency Review, and Gitleaks workflow exists in `.github/workflows/security.yml`.
- [x] Security/compliance runbook exists in `docs/delivery/runbooks/security-compliance.md`.
- [x] Security/compliance smoke passes through `yarn verify:security-compliance`.
- [~] Formal vulnerability scanning is configured in CI but still needs hosted run confirmation.
- [ ] Penetration testing is not complete.

## 8. Platform Operations

- [x] Idempotent tenant provisioning command exists through `scripts/new-client.ts`.
- [~] Centralized tenant/adapters/gateway configuration exists as generated `client.json`; UI is not implemented.
- [x] Cross-client update/patch strategy is documented in `docs/delivery/runbooks/platform-operations.md`.
- [x] Support triage workflow is documented in `docs/delivery/runbooks/platform-operations.md` and `sla-support.md`.
- [x] Client offboarding/source-code buyout process is documented in `docs/delivery/runbooks/source-code-buyout.md`.
- [x] Platform operations smoke passes through `yarn verify:platform-operations`.

## 9. Documentation & Knowledge Base

- [x] `AGENTS.md`, memory files, architecture index, graphify contexts, and skills are present.
- [x] Production blueprint and SaaS migration docs exist.
- [x] AI DevKit requirements/design/planning/implementation/testing docs exist for the commerce roadmap.
- [~] API documentation from Zod/tRPC schemas is not implemented.
- [x] Component catalog exists in `docs/delivery/runbooks/component-catalog.md`; full Storybook remains future UI tooling.
- [x] CMS user guide for store managers exists in `docs/delivery/runbooks/cms-store-manager.md`.
- [x] Operator handbook index exists in `docs/delivery/runbooks/OPERATOR_HANDBOOK_INDEX.md`.
- [x] Documentation/knowledge smoke passes through `yarn verify:documentation-knowledge`.

## 10. AI-Augmented Development Process

- [x] Solito and Tamagui skill files are installed.
- [x] Caveman startup rule is in `AGENTS.md`.
- [x] Memory update rule is in `AGENTS.md`.
- [x] Graphify bounded-context graphs exist.
- [x] Parallel agent dispatch protocol is documented in `AGENTS.md`.
- [x] Repo-local Symphony delivery workflow exists under `docs/delivery/`.
- [x] Named delivery verifier exists through `yarn verify:delivery`.
- [x] AI development process smoke passes through `yarn verify:ai-development-process`.
- [x] Guards catch common AI violations: direct adapters, shared-package env/className/hex, search-service catalog bypass, shared `next/link` imports.
- [~] Checklist review/update is now required; future agents must keep this file current.

## 11. Launch & Post-Launch

- [x] Beta client plan is documented in `docs/delivery/runbooks/launch-post-launch.md`; first beta client is not launched.
- [x] Content/product/order/customer migration checklist is documented.
- [x] Go-live checklist for DNS, SSL, live payment keys, app review, and push certificates is documented.
- [x] SLA/support channel checklist is documented.
- [x] Merchant/customer feedback loop is documented.
- [x] Launch/post-launch smoke passes through `yarn verify:launch-post-launch`.

## Current Release Blockers

- [x] Committed 2277 pre-existing staged deletions (generated/dead files). `yarn guard:hygiene` now passes clean. BLK-003 resolved on 2026-04-29.
- [x] Rerun full API/service suite successfully. (2026-04-30: 225/225 pass in 6min via direct Node/tsx command — no disk issue. Previous ENOSPC was Yarn-specific, direct `node` works.)
- [~] Complete provider-backed production search with Meilisearch, facets, and health checks: adapter, indexing dry-run, facet/filter/sort config, and local health-settings checks pass; live Meilisearch provisioning remains.
- [~] Complete production payment gateway redirect/webhook handling and COD settlement operations: local provider/webhook/reconciliation gates pass; client sandbox/live verification remains.
- [~] Complete notification provider for push/email order updates: push/email provider seams and admin controls pass locally; physical push and live email vendor smoke remain.
- [~] Complete tenantId persistence/scoping for shared-ready mutable commerce/CMS tables. (2026-05-01: Schema done — 24 tables have tenantId + composite unique constraints. Service query filtering by tenantId remains.)
- [x] Complete local provisioning automation for new clients through `scripts/new-client.ts`; live account provisioning remains external.
- [~] Complete production observability: local health endpoint/runbooks pass; Sentry, hosted uptime checks, logging, and alerting remain deployment work.
- [~] Complete native mobile production readiness: push/EAS seams are implemented; deep links, physical push smoke, real EAS credentials/builds, and Maestro smoke remain.

## Functional Delivery Plan

Goal: make web storefront and Expo app functionally ready end-to-end. UI publishing/polish can happen separately, but all customer, admin, CMS, checkout, order, account, and platform-critical flows must work as expected. The only allowed external blockers are the client's real Odoo credentials/endpoints and custom payment gateway credentials/endpoints; those must already have ready adapter seams, runbooks, and smoke tests.

### Phase 0 - Gate Recovery

- [x] Fix `apps/next/scripts/dev-stable.mjs` duplicate `createRequire` issue so dev/a11y smoke can boot.
- [x] Scope hygiene away from nested `.worktrees/` and add hygiene runbook.
- [x] Move search behind `SearchProvider`; guard blocks `getPublicCatalogCollections()` from returning to search service.
- [x] Remove `next/link` imports from shared screens.
- [~] Direct `Platform.OS` use remains in shared screens and should be reduced before native functional verification.
- [x] Free local disk space or run direct Node commands before full suite; recent Yarn run hit `ENOSPC`. (Resolved: using direct Node commands with Docker PostgreSQL. Dev server + API suite run clean.)
- [x] Rerun `yarn e2e:a11y` after disk is stable; latest run did not complete and left a dev server that was cleaned up. (2026-04-30: 6/6 pass in 30.9s — heading hierarchy, keyboard nav, focus visibility, ARIA labels, skip link, image alt text.)
- [x] Full API suite verified: 217/217 pass, ~160s. BLK-002 resolved on 2026-04-29.
- [x] Staged deletion batch committed. BLK-003 resolved on 2026-04-29.

### Phase 1 - Web Storefront Functionally Ready

- [x] Home page, search page, product detail, cart, checkout, order history, and account screens exist.
- [x] Checkout quote and order placement flow through server services.
- [x] Order write-back delegates to `OrderProvider.place`.
- [x] Payment intent creation delegates to `PaymentProvider`.
- [~] Account referral, loyalty, and hair/skin test surfaces exist with explicit templates; web API/functional smoke passes, while native/manual and production persistence remain.
- [~] Pharmacist console exists for assisted consultation; web/API and browser-click operator smoke pass for customer search, product search/recommendation, hair consultation review/submit, and profile history update; native and production audit persistence remain.
- [x] Mock Odoo-style product/catalog data exists.
- [x] Mock payment adapter exists for COD, card-on-delivery, pay-at-branch, and online-card functional testing.
- [x] Add one production-like seed/check: logo, hero, promo strip, category rails, product rail, footer, and realistic product data.
- [x] Hide, disable, or complete unfinished customer-facing and operator-facing areas; no broken surfaces should be reachable. (2026-04-30: Audit complete — all 24 screens, 15 Expo views, 67 admin API routes functional. QuickViewModal i18n fixed with en/ar support. Native search mock documented as demo limitation. No broken surfaces found.)
- [~] Verify customer flow manually: automated functional smoke now covers home -> search/listing -> product -> cart -> account referral -> loyalty -> test detail -> recommended product cart add -> referral+loyalty checkout quote -> COD order placement -> order history; browser-click/manual QA still remains.
- [x] Verify no customer-facing "mock", "todo", "test", "lorem", broken image, or console error appears in functional flow covered by `yarn verify:functional-storefront`. Static/live smoke blocks visible seed placeholders; Prisma fallback errors and dev i18n/style warnings were removed from this flow.
- [x] Run `yarn workspace next-app build` or direct equivalent after disk cleanup — was blocked on BETTER_AUTH_SECRET during SSG page data collection; now resolved by adding BETTER_AUTH_SECRET + TRUSTED_REQUEST_BYPASS_SECRET to apps/next/.env. (2026-04-30: build passes clean — static + partial prerender + dynamic pages all generated without errors.)

### Phase 2 - Mobile App Functionally Ready

- [x] Expo app shell exists, resolves local Expo config through `yarn verify:expo-functional`, and passes Expo typecheck.
- [~] Shared screens are available for native; current Expo compile gate passes, while direct `Platform.OS` cleanup remains a hygiene backlog.
- [~] Verify native boot from `apps/expo`: static boot/config checks pass; real device or simulator boot still required.
- [~] Verify native navigation for home, search/listing, product, cart, checkout, account/orders: `AppRouter` static coverage passes; real device or simulator navigation still required.
- [~] Complete or hide incomplete push notification and deep-link settings until functional: push registration/provider/EAS runbook exist; physical-device push and deep links remain.
- [~] Add native smoke checklist with screenshots or screen recording: static smoke script exists; screenshot/screen recording evidence still required.
- [ ] Add Maestro later; for first functional delivery, manual native smoke is acceptable only if documented and repeatable.

### Phase 3 - Odoo Connection Ready

- [x] Odoo adapter package exists under `packages/adapters/odoo-erp`.
- [x] Registry can switch product/category/brand providers with `USE_MOCK=false` and Odoo env vars.
- [x] Add/update Odoo integration runbook with exact env vars, expected endpoints, required fields, and sample payloads.
- [x] Add adapter health check or smoke script for Odoo product/category/brand list/get.
- [x] Add mapping checklist for Odoo IDs, variants, inventory, prices, images, categories, and brands.
- [x] Define order write-back expectations for merchant backend: required order fields, idempotency key, status mapping, failure behavior.
- [x] Confirm all app functionality works against mock Odoo-equivalent contract before real Odoo is connected. (Verified by `yarn verify:functional-storefront` 24/24 pass.)

### Phase 4 - Custom Payment Gateway Ready

- [x] `PaymentProvider` contract exists.
- [x] Mock payment adapter exists.
- [x] Generic `custom-payment` REST adapter exists.
- [x] `.env.example` documents custom payment env vars.
- [x] Adapter guide documents expected `POST /payments/intents` contract.
- [x] Add custom payment webhook route/service for settlement updates.
- [x] Add return/cancel URL handling for online-card payment.
- [x] Add idempotency persistence or adapter-level retry policy for payment intents. (2026-04-30: PaymentProvider contract includes idempotency keys. Mock/custom adapters return idempotent responses. Retry handled at service layer via provider registry.)
- [x] Add gateway handoff doc for client/payment vendor: request schema, response schema, headers, signature, sandbox test cards, webhook events. (2026-04-30: `docs/delivery/runbooks/custom-payment-gateway.md` — API contract, webhook format, HMAC verification, sandbox test cards, webhook events table, adapter customization, production verification.)
- [x] Add focused tests for custom payment success/failure mapping.
- [x] Confirm checkout works against mock payment-equivalent contract before real gateway is connected. (Verified by `yarn verify:functional-storefront` — quote + COD order placement pass.)

### Phase 5 - Admin/CMS Functionally Ready

- [x] Admin CMS UI exists.
- [x] Prisma CMS foundation exists.
- [x] Draft/preview/publish/rollback have service coverage. (2026-04-30: `yarn verify:cms-lifecycle` 14/14 pass — covers release CRUD, block ops (hero + promo strip), reorder persistence, copy edit, publish, rollback, scheduled release creation. Verified by cms-lifecycle smoke.)
- [x] Prepare a store-manager functional script: edit hero, reorder block, preview page, publish. (Verified by `yarn verify:cms-lifecycle` — 14/14 pass covering release CRUD, block ops, publish, rollback.)
- [x] Complete, hide, or mark unfinished admin modules as internal-only. (2026-04-30: Audit complete — AdminScreen covers overview/orders/users/cache, AdminCmsScreen covers toggles/spotlights/preview. All 67 admin API routes implemented. No unfinished admin modules.)
- [x] Add lightweight CMS user guide. (2026-04-30: `docs/delivery/runbooks/cms-store-manager.md` — admin surface, block editing, verified lifecycle, media library, rollback/scheduling, block coverage.)
- [x] Verify admin auth/session path. (2026-04-30: 46/46 auth tests pass. Live Docker PostgreSQL running — admin login, session resolution, RBAC (catalog/CMS/ops 401/403/200), rate limiting all verified against real DB. Dynamic per-user domain permissions implemented: super admin creates users with custom section access (catalog/marketing/sales/inventory/ops/customers). 28/28 tests, tsc clean.)

### Phase 6 - Delivery Verification Pack

- [x] `node scripts/guard-checks.mjs`.
- [x] `node --max-old-space-size=4096 node_modules/typescript/bin/tsc -p apps/next/tsconfig.json --noEmit --incremental false`.
- [x] Focused service/API tests for checkout/order/payment/search.
- [x] Focused notification service tests.
- [x] Focused referral/loyalty/account-test/pharmacist tests through `yarn verify:retention-consultation`.
- [x] Retention/consultation gate is promoted into the current required delivery profile.
- [x] Client-reviewable quality profile exists through `yarn verify:delivery:quality`.
- [x] Repo-local delivery gates pass through `yarn verify:delivery` and `yarn verify:delivery:functional`.
- [x] Backend integration profile passes through `node scripts/verify-delivery.mjs --profile backend`.
- [x] User/account profile passes through `node scripts/verify-delivery.mjs --profile account`.
- [x] Payments/checkout profile passes through `node scripts/verify-delivery.mjs --profile payments`.
- [x] Search/discovery profile passes through `node scripts/verify-delivery.mjs --profile search`.
- [x] Notifications profile passes through `node scripts/verify-delivery.mjs --profile notifications`.
- [x] Full API suite: 217/217 pass, ~160s. BLK-002 resolved.
- [x] Web a11y smoke when disk allows; latest local run did not complete and required dev-server cleanup.
- [x] Production build passes: 149 static pages via `yarn workspace next-app build`.
- [x] Web functional script completed through `yarn verify:functional-storefront`, including referral, loyalty, account test detail, recommended-product add-to-cart, and referral+loyalty checkout.
- [~] Native functional smoke started: `yarn verify:expo-functional` and Expo typecheck pass; manual device/simulator script remains.
- [x] Client handoff pack completed: env vars, Odoo mapping, payment gateway contract, known non-UI limitations. (2026-04-30: `docs/delivery/CLIENT_HANDOFF_PACK.md` — 6 sections covering all env vars, Odoo endpoints/mapping, PaymentProvider contract, 15 non-UI blockers, referral/loyalty/pharmacist acceptance.)
- [x] Client handoff pack includes referral, loyalty, and hair/skin pharmacist workflow acceptance notes. (2026-04-30: Section 5 of CLIENT_HANDOFF_PACK.md — per-criterion acceptance status with verification commands and pre-release items.)

### Functional Acceptance Criteria

- [~] Client can browse products on web and app without crashes. Web functional smoke, Expo static smoke, and Expo typecheck pass; native device/simulator smoke remains.
- [x] Client can search/list products with mock Odoo data on web.
- [x] Client can open product detail, add to cart, and checkout on web.
- [x] Client can place COD/mock payment order and see order history on web.
- [~] Admin can update key homepage content in the functional CMS flow. (2026-04-30: CMS API verified — 14/14 lifecycle smoke passes. All 12 admin CMS pages return valid HTTP status. Browser-based admin UI interaction (login → edit blocks → preview → publish) requires provisioned admin credentials.)
- [~] Client can use referral, loyalty redemption, and explicit hair/skin test recommendation flows end-to-end on web smoke; pharmacist operator hair consultation API and browser-click web smoke also pass. Native/manual and production persistence remain.
- [x] Real Odoo connection path is documented and only needs env + endpoint alignment.
- [x] Real custom payment gateway path is documented and only needs env + gateway endpoint/webhook alignment. (2026-04-30: `docs/delivery/runbooks/custom-payment-gateway.md` — gateway API contract, webhook format, adapter customization points, production verification checklist.)
- [x] Known non-UI production blockers are listed clearly and not exposed as broken UI/functionality. (2026-04-30: `docs/delivery/PRODUCTION_BLOCKERS.md` covers 15 blockers across auth, DB, integrations, infra, security.)

## Next Recommended Implementation Queue

- [x] Free disk / clear safe generated caches so full verification can run.
- [x] Finish custom payment webhook + return/cancel flow.
- [x] Create production-like merchant seed and functional script.
- [x] Run web functional flow and fix broken behavior covered by the script.
- [x] Clean remaining web dev warnings: deprecated `textShadow*`/`shadow*` style props and missing i18next initialization warning.
- [~] Run Expo native smoke and fix shared-screen blockers: static Expo smoke, Expo typecheck, push registration checks, and EAS config checks pass; device/simulator smoke remains.
- [x] Write Odoo connection runbook and smoke script.
- [x] Model explicit hair/skin test templates and add them to functional smoke.
- [x] Define client-specific questionnaire fields/content for hair and skin templates.
- [x] Add referral + loyalty combined checkout/order smoke to `yarn verify:functional-storefront`.
- [x] Define production persistence path for referral, loyalty, and pharmacist consultation records.
- [x] Implement `NotificationProvider` contract and mock adapter.
- [x] Add Meilisearch adapter behind `SearchProvider`.
- [x] Define Shopify adapter scope and verification smoke.
- [x] Define custom PostgreSQL adapter mapping and verification smoke.
- [x] Start `new-client.ts` as an idempotent provisioning command.
- [x] Finish Aspect 06 user/account management gate, tenant membership schema, and OAuth setup direction.
- [x] Finish Aspect 07 payments/checkout reconciliation gate.
- [x] Finish Aspect 08 search/discovery gate, Meilisearch indexing dry-run, facets, filters, sort, and health settings.
- [x] Finish Aspect 09 notifications gate, email adapter, admin control center, dead-letter retry metadata, and status surface.
- [x] Finish Aspect 10 quality/testing gate.
- [x] Finish Aspect 11 DevOps/deployment gate.
- [x] Finish Aspect 12 operations/observability gate.
- [x] Finish Aspect 13 security/compliance local gate; hosted scans, RLS, and penetration test remain pre-production/external.
- [x] Finish Aspect 14 platform operations local gate; live account provisioning and tenant-management UI remain external/future work.
- [x] Finish Aspect 15 documentation/knowledge local gate; API schema docs and full Storybook remain future docs/UI tooling.
- [x] Finish Aspect 16 AI development process local gate.
- [x] Finish Aspect 17 launch/post-launch local gate; actual beta launch remains blocked on first client details and production credentials.
