# Production CMS Backlog

**Date**: 2026-04-13
**Plan Source**: [2026-04-13-production-cms-plan.md](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/docs/plans/2026-04-13-production-cms-plan.md)
**Execution Model**: incremental, domain-by-domain migration with stable storefront contracts

## Priority Model

- `P0`: required to establish the production CMS foundation
- `P1`: required to remove live mock CMS dependence from core storefront surfaces
- `P2`: publish workflow, rollback, and operational hardening

## Phase 1: Audit And Service Boundary (`P0`)

- [ ] `CMS-001` Inventory every live CMS domain currently sourced from `packages/adapters/mock/cms/index.ts` and map each to its read path in `apps/next/server/services/home/home-cms.service.ts`
- [ ] `CMS-002` Document the migration matrix in `docs/plans/2026-04-13-production-cms-plan.md` or a sibling artifact with columns: domain, current source, target Prisma model, read service, admin write path, migration status
- [ ] `CMS-003` Introduce a dedicated CMS service namespace under `apps/next/server/services/cms/` starting with `cms-read.service.ts`, `cms-admin-write.service.ts`, and `cms-preview.service.ts`
- [ ] `CMS-004` Refactor `apps/next/server/services/home/home-cms.service.ts` so it depends on the new CMS service namespace instead of directly pulling multiple `app/api/_lib/*store.ts` helpers
- [ ] `CMS-005` Add shared CMS normalization types/helpers under `apps/next/server/services/cms/_lib/` so the UI-facing shape remains stable while persistence changes underneath

## Phase 2: Lift API-Local CMS Stores Into Services (`P0`)

- [ ] `CMS-006` Move site-config business rules from `apps/next/app/api/_lib/admin-site-config-store.ts` into `apps/next/server/services/cms/cms-site-config.service.ts`
- [ ] `CMS-007` Move banner/ticker business rules from `apps/next/app/api/_lib/admin-banners-store.ts` into `apps/next/server/services/cms/cms-banners.service.ts`
- [ ] `CMS-008` Move UGC business rules from `apps/next/app/api/_lib/admin-ugc-store.ts` into `apps/next/server/services/cms/cms-ugc.service.ts`
- [ ] `CMS-009` Move admin-controls business rules from `apps/next/app/api/_lib/admin-controls-store.ts` into `apps/next/server/services/cms/cms-admin-controls.service.ts`
- [ ] `CMS-010` Update `apps/next/app/api/admin/cms/site-config/route.ts` to delegate to the new CMS service layer
- [ ] `CMS-011` Update `apps/next/app/api/admin/cms/banners/route.ts` to delegate to the new CMS service layer
- [ ] `CMS-012` Update `apps/next/app/api/admin/cms/ugc/route.ts` to delegate to the new CMS service layer
- [ ] `CMS-013` Update `apps/next/app/api/admin/cms/toggles/route.ts` and `apps/next/app/api/admin/cms/toggles/[id]/route.ts` to delegate to the new CMS service layer
- [ ] `CMS-014` Update `apps/next/app/api/admin/cms/brand-spotlights/route.ts` and `apps/next/app/api/admin/cms/brand-spotlights/[id]/route.ts` to delegate to the new CMS service layer
- [ ] `CMS-015` Update `apps/next/app/api/admin/cms/offer-banners/route.ts` and `apps/next/app/api/admin/cms/offer-banners/[id]/route.ts` to delegate to the new CMS service layer

## Phase 3: Canonical Shell And Global CMS Domains (`P1`)

- [ ] `CMS-016` Make `apps/next/server/services/home/home-cms.service.ts` read shell branding, top bar, footer, search-panel titles, ticker settings, education banners, and UGC from CMS services only
- [ ] `CMS-017` Verify `apps/next/server/services/navigation/resolve-shell-menus.service.ts` and `apps/next/server/services/admin/admin-menus.service.ts` can support canonical menu persistence for storefront shell navigation
- [ ] `CMS-018` Refactor `apps/next/app/api/admin/cms/menus/route.ts` and `apps/next/app/api/admin/cms/menus/[id]/route.ts` so menu writes flow through services instead of endpoint-local logic
- [ ] `CMS-019` Add or complete Prisma-backed persistence for any shell/menu/footer content that still exists only in mock CMS payloads
- [ ] `CMS-020` Update `apps/next/app/admin/marketing/cms/site-config/page.tsx` and `apps/next/app/admin/marketing/cms/menus/page.tsx` to match the new service-owned write/read flow
- [ ] `CMS-021` Add service-level tests for shell/menu/site-config reads and writes in `apps/next/server/services/cms/*.test.ts`

## Phase 4: Homepage Merchandising CMS Migration (`P1`)

- [ ] `CMS-022` Identify every home merchandising section still sourced from `packages/adapters/mock/cms/index.ts` and represented in `apps/next/server/services/home/home-cms.service.ts`
- [ ] `CMS-023` Model missing homepage merchandising entities in `apps/next/prisma/schema.prisma` with explicit status, ordering, locale, and actor fields
- [ ] `CMS-024` Add Prisma migration(s) under `apps/next/prisma/migrations/` for the new homepage merchandising entities
- [ ] `CMS-025` Build `apps/next/server/services/cms/cms-home-merchandising.service.ts` to read normalized hero, rails, spotlights, offer banners, and supporting merchandising modules
- [ ] `CMS-026` Update `apps/next/app/admin/marketing/cms/blocks/page.tsx` and its `_components` to edit canonical Prisma-backed merchandising records instead of relying on mock-shaped runtime state
- [ ] `CMS-027` Update `apps/next/app/api/admin/cms/blocks/upload/route.ts` and related block endpoints so writes land in the new canonical models or versioned block records
- [ ] `CMS-028` Replace the remaining mock-backed merchandising assembly in `apps/next/server/services/home/home-cms.service.ts` with data from `cms-home-merchandising.service.ts`
- [ ] `CMS-029` Extend `apps/next/server/services/home/home-cms.service.test.ts` and `apps/next/server/services/home/home-page.service.test.ts` to cover Prisma-backed merchandising reads

## Phase 5: Editorial And Layout-As-Data Domains (`P1`)

- [ ] `CMS-030` Audit release/page-version paths in `apps/next/app/api/admin/release-blocks/route.ts`, `apps/next/app/api/admin/releases/route.ts`, `apps/next/app/api/admin/releases/[id]/route.ts`, and `apps/next/app/api/admin/releases/[id]/publish/route.ts`
- [ ] `CMS-031` Consolidate release/page-version read/write orchestration into `apps/next/server/services/cms/cms-release.service.ts`
- [ ] `CMS-032` Move `findLatestPageVersionByRelease`, `getPageVersionById`, and `toReleaseBlockRecords`-style orchestration behind the CMS service layer instead of calling page-version helpers directly from `home-cms.service.ts`
- [ ] `CMS-033` Ensure all editorial home block types emitted by `apps/next/server/services/home/normalize-home-blocks.ts` are sourced from canonical persisted block records in Prisma/release tables
- [ ] `CMS-034` Update `apps/next/app/admin/marketing/cms/releases/page.tsx` and `apps/next/app/admin/marketing/cms/blocks/page.tsx` to operate against the consolidated release service
- [ ] `CMS-035` Add regression tests covering preview and published home-block resolution in `apps/next/server/services/home/home-cms.service.test.ts` and any new `cms-release.service.test.ts`

## Phase 6: Draft, Preview, Publish, Rollback (`P2`)

- [ ] `CMS-036` Introduce explicit lifecycle fields and/or tables needed for draft, published, archived, and rollbackable CMS entities in `apps/next/prisma/schema.prisma`
- [ ] `CMS-037` Implement `apps/next/server/services/cms/cms-publish.service.ts` for deterministic publish behavior and cache invalidation hooks
- [ ] `CMS-038` Implement `apps/next/server/services/cms/cms-rollback.service.ts` or equivalent rollback support for published CMS releases
- [ ] `CMS-039` Refactor `apps/next/app/api/admin/releases/[id]/publish/route.ts` to call the publish service only
- [ ] `CMS-040` Ensure preview handling in `apps/next/server/services/home/home-cms.service.ts` and `apps/next/app/api/_lib/preview-token.ts` remains service-owned and explicit
- [ ] `CMS-041` Add tests for preview, publish, rollback, and publish-side cache invalidation

## Phase 7: Seed And Bootstrap Strategy (`P2`)

- [ ] `CMS-042` Extract reusable seed content from `packages/adapters/mock/cms/index.ts` into Prisma seed/bootstrap scripts under `apps/next/scripts/`
- [ ] `CMS-043` Define a repeatable local/staging bootstrap workflow that populates canonical CMS tables without making the mock adapter the live source of truth
- [ ] `CMS-044` Reduce `packages/adapters/mock/cms/index.ts` to fixture/contract/bootstrap responsibilities only
- [ ] `CMS-045` Update any provider wiring that still causes storefront CMS reads to prefer the mock adapter in production-like paths

## Phase 8: Hardening And Exit (`P2`)

- [ ] `CMS-046` Add service smoke tests for all new CMS services in `apps/next/server/services/cms/*.test.ts`
- [ ] `CMS-047` Add API tests for the admin CMS routes touched in `apps/next/app/api/admin/**`
- [ ] `CMS-048` Run `yarn guard:checks`
- [ ] `CMS-049` Run `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false`
- [ ] `CMS-050` Run `yarn --cwd apps/next test:api`
- [ ] `CMS-051` Run `next build --webpack --debug-prerender` from `apps/next` for the final publish/preview/caching slice
- [ ] `CMS-052` Update `SESSION-STATE.md`, `RECENT_CONTEXT.md`, and `MEMORY.md` when the migration meaningfully changes the repo’s CMS operating baseline

## Suggested Execution Order

1. `Phase 1`
2. `Phase 2`
3. `Phase 3`
4. `Phase 4` and `Phase 5` in parallel where file ownership does not overlap
5. `Phase 6`
6. `Phase 7`
7. `Phase 8`

## MVP Cut Line

If we want the earliest credible production CMS milestone, stop after:

- `CMS-001` through `CMS-021`

That gives us:

- service-owned CMS orchestration for global shell domains
- thin admin routes for the main existing Prisma-backed CMS entities
- a clear boundary between canonical Prisma content and mock fallback content

## Definition Of Done

- No live storefront CMS path treats `packages/adapters/mock/cms/index.ts` as the canonical source of truth
- CMS reads and writes are orchestrated through `apps/next/server/services`
- Prisma/Postgres is the canonical store for mutable admin-editable CMS content
- Preview, publish, and rollback flows are explicit and tested
- Seeds/bootstrap content is separate from production content ownership
