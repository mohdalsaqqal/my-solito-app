---
description: "Task list for feature 004-production-cms"
---

# Tasks: Production CMS Canonicalization

**Input**: Design documents from `/specs/004-production-cms/`
**Prerequisites**: plan.md, spec.md

**Tests**: Tests are REQUIRED for this feature because the migration must preserve
current storefront contracts while changing canonical persistence and service
ownership.

**Organization**: Tasks are grouped by user story to enable independent
implementation and testing.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish the migration inventory and service namespace.

- [x] T001 Create the feature directory baseline under `specs/004-production-cms/` and confirm documentation links are correct
- [x] T002 Create `apps/next/server/services/cms/` with initial module stubs for `cms-read.service.ts`, `cms-admin-write.service.ts`, and `cms-preview.service.ts`
- [x] T003 [P] Document the CMS migration matrix in `docs/plans/2026-04-13-production-cms-plan.md` or a sibling artifact, mapping current sources to target canonical sources

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish service ownership before migrating any story-specific CMS domain.

**Critical**: No user story work should begin until this phase is complete.

- [ ] T004 Refactor `apps/next/server/services/home/home-cms.service.ts` to depend on the `apps/next/server/services/cms/` namespace instead of directly owning all CMS source orchestration
- [x] T005 [P] Create shared CMS normalization helpers in `apps/next/server/services/cms/_lib/`
- [x] T006 [P] Define initial CMS service test files in `apps/next/server/services/cms/`
- [x] T007 Verify the foundational slice with `yarn guard:checks` and `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false`

**Checkpoint**: The repo has a canonical CMS service namespace and `home-cms.service.ts` can start delegating to it.

---

## Phase 3: User Story 1 - Canonical Global CMS Reads/Writes (Priority: P1) 🎯 MVP

**Goal**: Move the global Prisma-backed CMS domains to service-owned reads/writes.

**Independent Test**: Update site config, banners, UGC, and toggles from admin; confirm persistence and reads flow through services.

### Tests for User Story 1

- [x] T008 [P] [US1] Add service tests for `apps/next/server/services/cms/cms-site-config.service.ts`
- [x] T009 [P] [US1] Add service tests for `apps/next/server/services/cms/cms-banners.service.ts`
- [x] T010 [P] [US1] Add service tests for `apps/next/server/services/cms/cms-ugc.service.ts`
- [x] T011 [P] [US1] Add service tests for `apps/next/server/services/cms/cms-admin-controls.service.ts`

### Implementation for User Story 1

- [x] T012 [US1] Move site-config business rules from `apps/next/app/api/_lib/admin-site-config-store.ts` into `apps/next/server/services/cms/cms-site-config.service.ts`
- [x] T013 [US1] Move banners/ticker business rules from `apps/next/app/api/_lib/admin-banners-store.ts` into `apps/next/server/services/cms/cms-banners.service.ts`
- [x] T014 [US1] Move UGC business rules from `apps/next/app/api/_lib/admin-ugc-store.ts` into `apps/next/server/services/cms/cms-ugc.service.ts`
- [x] T015 [US1] Move admin-controls business rules from `apps/next/app/api/_lib/admin-controls-store.ts` into `apps/next/server/services/cms/cms-admin-controls.service.ts`
- [x] T016 [US1] Update `apps/next/app/api/admin/cms/site-config/route.ts` and `apps/next/app/api/admin/cms/site-config/logo-upload/route.ts` to delegate to services
- [x] T017 [US1] Update `apps/next/app/api/admin/cms/banners/route.ts` to delegate to services
- [x] T018 [US1] Update `apps/next/app/api/admin/cms/ugc/route.ts` to delegate to services
- [x] T019 [US1] Update `apps/next/app/api/admin/cms/toggles/route.ts` and `apps/next/app/api/admin/cms/toggles/[id]/route.ts` to delegate to services
- [x] T020 [US1] Update `apps/next/app/api/admin/cms/brand-spotlights/route.ts`, `apps/next/app/api/admin/cms/brand-spotlights/[id]/route.ts`, `apps/next/app/api/admin/cms/offer-banners/route.ts`, and `apps/next/app/api/admin/cms/offer-banners/[id]/route.ts` to delegate to services
- [x] T021 [US1] Update `apps/next/server/services/home/home-cms.service.ts` so shell/global CMS reads use the canonical service layer
- [x] T022 [US1] Verify User Story 1 with `yarn guard:checks`, `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false`, and targeted `apps/next` API/service tests

**Checkpoint**: Global CMS domains are service-owned and Prisma-canonical. This is the MVP cut line.

---

## Phase 4: User Story 2 - Homepage Merchandising Uses Canonical Persistence (Priority: P1)

**Goal**: Remove live mock-CMS source-of-truth behavior from homepage merchandising/editorial domains.

**Independent Test**: Publish or persist homepage merchandising content and verify `home-cms.service.ts` resolves it from canonical persisted records.

### Tests for User Story 2

- [x] T023 [P] [US2] Extend `apps/next/server/services/home/home-cms.service.test.ts` for Prisma-backed merchandising reads
- [x] T024 [P] [US2] Extend `apps/next/server/services/home/home-page.service.test.ts` for canonical merchandising payload resolution

### Implementation for User Story 2

- [x] T025 [US2] Audit all homepage merchandising/editorial content currently sourced from `packages/adapters/mock/cms/index.ts`
- [x] T026 [US2] Add missing homepage merchandising/editorial canonical models to `apps/next/prisma/schema.prisma`
- [x] T027 [US2] Add corresponding migration files under `apps/next/prisma/migrations/`
- [x] T028 [US2] Create `apps/next/server/services/cms/cms-home-merchandising.service.ts`
- [x] T029 [US2] Update `apps/next/server/services/home/home-cms.service.ts` to resolve migrated merchandising domains through `cms-home-merchandising.service.ts`
- [x] T030 [US2] Update admin editing surfaces in `apps/next/app/admin/marketing/cms/blocks/page.tsx` and related `_components/`
- [x] T031 [US2] Update block/release write endpoints in `apps/next/app/api/admin/cms/blocks/**`, `apps/next/app/api/admin/release-blocks/**`, and related routes as needed
- [x] T032 [US2] Verify User Story 2 with `yarn guard:checks`, `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false`, and `yarn --cwd apps/next test:api`

**Checkpoint**: Homepage merchandising/editorial CMS content is canonically persisted and service-owned.

---

## Phase 5: User Story 3 - Explicit Preview, Publish, And Rollback (Priority: P2)

**Goal**: Add production-grade editorial lifecycle behavior to the canonical CMS stack.

**Independent Test**: Preview draft content, publish it, and roll back to a prior version through service-owned flows.

### Tests for User Story 3

- [x] T033 [P] [US3] Add tests for preview resolution in `apps/next/server/services/cms/cms-preview.service.test.ts`
- [x] T034 [P] [US3] Add tests for publish behavior in `apps/next/server/services/cms/cms-publish.service.test.ts`
- [x] T035 [P] [US3] Add tests for rollback behavior in `apps/next/server/services/cms/cms-rollback.service.test.ts`

### Implementation for User Story 3

- [x] T036 [US3] Add lifecycle/versioning schema support in `apps/next/prisma/schema.prisma`
- [x] T037 [US3] Add corresponding Prisma migration files under `apps/next/prisma/migrations/`
- [x] T038 [US3] Implement `apps/next/server/services/cms/cms-preview.service.ts`
- [x] T039 [US3] Implement `apps/next/server/services/cms/cms-publish.service.ts`
- [x] T040 [US3] Implement `apps/next/server/services/cms/cms-rollback.service.ts`
- [x] T041 [US3] Update `apps/next/app/api/admin/releases/route.ts`, `apps/next/app/api/admin/releases/[id]/route.ts`, and `apps/next/app/api/admin/releases/[id]/publish/route.ts` to delegate to the new services
- [x] T042 [US3] Ensure `apps/next/server/services/home/home-cms.service.ts` uses explicit preview/published resolution from the service layer
- [x] T043 [US3] Verify User Story 3 with `yarn guard:checks`, `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false`, `yarn --cwd apps/next test:api`, and `next build --webpack --debug-prerender` from `apps/next`

**Checkpoint**: Preview, publish, and rollback are explicit and testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup, seeding strategy, and verification.

- [x] T044 Convert reusable mock CMS runtime content from `packages/adapters/mock/cms/index.ts` into explicit seed/bootstrap fixtures under `apps/next/scripts/` or equivalent
- [x] T045 Update provider/bootstrap wiring so mock CMS data is fixture/seed/fallback behavior only, never canonical live production truth
- [x] T046 [P] Update `docs/plans/2026-04-13-production-cms-plan.md` and `docs/plans/2026-04-13-production-cms-backlog.md` with execution status
- [x] T047 [P] Update `SESSION-STATE.md`, `RECENT_CONTEXT.md`, and `MEMORY.md` after substantial migration milestones
- [x] T048 Run `yarn guard:checks`
- [x] T049 Run `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false`
- [x] T050 Run `yarn --cwd apps/next test:api`
- [x] T051 Run `next build --webpack --debug-prerender` from `apps/next` for the final slice

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1**: no dependencies
- **Phase 2**: depends on Phase 1
- **Phase 3 (US1)**: depends on Phase 2
- **Phase 4 (US2)**: depends on Phase 3
- **Phase 5 (US3)**: depends on Phase 4
- **Phase 6**: depends on all desired user stories being complete

### User Story Dependencies

- **US1**: independent after foundational service namespace work
- **US2**: depends on US1 because homepage reads need the canonical CMS service boundary first
- **US3**: depends on US2 because preview/publish/rollback should operate on canonical persisted domains

### Parallel Opportunities

- `T003`, `T005`, `T006` can run in parallel
- `T008` through `T011` can run in parallel
- `T023` and `T024` can run in parallel
- `T033` through `T035` can run in parallel
- Documentation/memory updates in Phase 6 can run in parallel

## Implementation Strategy

### MVP First

1. Complete Phase 1
2. Complete Phase 2
3. Complete Phase 3 (US1)
4. Stop and validate the service-owned canonical CMS foundation

### Incremental Delivery

1. Deliver US1 as the first production CMS foundation slice
2. Deliver US2 as the homepage/source-of-truth migration slice
3. Deliver US3 as the editorial lifecycle hardening slice

## Notes

- Preserve storefront-facing normalized contracts while changing the backing source.
- Prefer small migration slices by CMS domain to reduce regression risk.
- Do not let `app/api/_lib/*store.ts` remain the long-term home for CMS business logic.
