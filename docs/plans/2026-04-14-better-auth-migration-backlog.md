# Better Auth Migration Backlog

**Date**: 2026-04-14
**Plan Source**: [2026-04-14-better-auth-migration-plan.md](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/docs/plans/2026-04-14-better-auth-migration-plan.md)
**Execution Model**: phased authentication migration with authorization compatibility preserved

Spec Kit feature set:
- [specs/005-better-auth/spec.md](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/specs/005-better-auth/spec.md)
- [specs/005-better-auth/plan.md](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/specs/005-better-auth/plan.md)
- [specs/005-better-auth/tasks.md](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/specs/005-better-auth/tasks.md)

## Priority Model

- `P0`: required to establish the Better Auth migration foundation without breaking current auth
- `P1`: required to move active authentication flows onto Better Auth
- `P2`: required to finish migration, remove legacy issuance, and harden the result

## Phase 1: Freeze And Inventory Current Auth Contract (`P0`)

- [ ] `AUTH-001` Inventory every route and service currently depending on [auth-session.ts](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/api/_lib/auth-session.ts) and [request-auth.ts](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/api/_lib/request-auth.ts)
- [ ] `AUTH-002` Document the current normalized app session contract used across the repo: `userId`, `email`, `name`, `role`
- [ ] `AUTH-003` Document where role assignment currently originates and which routes depend on admin-domain checks in [admin-rbac.ts](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/api/_lib/admin-rbac.ts)
- [ ] `AUTH-004` Add a migration matrix to [2026-04-14-better-auth-migration-plan.md](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/docs/plans/2026-04-14-better-auth-migration-plan.md) or a sibling artifact with columns: route/helper, current auth dependency, Better Auth target path, authorization dependency, migration status

## Phase 2: Install Better Auth In Parallel (`P0`)

- [x] `AUTH-005` Add `Better Auth` dependencies to the `apps/next` workspace without removing current custom auth paths
- [x] `AUTH-006` Create Better Auth configuration under `apps/next` in a dedicated auth module namespace
- [x] `AUTH-007` Extend `apps/next/prisma/schema.prisma` with the required Better Auth identity/session/account tables while keeping app-owned role and permission data separate
- [x] `AUTH-008` Add Prisma migration(s) under `apps/next/prisma/migrations/` for the Better Auth tables
- [x] `AUTH-009` Add bootstrap/config validation so Better Auth can initialize without replacing the current custom auth issuance path

## Phase 3: Introduce A Normalized Auth Adapter Layer (`P0`)

- [x] `AUTH-010` Create `apps/next/server/services/auth/` as the canonical Better Auth integration boundary
- [x] `AUTH-011` Add `apps/next/server/services/auth/auth-session-adapter.service.ts` to normalize Better Auth session/user data into the app session shape used today
- [x] `AUTH-012` Add `apps/next/server/services/auth/auth-role-resolution.service.ts` so role lookup stays app-owned and Prisma-backed rather than delegated to Better Auth defaults
- [x] `AUTH-013` Add auth adapter helpers/tests under `apps/next/server/services/auth/*.test.ts`
- [x] `AUTH-014` Ensure no route or service consumes raw Better Auth objects directly outside the auth adapter layer

## Phase 4: Preserve Authorization And RBAC Semantics (`P0`)

- [ ] `AUTH-015` Refactor [admin-rbac.ts](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/api/_lib/admin-rbac.ts) only as needed to consume the normalized app session shape without changing its permission semantics
- [ ] `AUTH-016` Verify all admin-domain permission paths remain app-owned for domains: `dashboard`, `catalog`, `sales`, `inventory`, `marketplace`, `marketing`, `customers`, `operations`, `settings`
- [ ] `AUTH-017` Define where app-owned role metadata lives in Prisma if the current source is not explicit enough for Better Auth-backed identity
- [ ] `AUTH-018` Add tests proving Better Auth-backed normalized sessions still satisfy existing RBAC outcomes for `admin`, `marketing`, `catalog`, `support`, and `ops`

## Phase 5: Migrate Low-Risk Auth Endpoints (`P1`)

- [x] `AUTH-019` Refactor [apps/next/app/api/auth/session/route.ts](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/api/auth/session/route.ts) to resolve sessions through the Better Auth adapter
- [x] `AUTH-020` Refactor [apps/next/app/api/auth/login/route.ts](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/api/auth/login/route.ts) so authentication uses Better Auth while preserving existing rate limiting and trusted mutation checks
- [x] `AUTH-021` Refactor [apps/next/app/api/auth/logout/route.ts](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/api/auth/logout/route.ts) to terminate Better Auth-backed sessions
- [x] `AUTH-022` Refactor [apps/next/app/api/auth/register/route.ts](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/api/auth/register/route.ts) to create Better Auth-backed users/accounts
- [ ] `AUTH-023` Review and migrate password/reset flows under `apps/next/app/api/auth/request-reset/route.ts` and `apps/next/app/api/auth/reset-password/route.ts` if they are part of the supported Better Auth rollout

## Phase 6: Bridge Existing Request Auth Helpers (`P1`)

- [x] `AUTH-024` Refactor [request-auth.ts](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/api/_lib/request-auth.ts) to resolve identity through the Better Auth adapter instead of raw custom cookie parsing
- [x] `AUTH-025` Preserve the exported helpers `requireAuthSession(...)`, `requireAdminDomainSession(...)`, and `requireAdminAnyDomainSession(...)`
- [x] `AUTH-026` Preserve trusted request checks and mutation gating behavior while changing only the authentication source
- [x] `AUTH-027` Update route tests that currently assume custom cookie parsing to assert on the same behavior through the new adapter-backed path

## Phase 7: Migrate Protected App Routes (`P1`)

- [x] `AUTH-028` Migrate customer account API routes under `apps/next/app/api/account/**` to the Better Auth-backed request helpers without changing authorization behavior
- [x] `AUTH-029` Migrate order and pharmacist protected routes under `apps/next/app/api/orders/**` and `apps/next/app/api/pharmacist/**`
- [x] `AUTH-030` Migrate admin read APIs under `apps/next/app/api/admin/**` to the Better Auth-backed request helpers
- [x] `AUTH-031` Migrate admin CMS and release lifecycle routes under `apps/next/app/api/admin/cms/**` and `apps/next/app/api/admin/releases/**`
- [x] `AUTH-032` Verify admin and CMS flows still enforce RBAC and audit expectations after the authentication source swap

## Phase 8: Dual-Session Transition (`P2`)

- [x] `AUTH-033` Support both the legacy custom encrypted cookie session and Better Auth sessions during the cutover window
- [x] `AUTH-034` Issue Better Auth-backed sessions for all new logins
- [ ] `AUTH-035` Continue reading legacy sessions for a defined transition period so rollback does not force immediate logout for all users
- [ ] `AUTH-036` Add observability/logging so the team can track legacy-vs-Better-Auth session usage during the transition

## Phase 9: Remove Legacy Auth Issuance (`P2`)

- [ ] `AUTH-037` Stop issuing new sessions from [auth-session.ts](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/api/_lib/auth-session.ts)
- [ ] `AUTH-038` Remove legacy session issuance dependencies from auth routes once the transition window closes
- [ ] `AUTH-039` Keep or remove legacy read compatibility explicitly based on rollout results rather than leaving it accidental
- [ ] `AUTH-040` Clean up dead custom-auth-only code paths after Better Auth is the sole active session issuer

## Phase 10: Verification And Hardening (`P2`)

- [x] `AUTH-041` Add service tests for Better Auth session normalization and role resolution in `apps/next/server/services/auth/*.test.ts`
- [x] `AUTH-042` Add API tests for auth endpoints and protected route helper behavior under Better Auth-backed sessions
- [ ] `AUTH-043` Verify admin RBAC regression coverage for every admin panel role/domain combination that matters to the repo
- [x] `AUTH-044` Run `yarn guard:checks`
- [x] `AUTH-045` Run `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false`
- [x] `AUTH-046` Run `yarn --cwd apps/next test:api`
- [x] `AUTH-047` Run `yarn --cwd apps/next build --webpack`
- [x] `AUTH-048` Update [SESSION-STATE.md](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/SESSION-STATE.md), [RECENT_CONTEXT.md](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/RECENT_CONTEXT.md), and [MEMORY.md](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/MEMORY.md) when the auth operating baseline changes

## Current Execution Snapshot

- Implemented baseline: Better Auth foundation, normalized auth adapter, auth route cutover, request-auth helper cutover, and broad protected-route migration
- Verified baseline:
  - `yarn guard:checks` ✅
  - `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false` ✅
  - `yarn --cwd apps/next test:api` ✅
  - `yarn --cwd apps/next build --webpack` ✅
  - `yarn --cwd apps/next build --webpack --debug-prerender` ✅ with residual request-bound bailout diagnostics still logged during analysis
- Remaining work is concentrated in:
  - richer RBAC matrix regression coverage
  - explicit transition observability
  - final legacy session compatibility removal
  - production secret hardening and rollout cleanup

## Suggested Execution Order

1. `Phase 1`
2. `Phase 2`
3. `Phase 3`
4. `Phase 4`
5. `Phase 5`
6. `Phase 6`
7. `Phase 7` in parallel with early `Phase 8` planning where safe
8. `Phase 8`
9. `Phase 9`
10. `Phase 10`

## MVP Cut Line

If we want the earliest worthwhile auth migration milestone, stop after:

- `AUTH-005` through `AUTH-027`

That gives us:

- Better Auth installed and configured
- Prisma auth tables in place
- a normalized auth adapter layer
- low-risk auth endpoints moved over
- existing request auth helpers backed by Better Auth
- admin/CMS authorization semantics preserved

## Definition Of Done

- Better Auth is the active authentication system
- app-owned RBAC and admin-domain authorization are preserved
- route handlers continue to depend on normalized server-owned auth helpers
- Prisma remains the canonical persistence layer
- admin and CMS flows behave the same or better
- legacy custom session issuance is removed after a safe transition window
