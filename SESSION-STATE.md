# SESSION-STATE.md - Active Working Memory

## 2026-05-05 Vercel Preview + Neon Prisma Admin DB

**Status**: PREVIEW DEPLOYED. Vercel Preview is ready and backed by Neon Postgres for Prisma admin/auth/CMS data.

### Completed this session
- Created Neon project `plain-tree-32144170`, branch `br-sweet-band-ajcelzun`, database `neondb`.
- Applied Prisma migrations to Neon, including `20260501000000_rls_tenant_policies`.
- Reworked `scripts/seed-admin.mjs` into an env-driven, idempotent seed using Better Auth scrypt hashes; no destructive hardcoded `admin/admin` or `pharma/pharma`.
- Seeded preview admin user `admin@realcosmetics.local`.
- Added `DIRECT_URL` support to examples/provisioning/devops verification and updated the staging deployment runbook.
- Fixed Vercel runtime ESM/CJS mismatch by removing `type: module` from `apps/next/package.json`.
- Deployed corrected Vercel Preview: `https://my-solito-gzefksc8i-moes-projects-cfd9e85f.vercel.app`.
- Removed accidental production-target deployment `dpl_7YSycyJFhprtzns7YBqwKZ4HbKVa`.

### Verification
```
yarn verify:devops-deployment [PASS]
yarn verify:delivery --profile deploy [PASS]
npx prisma validate --schema apps/next/prisma/schema.prisma [PASS]
vercel inspect dpl_DSDncbFqbRiapFazQEwaxopHJuGV [PASS] target=preview, status=Ready
remote admin login/session smoke [PASS]
remote public storefront/API smoke [PASS through CMS home API]
yarn e2e:a11y [PASS locally]
```

### Notes
- Vercel project-level Preview env creation is still branch-gated until a non-production branch exists in the connected Git repo. This preview used deployment-scoped env vars.
- `yarn verify:delivery:quality` was not completed because referral tests failed when pointed at the live Neon preview DB; do not use the preview DB as the fixture DB for those tests.
- Remote Playwright a11y against the protected Vercel URL hit Chromium `ERR_CONNECTION_RESET` before app load; curl/Node fetch reached the deployment, and local a11y passed.

## 2026-05-01 Final Sprint — 14 commits pushed. All gates passing.

**Status**: GREEN. Branch ready for human review.

### Completed this session
- **Wave 1**: TenantId scoping (24 tables), PostgreSQL RLS, Prisma referral/loyalty/pharmacist storage
- **Wave 2**: Sentry SDK, email adapter scaffolding
- **Wave 3**: Lighthouse CI, CodeQL security scanning
- **Admin/CMS**: Block editor bugs (5 types surfaced), V2 registry, SEO product fields, RBAC edit, health dashboard, settings page
- **Customer account**: Referral tab rendered, QR dedup, address validation, settings buttons
- **Pharmacist**: Prisma persistence, branch config (PHARMACIST_BRANCH_NAME), notification trigger
- **Checkout**: Cart cleared AFTER order, atomic set-quantity, success screen error state
- **Security**: 2 review rounds, privilege escalation fixes (role + domain permissions)
- **E2E**: 35 Playwright tests across 4 suites (admin, pharmacist, checkout, smoke)
- **Simplify**: AddUserSlideOver extracted, settings page built
- **Hooks**: session-init.py + phase-end.py, opsera removed

### Gates
```
guard:style     ? (1 pre-existing i18n debt)
guard:arch      ?
typescript      ?
E2E (admin)     ? 7/7
E2E (pharmacist) ? 8/8
E2E (checkout)  ? 12/12
E2E (smoke)     ? 8/8
CMS lifecycle   ? 14/14
API tests       ? 28/28
```

## 2026-05-01 Production Hardening Sprint — Committed c4ccb82 (46 files, +4745/-591)

**Status**: GREEN. All gates passing.

### Completed
- Wave 1: TenantId scoping (24 tables), PostgreSQL RLS (24 tables), Prisma referral/loyalty storage, production rate limiting
- Wave 2: Sentry SDK installed (dormant), email adapter scaffolded
- Wave 3: Lighthouse CI in GitHub Actions, CodeQL/security scanning confirmed
- Dynamic user management: per-domain permissions, CREATOR_DELEGATABLE role gating, privilege escalation fixes (2 rounds)
- CMS: FAQ accordion block, Platform.OS cleanup, health dashboard
- Security review: 2 rounds, all findings fixed
- Simplify: AddUserSlideOver extracted (~200 lines out of page.tsx)
- Hooks: session-init.py + phase-end.py, fixed cwd drift with ${CLAUDE_PROJECT_DIR}
- `.claude/agents/security-auditor.md` created

### Remaining: Wave 2 credentials (payment/Odoo/Meilisearch/push/email), penetration test (external), Maestro E2E

## 2026-05-01 Aspect 13 Security Compliance Gate

**Status**: GREEN locally. Security profile passes.

### Completed This Session

- Added app-wide security headers and CSP in `apps/next/next.config.mjs`.
- Made HSTS explicitly opt-in with `ENABLE_HSTS=true` to avoid unsafe preload/domain lockout before hosted HTTPS is ready.
- Added GitHub security workflow for CodeQL, Dependency Review, and Gitleaks.
- Added `docs/delivery/runbooks/security-compliance.md`.
- Added `yarn verify:security-compliance` and the `security` delivery profile/gate.
- Fixed blocking admin health page/import and admin shell syntax issues surfaced by the security profile typecheck.

### Verification

- `yarn verify:security-compliance`: PASS.
- `node scripts/verify-delivery.mjs --profile security`: PASS.

### Remaining

- Hosted GitHub security workflow confirmation, PostgreSQL RLS/DB-level tenant isolation, and penetration testing remain pre-production/external work.

## 2026-05-01 Aspect 14 Platform Operations Gate

**Status**: GREEN locally. Platform profile passes.

### Completed This Session

- Added `docs/delivery/runbooks/platform-operations.md` covering tenant provisioning, `client.json`, adapter/gateway config, cross-client patching, support triage, and offboarding.
- Added `scripts/verify-platform-operations.mjs` and `yarn verify:platform-operations`.
- Added the `platform-operations` delivery gate and `platform` profile.
- Updated the delivery matrix, operator handbook index, Aspect 14 file, and checklist.

### Verification

- `yarn verify:platform-operations`: PASS.
- `node scripts/verify-delivery.mjs --profile platform`: PASS.

### Remaining

- Live provider account provisioning and a centralized tenant-management UI remain external/future work; current operator source is generated `client.json`.

## 2026-05-01 Aspect 15 Documentation Knowledge Gate

**Status**: GREEN locally. Docs profile passes.

### Completed This Session

- Added `docs/delivery/runbooks/component-catalog.md` as the lightweight component documentation baseline until Storybook exists.
- Added `scripts/verify-documentation-knowledge.mjs` and `yarn verify:documentation-knowledge`.
- Added the `documentation-knowledge` delivery gate and `docs` profile.
- Updated the delivery matrix, operator handbook index, Aspect 15 file, and checklist.

### Verification

- `node scripts/verify-delivery.mjs --profile docs`: PASS.

### Remaining

- Generated API schema docs and full Storybook remain future documentation/UI tooling work.

## 2026-05-01 Aspect 16 AI Development Process Gate

**Status**: GREEN locally. AI profile passes.

### Completed This Session

- Added `scripts/verify-ai-development-process.mjs` and `yarn verify:ai-development-process`.
- Added the `ai-development-process` delivery gate and `ai` profile.
- Updated the delivery matrix, Aspect 16 file, checklist, and memory.

### Verification

- `node scripts/verify-delivery.mjs --profile ai`: PASS.

### Remaining

- No local blocker named for this aspect.

## 2026-05-01 Aspect 17 Launch Post-Launch Gate

**Status**: GREEN locally. Launch profile passes.

### Completed This Session

- Added `docs/delivery/runbooks/launch-post-launch.md`.
- Added `scripts/verify-launch-post-launch.mjs` and `yarn verify:launch-post-launch`.
- Added the `launch-post-launch` delivery gate and `launch` profile.
- Updated the delivery matrix, operator handbook index, Aspect 17 file, checklist, and memory.

### Verification

- `node scripts/verify-delivery.mjs --profile launch`: PASS.

### Remaining

- Actual beta launch remains blocked on first client details, production domains, payment live keys, app store accounts, push certificates, and client support contacts.

## 2026-04-30 Aspect 10 Quality Testing Gate

**Status**: GREEN. Current and quality profiles pass locally.

### Completed This Session

- Promoted `retention-consultation-focused` into the current delivery profile.
- Added the `quality` delivery profile and root script `yarn verify:delivery:quality`.
- Aligned `faq_accordion` across the release provider contract and admin release block update route.
- Fixed FAQ accordion React Native text style typing by using token font-weight strings directly.
- Hardened CMS lifecycle smoke to start a dedicated Next runtime on its own port and avoid `dev:stable` Prisma generate file-lock churn.

### Verification

- `node scripts/verify-delivery.mjs --profile current`: PASS.
- `yarn verify:cms-lifecycle`: PASS, 14/14 lifecycle checks.
- `yarn verify:delivery:quality`: PASS, including guard checks, Next typecheck, Expo functional/typecheck, notifications, retention/consultation, account management, payments/checkout, search/discovery, CMS lifecycle, static storefront, 225/225 API tests, and production Next build.

### Remaining

- Lighthouse CI, Maestro native E2E, hosted CI promotion, physical push, live email vendor, live Meilisearch, and client payment/Odoo verification remain external or hardening work.

## 2026-04-30 Session: Docker PostgreSQL + Dynamic User Management + CMS FAQ + Platform Cleanup

**Status**: GREEN. All gates passing. Docker PostgreSQL running live. 4 tickets completed.

### Completed
- Docker PostgreSQL 16 running (port 5433), dev server live at :3000
- Dynamic per-user domain permissions: super admin creates users with per-section access (catalog/marketing/sales/inventory/ops/customers). Toggle: None ? Full ? Read ? Off. Custom perms override role-based RBAC matrix.
- FAQ accordion CMS block: new block type (faq_accordion) ? FaqAccordion component in @real/ui/components ? renderer ? dispatch ? seed data (4 FAQ items: shipping, returns, authenticity, loyalty)
- Platform.OS cleanup: useHeaderScroll.ts refactored to .native.ts pattern, 14?13 Platform.OS files in packages/app
- Graphify rebuilt: 994 nodes, 1625 edges, 45 communities
- Production build: passes clean
- A11y smoke: 6/6 pass
- Search verification: 5/5 pass, 72 products indexed

### Gates
```
guard-checks     ? (1 pre-existing i18n debt: "Search users...")
next-typecheck   ?
next-api-full    ? (28/28)
next-build       ?
e2e-a11y         ? (6/6)
```

## 2026-04-30 Admin Auth/Session Verification (Line 285) — COMPLETED

**Status**: GREEN. 46/46 auth tests pass. Last code-verifiable checklist item cleared.

- 12/12 auth route tests (login, register, session, logout, reset, fail-close, rate limiting)
- 13/13 admin route auth tests (catalog/CMS/ops — 401/403/200 enforcement per RBAC matrix)
- 21 session adapter + request-auth tests (Better Auth identity mapping, legacy fallback, release-mode hardening)
- Full pipeline: Login ? Better Auth signInEmail ? Set-Cookie ? resolveNormalizedSessionFromRequest ? role resolution ? hasAdminDomainPermission ? 200/403
- Live smoke with provisioned admin credentials blocked by Postgres/client credential setup
- Line 285 marked [x]. All remaining [ ] items are deferred, blocked by device/credentials/infra, or pre-launch.

## 2026-04-30 Aspect 07 Payments Checkout Completed

**Status**: GREEN. Aspect 07 local gates passing.

### Completed This Session

- Added checkout reconciliation service for order write-back failure, loyalty reversal requirement, and referral ledger failure.
- Updated order placement to record reconciliation after payment/order/referral edge failures without breaking successful customer orders unnecessarily.
- Added `yarn verify:payments-checkout` and promoted the payments profile in `scripts/verify-delivery.mjs`.
- Updated the custom payment gateway runbook, delivery matrix, Aspect 07 file, checklist, and memory.

### Verification

- `yarn verify:payments-checkout`: PASS.
- `node scripts/verify-delivery.mjs --profile payments`: PASS.
- `node scripts/guard-checks.mjs`: PASS.
- Next typecheck: PASS.

### Remaining

- Client custom payment gateway sandbox/live verification needs vendor credentials/endpoints.
- Continue aspect loop with Aspect 08 Search & Discovery.

## 2026-04-30 Aspect 08 Search Discovery Completed

**Status**: GREEN. Aspect 08 local gates passing.

### Completed This Session

- Extended search provider payloads with filters, sort, facets, meta, and health settings.
- Updated mock and Meilisearch adapters for facet/filter/sort requests and settings-aware health.
- Added `scripts/sync-meilisearch-products.ts` for catalog-provider indexing with dry-run support.
- Added `yarn verify:search-discovery` and promoted the search profile in `scripts/verify-delivery.mjs`.
- Updated the Meilisearch runbook, delivery matrix, Aspect 08 file, checklist, and memory.

### Verification

- `yarn verify:search-discovery`: PASS.
- `node scripts/verify-delivery.mjs --profile search`: PASS.
- `node scripts/guard-checks.mjs`: PASS.
- Next typecheck: PASS.

### Remaining

- Live Meilisearch deployment/health needs provisioned host/key/index.
- Continue aspect loop with Aspect 09 Notifications.

## 2026-04-30 Aspect 09 Notifications Completed

**Status**: GREEN. Aspect 09 local gates passing.

### Completed This Session

- Added generic REST email notification adapter and env placeholders.
- Added multi-channel notification provider routing for push/email.
- Added notification dead-letter retry metadata and status surface.
- Added `yarn verify:notifications` and promoted the notifications profile in `scripts/verify-delivery.mjs`.
- Updated notifications runbook, delivery matrix, Aspect 09 file, checklist, and memory.

### Verification

- `yarn verify:notifications`: PASS.
- `node scripts/verify-delivery.mjs --profile notifications`: PASS.
- `node scripts/guard-checks.mjs`: PASS.
- Next typecheck: PASS.

### Remaining

- Physical push smoke needs EAS/APNs/FCM credentials.
- Live email smoke needs client vendor endpoint/key/from address.
- Continue aspect loop with Aspect 10 Quality & Testing.

## 2026-04-30 Admin Notification Control Center

**Status**: GREEN. Admin notification controls implemented and verified.

### Completed This Session

- Added notification-control service for templates, campaigns, status, and dead-letter visibility.
- Added admin APIs for overview, template updates, and campaigns.
- Added `/admin/marketing/notifications` page and admin navigation link.
- Extended shared admin API client/types.
- Updated notification runbook, Aspect 09, checklist, and memory.

### Verification

- `yarn verify:notifications`: PASS.
- `node scripts/verify-delivery.mjs --profile notifications`: PASS.
- `node scripts/guard-checks.mjs`: PASS.
- Next typecheck: PASS.

### Remaining

- Customer notification preference UI remains separate account work.
- Physical push and live email vendor smoke remain external.

## 2026-04-30 Delivery Documentation Pack + Aspect Sync

**Status**: GREEN. All gates passing.

### Completed This Session

**New docs created (5):**
- `docs/delivery/PRODUCTION_BLOCKERS.md` — 15 non-UI blockers across auth, DB, integrations, infra, security
- `docs/delivery/CLIENT_HANDOFF_PACK.md` — 6 sections: env vars, Odoo mapping, PaymentProvider contract, blockers, referral/loyalty/pharmacist acceptance
- `docs/delivery/runbooks/custom-payment-gateway.md` — API contract, webhook format, HMAC, sandbox test cards, webhook events, adapter customization, production verification
- `docs/delivery/runbooks/OPERATOR_HANDBOOK_INDEX.md` — Central operator index (store manager, support, DevOps, integrations, retention)
- `docs/delivery/runbooks/backup-recovery.md` — Backup scope, schedule, PITR, disaster recovery, provider-specific notes

**Checklist items advanced (10):**
- `[x]` Lines 272, 280, 283, 300, 301, 312, 313 — 7 items marked verified done
- `[~]` Lines 309 — CMS API verified (14/14), admin pages load, browser UI needs credentials
- `[~]` Lines 305, 310 — Web verified, native/physical remains

**Aspect files synced (5):**
- Aspect 04 (CMS) — all `[x]`
- Aspect 07 (Payments) — 4 tasks marked done, 2 remain (rollback design, gateway sandbox)
- Aspect 08 (Search) — Meilisearch adapter marked done
- Aspect 11 (DevOps) — Backup/PITR marked done
- Aspect 15 (Documentation) — CMS guide, operator index, Odoo, payment handoff all done

### Verification (re-confirmed)
- `yarn guard:checks`: PASS
- `yarn tsc`: PASS (no errors)
- `yarn verify:functional-storefront`: 24/24 PASS (prior session)

### Remaining `[ ]` — needs external dependency
- **Line 284**: Admin auth/session verification — needs provisioned admin credentials
- **Physical device**: Native smoke, push notifications, pharmacist mobile flow
- **Client credentials**: Odoo connection, payment gateway sandbox, EAS build

## 2026-04-29 All Blockers Cleared + Build + Test Hardening

**Status**: LANDED / ALL BLOCKERS CLEARED / HARDENING GATES GREEN.

### BLK-003 Resolved
- Committed 2277 staged deletions from git index (generated output + dead scaffolds).
- `yarn guard:hygiene` now passes: 0 FAIL, 0 WARN.

### next-build Hardening Gate Passes
- `yarn workspace next-app build` passes: 149 static pages generated.
- Requires `REQUIRE_PRODUCTION_AUTH=false` env during build (no local Postgres).

### test:api Cross-Platform Fix
- `yarn --cwd apps/next test:api` was broken on Windows because Yarn 4's shell glob-expands `?` in DATABASE_URL.
- Added `apps/next/scripts/run-api-tests.mjs` wrapper that sets env vars in-process, bypassing shell interpretation.
- `test:api` script now uses the wrapper: 217/217 pass via both direct and `yarn verify:delivery`.
- Promoted `next-api-full` into the `current` delivery profile in `scripts/verify-delivery.mjs`.

**Verification**
- `yarn verify:delivery` passed: all 6 current gates green.
- `yarn guard:hygiene` passed: 0 FAIL, 0 WARN.
- `yarn workspace next-app build` passed: 149 static pages.
- `yarn --cwd apps/next test:api` passed: 217/217.

**Next**
- All 3 blockers resolved. All hardening gates pass.
- Continue aspect-by-aspect delivery.

## 2026-04-29 BLK-002 Full API Suite Resolved

**Status**: LANDED / `BLK-002` CLEARED.

- Root cause: test cleanup paths used `APPS_NEXT_ROOT/.data/` while stores use `process.cwd()/.data/`. Functional storefront smoke left stale referral/program data in root `.data/` that tests never cleaned, causing 16 state isolation failures across referral, checkout, and order tests.
- Fixed 7 test files to use `process.cwd()` for `.data/` and `.tmp/` cleanup, matching the store paths.
- Added `connect_timeout=2` to test `DATABASE_URL` so Prisma connection attempts fail fast when Postgres is unavailable.
- Added `--test-timeout=30000` as a safety net in the `test:api` script.
- Full suite now passes: `217/217` in ~160s without a running Postgres.
- Promoted `next-api-full` into the current required delivery profile.
- Updated `BLOCKERS.md`, `DELIVERY_MATRIX.md`, and `checklist.md`.

**Verification**
- `yarn --cwd apps/next test:api` passed: `217/217` in ~160s.
- `node scripts/guard-checks.mjs` passed.

**Next**
- BLK-003 (staged deletions) remains the next active blocker.
- Continue aspect-by-aspect delivery.

## 2026-04-29 Expo Typecheck Promotion

**Status**: LANDED / `BLK-001` CLEARED.

- `yarn --cwd apps/expo tsc --noEmit --incremental false` now passes.
- Scoped `apps/expo/tsconfig.json` to native-reachable Expo app files plus shared `packages/app`, `packages/ui`, `packages/tokens`, and provider contracts. Adapter implementations, package tests, and UI reference files no longer compile as part of the native app gate.
- Fixed Expo-facing strict TypeScript issues in release mocks, home layout/rendering, i18n wrappers, product card parsing, QR typing, auth error parsing, native star rating, focus trap, RN slot cloning, textarea typing, and pharmacist camera scan setup.
- Promoted `expo-typecheck` into current and functional delivery profiles.
- Marked Aspect 02 locally complete and updated Aspect 03 to remove `BLK-001` as a blocker.

**Verification**
- `yarn --cwd apps/expo tsc --noEmit --incremental false` passed.
- `yarn verify:expo-functional` passed.
- `node scripts/guard-checks.mjs` passed.
- `node --max-old-space-size=4096 node_modules/typescript/bin/tsc -p apps/next/tsconfig.json --noEmit --incremental false` passed.

**Next**
- Run `yarn verify:delivery` with the promoted Expo typecheck gate.
- Continue Aspect 03 with physical-device native smoke and deep-link validation.

## 2026-04-28 Delivery Readiness Loop

**Status**: LANDED / GATES GREEN.

- Fixed `apps/next/scripts/dev-stable.mjs` so the dev server no longer crashes on duplicate `createRequire` declarations and resolves the Prisma CLI through `prisma/build/index.js`.
- Hardened `scripts/run-e2e-a11y.mjs` cleanup on Windows so stale dev-server cleanup does not fail the smoke run when the process has already exited.
- Updated `scripts/guard-hygiene.mjs` to exclude `.worktrees/` from active repo hygiene scanning and added `docs/plans/003-hygiene-remediation-runbook.md` for the memory override, workspace exclusion, and nested worktree policy.
- Fixed storefront a11y smoke blockers:
  - Offer banner image-only buttons now always get a non-empty accessible label.
  - Footer social icon links now use their social label for accessibility.
  - Next dev indicator is disabled in local dev config so a11y smoke only measures app UI.
  - The a11y test snapshots named interactive elements after hydration instead of looping over a changing locator list.
- Made `apps/next` API tests explicitly run with `NODE_ENV=test`, `REQUIRE_PRODUCTION_AUTH=false`, and stable auth/session secrets so mocked auth tests do not inherit release-like auth behavior.

**Verification**
- `yarn guard:checks` passed.
- `yarn guard:agent-docs` passed.
- `yarn guard:hygiene` passed with one known warning: `HY-008` reports 2277 pre-existing staged deletions.
- `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false` passed.
- `yarn workspace next-app build` passed with mock env and generated 145 static pages.
- `yarn e2e:a11y` passed.
- `yarn --cwd apps/next test:api` passed: `213/213`.
- `npx ai-devkit@latest lint --feature commerce-platform-roadmap` passed with the known no-dedicated-worktree warning.

**Next**
- Resolve or intentionally commit/restore the pre-existing 2277 staged deletions before push/release.
- Continue the commerce roadmap with the planned `SearchProvider` slice.

## 2026-04-28 Commerce Delivery Checklist

**Status**: LANDED.

- Added root `checklist.md` as the production-readiness tracker for the commerce platform lifecycle.
- Reviewed the current system against the submitted lifecycle coverage:
  - Landed: AGENTS-governed architecture, RNR/token UI contract, Better Auth foundation, service/provider/adapter boundaries, order write-back through `OrderProvider.place`, shared storefront screens, API/service test scripts, guard checks, Playwright a11y smoke, production blueprint, SaaS migration docs, and AI DevKit roadmap docs.
  - Partial: native production readiness, CMS scheduling/media/release operations, payment hardening, Odoo production verification, tenant persistence/scoping, observability, runbooks, and shared screen `Platform.OS` hygiene.
  - Not yet: formal tRPC standard/implementation, public GraphQL exposure remains disallowed, GraphQL Mesh remains deferred, NotificationProvider, Shopify/custom PostgreSQL/Meilisearch/Paymob adapters, provisioning automation, Maestro, Lighthouse CI, Sentry confirmation, RLS, penetration testing, and go-live/offboarding runbooks.
- Updated `AGENTS.md` to v4.7 so agents must read `checklist.md` before substantial work and update it when delivery status, blockers, verification, or next steps change.
- Linked `checklist.md` from `docs/architecture-index.md`.

**Verification**
- `yarn guard:agent-docs` passed.
- `yarn guard:checks` passed.
- `npx ai-devkit@latest lint --feature commerce-platform-roadmap` passed with the known no-dedicated-worktree warning.

**Next**
- Use the checklist's recommended queue: decide/formalize tRPC scope, implement `NotificationProvider`, formalize payment provider boundary, add Meilisearch adapter, add FAQ/Testimonials CMS blocks, continue shared screen hygiene, and start `new-client.ts`.

## 2026-04-28 Payment Gateway Readiness Slice

**Status**: LANDED / FOCUSED GATES GREEN.

- Added `PaymentProvider` contract for payment intents, optional intent lookup, optional webhooks, and health checks.
- Added `mockPaymentAdapter` for functional COD, card-on-delivery, pay-at-branch, and online-card intent flows.
- Added `packages/adapters/custom-payment` as a generic REST custom gateway adapter selected by env.
- Wired `paymentProvider` into `packages/providers/registry.ts` with `USE_CUSTOM_PAYMENT=false` switching to custom gateway when configured.
- Updated `placeOrder()` to create a payment intent before `OrderProvider.place`, attaching normalized settlement data to the order write-back payload.
- Added `.env.example` entries and adapter guide docs for custom payment integration.
- Updated focused order placement test to assert payment provider delegation and settlement propagation.

**Verification**
- `node --max-old-space-size=4096 node_modules/typescript/bin/tsc -p apps/next/tsconfig.json --noEmit --incremental false` passed.
- `node scripts/guard-checks.mjs` passed.
- Focused order placement tests passed: `3/3`.
- Earlier Yarn-based parallel verification hit local disk/cache pressure: `ENOSPC` and one timeout. Use direct local node commands or free disk before full suite.

**Next**
- Add payment webhook route/service for generic custom payment gateway.
- Add `NotificationProvider`.
- Continue Odoo readiness by verifying product/category/brand adapters against real env contracts.

## 2026-04-28 Website/App Functional Delivery Plan

**Status**: PLANNED / CORRECTED SCOPE.

- Updated `checklist.md` with a phased plan to get the website and app functionally ready end-to-end.
- Corrected scope: this is a functional delivery plan. UI polish/publishing can happen separately, but all functionality should work as expected.
- Only allowed external blockers are the client's real Odoo credentials/endpoints and custom payment gateway credentials/endpoints; adapter seams, runbooks, and smoke tests must be ready.
- Plan phases:
  1. Gate recovery: old review findings, disk/verification stability, staged deletion blocker.
  2. Web storefront functional readiness: production-like seed, complete customer flow, no broken reachable surfaces.
  3. Mobile app functional readiness: Expo boot/navigation smoke, complete or hide incomplete push/deep-link controls.
  4. Odoo connection readiness: env/runbook/smoke/mapping/order write-back expectations.
  5. Custom payment readiness: webhook, return/cancel handling, idempotency/retry, vendor handoff docs.
  6. Admin/CMS functional readiness: edit/preview/publish script and user guide.
  7. Delivery verification pack and acceptance criteria.
- Reordered the next implementation queue toward functional readiness: free disk, finish custom payment webhook/return flow, production-like seed/script, web functional flow, Expo native smoke, Odoo runbook/smoke, then notifications/search/provisioning.

**Next**
- Free disk or clear safe generated caches before full verification.
- Implement custom payment webhook + return/cancel flow.
- Create production-like merchant seed and run end-to-end web functional flow.

## 2026-04-28 Custom Payment Functional Flow

**Status**: LANDED / FOCUSED GATES GREEN.

- Added custom payment webhook service and route at `/api/payments/custom/webhook`.
- Webhook processing delegates to `paymentProvider.handleWebhook(...)` and records settlements through `OrderProvider.confirmPaymentSettlement(...)` when supported.
- Added custom payment return/cancel routes for online-card gateway redirects.
- Extended order placement to pass return/cancel URLs to `PaymentProvider.createIntent(...)`.
- Exposed `paymentAction` on placed orders so web checkout can redirect users to a required gateway payment URL.
- Added mock order settlement recording so local/default functional mode can exercise settlement updates.
- Added HMAC-SHA256 custom payment webhook verification in `packages/adapters/custom-payment`.
- Updated payment gateway docs, `.env.example`, and `checklist.md`.

**Verification**
- `node --max-old-space-size=4096 node_modules/typescript/bin/tsc -p apps/next/tsconfig.json --noEmit --incremental false` passed.
- Focused payment/order/custom adapter tests passed: `7/7`.
- `node scripts/guard-checks.mjs` passed.
- `yarn guard:agent-docs` passed.
- Full `yarn --cwd apps/next test:api` timed out after 4 minutes in local environment; isolated `checkout-page.service.test.ts` passed but spent about 16 seconds waiting through unavailable Postgres fallbacks.
- `yarn e2e:a11y` and a manual a11y rerun did not complete locally; leftover Next dev-server processes were cleaned up.

**Next**
- Create production-like merchant seed and functional script.
- Rework or configure DB-heavy fallback tests before treating full API suite and web a11y smoke as green.
- Continue Odoo runbook/smoke script.

## 2026-04-29 Web Functional Storefront Smoke

**Status**: LANDED / WEB FUNCTIONAL SMOKE GREEN.

- Replaced customer-visible fallback CMS copy that said "Mock CMS hero content" with production-like merchant copy.
- Switched fallback CMS branding from `/brand-logo-placeholder.svg` to the uploaded `/uploads/site-branding/logo-en.png` asset.
- Added `scripts/verify-functional-storefront.mjs` plus package scripts:
  - `yarn verify:functional-storefront:static`
  - `yarn verify:functional-storefront`
- The live functional script starts the Next dev server, checks home/shop/search/product/cart/checkout/orders/account pages, validates catalog/search/CMS APIs, then exercises add-to-cart, checkout quote creation, COD order placement, and order history through real API routes.
- Adjusted the smoke runner to provide local-only Better Auth/trusted request env and to mint a non-release legacy session cookie from the configured local auth secret.
- Quieted repeated Prisma client error logs during intentional local CMS fallback by making Prisma client error logging opt-in via `PRISMA_CLIENT_LOG=error`.

**Verification**
- `yarn verify:functional-storefront` passed end-to-end.
- `node scripts/guard-checks.mjs` passed.
- `node --max-old-space-size=4096 node_modules/typescript/bin/tsc -p apps/next/tsconfig.json --noEmit --incremental false` passed.

**Remaining**
- Deprecated `textShadow*`/`shadow*` style warnings and the missing i18next initialization warning were removed from the functional smoke path.
- Native Expo functional smoke remains.
- Production build/full API/a11y suite still need reruns in a stable environment.

## 2026-04-29 Expo Static Functional Smoke

**Status**: LANDED / STATIC EXPO SMOKE GREEN.

- Used the Expo API Routes, Expo Dev Client, Expo CI/CD, and Solito navigation guidance for the mobile-readiness pass.
- Confirmed no Expo `+api.ts` routes are part of the commerce data layer; Next.js remains the server/data owner per `AGENTS.md`.
- Hardened the Expo API client so the public mobile bundle no longer sends the server-only `x-rc-trusted-request: 1` bypass header. Native requests now send same-origin `origin`/`referer` provenance headers for the current Next-backed API contract.
- Normalized checkout branch data so missing `stockCount` becomes `0` before entering the shared checkout screen.
- Fixed forgot-password submit handling so the async auth reset call satisfies the shared screen callback contract.
- Added `scripts/verify-expo-functional.mjs` plus root `yarn verify:expo-functional`.
- The static Expo smoke checks app config, platform/scheme/scripts, provider shell, API-client boundary, expected router views, checkout/order wiring, branch normalization, absence of Expo API routes, and local `expo config` resolution.

**Verification**
- `yarn verify:expo-functional` passed.
- `node scripts/guard-checks.mjs` passed.
- `node --max-old-space-size=4096 node_modules/typescript/bin/tsc -p apps/next/tsconfig.json --noEmit --incremental false` passed.

**Remaining**
- Real device/simulator boot and navigation smoke.
- Push notification and deep-link verification.
- EAS Build/Submit/Update runbook or workflow setup.
- Broad Expo TypeScript command still exposes existing monorepo backlog outside the focused Expo-owned fixes.

## 2026-04-29 Push Notifications And EAS Runbook

**Status**: LANDED / STATIC GATES GREEN.

- Added `NotificationProvider` contract for push/email-capable notification delivery.
- Added `mockNotificationAdapter` with local `.tmp/mock-notifications.json` registration and delivery recording.
- Added `packages/adapters/expo-push` adapter selected by `USE_EXPO_PUSH=true`.
- Wired `notificationProvider` into the provider registry and readiness map.
- Added `/api/notifications/devices` for authenticated push-token registration/unregistration.
- Added `apps/next/server/services/notifications/notification.service.ts` with provider-backed registration and order-status notification orchestration.
- Admin order status updates now trigger non-blocking order-status notifications.
- Installed `expo-notifications`, configured Expo notifications, and added `apps/expo/app/registerPushNotifications.ts`.
- Expo app now attempts push registration, skips safely until an EAS project id exists, and sends tokens to the Next API through the shared API client.
- Added root `eas.json` with development, preview, and production build profiles.
- Added `docs/eas-runbook.md` for build, submit, update, credentials, push smoke, and rollback operations.
- Expanded `yarn verify:expo-functional` to check push registration and EAS config.

**Verification**
- `yarn verify:expo-functional` passed.
- `node scripts/guard-checks.mjs` passed.
- `node --max-old-space-size=4096 node_modules/typescript/bin/tsc -p apps/next/tsconfig.json --noEmit --incremental false` passed.
- Focused notification service tests passed: `2/2`.
- `git diff --check` passed for touched files.

**Remaining**
- Physical-device push smoke with real EAS project id and push credentials.
- Deep-link verification.
- Real EAS build/submit/update execution with client store credentials.
- `yarn --cwd apps/expo tsc --noEmit --incremental false` still fails on pre-existing monorepo/package type debt; the first current errors are outside the push/EAS files.

## 2026-04-29 Repo-Local Symphony Delivery Workflow

**Status**: LANDED.

- Added the complete repo-local delivery operating system under `docs/delivery/`.
- Added `docs/delivery/WORKFLOW.md` with the task state machine, ticket format, work-session loop, agent dispatch rule, and verification rule.
- Added `docs/delivery/DELIVERY_MATRIX.md` with current required gates, functional gates, hardening gates, and aspect-to-gate ownership.
- Added `docs/delivery/BLOCKERS.md` with reproducible active blockers:
  - `BLK-001` Expo typecheck shared package debt.
  - `BLK-002` full API suite stable DB/disk rerun.
  - `BLK-003` release hygiene staged deletions.
- Added 17 delivery aspect files under `docs/delivery/aspects/`, covering product/business through launch/post-launch.
- Added `scripts/verify-delivery.mjs` with named gates and profiles:
  - `current`
  - `functional`
  - `full`
  - `hardening`
- Added package scripts:
  - `yarn verify:delivery`
  - `yarn verify:delivery:functional`
  - `yarn verify:delivery:full`
- Updated `AGENTS.md` to v4.8 so agents must read delivery matrix/blockers/aspects during startup and keep delivery files updated when status changes.
- Updated `docs/architecture-index.md` and `checklist.md` to reference the delivery workflow.

**Verification**
- `node scripts/verify-delivery.mjs --list` passed.
- `yarn guard:agent-docs` passed.
- `yarn verify:delivery` passed.
- `yarn verify:delivery:functional` passed.
- `git diff --check` passed for the delivery workflow files.

**Next**
- Use `BLK-001` as the next bounded cleanup task: `packages/adapters/mock/release/index.ts`.

## 2026-04-29 Aspect 01 Product Business Foundation

**Status**: LANDED / ASPECT VERIFIED.

- Completed Aspect 01 under `docs/delivery/aspects/01-product-business-foundation.md`.
- Added business foundation runbooks:
  - `docs/delivery/runbooks/client-agreement-checklist.md`
  - `docs/delivery/runbooks/client-onboarding.md`
  - `docs/delivery/runbooks/sla-support.md`
  - `docs/delivery/runbooks/source-code-buyout.md`
- Updated `checklist.md` to mark onboarding, SLA/support, and source-code buyout docs complete.
- Kept legal review explicit: the agreement checklist is operationally complete, but final contract language still requires business/legal review.

**Verification**
- `yarn verify:delivery` passed.
- `git diff --check` passed for Aspect 01 runbooks/status files.

**Next**
- Move to Aspect 02 Architecture & Design System after this slice is verified.

## 2026-04-29 Aspect 02 Architecture Design System

**Status**: PARTIAL / GOVERNANCE GATE DOCUMENTED.

- Added `docs/delivery/runbooks/architecture-design-system.md` as the per-feature delivery gate for architecture, shared UI, shared screens, CMS layout data, provider contracts, adapters, and Solito navigation changes.
- Updated Aspect 02 to record that architecture governance is documented and current delivery verification is explicit.
- Kept Aspect 02 partial because broad Expo TypeScript promotion remains blocked by `BLK-001`.

**Next**
- Continue to Aspect 03 Core Development Domains, or clear `BLK-001` if the next goal is full Aspect 02 completion.

## 2026-04-29 Referral Loyalty Pharmacist Coverage Gate

**Status**: LANDED / FOCUSED GATE GREEN.

- Added `scripts/verify-retention-consultation.mjs` and root `yarn verify:retention-consultation`.
- Added `docs/delivery/runbooks/referral-loyalty-pharmacist-tests.md` to track referral, loyalty, account tests, and pharmacist consultation acceptance.
- Updated delivery matrix, Aspect 03, Aspect 05, Aspect 06, Aspect 07, Aspect 10, and `checklist.md` so these flows are explicit delivery requirements.
- Current status is partial for production readiness: service/API contracts pass, but production persistence, tenant scoping, hair/skin templates, native/operator smoke, rollback, expiry, and fraud controls remain.

**Verification**
- `yarn verify:retention-consultation` passed: `28/28`.
- `yarn verify:delivery:functional` passed with the new `retention-consultation-focused` gate included.

**Next**
- Add combined referral + loyalty checkout smoke to `yarn verify:functional-storefront`.
- Model explicit hair and skin consultation templates before client handoff.

## 2026-04-29 Aspect 03 Web Retention Functional Smoke

**Status**: LANDED / WEB FUNCTIONAL SMOKE GREEN.

- Expanded `scripts/verify-functional-storefront.mjs` to use the seeded customer account.
- Web functional smoke now covers account referral summary, referral validate/apply, loyalty wallet/history, account test history, account test detail recommendations, recommended-product add-to-cart, and referral+loyalty COD checkout/order history.
- Aspect 03 and `checklist.md` now distinguish web coverage from remaining native/manual and production-persistence work.

**Verification**
- `yarn verify:functional-storefront` passed.

**Next**
- Model explicit hair and skin consultation templates.
- Add native/manual smoke for account referral, loyalty, tests, and recommended-product cart behavior.

## 2026-04-29 Aspect 03 Hair Skin Consultation Templates

**Status**: LANDED / WEB GATES GREEN.

- Added explicit `skin` and `hair` consultation template identity to account and pharmacist shared contracts.
- Seeded skin and hair/scalp account test records/details in the mock account adapter.
- Seeded skin and hair/scalp pharmacist consultation records in the mock pharmacist adapter.
- Pharmacist consultation payloads now accept `templateType` with a safe default of `skin`.
- Web functional storefront smoke now fails unless account tests expose both skin and hair templates.

**Verification**
- Next typecheck passed.
- `yarn verify:retention-consultation` passed: `28/28`.
- `yarn verify:functional-storefront` passed.

**Next**
- Define client-specific questionnaire fields/content for the hair and skin templates.
- Add native/manual smoke for these account and consultation flows.

## 2026-04-29 Aspect 03 Pharmacist Operator Web Smoke

**Status**: LANDED / WEB FUNCTIONAL SMOKE GREEN.

- Expanded `scripts/verify-functional-storefront.mjs` with an authenticated pharmacist session.
- Web functional smoke now verifies pharmacist customer search, QR resolve, customer profile/history, product search, hair consultation draft, hair consultation submit, and the submitted consultation appearing in the customer history.
- Aspect 03, the referral/loyalty/pharmacist runbook, and `checklist.md` now distinguish web/API operator coverage from remaining browser-click/native verification and production audit persistence.

**Verification**
- `yarn verify:functional-storefront` passed.

**Next**
- Run browser-click/native pharmacist smoke.
- Define production persistence, tenant scoping, and audit trail for consultations.

## 2026-04-29 Aspect 03 Pharmacist Browser Smoke

**Status**: LANDED / BROWSER GATE GREEN.

- Added `e2e/pharmacist.spec.ts` and `scripts/run-e2e-pharmacist.mjs`.
- Added root `yarn verify:pharmacist-browser` and included `pharmacist-browser` in the functional delivery profile.
- Browser-click smoke covers pharmacist customer search, open customer, create hair test, product recommendation selection, review, submit, and submitted consultation history.
- Fixed the pharmacist new-test form to include `templateType` in the submitted consultation payload.
- Updated `packages/ui/components/Button.tsx` to render a real HTML `button` on web while keeping React Native `Pressable` on native, so browser clicks reliably invoke actions.

**Verification**
- `yarn verify:pharmacist-browser` passed.
- `yarn verify:delivery:functional` passed with the new `pharmacist-browser` gate included.
- `yarn verify:functional-storefront` passed after the shared Button web rendering change.

**Next**
- Run native/device pharmacist smoke.
- Define production consultation persistence, tenant scoping, and audit trail.

## 2026-04-27 Commerce Platform Requirements Refresh

**Status**: DOCS UPDATED.

- Updated AI DevKit lifecycle docs for `commerce-platform-roadmap` with the submitted managed commerce platform requirements.
- Requirements now cover branded web storefronts and native apps, CMS blocks, search/facets, product detail, cart/checkout, COD/custom gateway, Better Auth, SEO, native push/deep links, backend adapters, tenant provisioning, Sentry, CI/CD, security, and NFRs.
- Recorded architecture decision blockers instead of silently overriding `AGENTS.md`:
  - Payload CMS 3.0 vs current Prisma/Postgres canonical CMS rule.
  - Tamagui v2 vs current RNR-centered shared UI contract.
  - Expo SDK 52+ vs Solito v5 skill baseline of Expo SDK 54+.
  - GraphQL Mesh/tRPC target vs current service/provider/adapter architecture and no external BFF rule.
  - Redis sessions/cache target vs current Better Auth/Prisma/session/rate-limit setup.
- Updated design, planning, and testing docs to reflect v1 isolated tenant deployments, Meilisearch/search provider, first-party Odoo/Shopify/custom PostgreSQL adapters, `new-client.ts`, EAS, Sentry, dependency scanning, CodeQL, Playwright, Maestro, and Lighthouse gates.

**Verification**
- `npx ai-devkit@latest lint` passed.
- `npx ai-devkit@latest lint --feature commerce-platform-roadmap` passed with known no-dedicated-worktree warning.
- No app code changed.

### 2026-04-27 AGENTS Commerce Platform Rules

**Status**: LANDED.

- Updated `AGENTS.md` to v4.5 with durable Commerce Platform Rules.
- Added rules that commerce integrations must follow the canonical data flow and use provider/service/adapter boundaries.
- Added no-duplication rule: audit and harden existing commerce contracts, services, screens, and CMS blocks before adding new ones.
- Added explicit locations for commerce provider contracts, adapters, CMS renderers, and shared commerce screens.

### 2026-04-27 Requirements Realigned To AGENTS

**Status**: LANDED.

- Rewrote `docs/ai/requirements/feature-commerce-platform-roadmap.md` so requirements are based on `AGENTS.md` v4.5.
- Removed proposed stack choices from active requirements when they conflict with current source of truth.
- Made Prisma/Postgres CMS, RNR-centered shared UI, service/provider/adapter flow, provider-backed commerce domains, and audit-before-addition explicit requirements.
- Kept Odoo, Shopify REST, custom PostgreSQL, Meilisearch, Paymob, and notification providers as proposed adapter targets only after contracts are stable.

### 2026-04-27 Dev Lifecycle Phase 3: Commerce Design Review

**Status**: LANDED.

- Rewrote `docs/ai/design/feature-commerce-platform-roadmap.md` against AGENTS-aligned requirements.
- Removed stale active conflict framing around Payload/Tamagui/GraphQL Mesh.
- Design now centers Prisma/Postgres CMS, RNR shared UI, existing domain service folders, provider-backed commerce domains, adapter isolation, and audit-before-addition.
- Added design trade-offs for payment boundary, search provider, notification provider, and native scope.

**Verification**
- `npx ai-devkit@latest lint --feature commerce-platform-roadmap` passed with the known no-dedicated-worktree warning.

### 2026-04-27 Dev Lifecycle Phase 4: Explicit Commerce Audit Matrix

**Status**: LANDED.

- Added the explicit commerce implementation matrix to `docs/ai/implementation/feature-commerce-platform-roadmap.md`.
- Updated planning to mark the matrix output complete.
- Confirmed the first implementation candidates:
  1. Refactor `placeOrder()` to use `OrderProvider.place` for merchant write-back.
  2. Add `SearchProvider` and delegate search service behavior to it.
  3. Add `NotificationProvider` for order-status notifications.
  4. Add FAQ and Testimonials CMS blocks after renderer/component audit.
  5. Clean shared screen web-only imports and review `Platform.OS` usage.
- Key concrete gap: `apps/next/server/services/orders/place-order.service.ts` currently persists placed orders to `.tmp/mock-orders.json` instead of using `OrderProvider.place`.

**Verification**
- `npx ai-devkit@latest lint --feature commerce-platform-roadmap` passed with the known no-dedicated-worktree warning.

### 2026-04-27 Dev Lifecycle Phase 5: Planning Reconciliation

**Status**: LANDED.

- Updated `docs/ai/planning/feature-commerce-platform-roadmap.md` to mark Phase 5 planning reconciliation complete.
- Converted confirmed audit gaps into an ordered Phase 4 implementation queue:
  1. Order write-back through `OrderProvider.place`.
  2. `SearchProvider` contract plus search service delegation.
  3. `NotificationProvider` contract for order-status push/email.
  4. FAQ and Testimonials CMS block audit/implementation.
  5. Shared screen hygiene for web-only imports and direct `Platform.OS` usage.
- Updated `docs/ai/implementation/feature-commerce-platform-roadmap.md` to mark confirmed-gap conversion complete.
- Selected the next implementation slice: add a failing test for `placeOrder()` delegating final order creation/write-back to `OrderProvider.place`, then implement the smallest provider-backed path.

**Verification**
- `npx ai-devkit@latest lint --feature commerce-platform-roadmap` passed with the known no-dedicated-worktree warning.

### 2026-04-27 Dev Lifecycle Phase 4: Order Write-Back

**Status**: LANDED.

- Added TDD coverage proving `placeOrder()` delegates final order creation/write-back to `OrderProvider.place`.
- Updated `apps/next/server/services/orders/place-order.service.ts` to call `orderProvider.place` instead of directly persisting `.tmp/mock-orders.json`.
- Widened `PlaceOrderInput` with optional normalized `order` data for merchant/backend adapters.
- Added `mockOrderAdapter.place()` as the local provider-backed write path.
- Added `yarn guard:checks` enforcement that blocks direct mock order persistence from returning to `place-order.service.ts`.
- Updated commerce roadmap planning, implementation, and testing docs.

**Verification**
- Red test failed first because `placeOrder()` returned a locally generated `ord-*` id instead of the provider-created order id.
- Focused order service tests passed: `3/3`.
- Focused order route tests passed: `6/6`.
- `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false` passed.
- `yarn guard:checks` passed.
- `npx ai-devkit@latest lint --feature commerce-platform-roadmap` passed with the known no-dedicated-worktree warning.
- Local Prisma was unavailable at `localhost:5432` during focused tests; auth role fallback logs were expected and non-blocking.

**Next**
- Start the `SearchProvider` slice: failing search delegation test, smallest provider contract, then move current in-memory search behavior behind the provider boundary.

## Current State: Architecture Fix Slice Started

**Last Updated**: 2026-04-25

### 2026-04-26 Dev Lifecycle Phase 4: Pharmacist Service Boundary

**Status**: LANDED.

- Added `apps/next/server/services/pharmacist/pharmacist-consultation.service.ts` as the server-owned orchestration layer for pharmacist/customer lookup, QR resolve, product search, draft creation, and consultation submission.
- Added TDD coverage in `pharmacist-consultation.service.test.ts`.
- Updated all `apps/next/app/api/pharmacist/**` routes to delegate business/provider orchestration to the service.
- Added `yarn guard:checks` enforcement that blocks direct `pharmacistProvider` orchestration in pharmacist API routes.
- Updated AI DevKit lifecycle docs for `commerce-platform-roadmap`.

**Verification**
- Red test failed first with missing service module.
- Focused pharmacist service tests passed: `5/5`.
- `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false` ?
- `yarn guard:checks` ?
- `npx ai-devkit@latest lint --feature commerce-platform-roadmap` ? with known no-dedicated-worktree warning.

### 2026-04-26 Dev Lifecycle Phase 4: Pharmacist Validation Alignment

**Status**: LANDED.

- Updated pharmacist QR validation to use live `qrCode` contract and trim input.
- Added canonical `PharmacistConsultationBodySchema` for `customerId`, `title`, `summary`, `notes`, `metrics`, and `recommendedProductIds`.
- Updated pharmacist QR, draft, and submit routes to validate payloads before delegating to server services.
- Added focused validation schema tests.

**Verification**
- Red validation test failed first because `PharmacistConsultationBodySchema` was missing.
- Focused validation/pharmacist tests passed: `8/8`.
- `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false` ?
- `yarn guard:checks` ?
- Source search found no remaining legacy `barcode` or `recommendations:` contract usage in pharmacist validation/routes.
- `npx ai-devkit@latest lint --feature commerce-platform-roadmap` ? with known no-dedicated-worktree warning.

### 2026-04-25 Service Boundary Cleanup: Pricing + Referral Helpers

**Status**: LANDED.

- Moved checkout pricing quote helpers out of `apps/next/app/api/_lib/pricing-quote.ts` into `apps/next/server/services/checkout/pricing-quote.ts`.
- Moved referral profile/program/ledger stores out of `apps/next/app/api/_lib/referral-*.ts` into `apps/next/server/services/referral/`.
- Kept old API `_lib` files as compatibility re-export shims only.
- Updated account, checkout quote, and order placement services to import server-owned helpers instead of API `_lib` helpers.
- Added `yarn guard:checks` enforcement so server services cannot reintroduce imports from the moved pricing/referral API helper paths.

**Verification**
- `yarn guard:checks` ?
- `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false` ?
- Focused service tests passed: `6/6` ?
- Local Postgres was unavailable at `localhost:5432`, causing expected Prisma fallback logs during account service tests.

### Previous State: Better Auth Audit Findings Fixed

**Last Updated**: 2026-04-22

### 2026-04-22 Better Auth Audit Remediation

**Audit findings fixed** — LANDED.
- Checkout quote and order placement now resolve sessions through `resolveNormalizedSessionFromRequest(...)` instead of parsing the legacy `rc_auth_session` cookie directly.
- Password reset routes now delegate to Better Auth APIs:
  - `/api/auth/request-reset` ? `auth.api.requestPasswordReset`
  - `/api/auth/reset-password` ? `auth.api.resetPassword`
- Password reset delivery fails closed when unavailable in release-like environments.
- `/api/checkout/quote` now requires trusted mutation provenance and uses a dedicated `checkoutQuoteLimiter`.
- `x-rc-trusted-request` now requires `TRUSTED_REQUEST_BYPASS_SECRET`; a bare value of `1` is rejected.
- [docs/reports/better-auth-audit-2026-04-22.md](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/docs/reports/better-auth-audit-2026-04-22.md) was updated with remediation status.

**Verification**
- Targeted auth/checkout/order suite passed: `44/44`.
- `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false` ?
- `yarn guard:checks` ?
- `py -3 scripts/build_graphify_contexts.py` ?

### Previous State: AGENTS Startup Status Rule Added

### 2026-04-22 AGENTS Startup Status Rule

**AGENTS.md updated** — LANDED.
- Version bumped to `v4.3`
- Last updated set to `2026-04-22`
- Added `Mandatory Startup Status` requiring agents to report:
  - `/caveman: active|inactive`
  - `graphify: checked|not checked`
- If repo guidance is explicitly overridden, agents should report `graphify: not checked (user override)`.

### Previous State: Better Auth Audit Completed

### 2026-04-22 Better Auth Audit

**Audit artifact** — ADDED:
- [docs/reports/better-auth-audit-2026-04-22.md](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/docs/reports/better-auth-audit-2026-04-22.md)

**Key findings**
- P1: checkout quote and order placement services still parse the legacy `rc_auth_session` cookie directly instead of resolving Better Auth-backed normalized sessions.
- P1: password reset routes still call the development-only mock `authProvider` instead of Better Auth account lifecycle flows.
- P2: `/api/checkout/quote` writes quote state without trusted mutation or route-level rate-limit protection.
- P2: the static `x-rc-trusted-request: 1` bypass header should be replaced with a stronger internal trust mechanism or constrained to documented machine callers.

**Verification**
- Targeted auth/checkout/order suite passed: `38/38`.
- `yarn --cwd apps/next test:api` was attempted but timed out after roughly `124s` in this environment.

### Better Auth Implementation

**Foundational auth migration** — LANDED. The repo now has a working Better Auth foundation in code, not just in docs:
- Better Auth config/bootstrap lives in [apps/next/lib/auth.ts](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/lib/auth.ts)
- Better Auth security/config helpers were added to [security-policy.ts](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/api/_lib/security-policy.ts)
- Prisma now includes Better Auth identity/session/account/verification tables plus app-owned role mapping in [schema.prisma](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/prisma/schema.prisma)
- Migration added: [20260414103000_better_auth_foundation](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/prisma/migrations/20260414103000_better_auth_foundation/migration.sql)

**Auth service boundary** — LANDED. `apps/next/server/services/auth/` now exists as the canonical Better Auth integration layer:
- [auth-session-adapter.service.ts](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/server/services/auth/auth-session-adapter.service.ts)
- [auth-role-resolution.service.ts](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/server/services/auth/auth-role-resolution.service.ts)

**Auth route cutover** — LANDED. The low-risk auth routes now issue/resolve Better Auth-backed sessions:
- `/api/auth/login`
- `/api/auth/logout`
- `/api/auth/register`
- `/api/auth/session`

**Protected-route helper cutover** — LANDED. [request-auth.ts](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/api/_lib/request-auth.ts) now resolves Better Auth-backed normalized sessions first and falls back to legacy cookie sessions during the transition window. Protected account, order, pharmacist, admin, CMS, and release routes were updated to await the async helper path.

### Production Hardening Follow-Up

**Dedicated Better Auth secret enforcement** — LANDED. Better Auth no longer treats the legacy auth secret as an acceptable production substitute:
- [security-policy.ts](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/api/_lib/security-policy.ts) now requires a dedicated `BETTER_AUTH_SECRET` in release-like environments and rejects weak secrets under 32 characters
- [auth.ts](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/lib/auth.ts) now fails closed with an explicit Better Auth secret error when release config is invalid
- CI and operator docs now reflect the real contract:
  - [.env.example](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/.env.example)
  - [.github/workflows/ci.yml](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/.github/workflows/ci.yml)
  - [docs/adapter-integration-guide.md](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/docs/adapter-integration-guide.md)
  - [docs/production-blueprint.md](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/docs/production-blueprint.md)

**Request-bound prerender cleanup** — PARTIALLY LANDED. The safe route-handler pass now centralizes request-bound auth/session handling more cleanly and reduces false-alarm debug noise:
- [request-auth.ts](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/api/_lib/request-auth.ts) now establishes a request connection before protected session resolution
- request-bound GET handlers were explicitly marked where needed:
  - [api/auth/session/route.ts](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/api/auth/session/route.ts)
  - [api/cms/home/route.ts](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/api/cms/home/route.ts)
  - [api/reviews/route.ts](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/api/reviews/route.ts)
- [response.ts](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/api/_lib/response.ts) now suppresses expected prerender bailout noise (`NEXT_PRERENDER_INTERRUPTED`, `HANGING_PROMISE_REJECTION`) so `--debug-prerender` is readable again

**Regression coverage** — EXPANDED.
- [auth-session.test.ts](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/api/_lib/auth-session.test.ts) now covers release-mode secret strength enforcement
- [auth/route.test.ts](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/api/auth/route.test.ts) now covers fail-closed behavior for weak/missing Better Auth secrets in release-like environments
- [apps/next/package.json](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/package.json) test script now seeds a strong test `BETTER_AUTH_SECRET` so auth imports are stable under test

**Production auth hardening** — TIGHTENED AGAIN.
- [auth-role-resolution.service.ts](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/server/services/auth/auth-role-resolution.service.ts) no longer upserts inferred roles in release-like environments; missing mapping now resolves to least-privilege `customer`
- release-like environments also fail closed when Prisma role lookup throws instead of re-inferring elevated seeded roles
- [auth-session-adapter.service.ts](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/server/services/auth/auth-session-adapter.service.ts) now rejects legacy cookie fallback entirely in release-like environments
- new focused auth tests cover:
  - no inferred-role upsert in release mode
  - release-mode rejection of legacy cookie fallback
  - existing email-verification and session-rate-limit behavior

**Spec Kit sync** — LANDED. `specs/005-better-auth/` now reflects the real implementation approach instead of the earlier generic migration draft:
- [spec.md](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/specs/005-better-auth/spec.md) is now `In Progress` and includes release-secret enforcement plus prerender-compatibility requirements
- [plan.md](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/specs/005-better-auth/plan.md) now records the landed Better Auth foundation and the safe hardening pass
- [tasks.md](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/specs/005-better-auth/tasks.md) now includes explicit completed US3 tasks for release-secret hardening, env/CI/doc sync, and prerender-noise cleanup

### Verification
- `yarn guard:checks` ?
- `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false` ?
- `yarn --cwd apps/next prisma:generate` ?
- targeted auth tests ?
- `yarn --cwd apps/next test:api` ? (`159/159`)
- `yarn --cwd apps/next build --webpack` ?
- `yarn --cwd apps/next build --webpack --debug-prerender` ?
- focused auth regression suite ? (`29/29`)

### Remaining Follow-Up
- Production/staging must set a real high-entropy `BETTER_AUTH_SECRET`; release-like envs now fail closed instead of silently falling back
- Debug prerender no longer floods with expected bailout logs, but deeper route-to-route/request-state coupling still exists and should be reduced by moving more internal fetch paths to direct service calls
- Explicit Better Auth vs legacy-session observability is not implemented yet
- Dev/test still use compatibility behavior intentionally, but release-like environments no longer accept legacy cookie fallback

---

## Previous State: 004-production-cms — Audit Remediation Landed, Final Build Still Open

**Last Updated**: 2026-04-14

### Better Auth Planning

**Repo-native auth migration plan** — ADDED. The repo now has a concrete phased migration plan for moving from the current custom encrypted-cookie auth system to `Better Auth` without replacing the existing custom admin/CMS authorization model:
- [2026-04-14-better-auth-migration-plan.md](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/docs/plans/2026-04-14-better-auth-migration-plan.md)

**Execution backlog** — ADDED. The migration now also has a dependency-ordered backlog with concrete repo file targets and an MVP cut line:
- [2026-04-14-better-auth-migration-backlog.md](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/docs/plans/2026-04-14-better-auth-migration-backlog.md)

**Spec Kit feature set** — ADDED. A full implementation/security/audit/delivery feature set now exists under:
- [specs/005-better-auth/spec.md](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/specs/005-better-auth/spec.md)
- [specs/005-better-auth/plan.md](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/specs/005-better-auth/plan.md)
- [specs/005-better-auth/tasks.md](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/specs/005-better-auth/tasks.md)

**Target split locked in**
- `Better Auth` should own authentication, sessions, and account lifecycle
- the app should continue owning admin-domain RBAC, CMS authorization, audit logging, trusted mutation policy, and business authorization
- `Strapi` remains out of scope for the production CMS path

### Prerender Follow-Up

**Original `NEXT_PRERENDER_INTERRUPTED` build blocker** — PARTIALLY RESOLVED. The specific request-bound API routes that previously stopped the build now call `await connection()` before touching auth headers, cookies, or request URLs:
- `/api/admin/capabilities`
- `/api/admin/cms/toggles`
- `/api/admin/i18n/status`
- `/api/admin/inventory`
- `/api/admin/orders`
- `/api/admin/preview-token`
- `/api/orders`
- `/api/pharmacist/customers/search`
- `/api/pharmacist/products/search`
- `/api/products`
- `/api/search`

**Current verification state**
- `yarn --cwd apps/next build --webpack` ?
- `yarn --cwd apps/next build --webpack --debug-prerender` still crashes on Windows with a `VirtualAlloc failed` worker exit after compile/typecheck, which now looks like a separate environment/memory issue rather than the original prerender bailout.

**Remaining architecture debt surfaced by the successful build**
- Build logs still show `BFF_FAIL` warnings for other API handlers that are being hit during page generation and still bail out on `request.headers` / `request.url`, especially admin/account APIs and `/api/cms/home`.
- That indicates there are still internal route-to-route calls or build-time fetch paths that should be moved toward direct service calls per `AGENTS.md`, even though the hard build stop has been cleared.

### Latest 004 Remediation

**Preview version correctness** — FIXED. `cms-preview.service.ts` now resolves explicit `versionId` previews via `getPageVersionById(...)` before falling back to latest-by-release lookup, so preview links point at the intended snapshot instead of drifting to newer drafts.

**Publish lifecycle delegation** — FIXED. `apps/next/app/api/admin/releases/[id]/publish/route.ts` now delegates release publication to `apps/next/server/services/cms/cms-publish.service.ts` instead of re-owning the publish logic in the route.

**Rollback route exposure** — ADDED. `apps/next/app/api/admin/releases/[id]/rollback/route.ts` now exposes the service-owned rollback flow, and shared client endpoints now include `adminReleaseRollback`.

**Homepage merchandising partial-failure safety** — FIXED. `cms-home-merchandising.service.ts` no longer treats partial Prisma query failure as canonical empty merchandising. Any failed merchandising subquery now returns `{ ok: false }`, preserving explicit mock fallback instead of blanking sections.

**Lifecycle cache invalidation** — FIXED. `cms-publish.service.ts` and `cms-rollback.service.ts` now invalidate `cms-home` via `revalidateTag(...)` after successful lifecycle changes.

**Dedicated lifecycle test files** — ADDED. `cms-preview.service.test.ts`, `cms-publish.service.test.ts`, and `cms-rollback.service.test.ts` now exist so the `004` task list no longer points at missing files.

### Verification After Audit Fixes
- `yarn guard:checks` ?
- `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false` ?
- `yarn --cwd apps/next test:api` ? (`148/148`)

### Current Blocker
- `yarn --cwd apps/next build --webpack --debug-prerender` ?
- Current failure is broader than `004`: the build still hits `NEXT_PRERENDER_INTERRUPTED` bailouts across authenticated/request-bound API routes that read `request.headers` or `request.url` during prerender analysis. `004` remediation landed, but the final build gate is still open at the repo level.

---

## Previous State: 004-production-cms Initial Implementation

**Last Updated**: 2026-04-13

**State**: All 11 phases from the `joyful-stirring-breeze.md` homepage redesign plan are implemented and verified. The homepage now features: warm rose color palette, unified hover interactions, normalized radius tiers, denser product rails, tiered section headers, scroll-reveal animations, and corrected accessibility contrast.

### All Phases Complete
- **Phase 9** — Token Foundation Fixes (6 files): brand font min, caption/label lineHeight, card brand weight, amber WCAG, sale price burgundy, surface warm, flash bg token, countdown white digits
- **Phase 10** — Quality Polish: unified hover system (ProductCard, CategoryStrip, BrandRail, OfferBannersGrid, Button), 3-tier radius normalization (2px?6px cards, 16px?12px hero), product image `contain?cover`
- **Phase 0** — TopPromoBar Demotion: black?roseBlush bg, weight 700?500, inverse?default tone
- **Phase 6** — Section Headers: tiered sizes (lg/28px serif, md/18px sans, sm/16px sans), eyebrow roseDeep on roseBlush (6:1 WCAG), meta weight 500
- **Phase 1** — Category Strip: ghost buttons?56px circles with icon/label below, removed header
- **Phase 3** — Product Rail Density: card width 240px?180px for 5-6 visible cards
- **Phase 7** — Brand Rail: replaced plain text with MarketplaceSectionHeader (size=sm), added `onPressViewAll`
- **Phase 4** — Hero Carousel: gradient 30%?40%/height 60%?70%, title/subtitle overlays (Playfair serif), CTA commercePrimary burgundy
- **Phase 5** — Section Spacing Rhythm: `getSectionGap()` helper with type-pair logic (hero?cat=16px, flash=40px, newsletter=64px, editorial=48px)
- **Phase 8** — Scroll Reveals: `RevealOnScroll` wrapper with staggered `delayMs=index*40`, `liftY=12`; hero/promo_strip skip
- **Phase 2** — Flash Deals Section: `HomeFlashDealsSection` component created (serif header + countdown + product rail); `FlashSaleBand` kept as fallback since CMS block has no products yet

### Pre-existing Type Errors Fixed
- `HeaderMainRow.tsx:303` — removed `style` from `Button`, wrapped child in `<Text>`
- `TopBrandsGrid.tsx:170` — added `as const` to `textAlign` and `maxWidth`

### Audit Finding Fixed
- `HeroSlideCard.tsx` had `rgba(0,0,0,0.40)` hardcoded ? replaced with `colors.black` + `opacity.overlayLight`

### Verification
- `yarn guard:checks` ? — all 15 checks passed
- `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false` ? — zero type errors

---

## Current State: Constitution Updated For Production CMS Direction

**Last Updated**: 2026-04-13

**State**: The repo constitution and `AGENTS.md` now explicitly codify the recommended production CMS direction for this codebase: keep the CMS in-repo on `Next.js + Prisma`, treat Prisma/Postgres as the canonical store for mutable admin-editable CMS content, route all CMS reads/writes through `apps/next/server/services`, and demote `packages/adapters/mock/cms` to seed/fallback/contract-fixture status only.

### Decision Landed
- Added constitutional principle XVII in `.specify/memory/constitution.md`: `In-Repo CMS Canonical Source of Truth`.
- Expanded constitution architecture constraints and definition-of-done checks so live storefront CMS paths cannot depend on mock CMS data as the production source of truth.
- Updated `AGENTS.md` non-negotiables and Layout-As-Data guidance to mirror the same permanent CMS rule.

### Immediate Follow-Up
- Future CMS migration work should move remaining storefront mock-backed CMS domains into Prisma-backed models plus service-layer normalization.
- Spec/plan/tasks templates were reviewed; no changes were required for this amendment.
- `.specify/templates/commands/` is not present in this repo, so there were no command templates to sync.

---

## Current State: Storefront Warning Cleanup Completed

**Last Updated**: 2026-04-13

**State**: The storefront design-system normalization pass is now followed by a browser-clean cleanup pass. `http://localhost:3000/en` reloads with `0` console errors and `0` console warnings after replacing remaining web `shadow*` usage and removing the animated native-driver fallback on web.

### Warning Cleanup Landed
- Replaced deprecated toast shadow props with tokenized `boxShadow` + elevation in `packages/ui/components/Toast.tsx`.
- Stopped requesting a native animated driver on web in `packages/ui/components/home-v2/AnnouncementTicker.tsx`.
- Converted remaining live storefront shared surfaces from web `shadow*` props to web-safe elevation usage:
  - `packages/ui/components/Card.tsx`
  - `packages/ui/components/ProductCard.tsx`
  - `packages/ui/components/chrome/HeaderMainRow.tsx`
  - `packages/ui/components/chrome/SearchPanel.tsx`

### Verification
- `yarn guard:checks` ?
- `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false` ?
- Browser QA on `http://localhost:3000/en` ?
  - `0` console errors
  - `0` console warnings

---

## Current State: Dead Code Cleanup (Strapi + real-cosmetics-admin)

**Last Updated**: 2026-04-12

**State**: Deleted `apps/strapi/` (dead scaffold) and `real-cosmetics-admin/` (disconnected prototype). Cleaned up references in `scripts/guard-hygiene.mjs` EXCLUDE_DIRS. Admin UI remains fully functional at `/admin` (login: `admin`/`admin`).

### Deletion Rationale
- `apps/strapi/`: Excluded from yarn workspaces (`"!apps/strapi"`), zero imports from `apps/next/` or `packages/`, no content types, no data flows.
- `real-cosmetics-admin/`: Standalone Vite app with `localStorage` only, zero HTTP connection to monorepo, not in workspaces.
- Real admin UI is at `apps/next/app/admin/` (60 files) — full sidebar navigation, CMS management, catalog, orders, etc.

### CMS Architecture (Working)
- Base data: `packages/adapters/mock/cms/index.ts`
- Admin overrides: Prisma-backed (`CmsToggleOverride`, `CmsBrandSpotlight`, `CmsOfferBanner`, etc.)
- Admin API routes: `apps/next/app/api/admin/` (78 endpoints)
- Admin UI: `apps/next/app/admin/` (sidebar layout with role-based access)

---

## Current State: 003 Platform Hygiene Remediation + Sprint 3 Service Boundary Cleanup

**Last Updated**: 2026-04-12

**State**: The broken `003-platform-hygiene-remediation` items were repaired, Sprint 1 and Sprint 2 remediation slices are landed, and Sprint 3 completed a first-pass storefront service boundary cleanup. Local verification is green and draft PR `#1` is open. Hosted CI confirmation still remains open.

## 2026-04-12 Sprint 3 Service Boundary Cleanup
- Added `apps/next/server/services/_lib/storefront-service-context.ts` as the first typed request-context helper for storefront read services.
- The helper now owns request-derived locale/store/preview/requestUrl derivation at the page or route boundary instead of inside the affected services.
- Migrated the approved storefront read slice:
  - `apps/next/server/services/orders/order-detail.service.ts`
  - `apps/next/server/services/pharmacist/pharmacist-bootstrap.service.ts`
  - `apps/next/server/services/product/product-page.service.ts`
  - `apps/next/server/services/search/search.service.ts`
- Updated page-boundary callers to construct context once and pass plain data into services:
  - `apps/next/app/orders/[id]/page.tsx`
  - `apps/next/app/product/[id]/page.tsx`
  - `apps/next/app/search/page.tsx`
  - `apps/next/app/pharmacist/_components/pharmacist-route-shell-data.ts`
- Important behavior note: this refactor intentionally preserved current CMS behavior. `getCachedHomeCmsResponseData(...)` still receives only `requestUrl`, so CMS locale/store semantics were not widened in this pass.
- Verification after Sprint 3:
  - `yarn guard:checks` ?
  - `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false` ?
  - `yarn --cwd apps/next test:api` ? (`124/124`)
- Expanded the same boundary pattern into home, home-layout, categories, cart, and checkout page services.
- Updated page boundaries for:
  - `apps/next/app/page.tsx`
  - `apps/next/app/shop/page.tsx`
  - `apps/next/app/sales/page.tsx`
  - `apps/next/app/categories/page.tsx`
  - `apps/next/app/cart/page.tsx`
  - `apps/next/app/checkout/page.tsx`
- Updated related service tests for the new context contract.
- Verification after Sprint 3 batch 2:
  - `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false` ?
  - `yarn --cwd apps/next test:api` ? (`124/124`)

## 003 Platform Hygiene Remediation - Current Summary

### Commits already on branch
1. `619fc9e` - chore: commit pending hygiene deletions from prior sessions (164 files deleted)
2. `57b2b8d` - feat(003): platform hygiene and agent-doc source-of-truth remediation (49 files changed)
3. `c1ebf17` - fix(003): fix test imports, function signatures, and hygiene guard exclusions (18 files changed)
4. `39751dc` - fix(003): fix public-discovery test async leak and guard-hygiene vendor test (2 files changed)
5. `301c9e5` - docs(003): finalize audit cleanup and verification state

### Repaired in the audit cleanup pass
- `scripts/check-agent-docs.mjs` now requires a real `## Source of Truth` heading within the first 30 lines of `AGENTS.md`.
- `scripts/guard-hygiene.mjs` now validates active `.gitignore` entries instead of allowing commented lines to pass.
- `.gitignore` now contains active `.cline/` coverage.
- `specs/003-platform-hygiene-remediation/ARTIFACT_INVENTORY.md` now exists and lists the 28 service files.
- Root `yarn test` now runs a real workspace test target via Turbo because `apps/next/package.json` now exposes `test`.
- `.github/workflows/ci.yml` no longer masks `test-unit` failures with `|| true`.
- Stale API and shape tests were aligned to the current service-layer architecture.
- `apps/next/app/api/admin/i18n/prefill/route.ts` now tolerates local audit-persistence failure instead of failing the endpoint when Prisma is unavailable.
- Root `AUDIT_REPORT.md` was removed to satisfy the hygiene guard and the original cleanup task.
- Duplicate `apps/next/middleware.ts` was removed so Next uses `apps/next/proxy.ts` as the single routing/auth entry.

### Verified clean locally
- `yarn guard:checks` - passed
- `yarn guard:hygiene` - passed
- `yarn guard:agent-docs` - passed
- `node --test scripts/guard-hygiene.test.mjs` - passed (6/6)
- `node --test scripts/check-agent-docs.test.mjs` - passed (6/6)
- `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false` - passed
- `node scripts/list-service-files.mjs --check-parity` - passed (28 service files covered)
- `yarn --cwd apps/next test:api` - passed (118/118)
- `yarn test` - passed and now executes real workspace tests
- `yarn e2e:a11y` - passed

### External follow-up still open
- Draft PR `#1`: https://github.com/mohdalsaqqal/my-solito-app/pull/1
- `T072` was not replayed locally because it requires the deliberate PR typecheck experiment.
- `T091` remains open until hosted GitHub checks finish and are confirmed green on PR `#1`.

### Durable `003` enforcement scripts
- `scripts/guard-hygiene.mjs`
- `scripts/check-agent-docs.mjs`
- `scripts/list-service-files.mjs`

### Audit Artifact
- Full repo audit report: docs/reports/repo-audit-2026-04-12.md

## 2026-04-12 Sprint 1 CI Trust Repair
- Removed unsupported standalone CI jobs `typecheck-app` and `typecheck-ui` from `.github/workflows/ci.yml`.
- Rewrote `docs/BRANCH_PROTECTION.md` to match the real hosted CI surface: 9 required checks instead of the stale 11-check narrative.
- Deleted exploratory `packages/app/tsconfig.json` and `packages/ui/tsconfig.json` additions after they exposed substantial genuine type debt rather than a safe CI fix.
- Fixed service callsites to pass `request.url` into `getCachedHomeCmsResponseData(...)` in:
  - `apps/next/server/services/orders/order-detail.service.ts`
  - `apps/next/server/services/pharmacist/pharmacist-bootstrap.service.ts`
  - `apps/next/server/services/product/product-page.service.ts`
  - `apps/next/server/services/search/search.service.ts`
- Verification after the fix:
  - `yarn guard:checks` ?
  - `yarn guard:hygiene` ?
  - `yarn guard:agent-docs` ?
  - `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false` ?
  - `yarn --cwd apps/next test:api` ? (`118/118`)
  - `yarn e2e:a11y` ?
- Follow-up note: package-level shared TypeScript boundaries remain a future hardening track; branch protection should stay aligned to the 9 credible hosted checks until those compile targets are designed and made green.

## 2026-04-12 Sprint 2 Security Hardening
- Upgraded auth session cookies from signed-readable payloads to encrypted stateless payloads using AES-256-GCM.
- Added compatibility parsing for legacy signed cookies so existing sessions do not fail immediately during rollout.
- Centralized cookie extraction with `readAuthSessionCookieValue(...)` and reused it across API/session/service callsites.
- Updated `apps/next/proxy.ts` to understand the encrypted cookie format for route gating.
- Hardened rate-limit keying:
  - explicit actor keys when available
  - stronger proxy IP resolution (`cf-connecting-ip`, `x-vercel-forwarded-for`, `x-forwarded-for`, `x-real-ip`)
  - stable fingerprint fallback when IP is unavailable
- Refactored rate limiting to accept an injected store via `RateLimitStore` / `MemoryRateLimitStore`, preserving current route contracts while opening a path to shared backing stores later.
- Added coverage in:
  - `apps/next/app/api/_lib/auth-session.test.ts`
  - `apps/next/app/api/_lib/rate-limiter.test.ts`
- Verification:
  - `yarn guard:checks` ?
  - `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false` ?
  - `yarn --cwd apps/next test:api` ? (`122/122`)

## 2026-04-12 Sprint 2 Shared Rate-Limit Backend
- Added explicit backend switch via `RATE_LIMIT_STORE=memory|prisma` in `.env.example`.
- Implemented Prisma-backed rate limiting using the existing Postgres/Prisma stack with a dedicated `RateLimitBucket` table.
- Added migration: `apps/next/prisma/migrations/20260412073000_rate_limit_buckets/migration.sql`.
- Added `RateLimitBucket` model to `apps/next/prisma/schema.prisma`.
- `apps/next/app/api/_lib/rate-limiter.ts` now supports:
  - `MemoryRateLimitStore`
  - Prisma-backed shared storage when `RATE_LIMIT_STORE=prisma`
  - safe fallback to memory with a warning if Prisma store access fails
- Auth routes continue to use the same API surface while now awaiting async limiter operations.
- Verification:
  - `yarn guard:checks` ?
  - `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false` ?
  - `yarn --cwd apps/next test:api` ? (`123/123`)

## 2026-04-13 Design System Foundations Realigned

**State**: The token layer now reflects the five-principle design-system guidance the team wants to follow: semantic color roles plus a primary shade ramp, a canonical semantic type scale, a canonical 4px spacing grid, and motion tokens that distinguish hover, interaction, enter, and exit behavior. Shared Latin font tokens now point to `Manrope`, matching the Next app shell.

### Landed
- Added semantic display/heading/body/small typography tokens in `packages/tokens/typography.ts` while preserving compatibility aliases used by existing components.
- Switched token font families from `DM Sans` to `Manrope` and aligned web globals with `--font-sans`.
- Added `primary900` through `primary100` plus supporting semantic card/popover/destructive aliases in `packages/tokens/colors.ts`.
- Added canonical `space1` through `space32` entries on a 4px grid in `packages/tokens/spacing.ts` while preserving existing numeric aliases.
- Updated `packages/tokens/motion.ts` to reflect purposeful motion guidance:
  - hover: `100ms`
  - interaction: `200ms`
  - medium surfaces: `300ms`
  - ease-out for enter
  - ease-in for exit
  - ease-in-out for standard interactive motion
- Regenerated `packages/ui/generated-token-bridge.css` and updated `apps/next/app/globals.css` to consume the new font and motion variables.
- Cleaned a pre-existing shared-package guard violation in `packages/ui/components/chrome/AuthDrawer.tsx`.

### Verification
- `node scripts/generate-css-token-bridge.mjs` ?
- `yarn guard:checks` ?

## 2026-04-13 Shared UI Normalization Pass
- Refined high-impact shared reusables to better reflect the new design-system guidance:
  - `packages/ui/reusables/button.tsx`
  - `packages/ui/reusables/input.tsx`
  - `packages/ui/reusables/badge.tsx`
  - `packages/ui/reusables/card.tsx`
- Updated visible shared product-facing components for clearer hierarchy and spacing rhythm:
  - `packages/ui/components/SectionHeading.tsx`
  - `packages/ui/components/SearchField.tsx`
  - `packages/ui/components/Badge.tsx`
- Re-aligned `AuthDrawer` again so the shared-package token guard and Next typecheck both pass after the token changes.
- Verification:
  - `yarn guard:checks` ?
  - `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false` ?

## 2026-04-13 Chrome Normalization Pass
- Extended the second-pass normalization into high-traffic shared chrome:
  - `packages/ui/components/chrome/HeaderMainRow.tsx`
  - `packages/ui/components/chrome/AuthDrawer.tsx`
  - `packages/ui/components/chrome/FooterColumns.tsx`
  - `packages/ui/components/chrome/FooterNewsletter.tsx`
  - `packages/ui/components/chrome/FooterAccordion.tsx`
  - `packages/ui/components/chrome/FooterLegalRow.tsx`
- Header actions now use cleaner spacing rhythm and medium underline timing.
- Header search fields now use the taller semantic input treatment.
- Footer hierarchy now leans on overline/body/caption roles instead of older footer/meta drift.
- AuthDrawer spacing and motion were tightened to reflect the canonical 4px rhythm and interactive timing tokens.
- Verification:
  - `yarn guard:checks` ?
  - `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false` ?

## 2026-04-13 Storefront Search/Cart Normalization
- Extended chrome normalization into discovery and cart interaction surfaces:
  - `packages/ui/components/chrome/SearchOverlay.tsx`
  - `packages/ui/components/chrome/SearchPanel.tsx`
  - `packages/ui/components/chrome/CartDrawer.tsx`
  - `packages/ui/components/chrome/MiniSearchBar.tsx`
- Search overlay and panel now use the updated spacing rhythm and interaction timing more consistently.
- Cart drawer header, progress area, item list spacing, and sticky footer now better reflect the semantic type/spacing system.
- Verification:
  - `yarn guard:checks` ?
  - `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false` ?

## 2026-04-13 Merchandising Rail Normalization
- Extended the design-system pass into shared merchandising surfaces:
  - `packages/ui/components/home/HomeHeroRail.tsx`
  - `packages/ui/components/home/HomeProductRail.tsx`
  - `packages/ui/components/home-v2/ProductRail.tsx`
  - `packages/ui/components/home-v2/OfferBannersGrid.tsx`
  - `packages/ui/components/CampaignCard.tsx`
  - `packages/ui/components/ProductCard.tsx`
- Tightened rail gaps, section spacing, badge offsets, price/rating rhythm, and banner CTA timing to better reflect the semantic spacing and motion contract.
- Verification:
  - `yarn guard:checks` ?
  - `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false` ?

## 2026-04-13 Editorial Home-V2 Normalization
- Extended the shared UI normalization into the larger editorial home-v2 sections:
  - `packages/ui/components/home-v2/BrandSpotlightSection.tsx`
  - `packages/ui/components/home-v2/CampaignHeroBlock.tsx`
  - `packages/ui/components/home-v2/CompleteSetBlock.tsx`
  - `packages/ui/components/home-v2/TestimonialsBlock.tsx`
  - `packages/ui/components/home-v2/EditorialHotspotSection.tsx`
- Tightened section gaps, inner spacing, and interactive timing so these larger storytelling surfaces better match the normalized token system.
- Verification:
  - `yarn guard:checks` ?
  - `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false` ?

## 2026-04-13 Final Home-V2 Module Sweep
- Finished the remaining smaller home-v2 storefront modules:
  - `packages/ui/components/home-v2/TopBrandsGrid.tsx`
  - `packages/ui/components/home-v2/FlashSaleBand.tsx`
  - `packages/ui/components/home-v2/NewsletterLoyaltyCta.tsx`
  - `packages/ui/components/home-v2/PromoDealBannerRow.tsx`
  - `packages/ui/components/home-v2/UgcGallery.tsx`
- Tightened spacing rhythm and CTA/hover timing so the smaller merchandising/community modules match the same normalized system as the larger sections.
- Verification:
  - `yarn guard:checks` ?
  - `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false` ?

## 2026-04-13 Storefront Visual QA
- Launched the Next dev server with `yarn web` and visually checked `http://localhost:3000/en`.
- Captured full-page screenshots before and after a final small polish pass.
- Additional mobile-style polish landed in:
  - `packages/ui/components/home-v2/NewsletterLoyaltyCta.tsx`
  - `packages/ui/components/home-v2/TopBrandsGrid.tsx`
- Current browser state:
  - Page loads successfully
  - No console errors
  - Two warnings remain:
    - deprecated `shadow*` style props warning
    - `useNativeDriver` fallback warning from animated module support
- Verification after visual QA polish:
  - `yarn guard:checks` ?
  - `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false` ?

---

## 2026-04-22 Git Hygiene Cleanup

**State**: Root `.gitignore` was replaced with a monorepo-safe ignore set for Next.js, Expo, Node, generated caches, Graphify output, temp data, logs, local DBs, and AI tool workspaces.

### Landed
- `.gitignore` now ignores `graphify-out`, nested `graphify-out`, `.tmp`, `.data`, `.cache`, generated logs, local DBs, `.claude`, `.agents`, `.agent`, Playwright logs, Next/Expo build output, and dependency caches.
- Tracked generated/local files were removed from the Git index with `git rm --cached`, leaving local files intact.
- Stale deleted scaffolds were removed from the index: `apps/strapi`, `real-cosmetics-admin`, and `src/Figma`.

### Verification
- `git check-ignore -v` confirms the noisy generated paths are ignored.
- `git status --short --untracked-files=no` completed in about `0.27s` after the cleanup.

---

## 2026-04-22 Better Auth Redo Audit

**State**: Better Auth audit was redone with `AGENTS.md` read first, then memory files, `docs/architecture-index.md`, root graphify, and bounded contexts for `apps-next-api`, `apps-next-services`, and `packages-providers`.

### Status
- `/caveman`: inactive
- `graphify`: checked

### Result
- Original remediated findings still hold for login/register/logout/session routes, password reset API delegation, checkout quote mutation hardening, and order placement session resolution.
- New P1 finding: live page/bootstrap services still call `authProvider.getSession()`, which is the development-only mock auth provider, for account, account test detail, checkout page, order detail, and pharmacist bootstrap data.
- New P2 finding: Better Auth password reset fallback redirect points to `/reset-password`, but the actual App Router page is `/auth/reset-password`.
- Report updated: `docs/reports/better-auth-audit-2026-04-22.md`.

### Verification
- Redo audit did not rerun test/typecheck suites because it only updated audit documentation and memory.

### 2026-04-22 Better Auth Redo Audit Findings Fixed

**Status**: LANDED.

- `StorefrontServiceContext` now preserves request headers and exposes `createStorefrontServiceRequest(...)` for server services that need auth-aware request reconstruction.
- Account, account test detail, checkout page, order detail, and pharmacist bootstrap services now resolve sessions through `resolveNormalizedSessionFromRequest(...)` instead of `authProvider.getSession()`.
- Source search confirms no remaining `authProvider.getSession()` calls under `apps/next/server/services`.
- `BETTER_AUTH_PASSWORD_RESET_FALLBACK_PATH` now points to `/auth/reset-password`, matching the actual App Router page.
- Password reset route test expectation was updated to the corrected fallback URL.

**Verification**
- Focused tests passed: `24/24`.
- `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false` ?
- `yarn guard:checks` ?

---

## 2026-04-22 AGENTS Caveman Startup Rule

**Status**: LANDED.

- `AGENTS.md` version bumped to `v4.4`.
- Mandatory Startup Protocol now requires agents to activate `C:\Users\hamoo\.agents\skills\caveman\SKILL.md` as step `0`, before memory files, AGENTS, architecture index, or graphify.
- Mandatory Startup Status now reports `/caveman: active` when Caveman was activated by the startup protocol.
- Navigation Order now starts with the Caveman skill.

---

## 2026-04-30 Aspect 05 Backend Integration - Order Write-Back Contract

**Status**: LANDED.

- Expanded `docs/delivery/runbooks/odoo-connection.md` with the Odoo/custom merchant backend order write-back contract.
- The contract now covers `OrderProvider.place`, required outbound order fields, idempotency, status mapping, payment settlement separation, failure behavior, and live verification steps.
- Added static smoke assertions to `scripts/smoke-odoo-connection.mjs` so the Odoo handoff cannot regress to catalog-only documentation.
- Updated `docs/delivery/aspects/05-backend-integration.md` and `checklist.md` to mark the order write-back expectations done while keeping live Odoo verification, Shopify, custom PostgreSQL, and Meilisearch open.

**Verification**
- `node scripts/smoke-odoo-connection.mjs` passed.
- `node scripts/guard-checks.mjs` passed.

---

## 2026-04-30 Aspect 05 Backend Integration - Retention Persistence Path

**Status**: LANDED.

- Added `docs/delivery/runbooks/retention-consultation-persistence.md` for referral profiles/ledger, loyalty wallet/history, and pharmacist consultation/test persistence.
- Documented tenant scoping, production store ownership, referral idempotency, loyalty rollback rules, and pharmacist web-only/customer mobile-read boundaries.
- Updated `scripts/verify-retention-consultation.mjs` to statically verify the persistence runbook and questionnaire service path before running focused tests.
- Fixed `apps/next/server/services/pharmacist/pharmacist-consultation.service.ts` so questionnaire answers are preserved when submitting/drafting consultations.
- Updated focused pharmacist service test coverage.

**Verification**
- `yarn verify:retention-consultation` passed: 28/28.
- `node scripts/guard-checks.mjs` passed.

---

## 2026-04-30 Aspect 05 Backend Integration - Shopify Scope

**Status**: LANDED.

- Added `docs/delivery/runbooks/shopify-adapter-scope.md`.
- Added `scripts/smoke-shopify-adapter-scope.mjs` and root script `yarn verify:shopify-scope`.
- Added Shopify env placeholders to `.env.example`.
- Updated Aspect 05 and checklist status to mark scope definition complete while leaving adapter implementation open.

**Verification**
- `yarn verify:shopify-scope` passed.
- `node scripts/guard-checks.mjs` passed.

---

## 2026-04-30 Aspect 05 Backend Integration - Custom PostgreSQL Mapping

**Status**: LANDED.

- Added `docs/delivery/runbooks/custom-postgresql-adapter-mapping.md`.
- Added `scripts/smoke-postgresql-adapter-mapping.mjs` and root script `yarn verify:postgresql-mapping`.
- Added merchant PostgreSQL env placeholders to `.env.example`.
- Updated Aspect 05 and checklist status to mark mapping definition complete while leaving adapter implementation open.

**Verification**
- `yarn verify:postgresql-mapping` passed.
- `node scripts/guard-checks.mjs` passed.

---

## 2026-04-30 Aspect 05 Backend Integration - Meilisearch Adapter

**Status**: LANDED.

- Added `packages/adapters/meilisearch/index.ts` implementing `SearchProvider`.
- Wired provider registry to select Meilisearch when `USE_MEILISEARCH=true` and `MEILISEARCH_HOST` are configured.
- Added `docs/delivery/runbooks/meilisearch-adapter.md`, `scripts/smoke-meilisearch-adapter.mjs`, focused adapter tests, env placeholders, and root script `yarn verify:meilisearch-adapter`.
- Updated Aspect 05 and checklist to mark the adapter done while leaving indexing pipeline/facet config/live health as open production search work.
- Added the Aspect 05 backend profile to `scripts/verify-delivery.mjs` and `docs/delivery/DELIVERY_MATRIX.md`.

**Verification**
- `yarn verify:meilisearch-adapter` passed: 2/2 adapter tests.
- `node scripts/guard-checks.mjs` passed.
- `node --max-old-space-size=4096 node_modules/typescript/bin/tsc -p apps/next/tsconfig.json --noEmit --incremental false` passed.
- `node scripts/verify-delivery.mjs --profile backend` passed.

---

## 2026-04-30 Aspect 06 User & Account Management

**Status**: LANDED.

- Added Prisma tenant membership model: `Tenant`, `TenantUser`, and migration `20260430180000_tenant_user_membership`.
- Added `docs/delivery/runbooks/user-account-management.md`.
- Added `scripts/verify-account-management.mjs`, root script `yarn verify:account-management`, and delivery profile `account`.
- Strengthened account page and account test detail tests to assert real account surfaces instead of swallowing failures.
- Added `questionnaire` to shared app `AccountTestDetail`.
- Documented OAuth setup direction and env placeholders; activation remains client-choice dependent.
- Updated Aspect 06, checklist, delivery matrix, and memory.

**Verification**
- `yarn verify:account-management` passed: 14/14.
- `node scripts/verify-delivery.mjs --profile account` passed.
- `node --max-old-space-size=4096 node_modules/typescript/bin/tsc -p apps/next/tsconfig.json --noEmit --incremental false` passed.
- `yarn --cwd apps/next prisma validate` passed.
## 2026-05-01 Aspect 11 DevOps Deployment Gate

**Status**: GREEN. Local deploy-readiness gate and deploy profile pass.

### Completed This Session

- Added `docs/delivery/runbooks/staging-deployment.md` for Vercel staging, DB migrate, Expo preview, adapter readiness, staging verification, and rollback.
- Added `scripts/verify-devops-deployment.mjs` and root script `yarn verify:devops-deployment`.
- Added `devops-deployment` gate plus `deploy` profile in `scripts/verify-delivery.mjs`.
- Added root script `yarn verify:delivery:deploy`.
- Fixed `scripts/new-client.ts` so advertised `--output` works and generated client checklist includes staging/quality verification.

### Verification

- `yarn verify:devops-deployment`: PASS.
- `node scripts/verify-delivery.mjs --profile deploy`: PASS, including guard checks, Next typecheck, DevOps smoke, and production Next build.

### Remaining

- Real Vercel project/env setup, EAS preview build, store credentials, production domain verification, and live deployment promotion remain credential-gated.
## 2026-05-01 Aspect 12 Operations Observability Gate

**Status**: GREEN. Local operations profile passes.

### Completed This Session

- Added `GET /api/health` route.
- Added operations health service reporting runtime, provider readiness, search health, and notification status.
- Added focused health service test.
- Added uptime monitoring and incident response runbooks.
- Linked operations runbooks from operator handbook.
- Added `yarn verify:operations-observability` and operations delivery profile.

### Verification

- `yarn verify:operations-observability`: PASS.
- `node scripts/verify-delivery.mjs --profile operations`: PASS, including guard checks, Next typecheck, and operations smoke.

### Remaining

- Sentry, centralized logging vendor, hosted uptime checks, alert routing, and provider health dashboard remain vendor/credential or future UI work.

## 2026-05-05 Vercel Preview Deployment Continuation

**Status**: DEPLOYED, externally access-gated.

- Vercel Preview remains Ready at `https://my-solito-gzefksc8i-moes-projects-cfd9e85f.vercel.app` (`dpl_DSDncbFqbRiapFazQEwaxopHJuGV`).
- Public unauthenticated browser/fetch requests are intercepted by Vercel Deployment Protection before they reach Next.js.
- `vercel curl /api/health --deployment https://my-solito-gzefksc8i-moes-projects-cfd9e85f.vercel.app` reaches the protected deployment path.
- Direct CLI login reaches the app when tunneled through Vercel, but app auth rejects non-browser-like context as `AUTH_UNTRUSTED_REQUEST`.
- Local deploy readiness remains green: Next typecheck, `node scripts/verify-devops-deployment.mjs`, and `yarn verify:delivery --profile deploy` pass.

