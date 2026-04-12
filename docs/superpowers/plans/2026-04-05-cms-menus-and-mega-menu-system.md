# CMS Menus And Mega Menu System Plan

## Locked Direction

Build a CMS-managed menu system with WordPress-style menu creation and location assignment, but adapt the item model for commerce.

The system is:

- navigation
- merchandising
- discovery

Code owns:

- header layout
- mega menu interaction
- accessibility
- responsive behavior
- analytics dispatch

CMS owns:

- menu definitions
- item tree
- source references
- ordering
- brand rail configuration
- featured slots

## Data Contracts

Add provider-level menu contracts for:

- menu locations
- display styles
- nested menu items
- source references
- brand rail modes
- featured slots
- analytics metadata

Also add app-facing menu types for admin CRUD and future resolver output.

## Phase 1 Implementation Order

### 1. Docs And Contract Lock

- add spec and plan documents
- include analytics hooks explicitly
- lock scope to admin + provider + API + validation foundation

### 2. Provider Contracts

Create a dedicated menu contract file under `packages/providers/contracts/`.

Add:

- `MenuLocation`
- `MenuDisplayStyle`
- `MenuSourceType`
- `MenuItem`
- `BrandRailSource`
- `FeaturedSlot`
- `MenuAnalyticsConfig`
- `MenuRecord`
- `MenuProvider`

Update exports in `packages/providers/contracts/index.ts`.

### 3. Mock Adapter And Registry

Create a mock menu adapter with JSON persistence in `.tmp`.

Add:

- list menus
- get menu by id
- create menu
- update menu
- delete menu

Register `menuProvider` in `packages/providers/registry.ts`.

### 4. Shared App Types

Add app-facing menu types in `packages/app/lib/types.ts` for:

- admin CRUD
- future shell usage

Keep these aligned with provider contracts.

### 5. Endpoints And API Client

Add admin endpoints:

- `GET /api/admin/cms/menus`
- `POST /api/admin/cms/menus`
- `GET /api/admin/cms/menus/[id]`
- `PATCH /api/admin/cms/menus/[id]`
- `DELETE /api/admin/cms/menus/[id]`

Add matching `apiClient.admin` methods.

### 6. Admin Service Layer

Add `apps/next/server/services/admin/admin-menus.service.ts`.

Responsibilities:

- validation
- create/update/delete/list orchestration
- audit events
- strict depth enforcement
- source-type checks
- feature slot checks
- brand rail placement checks

### 7. CMS Admin UI

Add:

- `apps/next/app/admin/marketing/cms/menus/page.tsx`
- `apps/next/app/admin/marketing/cms/menus/[id]/page.tsx`

Phase 1 UI can be pragmatic:

- menu list
- create menu form
- metadata editing
- raw JSON tree editor for items/config
- inline validation errors

The visual drag-and-drop builder can come later once the data model is stable.

### 8. Analytics Hook Requirement

Phase 1 must include analytics fields in the menu contract even if header runtime emission lands in phase 2.

Minimum contract support:

- stable ids for menu, item, brand rail, and featured slot
- optional analytics keys for click and impression events

Future header integration must emit:

- menu open impression
- section impression
- item impression
- item click
- featured slot impression
- featured slot click
- brand rail click

### 9. Header Integration

Defer actual `Header.tsx` integration until the admin/model slice is stable.

Future split:

- `Header.tsx`
- `HeaderPrimaryNav.tsx`
- `HeaderMegaMenu.tsx`
- `HeaderMegaMenuRail.tsx`
- `HeaderMegaMenuColumns.tsx`
- `HeaderMegaMenuBrandRail.tsx`
- `HeaderMegaMenuFeaturedSlot.tsx`

## Validation Requirements

Must validate on save and on read:

- max depth 3
- no invalid parent chains
- no brand rail below level 1
- no featured slot below level 2
- valid source refs by source type

## First Deliverable

The first implementation slice is complete when:

- a menu can be created in CMS
- it can be assigned to `header_primary` or `header_mega_categories`
- it can be saved with nested items
- invalid depth is rejected
- analytics metadata is stored in the contract
- audit events are recorded

## Deferred Work

- shell resolver
- header consumption
- mobile rendering
- drag-and-drop editor
- query-backed dynamic brand resolution
- campaign-backed featured slot resolution
