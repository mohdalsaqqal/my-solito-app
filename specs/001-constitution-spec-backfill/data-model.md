# Data Model: Constitution and Spec Backfill

**Phase 1 output for spec 001-constitution-spec-backfill**
**Date**: 2026-04-03

## Overview

This subphase produces governance documents, not application data. The "entities" below describe the structure of the deliverable artifacts rather than database models.

## Entities

### Constitution

The single highest-authority governance document.

**Location**: `.specify/memory/constitution.md`

| Field | Type | Description |
|-------|------|-------------|
| Version | SemVer string | Current: 1.1.0. Incremented per amendment procedure. |
| Ratified | ISO date | Date of initial adoption |
| Last Amended | ISO date | Date of most recent change |
| Principles | Ordered list (I–IX) | Each has: name, description (MUST/MUST NOT rules), rationale |
| Architecture Constraints | Bullet list | Specific forbidden/required patterns |
| Program Model | Structured section | Phase 1/Phase 2 description, subphase inventory, execution order |
| Development Workflow | Structured section | Verification commands, Definition of Done, Memory Sync rules |
| Governance | Structured section | Amendment procedure, Spec Kit workflow, phase-gate compliance, compliance review |
| Sync Impact Report | HTML comment | Prepended on each amendment: version change, modified principles, template propagation status |

**Validation rules**:
- No unexplained bracket tokens
- No vague language ("should" without rationale)
- All dates ISO 8601 format
- Version line matches Sync Impact Report
- Every AGENTS.md non-negotiable maps to a principle or constraint

### Retroactive Spec

A Spec Kit specification documenting already-implemented behavior.

**Location**: `specs/NNN-pX-Y-short-name/spec.md`

| Field | Type | Description |
|-------|------|-------------|
| Feature Branch | String | Branch name following naming convention |
| Created | ISO date | Creation date |
| Status | Enum | Draft → Clarified → Planned → Implemented → Accepted |
| User Stories | Ordered list | P1/P2/P3 prioritized, each independently testable |
| Acceptance Scenarios | Given/When/Then | Per user story |
| Functional Requirements | Numbered list (FR-NNN) | MUST/MUST NOT rules, testable |
| Known Gaps | Bullet list | Deviations from constitution, missing tests, debt items |
| Regression Boundaries | Bullet list | Accepted behaviors that future changes must not break |
| Success Criteria | Numbered list (SC-NNN) | Measurable outcomes |
| Assumptions | Bullet list | Documented defaults |

**Lifecycle**: Retroactive specs start at "Accepted" status (documenting existing behavior) rather than progressing through implementation.

### Subphase

A numbered work unit mapping plan.md to Spec Kit.

| Field | Type | Description |
|-------|------|-------------|
| Phase | Integer (1 or 2) | Top-level phase |
| Subphase Number | Integer (1–14 for Phase 1, 1–8 for Phase 2) | Within-phase sequence |
| Name | String | Descriptive title from plan.md |
| Spec Branch | String | `NNN-pX-Y-short-name` format |
| Status | Enum | Not Started → In Progress → Complete |
| Dependencies | List of subphase refs | Sequential — each depends on prior |

### Naming Convention

The mapping rule between plan.md subphases and Spec Kit branches.

| Field | Type | Description |
|-------|------|-------------|
| Pattern | String | `NNN-pX-Y-short-name` |
| NNN | Zero-padded integer | Auto-generated sequential number |
| pX-Y | String | Phase (X) and subphase (Y) from plan.md |
| short-name | Kebab-case string | 2-4 word descriptor |

## Relationships

```text
Constitution
  └── governs → Retroactive Spec (compliance check)
  └── governs → Subphase (workflow enforcement)

plan.md
  └── defines → Subphase (numbered work units)

Subphase
  └── maps to → Spec Branch (via Naming Convention)

Retroactive Spec
  └── documents → existing codebase behavior
  └── establishes → Regression Boundaries
```
