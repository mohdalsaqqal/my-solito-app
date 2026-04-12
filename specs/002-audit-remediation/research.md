# Research: Audit Remediation Plan

**Phase 0 output for spec 002-audit-remediation**  
**Date**: 2026-04-09

## Research Tasks

### 1. Session Hardening Approach

**Task**: Determine how session cookies should be hardened without breaking the current auth flow.

**Decision**: Require an explicit session secret for protected production use, retain signed cookie sessions for the current architecture, and add environment-aware secure cookie attributes with fail-safe validation.

**Rationale**: The current app already relies on signed cookie sessions in shared helpers. Replacing the auth model would expand scope and risk. Hardening the existing pattern is the smallest change that closes the audit gap.

**Alternatives considered**:

- Replace the session model entirely with a third-party auth framework: rejected because it would turn remediation into a platform-wide auth migration.
- Keep the current fallback secret and document it as dev-only: rejected because the runtime behavior does not safely enforce that boundary.

### 2. CSRF and Request-Validation Strategy

**Task**: Choose a request-validation strategy for cookie-authenticated state-changing routes.

**Decision**: Add explicit same-origin validation for browser-driven protected mutations using Origin/Referer and Fetch Metadata checks, with documented exemptions for machine-to-machine routes such as payment webhooks.

**Rationale**: The repo uses cookie-authenticated JSON and multipart routes. This makes request-origin validation the best-fit hardening step without forcing a front-end token refactor across all clients in the first remediation pass.

**Alternatives considered**:

- Synchronizer token pattern on every protected mutation: more comprehensive, but higher migration cost and more surface-area change than needed for the first remediation slice.
- Rely only on `SameSite=Lax`: rejected because OWASP treats it as defense in depth, not the primary mitigation.

### 3. Same-Origin Upload Policy

**Task**: Decide how admin uploads should handle SVG and other potentially unsafe asset types.

**Decision**: Disallow SVG in same-origin admin upload endpoints for this remediation scope and permit only validated raster formats unless a future isolated asset-serving model is introduced.

**Rationale**: The current upload endpoints write directly into `public/uploads/`, so same-origin active content is not acceptable. Blocking SVG is the lowest-risk change.

**Alternatives considered**:

- Keep SVG and trust file extension or MIME checks: rejected because SVG supports active content and same-origin delivery increases risk.
- Keep SVG but sanitize inline: rejected for this remediation because it adds parser/sanitizer complexity and a larger testing burden.

### 4. Provider Readiness Contract

**Task**: Clarify how provider selection should behave across development, testing, and production-ready paths.

**Decision**: Make readiness explicit in the provider registry and related documentation, distinguish mock-only domains from production-ready domains, and fail fast for production-sensitive paths instead of silently falling back.

**Rationale**: The audit found that current behavior defaults to mock mode and leaves several domains mock-only. The plan needs a visible contract so release intent is unambiguous.

**Alternatives considered**:

- Continue silent fallback and rely on environment discipline: rejected because the audit already showed that this obscures release readiness.
- Force every domain to become production-ready in this remediation: rejected as too broad for a hardening-focused feature.

### 5. Verification Baseline Repair

**Task**: Decide how to restore trust in the repo’s verification workflow.

**Decision**: Treat the repository root as the canonical verification entry point, repair path-sensitive tests, update failing Playwright assertions to supported APIs, and keep the mandatory guard/type/API/E2E coverage aligned with the constitution.

**Rationale**: The audit exposed both real failures and harness defects. The plan must remove the harness defects first so later failures can be trusted.

**Alternatives considered**:

- Reduce the verification surface to only typecheck plus one smoke test: rejected because it would weaken the constitution and hide regressions.
- Leave brittle tests in place and document the expected invocation path informally: rejected because release confidence depends on deterministic verification.

## External Guidance Summary

- Next.js documentation supports secure cookie attributes and keeps route-level auth/session behavior inside the App Router server layer.
- OWASP guidance recommends explicit CSRF defenses for cookie-authenticated state-changing requests and treats `SameSite` as an additional layer rather than a complete solution.
- Playwright’s current accessibility guidance favors supported assertions and accessibility tooling rather than custom APIs that do not exist on stable locators.
- Prisma documentation favors a single client instance in long-running applications, which matches the existing singleton intent if DB-backed providers become active in later phases.

## Summary of Resolved Items

All planning unknowns are resolved for this feature. No `NEEDS CLARIFICATION` markers remain.
