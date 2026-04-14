# Better Auth Migration — Security Audit Checklist

**Feature**: `005-better-auth`  
**Date**: 2026-04-14  
**Status**: Completed

This document records the security verification pass required by spec FR-009 and
User Story 3 before the migration is considered delivered.

---

## 1. Session Handling

| # | Check | Result | Notes |
|---|-------|--------|-------|
| 1.1 | New login issues only a Better Auth session cookie | ✅ Pass | `login/route.ts` calls `auth.api.signInEmail` — no legacy cookie emitted |
| 1.2 | New registration issues only a Better Auth session cookie | ✅ Pass | `register/route.ts` calls `auth.api.signUpEmail` — no legacy cookie emitted |
| 1.3 | Logout terminates Both Better Auth and legacy session cookies | ✅ Pass | `logout/route.ts` appends both `set-cookie` clearers |
| 1.4 | Session resolution prefers Better Auth over legacy cookie | ✅ Pass | `resolveNormalizedSessionFromRequest` checks Better Auth first |
| 1.5 | Legacy fallback fires only when Better Auth session absent | ✅ Pass | Confirmed in `auth-session-adapter.service.test.ts` |
| 1.6 | Legacy fallback emits a `console.warn` in non-test envs | ✅ Pass | Added in T038; visible in server logs during migration window |
| 1.7 | `allowLegacyFallback: false` disables legacy path entirely | ✅ Pass | Option surfaced in adapter; `allowLegacyFallback === false` → early return |
| 1.8 | Better Auth secret validation fails fast in production if secret is weak/missing | ✅ Pass | `isBetterAuthConfigValid()` guards login and register; `getBetterAuthSecret()` returns null on weak secrets |

---

## 2. Identity Normalization

| # | Check | Result | Notes |
|---|-------|--------|-------|
| 2.1 | Better Auth user is never exposed raw to route handlers | ✅ Pass | `resolveNormalizedSessionFromHeaders` maps to `NormalizedAuthSession` before returning |
| 2.2 | `NormalizedAppSession` shape (`userId`, `email`, `name`, `role`) preserved post-migration | ✅ Pass | Confirmed by `auth-session-adapter.service.test.ts` and `request-auth.test.ts` |
| 2.3 | Unknown Better Auth user (no seeded email) resolves to `customer` role | ✅ Pass | `resolveAppOwnedRoleForUser` falls back to `customer` for unknown emails; confirmed in T035 tests |

---

## 3. Role Resolution and Missing-Role Behavior

| # | Check | Result | Notes |
|---|-------|--------|-------|
| 3.1 | All five admin panel roles resolve correctly from seeded emails | ✅ Pass | `auth-role-resolution.service.ts` maps by email in test; Prisma in prod |
| 3.2 | `customer` and `pharmacist` are denied all admin domains | ✅ Pass | `hasAdminDomainPermission` returns false for non-`AdminPanelRole` values |
| 3.3 | Unknown user with no app role mapping defaults to `customer` | ✅ Pass | T035 test: `unknown@external.example.com` → 403 on admin domain |
| 3.4 | Role resolution Prisma failure falls back gracefully | ✅ Pass | `auth-role-resolution.service.ts` catch block returns `inferRoleFromEmail(user.email)` |

---

## 4. Admin-Domain Authorization (RBAC)

| # | Check | Result | Notes |
|---|-------|--------|-------|
| 4.1 | `admin` has full access to all 9 domains | ✅ Pass | `admin-rbac.test.ts` — full matrix |
| 4.2 | `marketing` has full only on `marketing`, none on `operations` | ✅ Pass | `admin-rbac.test.ts` |
| 4.3 | `catalog` has full on `catalog`+`inventory`, none on `operations` | ✅ Pass | `admin-rbac.test.ts` |
| 4.4 | `support` has full on `sales`+`customers`, none on `operations` | ✅ Pass | `admin-rbac.test.ts` |
| 4.5 | `ops` has full only on `operations`, read-only everywhere else | ✅ Pass | `admin-rbac.test.ts` |
| 4.6 | Read-only role denied `full` permission check | ✅ Pass | T035 test: `ops` → 403 on `catalog` with `'full'` required |
| 4.7 | Representative protected routes enforce domain auth for all roles | ✅ Pass | `admin-route-auth.test.ts` — catalog, CMS, operations domains |

---

## 5. Trusted Mutation Request Enforcement

| # | Check | Result | Notes |
|---|-------|--------|-------|
| 5.1 | Cross-site browser mutations are rejected with 403 | ✅ Pass | `request-auth.test.ts` |
| 5.2 | Requests without provenance headers are rejected | ✅ Pass | `request-auth.test.ts` — `AUTH_UNTRUSTED_REQUEST` |
| 5.3 | Same-origin requests are accepted | ✅ Pass | `request-auth.test.ts` |
| 5.4 | Machine clients with bypass header are accepted | ✅ Pass | `request-auth.test.ts` — `x-rc-trusted-request: 1` |
| 5.5 | Trusted mutation check is preserved in `request-auth.ts` post-migration | ✅ Pass | `requireAuthSessionWithOptions` still calls `requireTrustedMutationRequest` |

---

## 6. Audit Continuity

| # | Check | Result | Notes |
|---|-------|--------|-------|
| 6.1 | Session attribution is passed through to admin/CMS service layer | ✅ Pass | `requireAdminDomainSession` returns `AuthSession` with `userId` for attribution |
| 6.2 | Auth mutations (login, logout, register) emit structured error codes on failure | ✅ Pass | All auth routes use `fail()` with specific error codes |

---

## 7. Compatibility Window and Legacy Deprecation

| # | Check | Result | Notes |
|---|-------|--------|-------|
| 7.1 | New sessions are issued only via Better Auth | ✅ Pass | Login and register routes confirmed |
| 7.2 | Legacy cookie read-path still active during transition window | ✅ Pass | `resolveNormalizedSessionFromRequest` fallback active |
| 7.3 | Legacy fallback path is observable via `console.warn` | ✅ Pass | T038 — fires in non-test environments |
| 7.4 | Explicit path to disable legacy fallback exists | ✅ Pass | `{ allowLegacyFallback: false }` option in adapter |
| 7.5 | Transition window closure gate (T039) is documented | ⏳ Deferred | T039 flagged as next step: set `allowLegacyFallback: false` globally after legacy sessions expire |

---

## 8. Delivery Gate Verification

| Gate | Status |
|------|--------|
| `yarn guard:checks` | Run in T047 |
| `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false` | Run in T047 |
| `yarn --cwd apps/next test:api` | Run in T047 |
| `yarn --cwd apps/next build --webpack` | Run in T047 |

---

## Open Items Before Full Closure

- **T039**: Set `allowLegacyFallback: false` globally once legacy session TTLs have expired (or a decided cutover date). This is the only remaining hardening step.
- Monitor `[auth] legacy-session-fallback` log lines in production to track when legacy sessions have fully drained before closing T039.
