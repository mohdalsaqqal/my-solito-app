# Implementation Plan: Better Auth Migration With Security Hardening

**Branch**: `005-better-auth` | **Date**: 2026-04-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-better-auth/spec.md`

## Summary

Replace the repo's custom authentication/session lifecycle with `Better Auth`
while preserving the existing app-owned authorization model. The delivery must
include phased implementation, compatibility cutover, security hardening, audit
review, verification, and ship/rollback guidance.

Current implementation status:
- Better Auth foundation is live in `apps/next`
- normalized auth/session adapter and app-owned role resolution are landed
- auth routes and protected-route helpers now resolve Better Auth-backed
  sessions first with legacy-read fallback during cutover
- the safe production hardening pass is also landed:
  - release-like environments require a dedicated strong `BETTER_AUTH_SECRET`
  - env/CI/docs now reflect the Better Auth operator contract
  - expected debug-prerender bailout noise is filtered so real failures remain
    visible

## Technical Context

**Language/Version**: TypeScript 5.9.3  
**Primary Dependencies**: Next.js App Router, Prisma, React, Better Auth  
**Storage**: PostgreSQL via Prisma in `apps/next/prisma`  
**Testing**: Node native tests / `apps/next` API tests / build verification  
**Target Platform**: Web app (`apps/next`) with protected admin and CMS APIs  
**Project Type**: Monorepo Next.js + Expo + shared packages  
**Performance Goals**: No regression in auth-sensitive route latency or route protection behavior  
**Constraints**: Must preserve app-owned RBAC; must keep route handlers thin; must not weaken trusted mutation policy; must not introduce Strapi  
**Scale/Scope**: Authentication, protected route integration, admin/CMS authorization preservation, and migration delivery controls

## Constitution Check

*GATE: Must pass before implementation starts. Re-check after auth adapter design.*

- `Prisma/Postgres` remains the canonical persistence layer.
- Route handlers stay thin and delegate to server-owned helpers/services.
- Admin/CMS authorization remains app-owned and server-side.
- The repo's production stack remains `Better Auth + Next.js + Prisma + Custom Admin/CMS`.
- Delivery must include `yarn guard:checks`, `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false`, `yarn --cwd apps/next test:api`, and `yarn --cwd apps/next build --webpack`.

## Project Structure

### Documentation (this feature)

```text
specs/005-better-auth/
|-- plan.md
|-- spec.md
`-- tasks.md
```

### Source Code (repository root)

```text
apps/next/
|-- app/api/_lib/
|   |-- auth-session.ts
|   |-- request-auth.ts
|   `-- admin-rbac.ts
|-- app/api/auth/
|-- app/api/admin/
|-- prisma/
|   |-- schema.prisma
|   `-- migrations/
`-- server/services/
    `-- auth/
```

**Structure Decision**: Introduce `apps/next/server/services/auth/` as the
Better Auth integration boundary. Keep `app/api/_lib/request-auth.ts` as the
compatibility surface for protected routes, but make it resolve identity
through the auth service layer rather than custom cookie parsing.

## Delivery Streams

### Stream 1: Authentication Implementation

- install and configure Better Auth
- add Prisma auth tables
- build normalized auth adapter/service layer
- migrate low-risk auth endpoints
- bridge request auth helpers

### Stream 2: Authorization Preservation

- preserve `admin-rbac.ts` semantics
- preserve protected route helper contracts
- preserve trusted mutation enforcement
- preserve audit behavior on admin/CMS mutations

### Stream 3: Security Audit And Hardening

- verify session handling
- verify dual-session compatibility behavior
- verify logout and transition edge cases
- verify RBAC outcomes remain unchanged
- verify no route consumes raw Better Auth objects outside the auth boundary
- enforce release-like Better Auth secret validity
- keep request-bound auth/session routes compatible with prerender analysis
- reduce false-alarm prerender diagnostics during debug verification

### Stream 4: Delivery And Rollback

- define transition window
- define legacy session deprecation sequence
- define rollback-safe compatibility period
- define required ship gates

## Security Focus Areas

- session issuance and invalidation
- identity normalization
- role resolution and missing-role behavior
- admin-domain authorization
- trusted mutation request checks
- audit continuity for admin and CMS writes
- compatibility window behavior
- legacy session removal safety
- release-like env secret enforcement
- request-bound prerender compatibility

## Delivery Gates

- `yarn guard:checks`
- `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false`
- `yarn --cwd apps/next test:api`
- `yarn --cwd apps/next build --webpack`
- `yarn --cwd apps/next build --webpack --debug-prerender`
- role-based route protection regression review
- auth migration checklist signoff

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None anticipated | N/A | The repo can absorb this change using existing boundaries if auth and authz remain split |
