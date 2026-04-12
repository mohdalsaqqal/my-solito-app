# Implementation Plan: Audit Remediation Plan

**Branch**: `002-audit-remediation` | **Date**: 2026-04-09 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-audit-remediation/spec.md`

## Summary

Harden the active Next.js commerce platform against the highest-risk audit findings by enforcing production-safe session handling, adding explicit validation for cookie-authenticated mutations, tightening same-origin upload policy, making provider readiness behavior explicit, and restoring trust in the repository verification baseline. The implementation will preserve the existing server-first architecture and shared UI contract while eliminating silent fallbacks and brittle test behavior.

## Technical Context

**Language/Version**: TypeScript 5.x across Next.js App Router, shared packages, and Playwright tests  
**Primary Dependencies**: Next.js 16.2.x, React 19, Expo 54, Playwright 1.59.x, Prisma 6.5.x, Yarn 4, Turbo 2.x  
**Storage**: File-backed mock stores in `.tmp/` and `.data/`, plus Prisma/PostgreSQL schema present in `apps/next/prisma/`  
**Testing**: `yarn guard:checks`, `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false`, `yarn --cwd apps/next test:api`, targeted Playwright E2E in `e2e/`  
**Target Platform**: Web-first commerce application in `apps/next`, with shared package impact for web and Expo consumers  
**Project Type**: Monorepo web application with shared UI/app packages and provider/adapters layers  
**Performance Goals**: Preserve current customer and admin flow responsiveness; no added verification step should materially slow the standard root verification workflow  
**Constraints**: Must keep data access in `apps/next/server/services`; must not introduce adapter imports outside allowed layers; must preserve existing customer/admin flows while tightening security; must keep Cache Components enabled; must satisfy repo constitution and AGENTS.md rules  
**Scale/Scope**: Auth/session helpers, protected route utilities, selected route handlers, selected admin upload endpoints, provider registry behavior, repository guard/test scripts, and verification documentation affecting the audit remediation scope

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Applicable? | Status | Notes |
|-----------|-------------|--------|-------|
| I. Server-Owned Data Access | Yes | PASS | All security and readiness changes stay inside route handlers, services, and shared server utilities |
| II. Token-Driven Design | Yes | PASS | Shared UI guard failure is in scope to bring back into compliance, not bypass |
| III. Provider-Mediated Integration | Yes | PASS | Provider readiness cleanup will clarify registry behavior without bypassing providers |
| IV. Width-Driven Responsive Layout and Touch Compliance | No | N/A | No new layout work is planned beyond fixing existing guard alignment |
| V. Layered Package Boundaries | Yes | PASS | Changes are explicitly split between `apps/next`, `packages/providers`, and shared verification artifacts |
| VI. CMS Controls Content, Not Layout | No | N/A | CMS content behavior is unaffected except for admin upload policy hardening |
| VII. Parallel Agent Dispatch | Yes | PASS | Implementation can later be split by file or subsystem when execution begins |
| VIII. Spec-Driven Delivery | Yes | PASS | This remediation is being documented and planned through Spec Kit before implementation |
| IX. Phase Isolation | Yes | PASS | Work is additive hardening for the Phase 1 baseline and does not introduce SaaS platform behavior |
| X. Accessibility as a First-Class Concern | Yes | PASS | Verification remediation includes stabilizing accessibility checks rather than weakening them |
| XI. Performance Baseline | Yes | PASS | Security and verification changes must not introduce wasteful request or render patterns |
| XII. Theme Completeness | Yes | PASS | Shared UI compliance work remains bound to token and theming rules |
| XIII. Visual Quality Standards | Yes | PASS | The plan restores guard compliance instead of adding exceptions |

**Gate result: PASS** — No constitutional exceptions are required for planning this feature.

## Project Structure

### Documentation (this feature)

```text
specs/002-audit-remediation/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── protected-mutation-policy.md
│   ├── admin-upload-policy.md
│   └── verification-baseline.md
└── tasks.md
```

### Source Code (repository root)

```text
apps/
├── next/
│   ├── app/
│   │   ├── api/
│   │   │   ├── _lib/
│   │   │   ├── auth/
│   │   │   ├── admin/
│   │   │   ├── account/
│   │   │   ├── orders/
│   │   │   └── payments/
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── proxy.ts
│   └── server/
│       └── services/
packages/
├── providers/
│   └── registry.ts
└── ui/
    └── components/
e2e/
scripts/
```

**Structure Decision**: The remediation spans server utilities, protected route handlers, provider registry behavior, shared UI guard compliance, and repository verification artifacts. Source-of-truth security behavior remains in `apps/next/app/api/_lib`, route orchestration remains in route handlers and services, provider readiness remains in `packages/providers`, and verification behavior remains in root scripts plus `e2e/`.

## Complexity Tracking

> No Constitution Check violations — this section is intentionally empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| (none) | — | — |
