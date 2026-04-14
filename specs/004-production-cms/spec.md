# Feature Specification: Production CMS Canonicalization

**Feature Branch**: `004-production-cms`  
**Created**: 2026-04-13  
**Status**: Draft  
**Input**: User description: "Make this repo's CMS a clean, fully production-grade in-repo CMS on Next.js + Prisma"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Canonical Global CMS Reads/Writes (Priority: P1)

As a platform operator, I want the global CMS domains already exposed in admin
to read and write through the server services layer with Prisma as the
canonical store, so shell/site content is production-safe and no longer depends
on endpoint-local store logic.

**Why this priority**: This is the smallest high-value slice that establishes
the production CMS boundary without waiting for full home/editorial migration.

**Independent Test**: Update site config, banners, UGC, and toggles from admin;
confirm changes persist in Prisma and are read back through services without the
storefront depending on mock CMS as the canonical source for those domains.

**Acceptance Scenarios**:

1. **Given** an admin updates site config, **When** the write completes,
   **Then** the change is persisted in Prisma and subsequent reads come through
   `apps/next/server/services` rather than endpoint-local store logic.
2. **Given** banners, UGC, or toggle overrides exist in Prisma, **When** the
   storefront shell is rendered, **Then** the read path uses canonical service
   orchestration and emits the same normalized UI contract.

---

### User Story 2 - Homepage Merchandising Uses Canonical Persistence (Priority: P1)

As a content operator, I want homepage merchandising modules and block-driven
sections to be backed by canonical persisted data, so admin-edited storefront
content is no longer split across Prisma and mock CMS payloads.

**Why this priority**: The current hybrid model is most visible on the
homepage. Migrating these domains removes the biggest production ambiguity.

**Independent Test**: Persist a homepage merchandising change through admin or
release/block tools, then verify `home-cms.service.ts` renders the updated
content from canonical persisted sources without relying on the mock CMS
adapter as the source of truth.

**Acceptance Scenarios**:

1. **Given** a homepage merchandising block is published, **When** the home
   page is requested, **Then** the block is sourced from canonical persisted
   records and normalized by services before rendering.
2. **Given** no block data exists for a migrated domain, **When** the
   storefront renders, **Then** the behavior follows the defined bootstrap or
   fallback path rather than silently treating mock CMS runtime data as
   production truth.

---

### User Story 3 - Explicit Preview, Publish, And Rollback (Priority: P2)

As an operations/admin user, I want explicit draft, preview, publish, and
rollback flows for CMS content, so content changes can be safely reviewed and
released.

**Why this priority**: This is essential for a fully production-grade CMS but
depends on canonical persistence being in place first.

**Independent Test**: Create or edit draft CMS content, preview it, publish it,
and roll it back through the production CMS services and routes.

**Acceptance Scenarios**:

1. **Given** a draft CMS change exists, **When** preview mode is requested,
   **Then** the preview payload reflects draft content without mutating the
   published storefront state.
2. **Given** a published CMS release exists, **When** an operator rolls back,
   **Then** the storefront resolves the previous published state and audit
   metadata records the action.

## Edge Cases

- What happens when Prisma is temporarily unavailable during an admin CMS write?
- What happens when a migrated CMS domain has no canonical persisted records yet?
- How does the system behave when preview tokens are invalid or point to stale
  release/version records?
- What happens when a publish action succeeds in persistence but cache
  invalidation fails?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST treat `Prisma/Postgres` as the canonical persistence
  layer for all mutable, admin-editable CMS content.
- **FR-002**: System MUST orchestrate CMS reads and writes through
  `apps/next/server/services`.
- **FR-003**: Route Handlers and Server Actions MUST remain thin transport
  layers that delegate CMS business logic to services.
- **FR-004**: System MUST normalize canonical CMS records into stable
  storefront/admin view models before rendering UI.
- **FR-005**: System MUST migrate site config, banners, UGC, and admin controls
  to service-owned read/write paths backed by Prisma.
- **FR-006**: System MUST migrate homepage merchandising and editorial block
  domains off live mock-CMS source-of-truth behavior.
- **FR-007**: System MUST support explicit draft, preview, publish, and
  rollback behavior for production CMS content.
- **FR-008**: System MUST record actor attribution and audit metadata for CMS
  mutations that affect canonical content.
- **FR-009**: System MUST provide an explicit bootstrap/seed strategy for local
  and staging environments without using mock CMS runtime data as production
  truth.
- **FR-010**: System MUST preserve current storefront contracts while changing
  the backing persistence source for migrated CMS domains.
- **FR-011**: System MUST include service/API verification for each migrated CMS
  slice.

### Key Entities *(include if feature involves data)*

- **CmsSiteConfig**: Canonical singleton for branding, top-bar, footer, and
  search shell content.
- **CmsBannerDomain**: Canonical ticker and education-banner content used by
  storefront shell and marketing surfaces.
- **CmsUgcDomain**: Canonical UGC items curated through admin.
- **CmsAdminControlsDomain**: Toggle overrides, brand spotlights, offer
  banners, and related audit metadata.
- **CmsHomeMerchandisingDomain**: Canonical persisted merchandising/editorial
  content for homepage and related release-driven blocks.
- **CmsReleaseVersion**: Persisted draft/published/rollback-capable content
  versioning records used for preview and publish flows.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: No migrated live storefront CMS path uses
  `packages/adapters/mock/cms/index.ts` as its canonical source of truth.
- **SC-002**: All migrated CMS writes are routed through
  `apps/next/server/services` and persisted in Prisma.
- **SC-003**: Preview and publish flows for migrated CMS domains are explicitly
  testable and pass their service/API verification.
- **SC-004**: Admin-edited CMS changes for the P1 scope remain visible in the
  storefront through the same normalized UI contracts after migration.
- **SC-005**: Bootstrap/seed behavior is documented and operationally separate
  from production content ownership.

## Assumptions

- Existing admin UI surfaces in `apps/next/app/admin/marketing/cms/**` will be
  reused and incrementally refactored rather than replaced wholesale.
- Existing Prisma CMS tables are the starting point, and additional models or
  lifecycle fields may be introduced as needed.
- Storefront UI contracts should remain stable while the persistence and
  orchestration layers change underneath them.
- The repo will continue using an in-repo CMS on `Next.js + Prisma`, per the
  constitution and `AGENTS.md`, rather than introducing an external CMS
  product.
