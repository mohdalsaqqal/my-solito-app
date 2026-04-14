# Production Blueprint

This is the recommended production architecture for this repo.

## Stack

- `Better Auth` for authentication
- `Next.js App Router` in `apps/next` for web, admin, route handlers, and server actions
- `Prisma + Postgres` for canonical app, CMS, release, and audit persistence
- Custom in-repo admin/CMS in `apps/next/app/admin`
- `apps/next/server/services` as the canonical business orchestration layer
- `packages/providers` for contracts and registry boundaries
- `packages/adapters` for external integrations and mock providers
- `apps/expo` for the mobile app

## Core Flows

### Data Flow

`UI -> Next.js server layer -> services -> provider registry -> adapters -> Prisma/external systems`

### CMS Flow

`Admin UI -> admin route handlers/server actions -> cms services -> Prisma -> normalized CMS view models -> storefront UI`

### Auth Flow

`Better Auth -> normalized app session -> custom RBAC/admin-domain checks -> route handlers/services`

## Ownership

### Better Auth Owns

- sign in
- sign out
- session lifecycle
- password/account flows
- identity/session primitives
- production auth secret configuration via `BETTER_AUTH_SECRET`

### The App Owns

- admin roles
- admin-domain permissions
- CMS authorization
- publish/rollback permissions
- audit logs
- trusted mutation policy
- business authorization rules

### Prisma Owns

- canonical CMS data
- release/version data
- audit records
- app-owned role and permission metadata
- operational admin data

## Recommended Rules

- Keep `Prisma/Postgres` as the canonical store for mutable admin-editable CMS content
- Keep CMS orchestration in `apps/next/server/services`
- Keep route handlers thin
- Keep storefront/shared UI consuming normalized CMS/view models, never raw Prisma rows
- Keep `packages/adapters/mock/cms` limited to seeds, fixtures, and explicit fallback/bootstrap use
- Do not introduce Strapi for this repo's production CMS path

## Why This Is The Best Fit

- It matches the repo's existing architecture rules in `AGENTS.md`
- It keeps admin, CMS, and commerce workflows in one system
- It preserves provider/adapter boundaries
- It avoids splitting business logic across a separate CMS platform
- It improves auth maturity without giving up custom authorization

## Explicit Recommendation

Use:

- `Better Auth + Next.js + Prisma + Custom Admin/CMS`

Do not use:

- `Strapi` as the production CMS for this repo

## Migration Direction

### Auth

- Introduce `Better Auth` for authentication
- Keep custom RBAC and admin-domain authorization on top
- Migrate auth in phases, starting with session/login flows
- Detailed plan: [2026-04-14 Better Auth Migration Plan](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/docs/plans/2026-04-14-better-auth-migration-plan.md)
- Current status: Better Auth foundation, Prisma tables, normalized auth adapter, and auth route cutover are landed; legacy session reads remain temporarily supported for rollback-safe cutover
- Operator rule: staging/production must set a dedicated `BETTER_AUTH_SECRET` with at least 32 characters of high-entropy random data

### CMS

- Continue moving remaining storefront CMS reads away from mock runtime truth
- Keep service-owned CMS reads/writes
- Keep Prisma as the single editable source of truth

## Done Looks Like

- authentication is library-backed and standardized
- authorization remains app-owned and business-specific
- all admin-editable CMS content is persisted in Prisma
- all CMS reads and writes flow through `apps/next/server/services`
- the storefront does not depend on live mock CMS runtime data
