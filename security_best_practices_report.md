# Security Best Practices Report

## Executive Summary

This repo has multiple production-blocking security issues in its current web stack. The most serious is that the provider registry wires authentication to the mock adapter in all cases, which leaves seeded admin-style credentials reachable through the live auth routes. Additional high-risk findings include tracked secret-bearing `.env` material in the Strapi app, unsigned-production fallback secrets for session and preview tokens, and missing cookie hardening / CSRF defenses around credentialed routes.

## Critical

### SEC-001: Mock authentication is active in all environments
- Severity: Critical
- Location: `packages/providers/registry.ts`
- Evidence:
  - `authProvider = useMock ? mockAuthAdapter : mockAuthAdapter`
  - `cmsProvider = useMock ? mockCMSAdapter : strapiCMSAdapter`
- Impact: The web auth routes always use the mock auth backend, so seeded credentials and mock session behavior remain available beyond local development if this app is deployed as-is.
- Fix: Gate mock auth behind an explicit development-only flag and provide a non-mock production auth provider before any public deployment.
- Mitigation: Add a startup invariant that crashes the app when mock auth is selected outside local development.

### SEC-002: Seeded shorthand admin credentials are implemented in the mock auth adapter
- Severity: Critical
- Location: `packages/adapters/mock/auth/index.ts`
- Evidence:
  - `if (identifier === 'admin') return 'admin@realcosmetics.local'`
  - seeded users include passwords `admin`, `marketing`, `catalog`, `support`, `ops`
- Impact: Anyone who can reach the auth routes can authenticate as privileged users if the mock adapter is active.
- Fix: Remove seeded privileged credentials from deployable code paths or restrict them to test-only fixtures that are never imported by production code.
- Mitigation: Fail closed when `NODE_ENV === 'production'` and any mock auth module is loaded.

## High

### SEC-003: Secret-bearing Strapi `.env` file is tracked in Git
- Severity: High
- Location: `apps/strapi/.env`
- Evidence:
  - File is tracked by Git.
  - It contains `APP_KEYS`, `ADMIN_JWT_SECRET`, `DATABASE_PASSWORD`, `JWT_SECRET`, and related secret material.
- Impact: Secrets in version control are exposed to every clone, backup, and fork, and rotation becomes mandatory.
- Fix: Remove the tracked `.env` file from Git history, rotate all contained secrets, keep only `.env.example`, and ensure `.env` is gitignored.
- Mitigation: Treat every secret currently in that file as compromised until rotated.

### SEC-004: Session cookies omit the `Secure` attribute and rely on a default fallback signing secret
- Severity: High
- Location: `apps/next/app/api/_lib/auth-session.ts`
- Evidence:
  - Fallback secret: `const AUTH_SESSION_FALLBACK_SECRET = 'dev-auth-secret-change-me'`
  - Cookie headers: `Path=/; HttpOnly; SameSite=Lax; Max-Age=...` with no `Secure`
- Impact: In production, missing `Secure` weakens transport protection for credential cookies, and a missing environment secret silently falls back to a known default that can be used to forge session cookies.
- Fix: Require a non-default secret in non-local environments and set `Secure` conditionally in production.
- Mitigation: Add boot-time validation that refuses to start when `AUTH_SESSION_SECRET` is missing or equal to the fallback.

### SEC-005: Preview tokens also fall back to a known default secret
- Severity: High
- Location: `apps/next/app/api/_lib/preview-token.ts`
- Evidence:
  - `return process.env.PREVIEW_TOKEN_SECRET || process.env.ODOO_SECRET || 'dev-preview-secret'`
- Impact: If production configuration is incomplete, preview tokens become forgeable with a known secret.
- Fix: Require an explicit production secret and remove hardcoded fallbacks outside local development.
- Mitigation: Abort startup when preview-secret configuration is missing in non-dev environments.

### SEC-006: State-changing cookie-auth routes do not implement explicit CSRF/origin validation
- Severity: High
- Location: `apps/next/app/api/auth/login/route.ts`, `apps/next/app/api/auth/logout/route.ts`, `apps/next/app/api/orders/place/route.ts`, `apps/next/app/api/admin/cache/route.ts`
- Evidence:
  - Credentialed cookie auth is used.
  - No route-level `Origin` / `Referer` checks or CSRF tokens are present.
  - Session cookies use `SameSite=Lax`, but that is the only visible CSRF control.
- Impact: The app relies on browser cookie policy alone for request forgery protection, which is weaker than explicit origin or token validation for sensitive state changes.
- Fix: Add CSRF protection for state-changing endpoints, at minimum validating trusted `Origin` headers and preferably using synchronizer or double-submit tokens for browser flows.
- Mitigation: Keep cookie `SameSite` restrictions, but treat them as defense-in-depth rather than the sole control.

## Medium

### SEC-007: Sensitive admin preview token creation is exposed as a `GET`
- Severity: Medium
- Location: `apps/next/app/api/admin/preview-token/route.ts`
- Evidence:
  - Preview token generation is implemented in `export async function GET(request: Request)`
- Impact: Using `GET` for a privileged token-generation side effect increases accidental triggering and weakens the semantics of protection around a sensitive operation.
- Fix: Convert preview token creation to `POST` and apply the same CSRF/origin protections as other admin mutations.
- Mitigation: If `GET` must remain temporarily, reduce blast radius with strict origin checks and short TTLs.

### SEC-008: Security headers are not visible in app config
- Severity: Medium
- Location: `apps/next/next.config.js`
- Evidence:
  - No global `headers()` configuration or visible CSP / clickjacking / nosniff policy in repo code.
- Impact: Browser-side protections such as CSP and frame restrictions may be absent unless they are enforced by the edge or hosting platform.
- Fix: Add an explicit security-header baseline in app or edge config.
- Mitigation: Verify runtime headers in the deployed environment if these protections are intentionally managed outside the repo.

## Low

### SEC-009: Error logging includes raw caught causes
- Severity: Low
- Location: `apps/next/app/api/_lib/response.ts`
- Evidence:
  - `console.error('[BFF_FAIL]', { ..., cause: meta.cause })`
- Impact: Depending on thrown error content, logs may capture more request or secret context than intended.
- Fix: Normalize logged errors to controlled fields and avoid dumping arbitrary error objects.
- Mitigation: Ensure log sinks are access-controlled and redact sensitive values upstream.
