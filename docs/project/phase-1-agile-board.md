# Phase 1 Agile Board

## Current Phase Goal
Ship one real production store across web, Expo, and admin workflows using the layout-as-data platform model.

## Status Legend
- `todo`
- `in-progress`
- `review`
- `blocked`
- `done`

## Sprint Plan

### Sprint 1
- `P1-001` Add first-class `storeId` contract
- `P1-002` Add page/block schema and normalized page payload contract
- `P1-003` Define final block schema and ProductQuery resolver contracts
- `P1-004` Create shared block registry and block renderer
- `P1-005` Migrate homepage to ordered normalized blocks

### Sprint 2
- `P1-006` Migrate PLP / category discovery surfaces
- `P1-007` Migrate PDP
- `P1-008` Migrate cart and checkout surfaces
- `P1-009` Migrate account core surfaces
- `P1-010` Ensure Expo consumes normalized page/block payloads

### Sprint 3
- `P1-011` Add internal page config store and version snapshots
- `P1-012` Generalize admin editor from release blocks to page blocks
- `P1-013` Complete preview, publish, and release workflow
- `P1-014` Run guards, docs, RTL, and launch checks

## Current Sprint Focus
- Sprint 1 implementation complete and ready for review
- prepare Sprint 2 storefront surface rollout

## Backlog

| ID | Epic | Task | Owner | Status | Dependencies | Acceptance Criteria |
|---|---|---|---|---|---|---|
| P1-001 | Foundations | Add first-class `storeId` contract | Agent 1 | review | None | `storeId = "default"` flows through normalized payloads and preview paths |
| P1-002 | Foundations | Add page/block schema and normalized page payload contract | Agent 1 | review | P1-001 | BFF emits typed page payloads with versioned blocks |
| P1-003 | Foundations | Define final block schema and ProductQuery resolver contracts | Agent 1 | review | P1-002 | Block schema and ProductQuery schema are documented and implementation-ready |
| P1-004 | Renderer | Create shared block registry and block renderer | Agent 2 | review | P1-002 | Registry resolves by `type + version` and shared renderer is available |
| P1-005 | Homepage | Migrate homepage to ordered normalized blocks | Agent 3 | review | P1-002, P1-004 | Homepage body renders from BFF-owned ordered blocks |
| P1-006 | Storefront | Migrate PLP / category discovery surfaces | TBD | todo | P1-002, P1-004 | Discovery surfaces render through normalized contracts where approved |
| P1-007 | Storefront | Migrate PDP | TBD | todo | P1-002, P1-004 | PDP uses production-safe block/layout approach without breaking commerce contract |
| P1-008 | Storefront | Migrate cart and checkout surfaces | TBD | todo | P1-002, P1-004 | Cart and checkout stay server-authoritative and production-safe |
| P1-009 | Storefront | Migrate account core surfaces | TBD | todo | P1-002, P1-004 | Account surfaces align with normalized page model where approved |
| P1-010 | Mobile | Ensure Expo consumes normalized page/block payloads | TBD | todo | P1-002, P1-004 | Expo customer app uses the same BFF-owned contracts as web where applicable |
| P1-011 | Admin | Add internal page config store and version snapshots | Agent 4 | todo | P1-002 | Page config persistence and versioning exist behind admin APIs |
| P1-012 | Admin | Generalize admin editor from release blocks to page blocks | Agent 4 | todo | P1-011 | Admin editing works by page/store/position/props |
| P1-013 | Admin | Complete preview, publish, and release workflow | Agent 4 | todo | P1-011, P1-012 | Preview and publish are stable for the real store |
| P1-014 | Verification | Run guards, docs, RTL, and launch checks | Agent 5 / Main | todo | All major epics | Definition of done satisfied and production readiness confirmed |

## In Progress
- None

## Review
- `P1-001 Add first-class storeId contract`
- `P1-002 Add page/block schema and normalized page payload contract`
- `P1-003 Define final block schema and ProductQuery resolver contracts`
- `P1-004 Create shared block registry and block renderer`
- `P1-005 Migrate homepage to ordered normalized blocks`

## Blocked
- None

## Done
- Created Phase 1 delivery tracker files
- Updated `AGENTS.md` with Agile file guidance and layout-as-data rules

## Blockers / Risks
- Phase 1 now includes all required pages across web and Expo, which is a significantly larger delivery scope than homepage-first migration.
- Final page inventory must stay disciplined to avoid uncontrolled scope growth.
- Checkout and other critical commerce surfaces must preserve server-authoritative behavior while adopting the new layout model.

## Update Rules
- Move a task to `in-progress` only when implementation actually starts.
- Move a task to `review` only after code, verification, and doc updates are ready.
- Move a task to `done` only after the definition of done is satisfied.
- Add blockers immediately when they affect delivery sequencing.
