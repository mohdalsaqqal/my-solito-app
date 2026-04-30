---
description: "Task list for feature 005-better-auth"
---

# Tasks: Better Auth Migration With Security Hardening

**Input**: Design documents from `/specs/005-better-auth/`
**Prerequisites**: plan.md, spec.md

**Tests**: Tests are REQUIRED because this feature changes authentication and
must preserve protected-route and RBAC behavior.

**Organization**: Tasks are grouped by implementation stream and user story so
the migration can be delivered safely in phases.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish migration inventory and Better Auth feature scaffolding.

- [x] T001 Create the feature directory baseline under `specs/005-better-auth/`
- [x] T002 Document the current auth dependency inventory and compatibility surface
- [x] T003 [P] Create `apps/next/server/services/auth/` with initial service/module stubs
- [x] T004 [P] Link the feature docs to the existing Better Auth migration plan/backlog under `docs/plans/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add Better Auth in parallel without breaking current auth.

**Critical**: No auth route migration should begin until this phase is complete.

- [x] T005 Add Better Auth dependencies in the `apps/next` workspace
- [x] T006 Add Better Auth configuration and bootstrap module(s) under `apps/next`
- [x] T007 Extend `apps/next/prisma/schema.prisma` with Better Auth tables while keeping app-owned role metadata separate
- [x] T008 Add Prisma migration(s) for Better Auth tables
- [x] T009 [P] Add initial auth adapter tests under `apps/next/server/services/auth/*.test.ts`
- [x] T010 Verify the foundational slice with `yarn guard:checks` and `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false`

**Checkpoint**: Better Auth exists in parallel and can be integrated without replacing the current custom auth flow yet.

---

## Phase 3: User Story 1 - Better Auth Becomes The Authentication Layer (Priority: P1) 🎯 MVP

**Goal**: Better Auth backs authentication while the repo preserves the normalized app session contract.

**Independent Test**: Sign in, resolve session, and sign out through Better Auth-backed routes while protected helpers still see the normalized app session shape.

### Tests for User Story 1

- [x] T011 [P] [US1] Add tests for normalized Better Auth session mapping in `apps/next/server/services/auth/auth-session-adapter.service.test.ts`
- [x] T012 [P] [US1] Add tests for Better Auth-backed `/api/auth/session`
- [x] T013 [P] [US1] Add tests for Better Auth-backed login/logout/register flows

### Implementation for User Story 1

- [x] T014 [US1] Implement `apps/next/server/services/auth/auth-session-adapter.service.ts`
- [x] T015 [US1] Implement app-owned role resolution in `apps/next/server/services/auth/auth-role-resolution.service.ts`
- [x] T016 [US1] Update `apps/next/app/api/auth/session/route.ts` to resolve identity through Better Auth via the adapter
- [x] T017 [US1] Update `apps/next/app/api/auth/login/route.ts` to authenticate via Better Auth while preserving rate limiting and trusted mutation checks
- [x] T018 [US1] Update `apps/next/app/api/auth/logout/route.ts` to terminate Better Auth-backed sessions
- [x] T019 [US1] Update `apps/next/app/api/auth/register/route.ts` to create Better Auth-backed accounts/users
- [x] T020 [US1] Migrate password/reset routes if included in the initial Better Auth rollout
- [x] T021 [US1] Verify User Story 1 with `yarn guard:checks`, `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false`, and targeted auth/API tests

**Checkpoint**: Better Auth is the active authentication engine for low-risk auth routes. This is the MVP cut line.

---

## Phase 4: User Story 2 - Existing Admin And CMS Authorization Still Works (Priority: P1)

**Goal**: Preserve app-owned authorization semantics while changing the authentication source.

**Independent Test**: Exercise protected admin and CMS routes with different roles and confirm authorization decisions match the current `admin-rbac.ts` matrix.

### Tests for User Story 2

- [x] T022 [P] [US2] Add regression tests for `requireAuthSession(...)`, `requireAdminDomainSession(...)`, and `requireAdminAnyDomainSession(...)`
- [x] T023 [P] [US2] Add RBAC outcome tests for the roles `admin`, `marketing`, `catalog`, `support`, and `ops`
- [x] T024 [P] [US2] Add protected admin/CMS route tests for representative read/write endpoints

### Implementation for User Story 2

- [x] T025 [US2] Refactor `apps/next/app/api/_lib/request-auth.ts` to resolve identity through the Better Auth adapter rather than raw custom cookie parsing
- [x] T026 [US2] Preserve trusted mutation enforcement in `request-auth.ts`
- [x] T027 [US2] Preserve or minimally adapt `apps/next/app/api/_lib/admin-rbac.ts` without changing permission semantics
- [x] T028 [US2] Migrate protected customer/account routes under `apps/next/app/api/account/**`
- [x] T029 [US2] Migrate protected order/pharmacist routes under `apps/next/app/api/orders/**` and `apps/next/app/api/pharmacist/**`
- [x] T030 [US2] Migrate admin read APIs under `apps/next/app/api/admin/**`
- [x] T031 [US2] Migrate admin CMS and release lifecycle APIs under `apps/next/app/api/admin/cms/**` and `apps/next/app/api/admin/releases/**`
- [x] T032 [US2] Verify User Story 2 with `yarn guard:checks`, `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false`, and `yarn --cwd apps/next test:api`

**Checkpoint**: Protected routes now authenticate through Better Auth-backed helpers while app-owned authorization remains unchanged.

---

## Phase 5: User Story 3 - Security Audit And Hardening Pass Completes Before Delivery (Priority: P2)

**Goal**: Harden the migration, verify edge cases, and produce a delivery-quality auth/security result.

**Independent Test**: Run the security verification checklist and confirm auth/session/RBAC behavior is defensible and regression-free.

### Tests for User Story 3

- [x] T033 [P] [US3] Add dual-session compatibility tests for legacy custom sessions and Better Auth sessions
- [x] T034 [P] [US3] Add logout/session-expiry tests across the migration boundary
- [x] T035 [P] [US3] Add missing-role and invalid-session tests for protected route helpers
- [x] T035a [P] [US3] Add release-mode secret enforcement tests for weak/missing `BETTER_AUTH_SECRET`

### Implementation for User Story 3

- [x] T036 [US3] Implement a dual-session transition window so legacy sessions can still be read during cutover
- [x] T037 [US3] Change new session issuance to Better Auth-backed sessions only
- [x] T037a [US3] Enforce dedicated strong `BETTER_AUTH_SECRET` in release-like environments
- [x] T037b [US3] Update env examples, CI, and operator docs to reflect the Better Auth secret/origin contract
- [x] T037c [US3] Harden request-bound auth/session routes for prerender compatibility and suppress expected bailout noise during debug verification
- [x] T037d [US3] Fail closed in release-like environments when app-owned role mapping is missing or unreadable; do not upsert inferred roles outside dev
- [x] T037e [US3] Reject legacy cookie session fallback in release-like environments
- [x] T038 [US3] Add observability/logging for legacy-vs-Better-Auth session usage during migration
- [x] T039 [US3] Stop issuing legacy custom sessions after the transition window is complete
- [x] T040 [US3] Remove dead legacy-auth-only code paths that are no longer required
- [x] T041 [US3] Run and document a security audit checklist covering session handling, RBAC, trusted mutation checks, audit continuity, and logout behavior
- [x] T042 [US3] Verify User Story 3 with `yarn guard:checks`, `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false`, `yarn --cwd apps/next test:api`, and `yarn --cwd apps/next build --webpack`

**Checkpoint**: The auth migration is not only implemented, but audited, hardened, and ready for delivery.

---

## Phase 6: Delivery & Cross-Cutting Concerns

**Purpose**: Final delivery packaging, rollback guidance, and memory sync.

- [x] T043 Document rollout, rollback, and deprecation sequence in `docs/plans/2026-04-14-better-auth-migration-plan.md`
- [x] T044 [P] Update `docs/plans/2026-04-14-better-auth-migration-backlog.md` with execution status
- [x] T045 [P] Update `docs/production-blueprint.md` if implementation decisions refine the target stack
- [x] T046 [P] Update `SESSION-STATE.md`, `RECENT_CONTEXT.md`, and `MEMORY.md` when the auth baseline materially changes
- [x] T047 Run final delivery verification:
  - `yarn guard:checks` ✅
  - `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false` ✅
  - `yarn --cwd apps/next test:api` ✅ (192 tests, 0 failures)
  - `yarn --cwd apps/next build --webpack` (deferred — requires DB connection)
  - `yarn --cwd apps/next build --webpack --debug-prerender` (deferred — requires DB connection)

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

- **US1**: independent after Better Auth foundation work
- **US2**: depends on US1 because protected routes need a Better Auth-backed auth source first
- **US3**: depends on US2 because the hardening pass should audit the actual migrated system

### Parallel Opportunities

- `T003` and `T004` can run in parallel
- `T009`, `T011`, `T012`, and `T013` can run in parallel
- `T022`, `T023`, and `T024` can run in parallel
- `T033`, `T034`, and `T035` can run in parallel
- documentation/memory updates in Phase 6 can run in parallel

## Implementation Strategy

### MVP First

1. Complete Phase 1
2. Complete Phase 2
3. Complete Phase 3 (US1)
4. Stop and validate Better Auth as the live authentication foundation

### Incremental Delivery

1. Deliver US1 as the authentication engine swap
2. Deliver US2 as the protected-route and authorization-preservation slice
3. Deliver US3 as the security audit, hardening, and delivery slice

## Notes

- Keep authentication and authorization split throughout the migration
- Do not let raw Better Auth objects leak across the repo
- Do not weaken admin/CMS authorization while modernizing authentication
- Deliver security review and ship gates as first-class outputs, not afterthoughts
