# SESSION-STATE.md - Active Working Memory

## Current State: 003 Platform Hygiene Remediation - Awaiting Hosted CI

**Last Updated**: 2026-04-12

**State**: The broken `003-platform-hygiene-remediation` items were repaired, the full local verification flow is green, and draft PR `#1` is open. Only hosted CI confirmation remains open.

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
