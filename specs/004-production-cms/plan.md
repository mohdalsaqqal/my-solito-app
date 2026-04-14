# Implementation Plan: Production CMS Canonicalization

**Branch**: `004-production-cms` | **Date**: 2026-04-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-production-cms/spec.md`

## Summary

Make this repo's CMS fully production-grade by finishing the transition from a
hybrid model to a canonical in-repo CMS: Prisma/Postgres becomes the source of
truth for mutable CMS content, `apps/next/server/services` owns CMS
orchestration, storefront reads use normalized service-owned payloads, and
mock CMS data becomes seed/fallback/fixture material only.

## Technical Context

**Language/Version**: TypeScript 5.9.3  
**Primary Dependencies**: Next.js App Router, Prisma, React, React Native Web, Turbo  
**Storage**: PostgreSQL via Prisma in `apps/next/prisma`  
**Testing**: Node native test runner / workspace tests / `apps/next` API tests  
**Target Platform**: Web app (`apps/next`) with shared cross-platform UI packages  
**Project Type**: Monorepo web application with shared packages  
**Performance Goals**: Preserve current storefront CMS payload shapes and avoid
regressions in cached public reads  
**Constraints**: Must follow `UI -> server layer -> services -> providers -> adapters`; must keep CMS as data, not layout; must not reintroduce live mock-CMS truth in production paths  
**Scale/Scope**: Admin CMS domains plus homepage/editorial/release flows in the existing `apps/next` stack

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Prisma/Postgres must remain the canonical store for mutable CMS content.
- CMS reads/writes must be orchestrated through `apps/next/server/services`.
- Route Handlers and Server Actions must stay thin.
- Storefront UI must consume normalized CMS/view models, not raw Prisma rows.
- `packages/adapters/mock/cms` may be used only for seed/fallback/fixture behavior, not canonical live production truth.
- Verification must include `yarn guard:checks` and `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false`; publish/preview/caching changes also require `yarn --cwd apps/next test:api` and final build verification.

## Project Structure

### Documentation (this feature)

```text
specs/004-production-cms/
├── plan.md
├── spec.md
└── tasks.md
```

### Source Code (repository root)

```text
apps/next/
├── app/
│   ├── admin/marketing/cms/
│   └── api/admin/cms/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
└── server/services/
    ├── cms/
    ├── home/
    ├── navigation/
    └── admin/

packages/
├── adapters/mock/cms/
├── app/lib/cms/
└── providers/
```

**Structure Decision**: Keep the repo's existing monorepo boundaries. New CMS
business logic belongs in `apps/next/server/services/cms/`; existing home and
navigation services will delegate to that namespace. Admin UI remains in
`apps/next/app/admin/marketing/cms/**`; admin route handlers remain in
`apps/next/app/api/admin/**` and become thinner over time. Prisma schema and
migrations continue to live in `apps/next/prisma/`.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None anticipated | N/A | The existing repo structure already supports this feature without constitutional exceptions |
