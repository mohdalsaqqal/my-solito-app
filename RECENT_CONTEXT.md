# RECENT_CONTEXT.md — Auto-Updated Highlights

## Last Session: Better Auth Production Hardening Follow-Up Landed

**Date**: 2026-04-14

### What Was Done
The safe production-ready follow-up for Better Auth landed. The repo now enforces a dedicated strong `BETTER_AUTH_SECRET` in release-like environments, seeds that contract in CI and local examples, and cleans up expected debug-prerender bailout noise so the real remaining route-coupling debt is easier to see.

### Output
- Updated [apps/next/app/api/_lib/security-policy.ts](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/api/_lib/security-policy.ts)
- Updated [apps/next/lib/auth.ts](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/lib/auth.ts)
- Updated [apps/next/app/api/_lib/request-auth.ts](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/api/_lib/request-auth.ts)
- Updated [apps/next/app/api/_lib/response.ts](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/api/_lib/response.ts)
- Updated request-bound routes:
  - [api/auth/session/route.ts](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/api/auth/session/route.ts)
  - [api/cms/home/route.ts](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/api/cms/home/route.ts)
  - [api/reviews/route.ts](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/api/reviews/route.ts)
- Updated env/docs/CI surfaces:
  - [.env.example](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/.env.example)
  - [.github/workflows/ci.yml](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/.github/workflows/ci.yml)
  - [docs/adapter-integration-guide.md](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/docs/adapter-integration-guide.md)
  - [docs/production-blueprint.md](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/docs/production-blueprint.md)
- Expanded auth hardening coverage:
  - [auth-session.test.ts](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/api/_lib/auth-session.test.ts)
  - [auth/route.test.ts](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/api/auth/route.test.ts)

### Verification
- ✅ `yarn guard:checks`
- ✅ `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false`
- ✅ `yarn --cwd apps/next test:api`
- ✅ `yarn --cwd apps/next build --webpack`
- ✅ `yarn --cwd apps/next build --webpack --debug-prerender`

### Remaining Follow-Up
- production and staging must set a real high-entropy `BETTER_AUTH_SECRET`
- legacy-session compatibility is still intentionally readable during cutover
- deeper route-to-service cleanup is still worth doing, but it is no longer a ship blocker for the safe hardening pass

### Planning Sync
- Updated [specs/005-better-auth/spec.md](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/specs/005-better-auth/spec.md), [plan.md](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/specs/005-better-auth/plan.md), and [tasks.md](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/specs/005-better-auth/tasks.md) so Spec Kit matches the real Better Auth rollout and hardening approach

## Last Session: Better Auth Foundation Implemented

**Date**: 2026-04-14

### What Was Done
The Better Auth migration moved from planning into implementation. The repo now has Better Auth config, Prisma auth tables, a normalized auth adapter layer, Better Auth-backed auth routes, and adapter-backed `request-auth.ts` helpers with legacy-session fallback for cutover safety.

### Output
- Added [apps/next/lib/auth.ts](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/lib/auth.ts)
- Added [apps/next/server/services/auth/auth-session-adapter.service.ts](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/server/services/auth/auth-session-adapter.service.ts)
- Added [apps/next/server/services/auth/auth-role-resolution.service.ts](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/server/services/auth/auth-role-resolution.service.ts)
- Added [apps/next/prisma/migrations/20260414103000_better_auth_foundation/migration.sql](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/prisma/migrations/20260414103000_better_auth_foundation/migration.sql)
- Updated auth routes and request helpers under `apps/next/app/api/auth/**` and `apps/next/app/api/_lib/request-auth.ts`
- Added Better Auth-focused tests in:
  - [auth-session-adapter.service.test.ts](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/server/services/auth/auth-session-adapter.service.test.ts)
  - [request-auth.test.ts](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/api/_lib/request-auth.test.ts)
  - [route.test.ts](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/api/auth/route.test.ts)
  - [session-resolver.test.ts](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/api/auth/session/session-resolver.test.ts)

### Verification
- ✅ `yarn guard:checks`
- ✅ `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false`
- ✅ `yarn --cwd apps/next test:api`
- ✅ `yarn --cwd apps/next build --webpack`
- ✅ `yarn --cwd apps/next build --webpack --debug-prerender`

### Remaining Follow-Up
- production/staging must use a strong `BETTER_AUTH_SECRET`
- legacy-session read compatibility still exists intentionally during cutover

## Last Session: Better Auth Migration Plan Added

**Date**: 2026-04-14

### What Was Done
A repo-specific migration plan was added for moving from the current custom auth/session layer to `Better Auth` while preserving the app-owned admin and CMS authorization model.

### Output
- Added [2026-04-14-better-auth-migration-plan.md](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/docs/plans/2026-04-14-better-auth-migration-plan.md)
- Added [2026-04-14-better-auth-migration-backlog.md](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/docs/plans/2026-04-14-better-auth-migration-backlog.md)
- Linked the plan from [production-blueprint.md](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/docs/production-blueprint.md)
- Added full Spec Kit feature set under [specs/005-better-auth](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/specs/005-better-auth)

### Key Decision
- `Better Auth` is the recommended authentication upgrade path
- custom app-owned RBAC stays in place
- `Strapi` is still not part of the recommended production stack

## Last Session: Next Prerender API Blocker Unwound

**Date**: 2026-04-14

### What Was Done
The `NEXT_PRERENDER_INTERRUPTED` build blocker was traced to request-bound API routes under `apps/next/app/api` being analyzed during build while still touching `request.headers`, cookies, or `request.url` without first declaring a request-bound boundary compatible with `cacheComponents`.

### Fix Landed
- Added `await connection()` from `next/server` at the top of the previously failing GET handlers:
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
- Confirmed that `dynamic = 'force-dynamic'` is not allowed here because this repo keeps `cacheComponents` enabled

### Verification
- ✅ `yarn --cwd apps/next build --webpack`

### Remaining Follow-Up
- `--debug-prerender` still crashes on Windows with a `VirtualAlloc failed` worker exit after compile/typecheck
- Build logs still show `BFF_FAIL` warnings from other route handlers that are being hit during build and still bail out on request-bound access, which points to broader service-vs-route coupling debt rather than the original hard build stop

## Last Session: 004 Production CMS Audit Remediation Landed

**Date**: 2026-04-14

### What Was Done
The `004-production-cms` feature was not actually complete, so the implementation pass did not skip it. The remaining audit gaps were fixed across the CMS preview, publish, rollback, merchandising, and admin release layers.

### Key Fixes
- **Preview correctness fixed** — `cms-preview.service.ts` now resolves explicit `versionId` previews via `getPageVersionById(...)` before falling back to latest release lookup
- **Publish flow moved behind services** — `apps/next/app/api/admin/releases/[id]/publish/route.ts` now delegates to `apps/next/server/services/cms/cms-publish.service.ts`
- **Rollback operator path exposed** — added `apps/next/app/api/admin/releases/[id]/rollback/route.ts` plus shared client endpoint support
- **Merchandising fallback safety fixed** — `cms-home-merchandising.service.ts` no longer treats partial Prisma failures as canonical empty merchandising; failed subqueries now return `{ ok: false }` so the explicit fallback path remains intact
- **Lifecycle cache invalidation added** — publish and rollback now call `revalidateTag('cms-home', 'max')`
- **Missing lifecycle tests added** — created dedicated `cms-preview.service.test.ts`, `cms-publish.service.test.ts`, and `cms-rollback.service.test.ts`

### Verification
- ✅ `yarn guard:checks`
- ✅ `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false`
- ✅ `yarn --cwd apps/next test:api` (`148/148`)

### Open Blocker
- ❌ `yarn --cwd apps/next build --webpack --debug-prerender`
- The current failure is broader than `004`: Next prerender analysis still interrupts on multiple authenticated/request-bound API routes that read `request.headers` or `request.url`

## Last Session: Homepage "Souk Energy" Redesign — All 11 Phases Complete

**Date**: 2026-04-13

### What Was Done
All 11 phases from `joyful-stirring-breeze.md` implemented and verified. The homepage homepage now features: warm rose color palette, unified hover interactions, normalized radius tiers, denser product rails, tiered section headers, scroll-reveal animations, and corrected accessibility contrast.

### Key Decisions
- **Tokens over hardcoded values** — enforced across all changes; found and fixed pre-existing violations (`rgba(0,0,0,0.40)` → `colors.black` + `opacity.overlayLight`)
- **Read AGENTS.md/QWEN.md before every phase** — followed startup protocol to prevent violations
- **TypeScript strictness** — all changes pass `yarn tsc --noEmit` with zero errors
- **Pre-existing type errors fixed** — `HeaderMainRow.tsx:303`, `TopBrandsGrid.tsx:170`

### Files Changed (21 files across all phases)
**Tokens:**
- `packages/tokens/components.ts` (T3 brand font min, CTA secondaryRadius)
- `packages/tokens/colors.ts` (C1 amber WCAG, C4 sale price burgundy, C5 surface warm)
**UI Components:**
- `packages/ui/primitives/Text.tsx` (T4 caption/label lineHeight)
- `packages/ui/components/ProductCard.tsx` (T6 brand weight 500, hover system, radius md, image cover)
- `packages/ui/components/home-v2/FlashSaleBand.tsx` (C6 token bg)
- `packages/ui/components/home-v2/CountdownTimer.tsx` (C3 white digits)
- `packages/ui/components/Button.tsx` (Q1 scale 1.02 + easing)
- `packages/ui/components/home-v2/OfferBannersGrid.tsx` (Q1/Q2 hover lift 3px + shadow, radius md)
- `packages/ui/components/chrome/TopPromoBar.tsx` (P1 demotion: roseBlush bg, weight 500, default tone)
- `packages/ui/components/home/HomeCategoryStrip.tsx` (Phase 1: 56px circles, icon/label below)
- `packages/ui/components/home/HomeBrandRail.tsx` (Phase 7: MarketplaceSectionHeader, onPressViewAll)
- `packages/ui/components/home/HomeProductRail.tsx` (Phase 3: card width 180px)
- `packages/ui/components/home/HomeFlashDealsSection.tsx` (Phase 2: new component)
- `packages/ui/components/home/types.ts` (Phase 1: icon field added)
- `packages/ui/components/HeroSlideCard.tsx` (Phase 4: gradient 40%/70%, title/subtitle overlays, CTA burgundy)
- `packages/ui/components/home/HomeHeroRail.tsx` (Phase 4: cardsInViewport 2.2)
- `packages/ui/components/MarketplaceSectionHeader.tsx` (Phase 6: size prop lg/md/sm, eyebrow WCAG)
**App:**
- `packages/app/features/home/HomeBlocksRenderer.tsx` (Phase 5: getSectionGap, Phase 8: RevealOnScroll)
- `packages/app/screens/LegacyHomeScreen.tsx` (removed onPressViewAll from HomeCategoryStrip)
**Pre-existing fixes:**
- `packages/ui/components/chrome/HeaderMainRow.tsx` (style→Text wrapper)
- `packages/ui/components/home-v2/TopBrandsGrid.tsx` (as const textAlign/maxWidth)

### Verification
- ✅ `yarn guard:checks` — all 15 checks passed
- ✅ `yarn tsc -p apps/next/tsconfig.json --noEmit` — zero type errors
- ✅ CSS token bridge regenerated

### Open Items
- Phase 2 `HomeFlashDealsSection` ready but CMS `FlashSaleBlock` has no products field — needs CMS schema extension to wire products
- Pre-existing hex violation in `OfferBannersGrid.tsx:226` (`hsl(0 0% 15%)`) — not introduced by this work
