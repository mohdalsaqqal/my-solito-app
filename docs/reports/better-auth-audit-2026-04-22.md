# Better Auth Audit - 2026-04-22

## Scope

Reviewed the current Better Auth migration and hardening surface across:

- `apps/next/lib/auth.ts`
- `apps/next/app/api/_lib/security-policy.ts`
- `apps/next/app/api/_lib/request-auth.ts`
- `apps/next/server/services/auth/*`
- `apps/next/app/api/auth/*`
- checkout/order auth-sensitive routes that still touch legacy session cookies

## Remediation Status

Updated on `2026-04-22`: the findings below were remediated in code.

- Checkout quote and order placement now resolve sessions through the normalized Better Auth boundary.
- Password reset routes no longer call the development-only mock `authProvider`; they delegate to Better Auth APIs and fail closed when reset delivery is unavailable.
- Checkout quote creation now enforces trusted mutation provenance and route-level rate limiting.
- The trusted request bypass header now requires a configured secret value; `x-rc-trusted-request: 1` alone no longer bypasses provenance checks.

Verification after remediation:

- Targeted auth/checkout/order suite: `44/44` passed.
- `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false` passed.
- `yarn guard:checks` passed.

## AGENTS-First Redo Audit

Redone on `2026-04-22` after reading `AGENTS.md` first, then memory files, `docs/architecture-index.md`, root graphify, and the bounded contexts for:

- `apps-next-api`
- `apps-next-services`
- `packages-providers`

Startup status:

- `/caveman`: inactive
- `graphify`: checked

Result:

- The original fixed items remain fixed for auth mutation routes, checkout quote creation, and order placement.
- Better Auth is now the session source for the audited live page/bootstrap services.
- Password reset works through Better Auth APIs, and the default reset-link redirect now points at the existing `/auth/reset-password` page.

## Overall Assessment

Better Auth is correctly established as the primary auth/session engine for login, register, logout, and session reads. The strongest parts of the implementation are:

- Better Auth is isolated behind a repo-owned service boundary.
- Routes consume normalized app sessions instead of raw Better Auth objects.
- App-owned RBAC remains separate from Better Auth.
- Release-like environments require a dedicated strong `BETTER_AUTH_SECRET`.
- Legacy session fallback is rejected in release-like environments.
- Unverified Better Auth identities are rejected in release-like environments.

The main remaining risks are migration completeness gaps: some auth-adjacent flows still depend on legacy cookies or the old mock auth provider.

## Findings

### P1 - Live page services still hydrate sessions from the mock auth provider — Fixed

Files:

- `apps/next/server/services/account/account-page.service.ts:3`
- `apps/next/server/services/account/account-page.service.ts:56`
- `apps/next/server/services/account/account-test-detail.service.ts:1`
- `apps/next/server/services/account/account-test-detail.service.ts:40`
- `apps/next/server/services/checkout/checkout-page.service.ts:1`
- `apps/next/server/services/checkout/checkout-page.service.ts:19`
- `apps/next/server/services/orders/order-detail.service.ts:1`
- `apps/next/server/services/orders/order-detail.service.ts:15`
- `apps/next/server/services/pharmacist/pharmacist-bootstrap.service.ts:1`
- `apps/next/server/services/pharmacist/pharmacist-bootstrap.service.ts:16`
- `packages/providers/registry.ts:54`
- `packages/providers/registry.ts:93`

`/account`, `/account/tests/[id]`, `/checkout`, `/orders/[id]`, and pharmacist bootstrap services still call `authProvider.getSession()`. In `packages/providers/registry.ts`, `authProvider` is still always `mockAuthAdapter` and the auth provider readiness tier is `development-only`.

Impact:

- Better Auth-only users can be rendered as signed out or receive stale mock-user account data on live Server Component pages.
- Account/order/pharmacist page authorization can diverge from the actual Better Auth session used by the API mutation routes.
- This violates the migration intent that Better Auth is the app's active session source, even though it still technically follows the provider boundary.

Recommendation:

- Pass request headers through the affected page-service contexts and resolve sessions with `resolveNormalizedSessionFromRequest()` or `resolveNormalizedSessionFromHeaders()`.
- Keep provider-backed domain data calls, but remove `authProvider.getSession()` from live `apps/next/server/services` page/bootstrap flows.
- Add regression tests for at least account, checkout, and order-detail initial data using Better Auth-only sessions.

Resolution:

- `StorefrontServiceContext` now preserves request headers, and `createStorefrontServiceRequest()` rebuilds request objects with those headers for server-service auth resolution.
- Account, account test detail, checkout page, order detail, and pharmacist bootstrap services now call `resolveNormalizedSessionFromRequest()` instead of `authProvider.getSession()`.
- Source search confirms no remaining `authProvider.getSession()` calls under `apps/next/server/services`.

### P2 - Password reset redirect fallback points at a missing page — Fixed

Files:

- `apps/next/app/api/_lib/security-policy.ts:6`
- `apps/next/app/api/_lib/security-policy.ts:131`
- `apps/next/app/api/_lib/security-policy.ts:137`
- `apps/next/app/auth/reset-password/page.tsx:5`
- `apps/next/app/api/auth/route.test.ts:474`

`getBetterAuthPasswordResetRedirectUrl()` defaults to `${baseUrl}/reset-password`, but the actual reset page lives at `/auth/reset-password`. Unless `BETTER_AUTH_PASSWORD_RESET_REDIRECT_URL` is configured, generated Better Auth reset links send users to a non-existent page.

Impact:

- Local/dev and any environment missing the explicit redirect env var will generate broken password-reset links.
- The existing route test locks in the wrong default path, so verification currently protects the bug.

Recommendation:

- Change `BETTER_AUTH_PASSWORD_RESET_FALLBACK_PATH` to `/auth/reset-password`.
- Update the password reset route test expectation to `http://localhost:3000/auth/reset-password`.

Resolution:

- `BETTER_AUTH_PASSWORD_RESET_FALLBACK_PATH` now defaults to `/auth/reset-password`.
- The password-reset route test expectation now matches the real App Router page.

### P1 - Checkout/order services still parse legacy auth cookies directly — Fixed

Files:

- `apps/next/server/services/checkout/checkout-quote.service.ts:6`
- `apps/next/server/services/checkout/checkout-quote.service.ts:24`
- `apps/next/server/services/checkout/checkout-quote.service.ts:69`
- `apps/next/server/services/orders/place-order.service.ts:6`
- `apps/next/server/services/orders/place-order.service.ts:110`
- `apps/next/server/services/orders/place-order.service.ts:115`

`createCheckoutQuote()` and `placeOrder()` read the old `rc_auth_session` cookie through `parseAuthSessionCookie()` instead of resolving the normalized Better Auth-backed session via `apps/next/server/services/auth`.

Impact:

- A Better Auth-only user may be treated as anonymous in checkout quote creation.
- A Better Auth-only user can be rejected when placing an order because `placeOrder()` requires a legacy session.
- Quote ownership can become inconsistent during or after legacy-session removal.

Resolution:

- `createCheckoutQuote()` and `placeOrder()` now call `resolveNormalizedSessionFromRequest(request)`.
- Added regression coverage proving order placement works with a Better Auth-only session and no legacy cookie.

### P1 - Password reset routes still use the development-only mock auth provider — Fixed

Files:

- `apps/next/app/api/auth/request-reset/route.ts:1`
- `apps/next/app/api/auth/request-reset/route.ts:21`
- `apps/next/app/api/auth/reset-password/route.ts:1`
- `apps/next/app/api/auth/reset-password/route.ts:21`
- `packages/providers/registry.ts:54`
- `packages/providers/registry.ts:93`

Login/register/session/logout have moved to Better Auth, but reset flows still call `authProvider`, which is currently always `mockAuthAdapter` and marked `development-only`.

Impact:

- Production password reset would not update Better Auth account credentials.
- The provider readiness guard does not currently include auth in the release-required domain list, so this can pass readiness checks.
- The active Better Auth migration remains incomplete for account lifecycle.

Resolution:

- `/api/auth/request-reset` now delegates to `auth.api.requestPasswordReset`.
- `/api/auth/reset-password` now delegates to `auth.api.resetPassword`.
- Release-like environments fail closed when password reset delivery is unavailable.

### P2 - `/api/checkout/quote` writes quote state without trusted mutation or rate-limit protection — Fixed

Files:

- `apps/next/app/api/checkout/quote/route.ts:5`
- `apps/next/app/api/checkout/quote/route.ts:7`
- `apps/next/server/services/checkout/checkout-quote.service.ts:193`

The route creates persisted pricing quotes but does not call `requireTrustedMutationRequest()` and does not apply a route-level limiter.

Impact:

- Cross-site POSTs and automated traffic can create quote records more cheaply than intended.
- This is not a direct account takeover issue, but it is avoidable write-surface exposure.

Resolution:

- The route now calls `requireTrustedMutationRequest(request)`.
- Added `checkoutQuoteLimiter`.
- Added a route test proving cross-site browser-like quote creation is rejected.

### P2 - Static trusted-request bypass header is too broad for public route handlers — Fixed

Files:

- `apps/next/app/api/_lib/security-policy.ts:4`
- `apps/next/app/api/_lib/request-auth.ts:115`

Any request with `x-rc-trusted-request: 1` bypasses the mutation provenance check.

Impact:

- Browser CSRF is still mostly constrained by CORS/preflight behavior, but the header is not cryptographic trust.
- If reused by non-browser clients or future infrastructure paths, it can become an attractive bypass footgun.

Resolution:

- `x-rc-trusted-request` now only bypasses provenance checks when it matches `TRUSTED_REQUEST_BYPASS_SECRET`.
- A bare `x-rc-trusted-request: 1` is rejected.

## Verification

Targeted tests run:

```text
node --max-old-space-size=4096 ../../node_modules/tsx/dist/cli.mjs --test --test-concurrency=1 app/api/auth/route.test.ts app/api/_lib/request-auth.test.ts server/services/auth/auth-session-adapter.service.test.ts app/api/orders/place/route.test.ts app/api/checkout/quote/route.test.ts
```

Original result:

- 38 tests passed.
- The targeted suite still logs local Prisma connection failures because the database is not running, but the tested code paths intentionally fall back in non-release test context.

Full suite note:

- `yarn --cwd apps/next test:api` was attempted and timed out after roughly 124 seconds in this environment.

Remediation result:

- Focused suite passed: `44/44`.
- `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false` passed.
- `yarn guard:checks` passed.
- Redo audit did not rerun the suites because it made no code changes.
- Finding-fix focused suite passed: `24/24`.
- Finding-fix typecheck passed: `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false`.
- Finding-fix guard passed: `yarn guard:checks`.

## Suggested Next Fix Order

1. Migrate checkout quote and order placement session resolution off direct legacy cookie parsing.
2. Move password reset routes to Better Auth or disable them explicitly until supported.
3. Add trusted mutation and rate limiting to checkout quote creation.
4. Replace the static trusted-request bypass header with a stronger internal trust mechanism.
