# Production CMS Plan

**Date**: 2026-04-13
**Basis**: `.specify/memory/constitution.md` v`1.4.0`
**Scope**: Move this repo from a hybrid CMS model to a clean, production-grade in-repo CMS on `Next.js + Prisma`

## Summary

This repo already has the right production direction: admin UI in `apps/next/app/admin`,
admin APIs in `apps/next/app/api/admin`, Prisma/Postgres persistence in `apps/next/prisma`,
and a strong server-layer architecture.

The remaining gap is that storefront CMS reads are still partly sourced from
`packages/adapters/mock/cms/index.ts`, while admin-managed overrides/config already persist
through Prisma. This plan completes that transition so Prisma becomes the canonical source of
truth for mutable CMS content and `apps/next/server/services` becomes the single CMS
orchestration layer.

## Current State

- Admin-managed CMS entities already persisted in Prisma:
  - `CmsSiteConfig`
  - `CmsTickerSettings`
  - `CmsTickerItem`
  - `CmsEducationBanner`
  - `CmsUgcItem`
  - `CmsToggleOverride`
  - `CmsBrandSpotlight`
  - `CmsOfferBanner`
  - `CmsAuditLog`
- Storefront CMS base content still depends on `packages/adapters/mock/cms/index.ts`
- Some admin business logic still lives in `apps/next/app/api/_lib/*store.ts`
- CMS normalization exists, but the source-of-truth boundary is still hybrid

## Target State

- `Prisma/Postgres` is the canonical source of truth for all mutable, admin-editable CMS content
- `apps/next/server/services` owns CMS reads, writes, normalization, preview, publish, and rollback orchestration
- `apps/next/app/api/admin` and any Server Actions remain thin transport layers
- Storefront reads consume only normalized CMS/view models from services
- `packages/adapters/mock/cms` is reduced to seeds, fixtures, contract-testing helpers, or explicit fallback/bootstrap data
- No live storefront path treats mock CMS data as the production source of truth

## Non-Negotiable Constraints

- Follow `UI -> Next.js server layer -> services -> provider registry -> adapters`
- Do not return raw Prisma rows directly to UI
- Keep CMS as data, not layout
- Keep Route Handlers thin
- Keep shared UI unaware of persistence shape
- Keep Prisma models queryable and operationally useful; use `Json` only where flexibility is genuinely needed

## Workstreams

### 1. Domain Audit And Mapping

Create a complete CMS inventory and classify each domain into one of three buckets:

- already Prisma-backed and production-capable
- Prisma-backed but still routed through legacy API-local store logic
- mock-backed and still needing canonical persistence

Deliverable:
- a migration matrix covering each storefront/admin CMS domain, current source, target source, and owner files

### 2. Canonical CMS Service Layer

Create or consolidate a dedicated CMS service surface under `apps/next/server/services`, for example:

- `cms-read.service.ts`
- `cms-admin-write.service.ts`
- `cms-preview.service.ts`
- `cms-publish.service.ts`
- `cms-versioning.service.ts`

Responsibilities:
- validation
- normalization
- draft/publish orchestration
- audit logging
- cache invalidation triggers
- rollback support

Deliverable:
- all CMS Route Handlers delegate to services instead of keeping long-term business logic in `app/api/_lib`

### 3. Prisma Model Completion

Add the missing Prisma models for storefront CMS domains that still only exist in mock data.

Design rules:
- use typed columns for status, ordering, locale, actor info, and operational fields
- use `Json` only for flexible block payloads or experimental structures
- include lifecycle and governance fields by default:
  - `status`
  - `createdAt`
  - `updatedAt`
  - `publishedAt`
  - `updatedByUserId`
  - `updatedByEmail`
  - `version` or equivalent release linkage

Deliverable:
- complete schema support for all admin-editable CMS domains

### 4. Draft, Preview, Publish, Rollback

Introduce a proper production editorial lifecycle:

- draft editing
- preview mode
- explicit publish action
- deterministic published snapshot or release promotion
- rollback path to a previous published version

Deliverable:
- production-safe publish mechanics instead of implicit live mutation behavior

### 5. Storefront Read Migration

Replace live storefront dependence on `packages/adapters/mock/cms/index.ts` domain by domain.

Suggested order:
1. Site config and shell content
2. Ticker, banners, and homepage promotional modules
3. Brand spotlights and merchandising sections
4. Editorial blocks and remaining home-layout content
5. Navigation/footer/legal/help content

Deliverable:
- each migrated domain reads from Prisma-backed services and emits the same normalized UI contract

### 6. Admin Write Consolidation

Move admin persistence logic toward a stable service-owned write path.

Refactor goal:
- Route Handler parses/authenticates request
- service validates and applies business rules
- Prisma persists canonical records
- service writes audit trail and invalidates caches

Deliverable:
- `app/api/_lib/*store.ts` is reduced, retired, or converted into thin persistence helpers underneath services

### 7. Seeds And Bootstrap Strategy

Convert the useful mock CMS content into one of:

- Prisma seed scripts
- bootstrap migration scripts
- fixture data for tests

Do not leave runtime production behavior dependent on the mock adapter.

Deliverable:
- repeatable local/staging bootstrap without treating mocks as live production data

### 8. Verification And Operations

Add the missing production safety net:

- service-level tests for CMS reads/writes
- publish/rollback tests
- preview-mode tests
- route-shape tests for admin endpoints
- cache invalidation verification
- migration/runbook documentation

Deliverable:
- a production-operable CMS with explicit verification and recovery procedures

## Delivery Phases

### Phase A - Inventory And Service Boundary

- map all CMS domains
- define service ownership
- decide schema additions and publish strategy

### Phase B - Foundation

- add/complete Prisma models
- create CMS service layer
- wire audit/versioning primitives

### Phase C - Domain Migration

- migrate storefront CMS reads domain by domain
- keep UI contracts stable while changing persistence source

### Phase D - Editorial Lifecycle

- ship preview/publish/rollback
- complete admin write consolidation

### Phase E - Hardening

- remove remaining live mock dependencies
- finalize seeds/runbooks/tests

## Risks

- existing storefront behavior may be subtly coupled to mock payload shape
- overusing `Json` could recreate a weakly-typed CMS schema inside Prisma
- migrating too many domains at once increases regression risk
- cache invalidation may be missed unless publish flows own it centrally

## Risk Controls

- migrate one CMS domain at a time
- preserve normalized service contracts while changing only the backing source
- add regression tests before cutting over each domain
- keep preview and publish flows explicit
- treat schema design as an operational concern, not just a content concern

## Verification

Minimum for each migration slice:

- `yarn guard:checks`
- `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false`
- targeted API/service tests for the touched CMS domain

Required for publish-flow or routing changes:

- `yarn --cwd apps/next test:api`
- `next build --webpack --debug-prerender` from `apps/next`

## Exit Criteria

This plan is complete when:

- all admin-editable CMS domains are canonically stored in Prisma
- all CMS reads and writes are orchestrated through `apps/next/server/services`
- no live storefront CMS path depends on `packages/adapters/mock/cms` as its source of truth
- draft, preview, publish, and rollback are implemented
- auditability and cache invalidation are part of the standard write flow
- bootstrap/seed behavior is explicit and separate from production content ownership
