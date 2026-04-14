# Better Auth Migration Plan

## Status

- `2026-04-14`: foundational Better Auth slice is now implemented
- Better Auth configuration, Prisma tables, auth adapter services, and auth route cutover are landed
- `request-auth.ts` now resolves normalized sessions through the Better Auth adapter with legacy-session fallback during cutover
- Remaining follow-up is hardening and cleanup, not initial adoption

This plan describes the safest migration path from the repo's current custom authentication system to `Better Auth`, while preserving the existing custom admin and CMS authorization model.

## Goal

Adopt `Better Auth` for authentication without weakening or rewriting the app-specific authorization system.

Backlog:
- [2026-04-14-better-auth-migration-backlog.md](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/docs/plans/2026-04-14-better-auth-migration-backlog.md)

## Non-Negotiable Architecture

- `Better Auth` should own authentication, sessions, and identity lifecycle
- The app should continue owning authorization, admin-domain access, CMS permissions, audit logging, and trusted mutation policy
- `Prisma/Postgres` remains the canonical persistence layer
- Route handlers stay thin
- Authorization decisions continue to live in the server layer

## Current State

### Authentication

The repo currently uses a custom encrypted stateless cookie flow centered around:

- [auth-session.ts](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/api/_lib/auth-session.ts)
- [request-auth.ts](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/api/_lib/request-auth.ts)
- [login route](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/api/auth/login/route.ts)

The current system provides:

- encrypted session cookies
- session parsing and validation
- trusted mutation checks
- role-aware session helpers

### Authorization

The current admin authorization model is app-owned and should stay app-owned:

- [admin-rbac.ts](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/api/_lib/admin-rbac.ts)

Current domains:

- `dashboard`
- `catalog`
- `sales`
- `inventory`
- `marketplace`
- `marketing`
- `customers`
- `operations`
- `settings`

Current admin panel roles:

- `admin`
- `marketing`
- `catalog`
- `support`
- `ops`

## Target State

### Better Auth Owns

- sign in
- sign out
- session creation and verification
- password flows
- email/account lifecycle
- user/account/session primitives

### The App Continues To Own

- `requireAuthSession(...)`
- `requireAdminDomainSession(...)`
- `requireAdminAnyDomainSession(...)`
- admin-domain permission mapping
- CMS access rules
- publish/rollback permissions
- audit logging
- trusted mutation enforcement

### Boundary Contract

All route handlers and services should consume a normalized app session shape, not raw Better Auth objects.

The compatibility target is the current session contract already used throughout the repo:

- `userId`
- `email`
- `name`
- `role`

## Migration Strategy

Use a phased parallel migration, not a big-bang replacement.

## Phase 0 - Freeze The Current Contract

### Deliverables

- document the existing auth session shape
- document every current auth helper and its callers
- document where roles are assigned today
- document every route that depends on current session cookies

### Files To Treat As Compatibility Boundaries

- [auth-session.ts](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/api/_lib/auth-session.ts)
- [request-auth.ts](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/api/_lib/request-auth.ts)
- [admin-rbac.ts](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/api/_lib/admin-rbac.ts)

### Exit Criteria

- the current auth and authz contract is explicitly documented
- migration does not require changing permission semantics

## Phase 1 - Add Better Auth In Parallel

### Deliverables

- install `Better Auth`
- add Better Auth config under `apps/next`
- add required Prisma auth tables
- keep all existing auth routes working

### Rule

Do not replace current cookie issuance yet.

### Exit Criteria

- Better Auth is configured and can resolve a session independently
- the existing custom auth still works untouched

### Current Status

- Completed on `2026-04-14`
- Implemented in:
  - [apps/next/lib/auth.ts](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/lib/auth.ts)
  - [apps/next/app/api/_lib/security-policy.ts](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/api/_lib/security-policy.ts)
  - [apps/next/prisma/schema.prisma](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/prisma/schema.prisma)
  - [20260414103000_better_auth_foundation](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/prisma/migrations/20260414103000_better_auth_foundation/migration.sql)

## Phase 2 - Introduce An Auth Adapter Layer

### Deliverables

- add `apps/next/server/services/auth/`
- create a normalizer that maps Better Auth user/session data into the repo's app session shape
- add a single session-resolution entry point for server code

### Target Shape

The adapter should return the same effective app session contract used today:

- `userId`
- `email`
- `name`
- `role`

### Rule

No route should depend directly on Better Auth session objects.

### Exit Criteria

- one adapter produces normalized app sessions from Better Auth
- the rest of the app can stay ignorant of Better Auth internals

### Current Status

- Completed on `2026-04-14`
- Implemented in:
  - [auth-session-adapter.service.ts](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/server/services/auth/auth-session-adapter.service.ts)
  - [auth-role-resolution.service.ts](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/server/services/auth/auth-role-resolution.service.ts)
  - [auth-session-adapter.service.test.ts](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/server/services/auth/auth-session-adapter.service.test.ts)

## Phase 3 - Separate Authentication From Authorization

### Deliverables

- keep role/domain permission logic in app-owned code
- ensure roles are stored in app-owned Prisma-backed metadata, not delegated to Better Auth
- wire normalized session into existing RBAC checks

### Important Rule

`Better Auth` answers:

- who is the user?
- is there a valid authenticated session?

The app answers:

- can this user access `marketing`?
- can this user publish releases?
- can this user manage CMS toggles?

### Exit Criteria

- Better Auth is used for identity
- existing RBAC semantics remain unchanged

## Phase 4 - Migrate Low-Risk Auth Endpoints

### Suggested First Routes

- `/api/auth/session`
- `/api/auth/login`
- `/api/auth/logout`
- `/api/auth/register`

### Work

- reimplement session read/write through Better Auth
- preserve the outward response contract as much as possible
- keep rate limiting and trusted mutation checks in place where appropriate

### Exit Criteria

- account/session routes work on Better Auth
- admin and CMS routes remain on compatibility helpers

### Current Status

- Completed on `2026-04-14`
- Landed route cutover:
  - [login](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/api/auth/login/route.ts)
  - [logout](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/api/auth/logout/route.ts)
  - [register](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/api/auth/register/route.ts)
  - [session](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/api/auth/session/route.ts)
  - [session-resolver](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/api/auth/session/session-resolver.ts)

## Phase 5 - Bridge Existing Request Auth Helpers

### Deliverables

- refactor [request-auth.ts](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/api/_lib/request-auth.ts) so it resolves auth through the adapter instead of custom cookie parsing
- preserve the exported helper names and behavior

### Preserve

- `requireAuthSession(...)`
- `requireAdminDomainSession(...)`
- `requireAdminAnyDomainSession(...)`
- trusted request checks

### Exit Criteria

- existing protected routes can keep using the same helpers
- identity comes from Better Auth
- authorization still comes from app RBAC

### Current Status

- Completed on `2026-04-14`
- [request-auth.ts](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/api/_lib/request-auth.ts) now resolves Better Auth-backed normalized sessions first and falls back to legacy cookies during transition
- Protected route call sites were updated to await async helper resolution across account, order, pharmacist, admin, CMS, and release routes

## Phase 6 - Migrate Admin And CMS APIs

### Priority Order

1. read-only admin routes
2. admin list endpoints
3. CMS read/write routes
4. release and publish/rollback routes

### Rule

The admin/CMS behavior must not change from the user's perspective during this phase.

### Exit Criteria

- admin and CMS APIs authenticate via Better Auth-backed session resolution
- authorization stays app-owned

## Phase 7 - Dual-Session Transition Window

### Deliverables

- support both legacy custom cookie sessions and Better Auth sessions temporarily
- issue Better Auth sessions on new logins
- continue reading legacy cookies during the cutover period

### Why

This allows rollback without immediately logging out every existing session.

### Exit Criteria

- new sessions are Better Auth-backed
- old sessions still read correctly during the migration window

### Current Status

- Partially completed on `2026-04-14`
- New login/register issuance now goes through Better Auth
- Legacy session reads remain supported through the adapter fallback path to preserve rollback safety
- Explicit usage telemetry is not implemented yet

## Phase 8 - Remove Legacy Session Issuance

### Deliverables

- stop issuing custom encrypted auth cookies
- keep short-lived legacy read compatibility if needed
- then remove old parsing and issuance code

### Candidates For Removal

- legacy issuance paths in [auth-session.ts](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/api/_lib/auth-session.ts)
- any route code that depends on raw custom cookie construction

### Exit Criteria

- Better Auth is the only session issuer
- compatibility reads are removed after the cutover window

### Current Status

- In progress
- Legacy issuance is no longer used by the migrated auth routes
- Legacy compatibility read paths still remain intentionally in place during cutover

## Phase 9 - Verification And Hardening

### Required Tests

- session resolution
- admin RBAC mapping
- domain-based access checks
- logout/session expiry
- password/reset flow
- role propagation into protected routes
- admin/CMS route protection

### Required Runtime Checks

- no direct UI authorization decisions based on client assumptions alone
- no route bypass of server-side RBAC
- no loss of audit logging on admin/CMS writes

### Current Verification Snapshot

- `yarn guard:checks` ✅
- `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false` ✅
- `yarn --cwd apps/next test:api` ✅
- `yarn --cwd apps/next build --webpack` ✅
- `yarn --cwd apps/next build --webpack --debug-prerender` ✅ with residual request-bound bailout logging still visible during analysis

### Remaining Hardening Follow-Up

- set a production-grade `BETTER_AUTH_SECRET` with at least 32 bytes of entropy
- add explicit Better Auth/legacy session transition observability
- continue reducing request-bound route-handler access that still surfaces `NEXT_PRERENDER_INTERRUPTED` diagnostics during debug prerender analysis

## Data Model Guidance

Use Better Auth tables for identity/session/account concerns.

Keep app-owned tables for:

- roles
- admin domain permissions
- operational staff metadata
- CMS audit metadata
- release actor metadata

Do not collapse app authorization into Better Auth defaults.

## Risks

### Main Risks

- migrating auth and authz together instead of separately
- accidentally weakening admin permission checks
- changing the current session shape too early
- tying route handlers directly to Better Auth primitives
- removing legacy compatibility before all call sites are migrated

### Mitigations

- preserve the current auth helper surface until the end
- migrate auth first, authz never
- use an adapter/normalizer layer
- cut over in phases

## MVP Cut Line

The smallest worthwhile migration milestone is:

1. Better Auth installed and configured
2. Prisma auth tables added
3. normalized auth adapter created
4. `/api/auth/session` moved to Better Auth
5. `request-auth.ts` resolves sessions through the adapter
6. admin RBAC stays unchanged

At that point, the repo has a real authentication upgrade without destabilizing admin/CMS permissions.

## Definition Of Done

- Better Auth is the active authentication system
- app-owned RBAC and admin-domain authorization are preserved
- route handlers still use thin server-owned auth helpers
- Prisma remains the canonical persistence layer
- admin and CMS flows behave the same or better
- legacy auth issuance is removed after a safe transition window
