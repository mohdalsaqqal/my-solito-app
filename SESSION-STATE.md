# SESSION-STATE.md - Active Working Memory

## Current State: 005-better-auth — Foundation Implemented, Safe Hardening Pass Landed

**Last Updated**: 2026-04-14

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

**Spec Kit sync** — LANDED. `specs/005-better-auth/` now reflects the real implementation approach instead of the earlier generic migration draft:
- [spec.md](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/specs/005-better-auth/spec.md) is now `In Progress` and includes release-secret enforcement plus prerender-compatibility requirements
- [plan.md](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/specs/005-better-auth/plan.md) now records the landed Better Auth foundation and the safe hardening pass
- [tasks.md](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/specs/005-better-auth/tasks.md) now includes explicit completed US3 tasks for release-secret hardening, env/CI/doc sync, and prerender-noise cleanup

### Verification
- `yarn guard:checks` ✅
- `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false` ✅
- `yarn --cwd apps/next prisma:generate` ✅
- targeted auth tests ✅
- `yarn --cwd apps/next test:api` ✅ (`159/159`)
- `yarn --cwd apps/next build --webpack` ✅
- `yarn --cwd apps/next build --webpack --debug-prerender` ✅

### Remaining Follow-Up
- Production/staging must set a real high-entropy `BETTER_AUTH_SECRET`; release-like envs now fail closed instead of silently falling back
- Debug prerender no longer floods with expected bailout logs, but deeper route-to-route/request-state coupling still exists and should be reduced by moving more internal fetch paths to direct service calls
- Explicit Better Auth vs legacy-session observability is not implemented yet
- Legacy compatibility read paths remain intentionally in place during cutover and should be removed only after rollout confidence is high

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
- `yarn --cwd apps/next build --webpack` ✅
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
- `yarn guard:checks` ✅
- `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false` ✅
- `yarn --cwd apps/next test:api` ✅ (`148/148`)

### Current Blocker
- `yarn --cwd apps/next build --webpack --debug-prerender` ❌
- Current failure is broader than `004`: the build still hits `NEXT_PRERENDER_INTERRUPTED` bailouts across authenticated/request-bound API routes that read `request.headers` or `request.url` during prerender analysis. `004` remediation landed, but the final build gate is still open at the repo level.

---

## Previous State: 004-production-cms Initial Implementation

**Last Updated**: 2026-04-13

**State**: All 11 phases from the `joyful-stirring-breeze.md` homepage redesign plan are implemented and verified. The homepage now features: warm rose color palette, unified hover interactions, normalized radius tiers, denser product rails, tiered section headers, scroll-reveal animations, and corrected accessibility contrast.

### All Phases Complete
- **Phase 9** — Token Foundation Fixes (6 files): brand font min, caption/label lineHeight, card brand weight, amber WCAG, sale price burgundy, surface warm, flash bg token, countdown white digits
- **Phase 10** — Quality Polish: unified hover system (ProductCard, CategoryStrip, BrandRail, OfferBannersGrid, Button), 3-tier radius normalization (2px→6px cards, 16px→12px hero), product image `contain→cover`
- **Phase 0** — TopPromoBar Demotion: black→roseBlush bg, weight 700→500, inverse→default tone
- **Phase 6** — Section Headers: tiered sizes (lg/28px serif, md/18px sans, sm/16px sans), eyebrow roseDeep on roseBlush (6:1 WCAG), meta weight 500
- **Phase 1** — Category Strip: ghost buttons→56px circles with icon/label below, removed header
- **Phase 3** — Product Rail Density: card width 240px→180px for 5-6 visible cards
- **Phase 7** — Brand Rail: replaced plain text with MarketplaceSectionHeader (size=sm), added `onPressViewAll`
- **Phase 4** — Hero Carousel: gradient 30%→40%/height 60%→70%, title/subtitle overlays (Playfair serif), CTA commercePrimary burgundy
- **Phase 5** — Section Spacing Rhythm: `getSectionGap()` helper with type-pair logic (hero→cat=16px, flash=40px, newsletter=64px, editorial=48px)
- **Phase 8** — Scroll Reveals: `RevealOnScroll` wrapper with staggered `delayMs=index*40`, `liftY=12`; hero/promo_strip skip
- **Phase 2** — Flash Deals Section: `HomeFlashDealsSection` component created (serif header + countdown + product rail); `FlashSaleBand` kept as fallback since CMS block has no products yet

### Pre-existing Type Errors Fixed
- `HeaderMainRow.tsx:303` — removed `style` from `Button`, wrapped child in `<Text>`
- `TopBrandsGrid.tsx:170` — added `as const` to `textAlign` and `maxWidth`

### Audit Finding Fixed
- `HeroSlideCard.tsx` had `rgba(0,0,0,0.40)` hardcoded → replaced with `colors.black` + `opacity.overlayLight`

### Verification
- `yarn guard:checks` ✅ — all 15 checks passed
- `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false` ✅ — zero type errors

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
- `yarn guard:checks` ✅
- `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false` ✅
- Browser QA on `http://localhost:3000/en` ✅
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
  - `yarn guard:checks` ✅
  - `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false` ✅
  - `yarn --cwd apps/next test:api` ✅ (`124/124`)
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
  - `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false` ✅
  - `yarn --cwd apps/next test:api` ✅ (`124/124`)

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
  - `yarn guard:checks` ✅
  - `yarn guard:hygiene` ✅
  - `yarn guard:agent-docs` ✅
  - `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false` ✅
  - `yarn --cwd apps/next test:api` ✅ (`118/118`)
  - `yarn e2e:a11y` ✅
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
  - `yarn guard:checks` ✅
  - `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false` ✅
  - `yarn --cwd apps/next test:api` ✅ (`122/122`)

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
  - `yarn guard:checks` ✅
  - `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false` ✅
  - `yarn --cwd apps/next test:api` ✅ (`123/123`)

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
- `node scripts/generate-css-token-bridge.mjs` ✅
- `yarn guard:checks` ✅

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
  - `yarn guard:checks` ✅
  - `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false` ✅

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
  - `yarn guard:checks` ✅
  - `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false` ✅

## 2026-04-13 Storefront Search/Cart Normalization
- Extended chrome normalization into discovery and cart interaction surfaces:
  - `packages/ui/components/chrome/SearchOverlay.tsx`
  - `packages/ui/components/chrome/SearchPanel.tsx`
  - `packages/ui/components/chrome/CartDrawer.tsx`
  - `packages/ui/components/chrome/MiniSearchBar.tsx`
- Search overlay and panel now use the updated spacing rhythm and interaction timing more consistently.
- Cart drawer header, progress area, item list spacing, and sticky footer now better reflect the semantic type/spacing system.
- Verification:
  - `yarn guard:checks` ✅
  - `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false` ✅

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
  - `yarn guard:checks` ✅
  - `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false` ✅

## 2026-04-13 Editorial Home-V2 Normalization
- Extended the shared UI normalization into the larger editorial home-v2 sections:
  - `packages/ui/components/home-v2/BrandSpotlightSection.tsx`
  - `packages/ui/components/home-v2/CampaignHeroBlock.tsx`
  - `packages/ui/components/home-v2/CompleteSetBlock.tsx`
  - `packages/ui/components/home-v2/TestimonialsBlock.tsx`
  - `packages/ui/components/home-v2/EditorialHotspotSection.tsx`
- Tightened section gaps, inner spacing, and interactive timing so these larger storytelling surfaces better match the normalized token system.
- Verification:
  - `yarn guard:checks` ✅
  - `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false` ✅

## 2026-04-13 Final Home-V2 Module Sweep
- Finished the remaining smaller home-v2 storefront modules:
  - `packages/ui/components/home-v2/TopBrandsGrid.tsx`
  - `packages/ui/components/home-v2/FlashSaleBand.tsx`
  - `packages/ui/components/home-v2/NewsletterLoyaltyCta.tsx`
  - `packages/ui/components/home-v2/PromoDealBannerRow.tsx`
  - `packages/ui/components/home-v2/UgcGallery.tsx`
- Tightened spacing rhythm and CTA/hover timing so the smaller merchandising/community modules match the same normalized system as the larger sections.
- Verification:
  - `yarn guard:checks` ✅
  - `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false` ✅

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
  - `yarn guard:checks` ✅
  - `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false` ✅
