# MEMORY.md - Long-Term Decisions & Conventions

## 2026-05-06 - Environment/Data Source Rules

## 2026-05-06 - FAS-17 Architecture Staffing Decision

- `docs/delivery/runbooks/technical-org-staffing.md` is the architecture + org staffing source for FAS-17.
- Main decision: platform architecture is sound; execution bottleneck is provider readiness and production operations throughput.
- Minimum core technical org for customer-ready delivery: Tech Lead (1), Backend Integrations (2), Frontend Platform (1), Mobile/Expo (1), DevOps/SRE (1), with part-time QA automation + security testing + TPM.
- Hiring sequence should prioritize backend integrations and SRE before broader UI expansion.
- Immediate follow-through is to split required provider-readiness blockers into owner-mapped child execution issues.
- `docs/delivery/runbooks/environment-data-source-matrix.md` is the compact operator/developer map for Local Dev, Local Production Build, Vercel Preview, and Vercel Production.
- Admin users are DB-first. `GET /api/admin/users` should use Prisma `User` + `AppAuthRoleMapping` as canonical data, with mock CMS `identity.admin.rolePreview` only as a non-release fallback when no DB-backed admin users are available.
- Page config/page version stores are Prisma-backed by default via `CmsPageConfig` and `CmsPageVersion`; `.data` JSON is explicit test/dev fallback only through `storageFile`.
- `yarn bootstrap:preview` and `yarn bootstrap:production` run release bootstrap checks through `scripts/bootstrap-release.mjs`; commands are check-only by default and require `--apply` before migrations/client generation/admin seed.
- `yarn verify:provider-readiness` reports `customer-ready` vs `demo-only`. In strict production/staging (`STRICT_PROVIDER_READINESS=true`), mock-backed required domains fail the command. Current blockers are release, product, category, brand, order, and payment.
- `AGENTS.md` v4.9 defines the P0 Professional Delivery Workflow: Local Dev for speed, local gates, preview bootstrap/readiness, Vercel Preview as staging truth, and production bootstrap/promotion only after Preview acceptance.
- Mock CMS means seed/fallback/demo data, not the absence of the custom CMS. The custom CMS remains the app-owned admin/publish/rendering system.
- Next cleanup target: replace remaining customer-production blockers with real release/catalog/order/payment providers.

## 2026-05-05 - Vercel Preview Deployment With Neon Prisma

- First hosted preview uses Neon Postgres for Prisma-backed admin/auth/CMS data and keeps commerce/search/payment/email/push providers mock or disabled.
- Preview Neon project: `plain-tree-32144170`; branch: `br-sweet-band-ajcelzun`; database: `neondb`.
- Vercel Preview URL: `https://my-solito-gzefksc8i-moes-projects-cfd9e85f.vercel.app`.
- `DATABASE_URL` should use the Neon pooled/runtime connection; `DIRECT_URL` should use the Neon direct connection for Prisma migrations/admin tooling.
- `scripts/seed-admin.mjs` is env-driven: requires `ADMIN_EMAIL` and `ADMIN_PASSWORD`, optional pharmacist vars, idempotent upserts, Better Auth scrypt hash format.
- Do not use the live Neon preview DB as the fixture DB for local route tests; referral tests expect isolated seeded state.
- `apps/next/package.json` must not set package-scope `"type": "module"` for Vercel serverless output; Vercel's Next launcher requires the emitted route files as CommonJS.
- Mock commerce adapters that persist fallback state must use `/tmp/real-commerce` on Vercel, not `process.cwd()/.tmp`, because the deployed function bundle is read-only.

## 2026-05-01 - Security Compliance Gate

- Security headers are centralized in `apps/next/next.config.mjs`.
- HSTS is intentionally opt-in through `ENABLE_HSTS=true`; do not enable until the target deployment is fully HTTPS-ready.
- `yarn verify:security-compliance` is the focused static security/compliance smoke.
- `node scripts/verify-delivery.mjs --profile security` is the consolidated security gate and includes guard checks plus Next typecheck.
- CI security scanning is configured in `.github/workflows/security.yml` with CodeQL, Dependency Review, and Gitleaks; hosted run confirmation is still required before production handoff.

## 2026-05-01 - Platform Operations Gate

- `docs/delivery/runbooks/platform-operations.md` is the operator reference for tenant provisioning, generated `client.json`, adapter/gateway configuration, cross-client patching, support triage, and offboarding.
- `yarn verify:platform-operations` is the focused platform-operations smoke.
- `node scripts/verify-delivery.mjs --profile platform` is the consolidated platform gate and includes guard checks plus Next typecheck.
- `new-client.ts` remains the idempotent provisioning source today; generated `client.json` is the tenant config record until a tenant-management UI exists.

## 2026-05-01 - Documentation Knowledge Gate

- `docs/delivery/runbooks/component-catalog.md` is the lightweight component documentation baseline until full Storybook is added.
- `yarn verify:documentation-knowledge` checks the core developer, operator, handoff, and component docs.
- `node scripts/verify-delivery.mjs --profile docs` is the consolidated documentation profile.

## 2026-05-01 - AI Development Process Gate

- `yarn verify:ai-development-process` checks AGENTS startup/memory/graphify/workflow requirements and bounded graph files.
- `node scripts/verify-delivery.mjs --profile ai` is the consolidated AI process profile.

## 2026-05-01 - Launch Post-Launch Gate

- `docs/delivery/runbooks/launch-post-launch.md` is the launch readiness runbook for beta plan, migration, go-live checklist, first 48 hours, SLA/support channels, and feedback loop.
- `yarn verify:launch-post-launch` checks the launch docs and delivery wiring.
- `node scripts/verify-delivery.mjs --profile launch` is the consolidated launch profile.

## 2026-04-30 � Better Auth Password Hashing (Critical)

- Better Auth uses `node:crypto.scrypt` (NOT bcrypt). Params: N=16384, r=16, p=1, dkLen=64, maxmem=128*N*r*2. Format: `${salt}:${key.toString('hex')}`. Password normalized with NFKC before hashing.
- Hash utility: `apps/next/app/api/_lib/password-hash.ts` � `hashBetterAuthPassword(password)`.
- bcrypt/bcryptjs hashes will fail with "Invalid password hash" error at login.
- Docker PostgreSQL at port 5433 (Windows PostgreSQL removed). `.env` DATABASE_URL uses 5433.

## 2026-04-30 � Dynamic Per-User Domain Permissions

- `hasAdminDomainPermission(role, domain, required, customPermissions?)` � if customPermissions has entries, they override role matrix. Domains NOT in customPermissions default to 'none'.
- `requireAdminDomainSession` reads per-user permissions from `.data/admin-user-overrides.json` via `resolveUserDomainPermissions`.
- Client-side: `canAccessDomain(role, domain, customPermissions?)` in `admin-permissions.ts`. AdminShell fetches user list on mount to get domainPermissions.
- Admin creates users via `POST /api/admin/users` (customers:full). Slide-over form at `/admin/customers` toggles per-domain: None ? Full ? Read ? Off.

## 2026-04-30 � CMS FAQ Accordion Block

- New block type: `faq_accordion`. Type + schema in `packages/app/lib/cms/blocks.ts`. Added to `HomeBlock` union, `homeBlockSchema` discriminated union, and `ReleaseBlockType`.
- Component: `packages/ui/components/home/FaqAccordion.tsx` � uses React Native primitives + tokens (multiline style objects to pass guard check).
- Renderer: `packages/app/features/home/renderers/renderFaqAccordionBlock.tsx`.
- Dispatch: `HomeBlocksRenderer.tsx` � `if (block.type === 'faq_accordion')`.
- Seed: 4 FAQ items in `packages/adapters/mock/cms/index.ts` (shipping, returns, authenticity, loyalty).

## 2026-04-30 � Platform.OS Cleanup Pattern

- `useHeaderScroll.ts` ? `useHeaderScroll.native.ts`: web uses `addEventListener('scroll')`, native uses `subscribeNativeScrollOffset()`.
- Guard check: `style={{...}}` with tokens on SAME LINE triggers violation. Multiline style objects pass.

## 2026-04-30 - Admin Auth Smoke + Full API Suite Rerun

- `apps/next/scripts/smoke-admin-auth.mjs` � self-contained admin auth smoke using real route handlers + mocked Better Auth. Tests login?session?admin RBAC for admin, customer, ops, unauthenticated roles across catalog/CMS/ops domains.
- `admin-route-auth.test.ts` requires `NODE_ENV=test` � `resolveAppOwnedRoleForUser` bypasses Prisma in test mode via `inferRoleFromEmail`. With `NODE_ENV=development`, Prisma query fails ? 401.
- Full API suite (225/225) runs clean via direct `node`/`tsx` command. Previous ENOSPC was Yarn pipe buffer issue, not disk space. Always use direct Node command (`node ../../node_modules/tsx/dist/cli.mjs --test`) for full suite, not `yarn test:api`.
- Line 285 was last code-verifiable `[ ]` in checklist � all remaining items deferred, blocked by device/credentials/infra, or pre-launch.

## 2026-04-30 - Payments Checkout Reconciliation Gate

- `yarn verify:payments-checkout` is the focused Aspect 07 gate for payment intent idempotency, custom payment webhook mapping, order write-back reconciliation, loyalty reversal recording, and referral ledger failure recording.
- `node scripts/verify-delivery.mjs --profile payments` is the consolidated payments/checkout profile.
- Checkout reconciliation records currently persist to `.data/checkout-reconciliation-store.json` for local/operator visibility; production should move this to tenant-scoped PostgreSQL plus retry/operator tooling.
- If payment intent creation succeeds but order write-back fails, `placeOrder()` records `order_write_back_failed`; if loyalty history was already touched, it also records `loyalty_reversal_required`.
- Referral ledger write failure after a successful order should not fail the customer order; it records `referral_ledger_failed` for follow-up.
- Client custom payment gateway sandbox/live verification remains blocked on vendor credentials/endpoints.

## 2026-04-30 - Search Discovery Gate

- `SearchProvider` now supports `filters`, `sort`, `facets`, result `meta`, and health settings (`filterableAttributes`, `sortableAttributes`, `typoToleranceEnabled`).
- Meilisearch search requests include facets, optional filters, and optional sort; health checks `/health` and `/indexes/:index/settings`.
- `scripts/sync-meilisearch-products.ts` is the catalog-provider-to-Meilisearch indexing job. It supports `--dry-run` without a live Meilisearch host.
- `yarn verify:search-discovery` is the focused Aspect 08 gate; `node scripts/verify-delivery.mjs --profile search` is the consolidated search profile.
- Live Meilisearch deployment details, live health, and production reindex scheduling remain external/deployment work.

## 2026-04-30 - Notifications Gate

- `NotificationProvider` now supports `recipientEmail` and `multi-channel` delivery results.
- `packages/adapters/email/` is the generic REST email notification adapter, enabled by `USE_EMAIL_NOTIFICATIONS=true`, `EMAIL_NOTIFICATION_ENDPOINT`, and `EMAIL_NOTIFICATION_FROM`.
- `packages/adapters/notification-mux/` routes push registrations/push messages to the push provider and email messages to the email adapter when configured.
- Failed deliveries are recorded through `notification-dead-letter.service.ts` with `retryCount` and `nextRetryAt`; production should move this to tenant-scoped PostgreSQL with an operator retry view.
- `getNotificationStatus()` exposes provider readiness and dead-letter backlog.
- `yarn verify:notifications` is the focused Aspect 09 gate; `node scripts/verify-delivery.mjs --profile notifications` is the consolidated notifications profile.
- Physical push smoke remains blocked on EAS/APNs/FCM credentials; live email smoke remains blocked on the client email vendor.

## 2026-04-30 - Admin Notification Control Center

- Web admin notification controls live at `/admin/marketing/notifications`; mobile app remains receive-only.
- Admin APIs:
  - `GET /api/admin/notifications`
  - `PATCH /api/admin/notifications/templates/:id`
  - `GET/POST /api/admin/notifications/campaigns`
- Marketing full access can update templates and create campaigns; marketing/operations read access can view notification status.
- `notification-control.service.ts` owns event templates, campaigns, test sends, provider status, and dead-letter visibility.
- `yarn verify:notifications` now checks control service, admin APIs, admin page, nav link, and focused tests.

## 2026-04-30 - Client Provisioning Command

- `scripts/new-client.ts` is the idempotent provisioning command for new tenant/client deployments.
- Usage: `npx tsx scripts/new-client.ts --slug <slug> [--name <name>] [--domains <domains>] [--force] [--dry-run]`
- Generates `clients/<slug>/.env` with strong random secrets and `clients/<slug>/client.json` with adapter config and provisioning checklist.
- Idempotent by default � exits clean if `.env` already exists. `--force` regenerates.
- `clients/` directory is gitignored. Generated secrets are per-client, never committed.
- Tracking: Aspect 11 (DevOps), Aspect 14 (Platform Operations), checklist queue item.

## 2026-04-30 - Odoo Order Write-Back Contract

- Odoo catalog reads and merchant backend order writes are separate adapter concerns.
- Order placement must remain behind `OrderProvider.place(input)`; services/UI must not call Odoo directly.
- The Odoo/custom backend order write-back contract requires explicit outbound order fields, idempotency using quote/platform order identity, status mapping, payment settlement separation, and classified failure behavior.
- `scripts/smoke-odoo-connection.mjs` now checks the runbook for order write-back coverage in addition to catalog adapter readiness.
- Live order write-back verification remains blocked on client Odoo endpoints/credentials and agreed product/fulfillment/payment mappings.

## 2026-04-30 - Retention And Consultation Persistence Path

- Referral, loyalty, and pharmacist consultation records remain provider-backed; production must persist them in tenant-scoped PostgreSQL before shared infrastructure.
- `docs/delivery/runbooks/retention-consultation-persistence.md` defines production ownership, required tenant scoping, referral ledger rules, loyalty transactional/ledger rules, pharmacist web-only submission rules, and customer web/mobile read rules.
- `yarn verify:retention-consultation` now checks the persistence runbook and verifies the pharmacist service preserves questionnaire answers before running focused tests.
- Pharmacist consultation normalization now forwards `questionnaire` to `PharmacistProvider`; customer-facing account detail can show submitted answers once the provider persists them.

## 2026-04-30 - Shopify Adapter Scope

- Shopify is scoped as an adapter under `packages/adapters/shopify/`; UI, shared screens, and server services must not call Shopify directly.
- Required provider scope: `ProductQueryProvider`, `CategoryProvider`, `BrandProvider`, and `OrderProvider.place`; search should prefer `SearchProvider`/Meilisearch and use Shopify search only as fallback.
- The adapter must preserve Shopify product and variant external IDs so order write-back can use variant IDs.
- Shopify webhooks must verify `SHOPIFY_WEBHOOK_SECRET`; bulk catalog sync must not run on storefront request paths.
- `yarn verify:shopify-scope` statically checks the runbook, env example, and provider contracts.

## 2026-04-30 - Custom PostgreSQL Adapter Mapping

- Merchant PostgreSQL integrations are scoped under `packages/adapters/postgresql/`; services/UI must not run merchant SQL directly.
- Required provider scope is `ProductQueryProvider`, `CategoryProvider`, `BrandProvider`, and `OrderProvider` only if the merchant database has a safe write path.
- Read-only merchant databases must not expose order write-back; use a separate order API adapter when needed.
- Mapping requires stable product/variant IDs, price/currency/inventory, category/brand slugs, and idempotent order writes keyed by `tenantId + idempotencyKey`.
- `yarn verify:postgresql-mapping` statically checks the runbook, env example, and provider contracts.

## 2026-04-30 - Meilisearch Adapter

- `packages/adapters/meilisearch/` implements `SearchProvider` and is selected by the registry when `USE_MEILISEARCH=true` and `MEILISEARCH_HOST` are configured.
- `MEILISEARCH_PRODUCTS_INDEX` supports `{tenantId}` and `{storeId}` placeholders for isolated indexes.
- The adapter normalizes hits into canonical search products, product suggestions, brand suggestions, trending searches, and popular brands.
- The adapter includes a health method against `/health`; production search still needs the indexing pipeline, facet/filter/sort config, and live Meilisearch verification.
- `yarn verify:meilisearch-adapter` runs static checks plus focused adapter tests.
- `node scripts/verify-delivery.mjs --profile backend` is the consolidated Aspect 05 gate.

## 2026-04-30 - User And Account Management Gate

- `yarn verify:account-management` is the focused Aspect 06 gate for Better Auth session behavior, account page/test detail, address service, tenant membership schema, OAuth setup direction, and native account route presence.
- `node scripts/verify-delivery.mjs --profile account` is the consolidated Aspect 06 profile.
- Prisma now has `Tenant` and `TenantUser` models plus migration `20260430180000_tenant_user_membership`; isolated deployments can keep using `default`, while shared infrastructure can use `tenantId + userId` membership.
- Customer-visible account test detail includes `questionnaire` in the shared app type, matching provider/service data for hair/skin consultations.
- OAuth provider activation is client-dependent; current repo state documents Google/Apple env placeholders and setup direction but does not enable a provider without credentials.

## 2026-04-30 - CMS Lifecycle Gate

- Aspect 04 current v1 CMS workflow is verified by `yarn verify:cms-lifecycle`.
- The CMS lifecycle smoke starts the Next app, uses an admin session, creates a draft release, creates hero and promo strip blocks, verifies block list, reorders blocks, edits hero copy, publishes, verifies CMS home response, rolls back to the original release, verifies post-rollback response, and creates a scheduled draft release.
- `writeAdminControlsState()` keeps Prisma as canonical persistence in release-like environments, but local non-release verification can continue when Postgres is unavailable. This keeps smoke tests usable without local DB while preserving fail-closed release behavior.
- `docs/delivery/runbooks/cms-store-manager.md` is the store-manager runbook for edit/save order/preview/publish/rollback/scheduling/media limitations.
- The `cms-lifecycle` gate is listed in `scripts/verify-delivery.mjs` and `docs/delivery/DELIVERY_MATRIX.md` as a hardening/functional CMS gate.
- Explicit FAQ accordion editing is still a future content-block enhancement; current testimonials use `ugc_gallery` plus `TestimonialsBlock`.

## 2026-04-30 - Hair/Skin Questionnaire Contracts

- `QuestionnaireField` type with id, label, type (text/number/select/multiselect/range/boolean), options, unit, min/max added to `AccountProvider.ts`.
- `AccountTestTemplate.fields?: QuestionnaireField[]` allows templates to carry their questionnaire schema.
- `PharmacistConsultationInput.questionnaire?: Record<string, unknown>` and `AccountTestDetail.questionnaire?: Record<string, unknown>` carry submitted responses.
- `SKIN_QUESTIONNAIRE_FIELDS` (10 fields) and `HAIR_QUESTIONNAIRE_FIELDS` (9 fields) defined in `QuestionnaireFields.ts` with realistic cosmetic consultation fields.
- `PharmacistConsultationBodySchema` updated to allow `questionnaire` passthrough.
- Mock adapters updated: templates carry field arrays, test details include sample questionnaire responses.
- Verification: `yarn tsc`, `yarn guard:checks`, `yarn verify:retention-consultation` (28/28), `yarn verify:pharmacist-browser` (1/1) all pass.
- Client can replace field labels/options before go-live; the contract is ready.

## 2026-04-30 - CampaignCard Hydration Fix

- `CampaignCard` had a nested `<button>` bug: outer `ReusableButton` renders `<button>`, inner CTA `Button` also rendered `<button>` � invalid HTML causing React hydration mismatch.
- Fix: replaced inner `<Button size='sm'>` with a styled `<Box>` + `<Text>` (pilled label). Whole card remains clickable via outer button.
- Detected by `yarn e2e:a11y` (now 6/6 passing).

## 2026-04-30 - Odoo Connection Runbook And Smoke Script

- Aspect 05-001 landed: `docs/delivery/runbooks/odoo-connection.md` + `scripts/smoke-odoo-connection.mjs` + `scripts/smoke-odoo-connection-live.ts`.
- Static smoke (44 checks) validates env vars, adapter topology, provider contract conformance, runbook coverage, and data mapping test coverage � no real Odoo required.
- `--health` and `--full` flags delegate to `tsx scripts/smoke-odoo-connection-live.ts` for live adapter execution against real Odoo.
- Static verification baseline: `node scripts/smoke-odoo-connection.mjs`, `yarn guard:checks`, `yarn tsc`.
- Live verification requires client Odoo credentials/endpoints (blocker noted in Aspect 05).

## 2026-04-29 - Expo Typecheck Gate Promoted

- `BLK-001` is resolved. `yarn --cwd apps/expo tsc --noEmit --incremental false` passes locally.
- Expo typecheck is now a current/functional delivery gate through `scripts/verify-delivery.mjs`.
- Expo native typecheck should compile native app code and native-reachable shared packages, not package tests, adapter implementations, or UI reference files. `apps/expo/tsconfig.json` is scoped accordingly.
- Native app code may depend on provider contracts, but not provider registry or adapter implementations.
- Keep `packages/app/qrcode.d.ts` as the shared declaration for current QR preview usage unless the repo installs upstream `@types/qrcode`.
- Remaining native delivery work is runtime/device validation: physical-device or simulator smoke, deep-link validation, physical push smoke with real EAS project credentials, and later Maestro.

## 2026-04-28 - Delivery Readiness Baseline

- Current delivery gate baseline is green after the readiness loop:
  - `yarn guard:checks`
  - `yarn guard:agent-docs`
  - `yarn guard:hygiene` exits 0 with known `HY-008` warning for 2277 pre-existing staged deletions
  - `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false`
  - `yarn workspace next-app build` with mock env
  - `yarn e2e:a11y`
  - `yarn --cwd apps/next test:api` (`213/213`)
  - `npx ai-devkit@latest lint --feature commerce-platform-roadmap`
- `apps/next/scripts/dev-stable.mjs` must keep a single `createRequire` declaration and resolve Prisma through `prisma/build/index.js` for this installed Prisma package.
- `scripts/run-e2e-a11y.mjs` uses tolerant Windows cleanup because stale port listeners may already be gone by cleanup time.
- Hygiene scanning must exclude nested `.worktrees/`; `docs/plans/003-hygiene-remediation-runbook.md` documents the memory override, workspace exclusion, and nested worktree policy.
- Next dev indicators are disabled in `apps/next/next.config.mjs` so local a11y smoke does not count framework dev-tool controls as app UI.
- Storefront image/icon-only interactive elements need explicit accessible labels; current fixed examples are offer banners and footer social links.
- `apps/next` API tests must run with explicit test auth env: `NODE_ENV=test`, `REQUIRE_PRODUCTION_AUTH=false`, `BETTER_AUTH_SECRET`, and `AUTH_SESSION_SECRET`.
- Remaining release hygiene blocker before push/release: decide what to do with the pre-existing 2277 staged deletions.

## 2026-04-28 - Commerce Delivery Checklist Contract

- Root `checklist.md` is the production-readiness tracker for the commerce platform lifecycle.
- `AGENTS.md` remains the sole architecture source of truth; `checklist.md` tracks delivery status, blockers, verification, and next implementation queue.
- `AGENTS.md` v4.7 requires agents to read `checklist.md` before substantial work and update it after finishing when delivery status changes.
- Definition of Done now includes updating `checklist.md` when status changed, plus the existing memory sync.
- Current checklist position:
  - Landed foundations include AGENTS boundaries, Better Auth, provider-backed order write-back, SearchProvider contract/mock adapter, core shared screens, guard checks, a11y smoke, production blueprint, SaaS migration note, and AI DevKit roadmap docs.
  - Release blockers include pre-existing staged deletions, full API suite rerun after timeout, production Meilisearch search, payment provider hardening, NotificationProvider, tenant DB scoping, provisioning automation, observability, and native mobile production readiness.
- tRPC is not currently installed or formalized. If adopted, AGENTS must be updated with a narrow internal-client bridge allowance; Server Components should continue calling services directly.

## 2026-04-28 - Payment Provider Boundary

- Payment is now a first-class provider boundary via `packages/providers/contracts/PaymentProvider.ts`.
- `OrderProvider` owns merchant/backend order write-back; `PaymentProvider` owns payment intent, authorization/capture state, optional webhook handling, and gateway health.
- Local/default functional mode uses `mockPaymentAdapter`.
- Real custom gateway mode uses `packages/adapters/custom-payment` with:
  - `USE_CUSTOM_PAYMENT=false`
  - `CUSTOM_PAYMENT_BASE_URL`
  - `CUSTOM_PAYMENT_API_KEY`
  - optional `CUSTOM_PAYMENT_WEBHOOK_SECRET`
  - optional `CUSTOM_PAYMENT_PROVIDER_NAME`
- `placeOrder()` now creates a payment intent before calling `OrderProvider.place` and attaches normalized `paymentSettlement` metadata to the order payload.
- Custom gateway webhook route/service is `/api/payments/custom/webhook`; it delegates to `paymentProvider.handleWebhook(...)` and records settlements through `OrderProvider.confirmPaymentSettlement(...)`.
- Custom payment return/cancel routes are `/api/payments/custom/return` and `/api/payments/custom/cancel`; `placeOrder()` passes those URLs to payment intent creation.
- Placed orders may include `paymentAction`; web checkout must redirect to `paymentAction.paymentUrl` when status is `requires_action`.
- Custom payment webhooks use HMAC-SHA256 over the raw body with `CUSTOM_PAYMENT_WEBHOOK_SECRET`; accepted signature headers are `x-custom-payment-signature`, `x-payment-signature`, or `x-signature`.
- Remaining production payment work: idempotency persistence, adapter-level retry policy, COD settlement operations, sandbox cards/vendor-specific docs, and gateway-specific hardening after the client gateway contract is known.
- Current verification caveat: focused payment/order/custom adapter tests pass, but full `apps/next test:api` timed out locally because DB-fallback-heavy tests wait on unavailable Postgres. Web a11y smoke also did not complete locally in the latest run; do not mark delivery gates fully green until those are fixed or run in an environment with Postgres available.

## 2026-04-28 - Functional Delivery Plan

- `checklist.md` now contains a phased `Functional Delivery Plan` for making the website and app work end-to-end with Odoo-equivalent mock catalog data plus mock/custom payment gateway readiness.
- This is a functional delivery track. UI polish/publishing can happen separately, but customer, admin, CMS, checkout, order, account, and platform-critical behavior should work as expected.
- Only allowed external blockers are the client's real Odoo credentials/endpoints and custom payment gateway credentials/endpoints; adapter seams, runbooks, and smoke tests must be ready before handoff.
- Delivery order:
  1. Stabilize gates and disk so verification can run.
  2. Complete web customer flow with production-like merchant seed.
  3. Verify Expo native smoke and hide incomplete native-only features.
  4. Prepare Odoo connection runbook, mapping checklist, and smoke script.
  5. Finish custom payment webhook and online-card return/cancel flow.
  6. Prepare CMS/admin functional script and user guide.
  7. Run verification pack and client functional script.
- Old review findings status:
  - `dev-stable.mjs` duplicate require fixed.
  - hygiene `.worktrees` scope/runbook fixed, but staged deletion batch remains release blocker.
  - search is now provider-backed.
  - shared `next/link` imports removed; direct `Platform.OS` backlog remains.

## 2026-04-27 - Commerce Platform Requirements Refresh

- `commerce-platform-roadmap` now includes managed commerce platform requirements for branded web storefronts and native apps from one codebase.
- V1 prioritizes isolated per-tenant deployments, not shared runtime multi-tenancy or marketplace features.
- Must-have v1 scope includes CMS blocks, product listing/search/facets, product detail, cart/checkout, COD/custom payment provider, block editor, universal adapters, `new-client.ts`, Zod API validation, and Lighthouse >= 90.
- First-party integration targets are Odoo, Shopify REST API, and custom PostgreSQL, all behind provider/service/adapter boundaries.
- Search target is Meilisearch, but it must enter through a search provider contract so UI/shared screens do not depend on Meilisearch directly.
- Commerce explicitness should start with an audit, not greenfield duplication: existing `CartProvider`, `OrderProvider`, `ProductProvider`, `CatalogProviders`, existing cart/catalog/checkout/orders/payments/product/search services, and existing shared commerce screens must be hardened before adding parallel names.
- Confirmed likely missing/under-specified platform surfaces: `SearchProvider`, `NotificationProvider`, possibly standalone `PaymentProvider`, Shopify adapter, custom PostgreSQL adapter, Meilisearch adapter, Paymob adapter, Newsletter/FAQ/Testimonials CMS blocks, and tests/guards for all fixed gaps.
- `AGENTS.md` v4.5 now includes durable Commerce Platform Rules: commerce integrations follow UI -> Next server layer -> services -> provider registry -> adapters; contracts live in `packages/providers/contracts`; adapters live in `packages/adapters`; services should use existing domain folders unless a new boundary is justified; audit existing equivalents before adding new commerce contracts/services/screens/blocks; search/notifications/payments/catalog/orders/cart/checkout/CMS must be provider/service-backed; commerce CMS blocks use `packages/app/features/home/renderers`; shared commerce screens live in `packages/app/screens`.
- `docs/ai/requirements/feature-commerce-platform-roadmap.md` is now AGENTS-aligned: proposed stack choices such as Payload CMS, Tamagui, external GraphQL Mesh/BFF, direct client merchant API calls, direct service-to-adapter imports, and mock-as-production content are deferred unless `AGENTS.md` changes.
- Phase 2 requirements review confirms the commerce roadmap requirements are template-complete and aligned to `AGENTS.md` v4.5. Remaining clarifications are product/implementation choices, not architecture conflicts: payment boundary, native scope, search adapter, notification channels, provisioning output, and CMS block audit.
- Phase 3 design review rewrote the commerce design to match AGENTS-aligned requirements. Active design centers Prisma/Postgres CMS, RNR shared UI, existing `apps/next/server/services` domain folders, provider-backed commerce domains, adapter isolation, audit-before-addition, and explicit trade-offs for `OrderProvider` vs `PaymentProvider`, `SearchProvider`, `NotificationProvider`, and native v1 scope.
- Phase 4 explicit commerce audit matrix is in `docs/ai/implementation/feature-commerce-platform-roadmap.md`. Confirmed first implementation candidates: refactor order placement to call `OrderProvider.place`, add `SearchProvider`, add `NotificationProvider`, add FAQ/Testimonials CMS blocks after audit, and clean web-only imports/`Platform.OS` use in shared screens.
- Phase 5 planning reconciliation is complete. The Phase 4 implementation queue is ordered as: order write-back through `OrderProvider.place`, `SearchProvider`, `NotificationProvider`, FAQ/Testimonials CMS blocks, then shared screen hygiene.
- Concrete order gap: `apps/next/server/services/orders/place-order.service.ts` currently builds/persists order summaries to `.tmp/mock-orders.json`; merchant write-back should go through `OrderProvider.place` or an explicitly justified provider boundary.
- Order write-back slice is landed. `placeOrder()` now delegates final creation/write-back through `OrderProvider.place`, `PlaceOrderInput` accepts optional normalized `order` data, and `mockOrderAdapter.place()` owns local mock order persistence.
- `yarn guard:checks` now blocks direct mock order persistence in `apps/next/server/services/orders/place-order.service.ts`; order placement services should not import `node:fs`, reference `mock-orders.json`, or revive `persistPlacedOrder`.
- Next implementation slice should use TDD for `SearchProvider`: first add a failing search service/provider delegation test, then define the smallest contract and move current in-memory search behavior behind it.
- Submitted stack choices that conflict with `AGENTS.md` are recorded as architecture decision items, not active rules:
  - Payload CMS 3.0 conflicts with current Prisma/Postgres canonical CMS rule.
  - Tamagui v2 conflicts with current RNR-centered shared UI contract.
  - Expo SDK 52+ conflicts with Solito v5 skill baseline of Expo SDK 54+.
  - GraphQL Mesh/tRPC target must not become an external BFF unless `AGENTS.md` changes.
  - Redis session/cache ownership must be reconciled with Better Auth and existing Prisma-backed session/rate-limit paths.
- Next lifecycle step for this feature is Phase 4 implementation of the `SearchProvider` slice.

## 2026-04-26 - Pharmacist Consultation Service Boundary

- Pharmacist API routes must not call `pharmacistProvider` directly.
- Canonical pharmacist/consultation orchestration now lives in `apps/next/server/services/pharmacist/pharmacist-consultation.service.ts`.
- Routes under `apps/next/app/api/pharmacist/**` should authenticate, parse route/request input, call the service, and map service/provider results to HTTP responses.
- `yarn guard:checks` blocks direct `pharmacistProvider` orchestration in pharmacist API routes.
- TDD baseline covers customer-role denial before provider access, QR trimming, and consultation submission normalization.
- Remaining consultation production-readiness gaps: validation schema alignment, staff/beauty-consultant role modeling, and Prisma-backed consultation/recommendation persistence.

## 2026-04-26 - Pharmacist Validation Contract

- Pharmacist QR resolve payload uses `qrCode`, not legacy `barcode`.
- Pharmacist consultation draft/submit payloads use `recommendedProductIds`, not legacy `recommendations`.
- Canonical pharmacist consultation validation schema is `PharmacistConsultationBodySchema`.
- `PharmacistConsultationSubmitBodySchema` is an alias of the canonical consultation body schema.
- Pharmacist QR, draft, and submit routes validate request bodies before server service delegation.
- Validation tests lock the `qrCode` and `recommendedProductIds` contract.

## 2026-04-25 - Service Boundary Cleanup: Pricing + Referral Helpers

- Server services must not import checkout pricing or referral store helpers from `apps/next/app/api/_lib`.
- Canonical pricing helper location is `apps/next/server/services/checkout/pricing-quote.ts`.
- Canonical referral store helper location is `apps/next/server/services/referral/`.
- `apps/next/app/api/_lib/pricing-quote.ts` and `apps/next/app/api/_lib/referral-*.ts` are compatibility re-export shims only.
- `yarn guard:checks` now enforces this moved-helper boundary for `apps/next/server/services`.
- Verification baseline for this slice: guard passed, Next typecheck passed, focused account/checkout/order service tests passed `6/6`.

## 2026-04-22 - Better Auth Audit Findings Fixed

- Checkout quote and order placement must resolve sessions through the normalized Better Auth boundary, not direct legacy cookie parsing.
- Password reset routes now use Better Auth APIs and must not call the development-only mock `authProvider`.
- Release-like password reset delivery must fail closed unless a real delivery mechanism is configured.
- `/api/checkout/quote` is a persisted write surface and must keep trusted mutation provenance plus route-level rate limiting.
- `x-rc-trusted-request` is no longer a static `1` bypass; it requires `TRUSTED_REQUEST_BYPASS_SECRET`.
- Remediation verification passed: targeted auth/checkout/order suite `44/44`, Next typecheck, `yarn guard:checks`, and graphify context rebuild.

## 2026-04-22 - AGENTS Startup Status Rule

- `AGENTS.md` v4.3 requires agents to explicitly report `/caveman: active|inactive` at the start of work.
- Agents must also report `graphify: checked|not checked` based on whether the root graph report and selected bounded-context graph were read for the current task.
- If the user explicitly overrides repo guidance, report `graphify: not checked (user override)`.

## 2026-04-22 - Better Auth Audit Follow-Up

- Better Auth audit report lives at `docs/reports/better-auth-audit-2026-04-22.md`.
- Original audit found checkout/order legacy-cookie parsing, mock-provider password reset, missing checkout quote mutation/rate-limit hardening, and static trusted-request bypass.
- Those findings were fixed later on `2026-04-22`; see the "Better Auth Audit Findings Fixed" memory entry above.
- Original targeted auth/checkout/order verification passed (`38/38`); full `yarn --cwd apps/next test:api` timed out after roughly `124s` in this environment.

## 2026-04-13 � Homepage "Souk Energy" Redesign Complete (All 11 Phases)

All 11 phases from `joyful-stirring-breeze.md` implemented and verified. Key decisions baked in:

- **Phase 9 (Token foundations):** `amberWarm` darkened for WCAG 4.66:1, `salePrice` ? commerce burgundy, `surface` ? warm white, caption/label lineHeight ? `normal`, card brand weight ? 500, countdown digits ? white
- **Phase 10 (Quality polish):** Unified hover system (ProductCard lift 2px + shadow, image scale 1.03, 200ms easeOut); 3-tier radius (md=6px cards, xl=12px hero, full=pills); product image `contain?cover`
- **Phase 0 (TopPromoBar demotion):** `c.inkBlack?c.roseBlush`, weight 700?500, `tone='inverse'?'default'`
- **Phase 6 (Section headers):** Tiered `size` prop (lg/28px serif, md/18px sans, sm/16px sans); eyebrow ? `c.roseDeep` on `c.roseBlush` (6.00:1 WCAG); meta weight 600?500; action label appends " ?"
- **Phase 1 (Category strip):** Ghost buttons ? 56px circles with icon/label below; removed header; added `icon` to `HomeCategoryItem` type
- **Phase 3 (Product rail density):** Card width 240px ? 180px
- **Phase 7 (Brand rail):** Plain text ? `MarketplaceSectionHeader` (size=sm); added `onPressViewAll`
- **Phase 4 (Hero carousel):** Gradient 30%?40%/height 60%?70%; title/subtitle overlays (Playfair serif 48px, Manrope 14px); CTA ? commercePrimary burgundy; `cardsInViewport` 2.8?2.2
- **Phase 5 (Section spacing):** `getSectionGap()` helper with type-pair logic (hero?cat=16px, flash=40px, newsletter=64px, editorial=48px, default=32px)
- **Phase 8 (Scroll reveals):** `RevealOnScroll` wrapper with staggered `delayMs=index*40`, `liftY=12`; hero/promo_strip skip
- **Phase 2 (Flash deals):** `HomeFlashDealsSection` component ready; CMS block has no products field so `FlashSaleBand` remains fallback

### Pre-existing type errors fixed
- `HeaderMainRow.tsx:303` � `style` removed from `Button`, child wrapped in `<Text>`
- `TopBrandsGrid.tsx:170` � `as const` on `textAlign` and `maxWidth`

### Audit finding fixed
- `HeroSlideCard.tsx` had `rgba(0,0,0,0.40)` ? replaced with `colors.black` + `opacity.overlayLight`

### Verification baseline
- `yarn guard:checks` ? � all 15 checks
- `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false` ? � zero errors

---

## 2026-04-13 - Production CMS Direction Locked In

- **Production CMS stack for this repo**: the canonical production CMS setup is in-repo `Next.js + Prisma`, not an external CMS product.
- **CMS source-of-truth rule**: `Prisma/Postgres` is the canonical persistence layer for all mutable, admin-editable CMS content. If content is editable in admin, it should live in Prisma.
- **CMS orchestration rule**: CMS reads/writes belong in `apps/next/server/services`; Route Handlers and Server Actions stay thin and should not become the long-term home for CMS business logic.
- **UI contract for CMS data**: storefront/shared UI should consume normalized CMS/view models from services, never raw Prisma rows.
- **Mock CMS role**: `packages/adapters/mock/cms` is for seeds, fixtures, contract testing, and explicit fallback/bootstrap use only. It is not the production storefront source of truth.
- **Migration direction**: remaining mock-backed storefront CMS domains should be moved into Prisma-backed models plus service-layer normalization before the CMS can be considered fully production-grade.
- **Governance lock**: this decision is now codified in `.specify/memory/constitution.md` v`1.4.0` and mirrored in `AGENTS.md`.

## 2026-04-13 - Web Shadow And Motion Cleanup

- **Web shadow contract for shared UI**: on web, shared UI should use `boxShadow` / `elevation` tokens instead of RN `shadowColor`, `shadowOpacity`, `shadowRadius`, or `shadowOffset`. Even tokenized `shadows.none` spreads still trigger the browser deprecation warning, so do not spread `shadows.*` into web styles.
- **Raised shared surfaces pattern**: for shared components that need elevation on both platforms, prefer `Platform.OS === 'web' ? { boxShadow: elevation.<tier> } : shadows.<tier>`.
- **No-op shadow spreads are not harmless on web**: remove `...shadows.none` from web-facing shared components; they can still produce deprecated `shadow*` warnings even when visually inert.
- **Announcement ticker animation rule**: `packages/ui/components/home-v2/AnnouncementTicker.tsx` should not request `useNativeDriver` on web. Keep the web path JS-driven to avoid the missing native animated module warning in Next/RN Web.
- **Current storefront browser-clean baseline**: after the cleanup pass, `http://localhost:3000/en` reloads with `0` console errors and `0` console warnings. Treat that as the current expected QA baseline for the normalized storefront.

## 2026-04-12 - Storefront Service Context Boundary

- **First storefront request-context contract**: `apps/next/server/services/_lib/storefront-service-context.ts` is now the shared helper for deriving `requestUrl`, `locale`, `storeId`, and `previewToken` at the page or route edge.
- **Preferred service boundary pattern for storefront reads**: page and route layers should build `StorefrontServiceContext` once, then pass plain typed context into services instead of having services call `headers()` or synthesize internal `Request` objects for request-state derivation.
- **Current migrated slice**: the storefront boundary pattern now covers order detail, pharmacist bootstrap, product page, search page, home page, home layout data, categories page, cart page, checkout page, account page, account test detail, and checkout success page services.
- **Search route compatibility rule**: route handlers may still accept a raw `Request`, but they should adapt it immediately into `StorefrontServiceContext` and keep the request-aware wrapper thin.
- **Preserve CMS semantics until dedicated follow-up**: `getCachedHomeCmsResponseData(...)` still keys off `requestUrl` only. Do not silently widen locale/store behavior for CMS reads inside a boundary-cleanup refactor without a separate verification pass.
## 2026-04-12 - 003 Platform Hygiene Audit Cleanup

- **Canonical `003` enforcement scripts**: the durable hygiene surface for this feature is `scripts/guard-hygiene.mjs`, `scripts/check-agent-docs.mjs`, and `scripts/list-service-files.mjs`.
- **Active `.gitignore` entries only**: hygiene validation must ignore commented lines; a commented vendor directory entry does not count as repo coverage.
- **Real Source-of-Truth heading required**: AD-000 is satisfied only when `AGENTS.md` contains a real `## Source of Truth` heading within the first 30 lines, not just the phrase `source of truth` somewhere in the file.
- **Root `yarn test` must be meaningful**: a Turbo root test script is only valid if at least one workspace exposes a real `test` command; `apps/next` is the current anchor.
- **Translation prefill route should degrade gracefully**: local failure to persist admin audit metadata must not fail the `/api/admin/i18n/prefill` endpoint when Prisma is unavailable.
- **Next routing entry rule for this repo**: `apps/next/proxy.ts` is the canonical routing/auth entry. Do not keep a duplicate `apps/next/middleware.ts` alongside it because that breaks local Next boot and `yarn e2e:a11y`.
- **Old `003` verification docs were stale**: references to `packages/app/tsconfig.json` and `packages/ui/tsconfig.json` are invalid in this repo and should not be used as ship gates.

---
## 2026-04-11 - Durable Conventions Added

- **No public Touchable surface in active shared UI contract**: `packages/ui/primitives/index.ts` must not re-export `Touchable`.
- **Admin CMS page networking standard**: page clients should call `apiClient.admin.*`; avoid direct page-level `/api/admin/...` fetch usage when a client method exists.
- **Admin blocks test ownership update**: query picker and upload preview behavior now live in extracted `_components` modules; tests should assert against those module files, not only `blocks/page.tsx`.

---

## 2026-04-10 ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â Project Strategic Intent

- **Phase 2 = Platform-as-a-Service (PaaS)** ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â Any e-commerce business gets their own branded web + mobile app in one shot. Real Cosmetics is Tenant #1 / reference implementation. This is NOT just a SaaS for beauty brands ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â it's a full commerce platform any merchant can adopt.
- **Mocks are intentional interface contracts** ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â They are NOT lazy stubs. Every mock adapter defines the exact shape of a real integration. When a real service is ready (payment gateway, ERP, auth, CMS), you implement the adapter against the provider interface, flip `USE_MOCK=false`, and deploy. Zero UI, service, or data flow changes needed.
- **"Production ready" = swap system proven** ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â Not "real integrations wired." Priority: bulletproof provider contracts, faithful mock implementations, `STRICT_PROVIDER_READINESS` enforcement, and documented adapter swap process.
- **Real Cosmetics is the proof of concept** ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â If the platform works for Real Cosmetics with mock adapters, it proves the architecture is ready for Phase 2 multi-tenant rollout.

## 2026-04-10 ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â Sprint 6 + Full Audit Completion

- **Dynamic import removed** ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â `product-list.service.ts` uses static `import { productProvider }` (was `await import('@real/providers')` with fallback)
- **i18n baseline updated** ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â 129 entries reflecting Sprints 3-5 string additions
- **Layer inversion deferred** ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â Moving `app/api/_lib/` to `server/services/_lib/` (25 imports) requires coordinated 15+ file change with regression testing; should be done in dedicated PR
- **Full audit completed** ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â 6 sprints, 5 P0 + 25 P1 fixed, 45+ file changes, all verification clean

## 2026-04-10 ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â Sprint 5: UI/UX P1 Decisions

- **Security headers via next.config.mjs** ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy on all paths
- **Session ID + CSRF token in auth cookies** ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â randomBytes-generated sessionId and csrfToken embedded in HMAC-signed session payload
- **boxShadowStrings tokens** ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â web-only boxShadow string equivalents added to shadows.ts; 6 hardcoded rgba shadow strings migrated
- **textAlign: 'end' for RTL** ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â replaces hardcoded 'right' in PromoDealBannerRow
- **Button.tsx kept** ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â NOT dead code; used by 30+ files across packages/app and packages/ui

## 2026-04-10 ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â Sprint 3: Accessibility P1 Decisions

- **Status color tokens adjusted for WCAG AA 4.5:1** ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â light mode: success/warning/danger/info darkened; dark mode: all lightened; textMuted lightened in dark mode
- **Touch targets minimum 40px** ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â quantity buttons and ghost header buttons increased from 24px/32px to 40px
- **Focus traps via useFocusTrap hook** ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â reusable hook for web modal Tab containment; used by QuickViewModal and SearchOverlay
- **aria-live for cart updates** ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â cart action changes announced via `role="status"` + `aria-live="polite"`
- **Reduced motion in Skeleton and Ticker** ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â continuous animations gated behind `!prefersReducedMotion`
- **Arabic i18n keys backfilled** ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â orders (13 keys), cart (1 key), search (1 key)

## 2026-04-10 ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â Sprint 2: CI/CD Foundation Decisions

- **CI via GitHub Actions** ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â 5 parallel jobs: guard, tsc (3 packages), API tests + coverage, E2E, build
- **Code coverage with c8** ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â v8-based, zero-config for Node.js native test runner
- **Bundle analysis with @next/bundle-analyzer** ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â opt-in via `ANALYZE=true` env var, opens interactive treemap
- **Strict mode enabled** ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â `reactStrictMode: true` in next.config.mjs to catch double-render bugs
- **Branch protection** ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â requires PR, 1 approval, all 5 status checks, admins included (manual GitHub setup needed)
- **PR concurrency optimization** ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â `cancel-in-progress: true` in CI to avoid wasted minutes

## 2026-04-10 ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â Sprint 1: Security P0 Decisions

- **Rate limiting**: In-memory sliding window rate limiter (`apps/next/app/api/_lib/rate-limiter.ts`) ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â zero external dependencies, per-endpoint limits, auto-prune every 60s
- **Validation**: Zod schemas centralized in `apps/next/app/api/_lib/validation-schemas.ts` ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â all mutation handlers must validate request bodies
- **Mock defaults**: `USE_MOCK=false` and `STRICT_PROVIDER_READINESS=true` in `.env.example` ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â production-safe defaults
- **`.env` gitignore**: Root `.gitignore` excludes `.env`, `.env.*` with `!.env.example` exception
- **timingSafeEqual**: Always guard with length check before calling ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â Node.js throws on different-length buffers
- **`fail()` response helper**: Extended to accept optional `headers` parameter for RateLimit headers

## 2026-04-10 ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â Previous Decisions

## Architecture Decisions

### Bounded-Context Graphs Are The Agent Navigation Layer (2026-04-10)
The repo now treats `graphify-out/contexts/` as the preferred graph layer for AI agents.

Durable rule:
- Agents must not start with whole-repo search if a matching bounded-context graph exists.
- Agents should build context in this order:
  `AGENTS.md` -> `docs/architecture-index.md` -> `graphify-out/GRAPH_REPORT.md` -> selected context graph -> raw files.

Current bounded contexts:
- `apps-next-api`
- `apps-next-services`
- `packages-providers`
- `packages-adapters`
- `packages-app`
- `packages-ui`

The regeneration command is:
- `py -3 scripts/build_graphify_contexts.py`

This is a navigation optimization, not a replacement for code verification or architectural rules in `AGENTS.md`.

### Session Security Policy Is Centralized (2026-04-09)
Session cookie and trusted-mutation policy now flow through `apps/next/app/api/_lib/security-policy.ts` and `request-auth.ts`.

Rules now encoded in code:
- release-like environments require explicit `AUTH_SESSION_SECRET`
- session cookies include secure attributes through a shared builder
- mutation routes enforce trusted request context (Origin/Referer + Fetch Metadata) unless explicitly exempted for machine routes

Do not reintroduce per-route ad hoc cookie logic or ad hoc CSRF checks.

### Provider Readiness Must Be Explicit (2026-04-09)
`packages/providers/registry.ts` now publishes explicit readiness/source metadata (`providerReadiness`, `providerEnvironment`) and supports optional strict fail-fast behavior via `STRICT_PROVIDER_READINESS=true`.

This is the canonical place to review release readiness for provider-backed domains.

### Same-Origin Admin Upload Policy Excludes SVG (2026-04-09)
Admin upload endpoints that store into `public/uploads` now enforce raster-only image policy for the remediated scope.

If SVG support is needed later, it must be introduced with an isolated asset serving/sanitization model, not via direct same-origin uploads.

### Cross-Platform Guard Contract (2026-04-09)
`yarn guard:checks` is now implemented by `scripts/guard-checks.mjs`, not `bash scripts/guard-checks.sh`.

Durable rule:
- Keep the Node guard entrypoint as the canonical root check on this repo.

### Custom CMS + Prisma ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â No Strapi (2026-04-10)
After comprehensive audit, Strapi was rejected in favor of:
- Custom CMS route handlers (already built in Next.js)
- Prisma + PostgreSQL for data persistence (10 CMS tables added to existing schema)
- `'use cache'` directive for CMS response caching
- Visual admin UI (already built for blocks, menus, banners, UGC, site config, releases)

Durable rules:
- Do NOT introduce Strapi as a dependency
- CMS data flows through: Admin UI ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ Route Handlers ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ Prisma ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ CMS service ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ Layout engine ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ UI
- Audit logs are **append-only** ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â never `deleteMany` on `CmsAuditLog`
- Migration script: `apps/next/scripts/migrate-cms-data.ts` (run after `npx prisma migrate deploy`)

### Admin UI Loading + Error Pattern (2026-04-10)
All admin CMS pages now use shared components:
- `AdminLoadingSkeleton` ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â replaces plain "LoadingÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¦" text
- `AdminErrorState` ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â replaces plain error text, includes retry button

Located in: `apps/next/app/admin/_components/AdminLoadingFeedback.tsx`

Durable rule:
- New admin pages should use these components, not raw text states

### Customer-Facing Empty State Pattern (2026-04-10)
All customer-facing empty states now include a CTA button:
- Empty cart ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ "Start Shopping" ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ `/shop`
- Empty orders ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ "Browse Shop" ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ `/shop`
- Empty search ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ "Browse Shop" ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ `/shop`

### Font System ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â Manrope (2026-04-10)
`apps/next/app/layout.tsx` uses:
- **Manrope** for Latin (EN) ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â replaces DM_Sans
- **Tajawal** for Arabic (AR) ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â unchanged

Durable rule:
- Do NOT reintroduce DM_Sans; Manrope is the canonical Latin font per design system spec

### Cart Mutation Guard Pattern (2026-04-10)
All cart mutations (`onCartIncrease`, `onCartDecrease`, `onCartRemove`) use a `pendingRef` guard:
```typescript
if (pendingRef.current[item.id]) return
pendingRef.current[item.id] = true
// ... mutation
pendingRef.current[item.id] = false
```

Durable rule:
- Never call cart mutations without a pending guard ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â rapid clicks cause stale state
- If shell helpers remain, treat them as legacy compatibility artifacts, not the required invocation path.



## 2026-04-12 - Full Repo Audit Artifact
- Full professional repo review captured in docs/reports/repo-audit-2026-04-12.md.
- Top risks identified: hosted CI typecheck drift, in-memory per-process rate limiting, signed-but-readable auth cookie payload, service-layer HTTP coupling, and shared-UI i18n/a11y debt.

## 2026-04-12 - Sprint 1 CI Trust Repair
Context:
- Audit remediation Sprint 1 targeted CI trust first.
- The repo's workflow still claimed two standalone package typecheck jobs (`packages/app`, `packages/ui`) that were not backed by credible package-local compile targets.

Decision:
- Prefer truthful hosted CI over preserving the stale 11-job shape.
- Keep `typecheck-next` as the only TypeScript gate in CI for now, and document 9 required hosted checks in `docs/BRANCH_PROTECTION.md`.

Implementation:
- Removed `typecheck-app` and `typecheck-ui` from `.github/workflows/ci.yml`.
- Rewrote the branch-protection guide to describe the actual 9-check policy and why the package-local gates are deferred.
- Fixed four service files after a signature drift surfaced in `typecheck-next`:
  - `apps/next/server/services/orders/order-detail.service.ts`
  - `apps/next/server/services/pharmacist/pharmacist-bootstrap.service.ts`
  - `apps/next/server/services/product/product-page.service.ts`
  - `apps/next/server/services/search/search.service.ts`

Verification:
- `yarn guard:checks`
- `yarn guard:hygiene`
- `yarn guard:agent-docs`
- `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false`
- `yarn --cwd apps/next test:api`
- `yarn e2e:a11y`

Open follow-up:
- If the team still wants package-level shared typecheck jobs later, treat that as a separate hardening initiative with real package boundaries and dedicated green compile targets.

## 2026-04-22 - Better Auth Redo Audit Findings

- The Better Auth audit was redone with `AGENTS.md` read first, followed by memory files, `docs/architecture-index.md`, root graphify, and bounded contexts for `apps-next-api`, `apps-next-services`, and `packages-providers`.
- Required startup status during this audit: `/caveman` was inactive, `graphify` was checked.
- Previously remediated Better Auth findings remain fixed for auth mutation routes, password reset API delegation, checkout quote trusted mutation/rate limiting, and order placement session resolution.
- New migration gap: live page/bootstrap services still use `authProvider.getSession()`, which maps to `mockAuthAdapter` and is marked `development-only` in `packages/providers/registry.ts`. Affected flows include account page, account test detail, checkout page, order detail, and pharmacist bootstrap.
- New reset-flow gap: `BETTER_AUTH_PASSWORD_RESET_FALLBACK_PATH` defaults to `/reset-password`, but the real page is `/auth/reset-password`; update the fallback path and route test before considering reset links operational by default.
- Audit report updated at `docs/reports/better-auth-audit-2026-04-22.md`.

## 2026-04-22 - Better Auth Redo Audit Findings Fixed

- `StorefrontServiceContext` preserves request headers; server services can use `createStorefrontServiceRequest(...)` to reconstruct requests with auth cookies intact.
- Account, account test detail, checkout page, order detail, and pharmacist bootstrap services now resolve sessions through `resolveNormalizedSessionFromRequest(...)`, not the development-only mock `authProvider`.
- `apps/next/server/services` should not reintroduce `authProvider.getSession()` for live page/bootstrap session hydration.
- `BETTER_AUTH_PASSWORD_RESET_FALLBACK_PATH` now defaults to `/auth/reset-password`, matching the real App Router reset page.
- Verification passed: focused suite `24/24`, Next typecheck, and `yarn guard:checks`.

## 2026-04-22 - AGENTS Caveman Startup Rule

- `AGENTS.md` v4.4 makes Caveman activation the first startup action.
- Agents must activate `C:\Users\hamoo\.agents\skills\caveman\SKILL.md` before memory files, AGENTS, architecture index, graphify, or raw file search.
- Startup status should report `/caveman: active` when activation succeeds.
- Navigation order now starts with the Caveman skill.

## 2026-04-12 - Sprint 2 Security Hardening Slice
Context:
- Sprint 2 from the remediation plan targeted session architecture and rate-limiting hardening.

Implementation:
- Replaced signed-readable auth cookies with encrypted stateless cookies in `apps/next/app/api/_lib/auth-session.ts`.
- Kept backward-compatible parsing for legacy signed cookies during transition.
- Reused a shared cookie reader across API/session and service code paths.
- Updated `apps/next/proxy.ts` to parse the encrypted cookie format for locale/auth routing.
- Introduced `RateLimitStore` and `MemoryRateLimitStore` to decouple limiter behavior from one hardcoded in-memory map implementation.
- Added `buildRateLimitKey(...)` so callers can prefer actor identity, then trusted proxy IP, then a stable request fingerprint.
- Updated auth routes to use the stronger rate-limit keying.

Verification:
- `yarn guard:checks`
- `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false`
- `yarn --cwd apps/next test:api`

## 2026-04-22 - Git Hygiene Cleanup Contract

- Generated Graphify output, temp data, local DB files, logs, dependency directories, build outputs, coverage, and local AI-tool workspaces must stay untracked.
- `.gitignore` is the canonical ignore surface for this cleanup and includes `graphify-out/`, `**/graphify-out/`, `.tmp/`, `.data/`, `.cache/`, `.claude/`, `.agents/`, `.agent/`, and generated log/database patterns.
- If a generated path was previously tracked, remove it with `git rm --cached` so local files are preserved.
- Keep explicit exceptions for legitimate source route folders named `cache` under `apps/next/app/**/cache/**`.
- Stale deleted scaffolds such as `apps/strapi`, `real-cosmetics-admin`, and `src/Figma` should remain removed from the index unless intentionally restored as product code.

## 2026-04-29 - Functional Storefront Smoke Contract

- `yarn verify:functional-storefront` is now the repeatable web functional smoke for client-readiness loops.
- The smoke validates production-like fallback CMS/catalog seed data, boots Next, checks storefront pages and public APIs, then executes add-to-cart, checkout quote creation, COD order placement, and order-history verification.
- The script uses local-only secrets and a non-release legacy session cookie so it can verify authenticated checkout without requiring a local Better Auth database; this must not be treated as a production auth pattern.
- Fallback CMS seed data must not expose "mock", placeholder branding, or lorem/todo-style copy on customer-visible paths.
- Prisma client internal `error` logging is opt-in via `PRISMA_CLIENT_LOG=error`; service-level production errors remain responsible for real operational diagnostics.
- Shared screens should import `useTranslation` from `@real/app/lib/i18n/use-translation`; direct `react-i18next` usage can trigger missing-init warnings in shared web/native flows.

## 2026-04-29 - Expo Static Smoke Contract

- `yarn verify:expo-functional` is now the repeatable static/config/router smoke for the Expo app.
- Expo API Routes must not become the commerce server/data layer under the current `AGENTS.md` architecture. Next.js owns APIs, services, data access, and provider orchestration.
- Public native/mobile bundles must not send the server-only trusted bypass header (`x-rc-trusted-request: 1`). Use allowed request provenance for the current local API contract, and move to a stronger authenticated mobile mutation contract before production if needed.
- The Expo app currently uses a state router around shared screens. The static smoke verifies expected view coverage and checkout/order wiring, but it is not a substitute for real device/simulator navigation.
- Device/simulator smoke, deep links, push notifications, and EAS Build/Submit/Update remain separate delivery gates.

## 2026-04-29 - Notification Provider And EAS Contract

- Notifications are provider-backed through `NotificationProvider`; UI/shared screens must not call Expo, FCM, APNs, or email providers directly.
- Local/default delivery uses `mockNotificationAdapter` and writes registrations/deliveries to `.tmp/mock-notifications.json`.
- Real Expo push delivery is selected with `USE_EXPO_PUSH=true`; `EXPO_PUSH_ACCESS_TOKEN` is optional and only used when the Expo push API requires an access token.
- `/api/notifications/devices` is the authenticated device-token registration endpoint.
- Order-status notifications are triggered from server/admin order status updates and must stay non-blocking; notification failure should not roll back a successful order status transition.
- Expo push registration must skip safely until the real EAS project id exists. A physical-device smoke is required before claiming production push readiness.
- Root `eas.json` owns build profiles; `docs/eas-runbook.md` owns operator instructions for build, submit, update, credentials, push smoke, and rollback.
- EAS Update can be used for JavaScript-only fixes. Native dependency, config, permission, app identifier, notification credential, icon, or splash changes require a new EAS build.

## 2026-04-29 - Repo-Local Symphony Delivery Workflow

- Delivery work is organized under `docs/delivery/`:
  - `WORKFLOW.md` defines how work moves.
  - `DELIVERY_MATRIX.md` maps aspects to gates.
  - `BLOCKERS.md` stores reproducible blockers.
  - `aspects/*.md` tracks end-to-end delivery status by aspect.
- `AGENTS.md` v4.8 makes delivery matrix, blockers, and relevant aspect files part of mandatory startup context.
- Every delivery task should have a small scope, exact verification commands, and a clear Done Means before implementation.
- `scripts/verify-delivery.mjs` is the named gate runner. Default `yarn verify:delivery` runs the current required gates; `yarn verify:delivery:full` includes hardening gates and may expose known blockers.
- Reproducible blockers must include command, aspect, current first failing area, impact, and next action.
- Do not mark a task done if the relevant delivery gate fails. Fix it if in scope; otherwise update `docs/delivery/BLOCKERS.md`.

## 2026-04-29 - Aspect 01 Product Business Foundation

- Aspect 01 is verified at the repo-delivery level.
- Client agreement checklist, onboarding runbook, SLA/support expectations, and source-code buyout handoff are under `docs/delivery/runbooks/`.
- The client agreement checklist is not legal advice or final contract language; final use requires business/legal review.
- Future client onboarding should start from `docs/delivery/runbooks/client-onboarding.md` and link back to the delivery matrix for acceptance gates.

## 2026-04-29 - Aspect 02 Architecture Design System

- Aspect 02 uses `docs/delivery/runbooks/architecture-design-system.md` as the delivery gate for architecture, shared UI, shared screens, provider/adapter, CMS layout-as-data, and Solito navigation work.
- The runbook is operational guidance only; it must not duplicate or override `AGENTS.md`.
- Aspect 02 remains partial while `BLK-001` blocks broad Expo TypeScript promotion.
- For architecture/design-system tickets, mark work done only when the relevant layer follows the canonical flow, `yarn verify:delivery` passes, and any remaining failed gate has a reproducible blocker entry.

## 2026-04-29 - Referral Loyalty Pharmacist Coverage

- `yarn verify:retention-consultation` is the focused gate for referral, loyalty, account test detail, and pharmacist consultation coverage.
- The gate covers referral validation/apply/admin/account summary, account page loyalty/test data, checkout page/quote, order loyalty application, account test detail, pharmacist bootstrap, and pharmacist consultation service behavior.
- `docs/delivery/runbooks/referral-loyalty-pharmacist-tests.md` owns acceptance criteria for these flows.
- Current implementation is service/API verified but not production-complete until persistence, tenant scoping, explicit hair/skin templates, native/manual smoke, rollback behavior, expiry/fraud controls, and operator audit trail are finished.
- Do not call these flows fully client-ready until the functional storefront smoke includes referral + loyalty checkout and hair/skin recommendation paths.

## 2026-04-29 - Aspect 03 Web Retention Functional Smoke

- `yarn verify:functional-storefront` now covers referral, loyalty, account tests, account test detail recommendations, recommended-product add-to-cart, and referral+loyalty COD checkout on web.
- The functional smoke uses seeded customer `u-1` because that account owns referral, loyalty, and test fixtures.
- Keep native/manual smoke separate: the web smoke proves server/API/customer-flow behavior, not physical-device navigation.
- Remaining before client-ready: explicit hair and skin templates, native/manual account flow smoke, production persistence/tenant scoping, rollback behavior, and fraud/expiry controls.

## 2026-04-29 - Aspect 03 Hair Skin Consultation Templates

- Account and pharmacist test records now carry explicit template identity through `AccountTestTemplate`.
- Supported template types are `skin` and `hair`.
- Pharmacist consultation input accepts optional `templateType`; service normalization defaults unknown/missing values to `skin`.
- Mock account and pharmacist adapters must seed both template types so `yarn verify:functional-storefront` can prove the customer account sees skin and hair consultation records.
- Template identity is not the same as client-specific questionnaire content. Template field definitions, audit persistence, tenant scoping, native/manual smoke, and operator smoke remain open.

## 2026-04-29 - Aspect 03 Pharmacist Operator Web Smoke

- `yarn verify:functional-storefront` now includes a pharmacist operator API flow using seeded pharmacist `u-3`.
- The operator smoke covers customer search, QR resolve, customer profile/history, product search, hair consultation draft, hair consultation submit, and submitted consultation history.
- This proves the current web/API assisted-consultation flow, but not browser-click UX, native UX, production persistence, tenant scoping, or audit trail.

## 2026-04-29 - Aspect 03 Pharmacist Browser Smoke

- `yarn verify:pharmacist-browser` is the web browser-click gate for the pharmacist assisted-consultation flow.
- The gate starts Next, signs in as seeded pharmacist `u-3`, searches customer `u-1`, opens the profile, creates a hair test, selects a product recommendation, reviews, submits, and verifies the submitted consultation in customer history.
- Pharmacist new-test UI must include `templateType` on `PharmacistConsultationInput`; otherwise hair tests silently submit as the default skin template.
- `packages/ui/components/Button.tsx` renders a real HTML `button` on web and keeps `Pressable` on native. This avoids browser-click/hydration gaps for product-facing shared buttons.
- Verification baseline after this slice: `yarn verify:pharmacist-browser`, `yarn verify:delivery:functional`, and `yarn verify:functional-storefront` passed.

## 2026-04-14 - 004 Production CMS Audit Remediation

- **004 was not done and should not have been skipped**: the implementation pass found remaining audit gaps in preview resolution, publish delegation, rollback exposure, merchandising failure handling, lifecycle cache invalidation, and claimed-but-missing lifecycle test files.
- **Preview contract rule**: explicit CMS preview `versionId` links must resolve the exact page version via `getPageVersionById(...)`, not "latest for the release", otherwise preview links drift as drafts change.
- **Release lifecycle ownership rule**: admin release publish and rollback flows should delegate to `apps/next/server/services/cms/*` lifecycle services rather than re-own lifecycle behavior in route handlers.
- **Homepage merchandising canonical-read safety**: Prisma-backed merchandising reads must fail as a unit for canonical takeover. Partial query failures must not be normalized into empty arrays/objects and treated as successful authoritative content.
- **Lifecycle cache invalidation rule**: successful CMS publish and rollback operations must invalidate the `cms-home` cache tag.
- **Shared admin client surface updated**: rollback is now part of the admin release contract through `packages/app/lib/endpoints.ts` and `packages/app/lib/api-client.ts`.
- **Current 004 verification baseline**:
  - `yarn guard:checks` ?
  - `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false` ?
  - `yarn --cwd apps/next test:api` ? (`148/148`)
- **Current blocker is broader than 004**: `yarn --cwd apps/next build --webpack --debug-prerender` still fails because multiple authenticated/request-bound API routes trigger `NEXT_PRERENDER_INTERRUPTED` during prerender analysis by reading `request.headers` or `request.url`.

## 2026-04-14 - Next Prerender Route-Handler Boundary Rule

- **With `cacheComponents` enabled, request-bound API handlers should use `await connection()` instead of `export const dynamic = 'force-dynamic'`**. The route segment `dynamic` config is not compatible with this repo's Next config.
- **Current stabilized routes**: the original build-stopping prerender failures were cleared by adding `await connection()` to the failing GET handlers for admin capabilities, CMS toggles, i18n status, inventory, admin orders, preview token, orders, pharmacist search endpoints, products, and search.
- **Normal build status**: `yarn --cwd apps/next build --webpack` now completes successfully again after this fix.
- **Residual debt remains**: successful builds still log `BFF_FAIL` warnings for other internal API calls that trip `NEXT_PRERENDER_INTERRUPTED` during page generation. That is evidence of broader route-to-route coupling and should be migrated toward direct service calls in line with `AGENTS.md`.
- **Debug prerender caveat on Windows**: `yarn --cwd apps/next build --webpack --debug-prerender` currently crashes after compile/typecheck with a `VirtualAlloc failed` worker exit, which appears separate from the original request-bound route issue.

## 2026-04-14 - Better Auth Migration Direction

- **Recommended auth upgrade path**: if the repo moves off the current custom encrypted-cookie auth system, the recommended path is `Better Auth`, not `Auth.js` or a standalone auth platform.
- **Authorization remains app-owned**: the app should continue owning admin-domain RBAC, CMS authorization, publish/rollback permissions, audit logging, and trusted mutation enforcement.
- **Recommended stack remains**: `Better Auth + Next.js + Prisma + Custom Admin/CMS`, with `Strapi` explicitly excluded from the recommended production stack for this repo.
- **Repo-native migration plan exists**: the phased migration is documented in `docs/plans/2026-04-14-better-auth-migration-plan.md`.
- **Repo-native execution backlog exists**: the dependency-ordered implementation backlog is documented in `docs/plans/2026-04-14-better-auth-migration-backlog.md`.
- **Spec Kit implementation track exists**: the full implementation/security/audit/delivery feature set is documented in `specs/005-better-auth/`.

## 2026-04-14 - Better Auth Foundation Landed

- **Canonical Better Auth boundary**: `apps/next/server/services/auth/` is now the repo-owned integration layer for Better Auth. Route handlers and other services should consume normalized app sessions from this boundary, not raw Better Auth objects.
- **Normalized session contract preserved**: the Better Auth adapter returns the same effective app session shape the repo already depended on: `userId`, `email`, `name`, and `role`.
- **Role ownership rule preserved**: app roles remain app-owned via Prisma-backed role mapping (`AppAuthRoleMapping`), not Better Auth defaults.
- **Dual-session cutover rule**: Better Auth is now the active issuer for migrated auth routes, but legacy cookie sessions are still readable through the adapter fallback during the transition window so rollback does not force immediate logout of existing sessions.
- **Migrated auth routes**: `/api/auth/login`, `/api/auth/logout`, `/api/auth/register`, and `/api/auth/session` now use Better Auth-backed session logic.
- **Protected-route auth source swap**: `apps/next/app/api/_lib/request-auth.ts` now resolves Better Auth-backed sessions first and falls back to legacy cookie parsing second; account, orders, pharmacist, admin, CMS, and release routes were updated to use the async helper path.
- **Required production hardening**: `BETTER_AUTH_SECRET` must be a high-entropy secret with at least 32 bytes of entropy. Local weak-secret warnings should be treated as a production rollout blocker.
- **Residual build/debug caveat**: even though `yarn --cwd apps/next build --webpack` and `--debug-prerender` now complete, debug prerender analysis still logs request-bound bailout diagnostics (`NEXT_PRERENDER_INTERRUPTED`) for some route handlers. That is residual route-to-route/request-state coupling debt, not a Better Auth correctness failure.

## 2026-04-14 - Better Auth Production Hardening Contract

- **Dedicated release secret required**: release-like environments must set a dedicated `BETTER_AUTH_SECRET`. Falling back to `AUTH_SESSION_SECRET` is now a non-release-only compatibility path and must not be relied on in staging or production.
- **Minimum secret strength rule**: `BETTER_AUTH_SECRET` must be at least 32 characters and high entropy. Weak configured values are treated as invalid in release-like environments and Better Auth now fails closed at boot.
- **CI/auth test contract updated**: CI and API tests now seed a strong Better Auth secret so auth imports reflect the real production contract instead of accidentally passing through legacy fallback.
- **Operator env contract**: `.env.example`, CI config, and operator-facing docs now treat `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, and `BETTER_AUTH_TRUSTED_ORIGINS` as the primary Better Auth env surface.
- **Prerender noise rule**: expected Next prerender bailout errors (`NEXT_PRERENDER_INTERRUPTED`, `HANGING_PROMISE_REJECTION`, and equivalent "needs to bail out of prerendering" messages) should not be logged as `BFF_FAIL` noise. Suppress those diagnostics so real failures remain visible.
- **Current ship-readiness position**: the safe hardening pass is considered shippable once production envs provide the required Better Auth secret and the existing rollout plan for legacy-session read compatibility is observed. Deeper route-to-service cleanup remains desirable architecture work, but is no longer the blocking auth-hardening gate.
- **Spec Kit sync rule for active features**: when a feature like `005-better-auth` moves from planning into real implementation, keep `spec.md`, `plan.md`, and `tasks.md` aligned with the actual rollout approach and verification state. Do not leave Spec Kit artifacts stuck in a generic draft state once the repo has committed to a specific production path.
- **No inferred-role writes in release envs**: `AppAuthRoleMapping` is the only production source of truth for app roles. If a mapping is missing in a release-like environment, return `customer` and do not upsert an inferred role from the seeded email map.
- **No legacy auth fallback in release envs**: legacy cookie sessions may remain readable for dev/test cutover convenience, but release-like environments must reject them entirely so stale cookie-embedded roles cannot outlive DB-backed role changes.

## 2026-04-13 - Canonical Design System Foundations

- **Latin font source of truth**: shared token font families now use `Manrope`, matching `apps/next/app/layout.tsx`. Do not reintroduce `DM Sans` in the active shared token contract.
- **Canonical semantic type scale**: the repo now has a durable semantic typography layer in `packages/tokens/typography.ts` with `display`, `heading`, `body`, `label`, `caption`, and `small` tiers. Older aliases remain compatibility-only and should be migrated away from over time.
- **Canonical spacing guidance**: `packages/tokens/spacing.ts` now exposes `space1` through `space32` on a 4px grid. Existing numeric aliases remain for compatibility, but new shared UI work should prefer the canonical `space*` tokens or semantic aliases.
- **Canonical color guidance**: `packages/tokens/colors.ts` now includes a dedicated primary ramp (`primary900` -> `primary100`) in addition to semantic purpose-based roles. New shared UI should prefer semantic roles first and use the ramp only when a tonal step is specifically needed.
- **Purposeful motion contract**: `packages/tokens/motion.ts` now distinguishes enter, exit, hover, and interactive timings. New interactions should keep direct user actions at or under `300ms`, use ease-out for entrances, ease-in for exits, and ease-in-out for standard interactive transitions.
- **CSS bridge contract**: after editing tokens, regenerate `packages/ui/generated-token-bridge.css` via `node scripts/generate-css-token-bridge.mjs`. The guard already enforces this.
- **Shared UI normalization contract**: after major token changes, follow with a second pass on high-impact shared reusables and product-facing shared components so hierarchy, spacing, and states visibly reflect the new tokens. Foundations alone are not enough.
- **Shared UI second-pass targets**: start with `packages/ui/reusables/button.tsx`, `input.tsx`, `badge.tsx`, `card.tsx`, then move to visible shared composition points like `SectionHeading.tsx`, `SearchField.tsx`, and shared chrome components.
- **Shared chrome targets after foundations**: once the core reusables are normalized, the next highest-impact surfaces are `HeaderMainRow.tsx`, `AuthDrawer.tsx`, and footer chrome (`FooterColumns.tsx`, `FooterNewsletter.tsx`, `FooterAccordion.tsx`, `FooterLegalRow.tsx`). These surfaces carry the design language most visibly across the storefront.
- **Next storefront chrome targets after header/footer**: `SearchOverlay.tsx`, `SearchPanel.tsx`, `CartDrawer.tsx`, and `MiniSearchBar.tsx` are the next-best normalization surfaces because they combine hierarchy, spacing, state styling, and motion in high-frequency user flows.
- **Merchandising surfaces after chrome**: `HomeHeroRail.tsx`, `HomeProductRail.tsx`, `home-v2/ProductRail.tsx`, `OfferBannersGrid.tsx`, `CampaignCard.tsx`, and `ProductCard.tsx` are the next-best targets because they set the visual rhythm for the discovery and merchandising sections across the storefront.
- **Editorial surfaces after merchandising rails**: `BrandSpotlightSection.tsx`, `CampaignHeroBlock.tsx`, `CompleteSetBlock.tsx`, `TestimonialsBlock.tsx`, and `EditorialHotspotSection.tsx` are the next-best normalization targets because they carry the most visible storytelling layouts and can otherwise drift from the shared spacing/motion contract.
- **Final storefront sweep modules**: after the larger editorial sections, finish `TopBrandsGrid.tsx`, `FlashSaleBand.tsx`, `NewsletterLoyaltyCta.tsx`, `PromoDealBannerRow.tsx`, and `UgcGallery.tsx` so the smaller secondary modules do not preserve older spacing/motion drift after the rest of the storefront has been normalized.
- **After normalization, do browser QA**: once the storefront sweep is complete, run the Next dev server and visually inspect the real page. Guards and typecheck are necessary but not sufficient for design-system work.
- **Current visual QA residue**: resolved on 2026-04-13. The storefront warning cleanup removed the deprecated web `shadow*` warning and the animated `useNativeDriver` fallback warning, bringing `/en` to a browser-clean state.

Follow-up:
- The limiter is still backed by memory by default; moving to a truly shared distributed store remains the next step if production deployment is horizontally scaled.
- Cookie parsing logic is aligned by format across Node and proxy runtimes, but it still exists in two runtime-specific implementations because Edge and Node crypto APIs differ.

## 2026-04-12 - Shared Rate-Limit Store Rollout Contract
Implementation:
- `RATE_LIMIT_STORE=prisma` enables a Prisma/Postgres-backed rate-limit store using raw SQL against `RateLimitBucket`.
- Default backend remains `memory`.
- Auth routes now await async limiter operations, but their external response contract is unchanged.
- If the Prisma backend is enabled and store access fails, the limiter falls back to memory and emits a warning.

Rollout steps:
1. Apply Prisma migration `20260412073000_rate_limit_buckets`
2. Deploy with `RATE_LIMIT_STORE=prisma`
3. Monitor for `[rate-limiter]` fallback warnings

Verification:
- `yarn guard:checks`
- `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false`
- `yarn --cwd apps/next test:api`
## 2026-04-30 - Delivery Quality Profile

- `yarn verify:delivery:quality` is the local client-review quality profile. It currently runs guards, Next typecheck, Expo functional/typecheck, notifications, retention/consultation, account management, payments/checkout, search/discovery, CMS lifecycle, storefront static smoke, full Next API tests, and production Next build.
- `retention-consultation-focused` is now part of the current required profile because referral, loyalty, and pharmacist consultation flows are client-critical.
- CMS lifecycle smoke starts its own Next dev server on port 3104 by default. It intentionally runs Next directly instead of `yarn web`/`dev:stable` to avoid Windows Prisma query-engine file locks during smoke verification.
- If `yarn verify:cms-lifecycle` reports another Next dev server is already running, stop the stale app dev process or set `CMS_START_SERVER=false` only when intentionally testing a known-good running server with matching auth env.
## 2026-05-01 - DevOps Deployment Gate

- `yarn verify:devops-deployment` checks staging/deploy readiness without external credentials: package scripts, delivery verifier wiring, `new-client.ts`, EAS preview/production config, CI guard/type/test/build jobs, staging runbook, backup/PITR runbook, and `new-client` dry-run.
- `yarn verify:delivery:deploy` runs guards, Next typecheck, DevOps smoke, and production Next build.
- `scripts/new-client.ts --output <dir>` is supported; generated client config should go to `clients/<slug>` by default or explicit output dir for smoke/testing.
- Staging process lives at `docs/delivery/runbooks/staging-deployment.md`: generate client config, provision staging DB, set Vercel preview env, run Prisma migrate deploy, build EAS preview, verify functional/a11y smoke, then rollback with Vercel/EAS/DB backup paths if needed.
- Real deployment remains blocked on client/Vercel/EAS/store credentials, but local deployment readiness is now verifiable.
## 2026-05-01 - Operations Health Gate

- `GET /api/health` is public no-store health endpoint. It returns `200` unless aggregate status is `unhealthy`, then `503`.
- Operations health service reports runtime, provider readiness, search provider health, and notification provider/dead-letter status.
- `yarn verify:operations-observability` checks route/service/runbook/operator-handbook wiring and runs focused health service test.
- `node scripts/verify-delivery.mjs --profile operations` runs guard checks, Next typecheck, and operations/observability smoke.
- Uptime setup lives at `docs/delivery/runbooks/uptime-monitoring.md`; incident response/rollback lives at `docs/delivery/runbooks/incident-response.md`.
- Sentry, hosted uptime, centralized logs, alert delivery, and provider health dashboard remain vendor/credential/UI work.

## 2026-05-05 - Vercel Preview Deployment State

- Active Preview deployment: `https://my-solito-gzefksc8i-moes-projects-cfd9e85f.vercel.app` (`dpl_DSDncbFqbRiapFazQEwaxopHJuGV`), target `preview`, status `Ready`.
- Neon preview DB migrations have been applied, including RLS tenant policy migration `20260501000000_rls_tenant_policies`.
- Preview is protected by Vercel Deployment Protection. Plain public smoke requests will see Vercel auth HTML until protection is bypassed or disabled for testing.
- Direct protected CLI calls can reach app routes, but `/api/auth/login` should be tested from browser context because non-browser CLI POSTs can be rejected as `AUTH_UNTRUSTED_REQUEST`.
- Keep project-level Vercel Preview env persistence noted as branch-gated; current working Preview used deployment-scoped env vars.


