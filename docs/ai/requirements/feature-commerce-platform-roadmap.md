---
phase: requirements
title: Commerce Platform Roadmap Requirements
description: AGENTS-aligned requirements for the managed branded commerce platform
---

# Commerce Platform Roadmap Requirements

## Source Of Truth

These requirements are governed by `AGENTS.md` v4.5. Any requirement that conflicts with `AGENTS.md` is not active until `AGENTS.md` is explicitly updated.

Active architecture rules:

- Commerce integrations follow: UI -> Next.js Server Layer -> Services -> Provider Registry -> Adapters.
- `apps/next` owns the web app, server layer, route handlers, server actions, and `server/services`.
- `apps/expo` owns the native mobile app.
- `packages/app` owns shared screens and flows.
- `packages/ui` owns the active RNR-centered shared UI system.
- `packages/providers` owns contracts and registry.
- `packages/adapters` owns external integrations.
- Prisma/Postgres is the canonical store for mutable admin-editable CMS content.
- Mock CMS/catalog data is seed, fixture, or explicit fallback only; it is not a production source of truth.
- Server services own data access and business orchestration.
- Providers are used over direct adapter imports.
- No client, shared screen, or service may directly import adapters.
- No external BFF layer is allowed.

## Problem Statement

The project needs a managed commerce platform that can launch branded web storefronts and native mobile apps from one monorepo while connecting to merchant-owned backends through provider contracts and adapters.

The immediate goal is a production-ready single-client commerce platform with clean seams for later isolated tenant provisioning and eventual multi-tenant evolution. The main risk is duplicating existing commerce services/contracts, bypassing the service/provider/adapter flow, or introducing unapproved stack choices that conflict with `AGENTS.md`.

## Vision

Deliver a managed commerce platform where:

- Customers browse, search, buy, authenticate, and view order history across web and native surfaces.
- Store managers manage CMS content, global storefront settings, orders, and operational workflows.
- Platform operators provision isolated client deployments and manage adapters, secrets, monitoring, and release gates.
- All commerce domains are service/provider-backed and replaceable without UI rewrites.
- Future tenant/platform features build from proven single-client boundaries instead of premature SaaS UI.

## User Roles

- Customer: browses products, searches, filters, adds to cart, checks out, authenticates, views orders, and receives order status notifications where native scope supports them.
- Store Manager / Marketer: manages Prisma-backed CMS pages, blocks, media references, global settings, orders, and content workflow through admin surfaces.
- Platform Operator: configures provider/adapters, provisions isolated client deployments, manages secrets, monitors health, and verifies release gates.
- Developer: extends services, provider contracts, adapters, shared screens, and shared UI within the `AGENTS.md` layer boundaries.

## Goals & Objectives

### V1 Must-Have Scope

- Shared page builder backed by normalized CMS blocks.
- CMS block coverage for Hero, ProductGrid or ProductRail, Banner, Countdown, TextSection, Newsletter, FAQ, and Testimonials where existing renderers do not already satisfy the requirement.
- Product listing with search and faceted filters through a service/provider boundary.
- Product detail page with images, variants, prices, backend IDs, and inventory status from provider-normalized data.
- Cart and checkout flow for guest and authenticated users.
- Cash-on-delivery payment path and a provider contract for custom gateway readiness.
- Order creation and order write-back through `OrderProvider`.
- Prisma/Postgres-backed CMS persistence for mutable admin-editable content.
- Scripted isolated client provisioning path.
- Zod validation at API route boundaries before service delegation.
- Minimum verification: `yarn guard:checks`; Next architecture changes also require Next typecheck.

### Should-Have Scope

- Better Auth identity/session/account lifecycle with app-owned business roles and permissions.
- Order history and order status events.
- Notification provider contract for push and email.
- SEO-optimized web storefront with SSR-compatible metadata and structured data.
- Multi-page CMS support, page zones, global settings, media references, draft, schedule, preview, and publish workflow.
- Monitoring across web/server/native surfaces.
- CI/CD gates for lint, typecheck, test, build, and architecture guards.

### Could-Have Scope

- Native mobile parity for product browsing, product detail, cart, checkout, account, and orders.
- Native push notifications and deep linking.
- Inventory sync through webhook or polling adapters.
- OTA update workflow for native apps.
- Provider adapters for specific merchant systems after contracts are stable.

### Won't-Have In V1

- Self-serve merchant onboarding.
- Public marketplace.
- A/B testing.
- Seller onboarding.
- Seller payouts.
- Commission engine.
- Merchant billing UI.
- Tenant-facing SaaS management UX.
- Shared runtime multi-tenancy before isolated deployments are proven.

## Functional Requirements

### Storefront: Web And Mobile

- FR1: Shared screens in `packages/app/screens` render storefront, product, cart, checkout, account, and order flows without importing adapters, `process.env`, or web-only APIs.
- FR2: Shared UI uses `packages/ui/components` and `packages/ui/reusables` under the active RNR-centered UI contract.
- FR3: Product listing supports provider-backed search, typo-tolerance where supported by the adapter, facets, filters, sorting, and empty states.
- FR4: Product detail shows images, variants, price, backend IDs, and inventory status from normalized service/provider data.
- FR5: Cart and checkout support guest and authenticated users.
- FR6: Payments support cash-on-delivery now and custom gateway states through provider contracts.
- FR7: Order creation writes back to the merchant backend through `OrderProvider` or an explicitly approved provider boundary.
- FR8: Customers can view order history and order status events.
- FR9: Authentication uses Better Auth for identity/session/account lifecycle while app services enforce roles and permissions.
- FR10: Web storefront supports SSR-compatible SEO metadata and structured data through `apps/next`.
- FR11: Native mobile scope must reuse shared screens where possible and keep platform-specific navigation/shell code in `apps/expo`.

### CMS And Content Management

- FR12: CMS content is persisted in Prisma/Postgres as the canonical store for mutable admin-editable content.
- FR13: CMS reads and writes are orchestrated by `apps/next/server/services`.
- FR14: CMS blocks are normalized by server services before shared UI renders them.
- FR15: New commerce CMS blocks follow the existing `packages/app/features/home/renderers` dispatch pattern.
- FR16: Required block coverage includes Hero, ProductGrid or ProductRail, Banner, Countdown, TextSection, Newsletter, FAQ, and Testimonials.
- FR17: Existing block renderers must be audited and hardened before new block types are added.
- FR18: CMS supports multi-page content, global settings, page zones, media references, preview, schedule, draft, and publish workflows as V1 maturity goals.

### Backend Integration: Provider And Adapter Layer

- FR19: Commerce provider contracts live in `packages/providers/contracts`.
- FR20: Commerce adapters live in `packages/adapters`.
- FR21: Services may import providers/registry only, never adapters directly.
- FR22: UI, shared screens, and shared UI may not import adapters or call external commerce APIs directly.
- FR23: Existing provider contracts and services must be audited before adding new parallel contracts or service folders.
- FR24: Catalog/product provider contracts must cover products, variants, prices, inventory, backend IDs, disabled state, and provider metadata needed by merchant integrations.
- FR25: Order provider contract must cover order creation, order write-back, status sync, payment settlement references, and merchant backend references.
- FR26: Search must be provider-backed and expose full-text query, facets, filters, index status, and adapter health.
- FR27: Notifications must be provider-backed and support order-status push/email workflows when enabled.
- FR28: Payment behavior must be provider-backed, whether it remains on `OrderProvider` or becomes a standalone `PaymentProvider`.

### Platform Operations

- FR29: Client provisioning must be scripted for isolated deployments and must not assume shared runtime multi-tenancy.
- FR30: Provisioning output may include deployment metadata, adapter config references, domain config, EAS/native config, monitoring references, and secret references.
- FR31: Provisioning must never write real secrets into source code.
- FR32: Monitoring and release gates must cover web, server, and native surfaces where applicable.
- FR33: CI must run meaningful lint/typecheck/test/build gates and architecture guards.

### Security And Compliance

- FR34: API route handlers validate input with Zod schemas before service calls.
- FR35: Route handlers remain thin: authenticate, parse, validate, delegate, respond.
- FR36: Server services enforce business authorization and do not rely on UI-only checks.
- FR37: Better Auth proves identity; app-owned roles and permissions decide business access.
- FR38: HTTPS and secure headers are required for production storefronts.
- FR39: Secrets are server-only and managed through deployment/secret-management systems, not committed source.
- FR40: Production-like auth/payment behavior must fail closed when required secrets/config are missing.

## Non-Functional Requirements

- NFR1: Web storefront Lighthouse score target is at least 90 for critical public pages.
- NFR2: Native critical flows should target smooth interaction on mid-range Android devices once mobile scope is active.
- NFR3: V1 uses isolated per-client deployments; shared multi-tenancy is deferred until the single-client platform is proven.
- NFR4: Storefront uptime target is 99.5%.
- NFR5: Maintainability depends on preserving monorepo boundaries and avoiding duplicate commerce abstractions.
- NFR6: Testability includes focused service/provider/adapter tests, Playwright for critical web flows, and Maestro for approved native flows.
- NFR7: Architecture guards should prevent adapter leaks, service bypasses, public legacy UI primitive reintroduction, and forbidden server/client access patterns.

## Explicit Commerce Audit Requirement

Before implementation, produce a short matrix with:

- area
- existing file or module
- gap
- action
- owner layer
- verification

Audit first:

- Existing providers: `CartProvider`, `OrderProvider`, `ProductProvider`, `CatalogProviders`, `CMSProvider`.
- Existing services: `cart`, `catalog`, `checkout`, `orders`, `payments`, `product`, `search`.
- Existing shared screens: `ShopScreen`, `SearchResultsScreen`, `ProductScreen`, `CartScreen`, `CheckoutScreen`, `OrdersScreen`, `OrderDetailScreen`, `AccountScreen`.
- Existing CMS renderers before adding ProductGrid, Banner, Countdown, Newsletter, FAQ, or Testimonials.

Only confirmed gaps become implementation tasks.

## Proposed Adapter Targets

These are implementation targets only after provider contracts are stable:

- Odoo adapter for catalog, inventory, pricing, and order write-back.
- Shopify REST adapter for catalog, inventory, pricing, and order write-back.
- Custom PostgreSQL adapter for merchant-specific catalog/order integration.
- Search adapter such as Meilisearch behind `SearchProvider`.
- Payment gateway adapter such as Paymob behind the approved payment provider boundary.
- Notification adapters for push/email behind `NotificationProvider`.

Specific adapter names are not permanent architecture rules unless `AGENTS.md` is updated again.

## Deferred Or Not Active Without AGENTS Update

These are not active implementation requirements because they conflict with, or are not yet approved by, `AGENTS.md`:

- Replacing Prisma/Postgres canonical CMS ownership with Payload CMS.
- Replacing the active RNR-centered shared UI contract with Tamagui.
- Adding an external BFF or exposing GraphQL Mesh as a new top-level data path.
- Letting client/shared code call merchant APIs directly.
- Letting services import adapters directly.
- Treating mock CMS/catalog data as production canonical content.

## User Stories & Use Cases

- As a customer, I want to browse, search, filter, view product detail, add to cart, and checkout through a storefront that works on web and approved native flows.
- As a customer, I want to authenticate and view order history without exposing admin-only data.
- As a store manager, I want to manage CMS content and global storefront settings through admin workflows backed by server services.
- As a store manager, I want products, inventory, orders, and payment status to flow through provider-backed integrations.
- As a platform operator, I want provisioning scripts and provider configs that launch isolated client deployments without committing secrets.
- As a developer, I want clear layer boundaries so adding Odoo, Shopify, PostgreSQL, search, payment, or notification adapters does not require UI rewrites.

## Success Criteria

- Requirements, design, planning, and implementation stay aligned with `AGENTS.md`.
- Must-have commerce flows run through services, provider registry, and adapters.
- No UI, shared screen, or service directly imports adapters.
- CMS mutable content remains Prisma/Postgres canonical and is normalized before UI rendering.
- New commerce blocks/screens/contracts are added only after existing equivalents are audited.
- Search, notification, payment, catalog, cart, checkout, order, and CMS domains are provider/service-backed.
- API inputs are validated with Zod before service delegation.
- Guards and tests cover each fixed architecture gap.
- `npx ai-devkit@latest lint --feature commerce-platform-roadmap` passes.
- `yarn guard:checks` passes when implementation changes land.

## Phase 2 Requirements Review

Review status: requirements are template-complete and aligned to `AGENTS.md` v4.5.

Validated:

- Problem statement identifies the managed commerce platform goal and the main architecture risk.
- Goals and non-goals separate V1 must/should/could scope from deferred marketplace/SaaS work.
- Functional requirements cover storefront, CMS, provider/adapter integration, platform operations, and security.
- Success criteria are measurable against repo architecture boundaries and verification gates.
- Constraints preserve Prisma/Postgres CMS, RNR-centered shared UI, service/provider/adapter flow, and no external BFF.
- Open questions are now implementation choices, not unresolved source-of-truth conflicts.

Remaining clarification areas:

- Payment boundary: keep payment behavior on `OrderProvider` or introduce standalone `PaymentProvider`.
- Native scope: browse-only, browse/cart/account, or full checkout.
- Search adapter: first implementation after `SearchProvider` is stable.
- Notification channels: push, email, SMS, or contract readiness only.
- Provisioning output: config references, deployment metadata, EAS config, monitoring references, or all of them.
- CMS block audit: which required blocks are already satisfied by existing renderers.

## Constraints & Assumptions

- `AGENTS.md` v4.5 is the active source of truth.
- V1 is single-client or isolated-client deployment first.
- Shared runtime multi-tenancy and marketplace concepts are future phases.
- Existing repo services/contracts/screens may already satisfy part of the platform and should be hardened before replacement.
- Native scope must respect the `apps/expo` ownership boundary.
- Shared `packages/` code must stay cross-platform-safe.
- Active shared UI work must use tokens and the current RNR-centered UI contract.

## Questions & Open Items

- Should payment remain on `OrderProvider`, or should the repo introduce a standalone `PaymentProvider`?
- What exact Odoo and Shopify resources are required for V1 catalog, inventory, pricing, and order write-back?
- What is the minimum native V1 scope: browse-only, browse/cart/account, or full checkout?
- Which search adapter should be first once `SearchProvider` is stable?
- Which notification channels are V1: push, email, SMS, or only provider contract readiness?
- What should `new-client.ts` generate first: config references, deployment metadata, EAS config, Sentry references, or all of them?
- Which existing CMS blocks satisfy the required commerce block set, and which are true gaps?
