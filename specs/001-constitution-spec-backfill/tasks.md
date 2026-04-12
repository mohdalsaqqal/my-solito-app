# Tasks: Constitution and Spec Backfill

**Input**: Design documents from `/specs/001-constitution-spec-backfill/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: No tests requested — this is a documentation-only subphase.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Verify prerequisites and prepare the working environment

- [ ] T001 Verify branch `001-constitution-spec-backfill` is checked out and clean
- [ ] T002 Verify `.specify/memory/constitution.md` exists with current v1.1.0 content
- [ ] T003 Verify Spec Kit tooling is functional by running `powershell.exe -NoProfile -File .specify/scripts/powershell/check-prerequisites.ps1 -Json`

**Checkpoint**: Environment ready — all prerequisites confirmed

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Finalize the constitution so retroactive specs can reference it for compliance checks

**CRITICAL**: No user story work can begin until this phase is complete — retroactive specs (US2) and naming conventions (US3) depend on a finalized constitution (US1 deliverable).

- [ ] T004 Read AGENTS.md and extract all rules from "Non-Negotiables", "Forbidden", and "Allowed" sections into a checklist
- [ ] T005 Read CLAUDE.md and extract all verification commands, forbidden patterns, and developer workflow rules
- [ ] T006 Read plan.md and extract Phase 1/Phase 2 structure, subphase inventory, execution order, and program rules

**Checkpoint**: Source material extracted — constitution authoring can begin

---

## Phase 3: User Story 1 — Establish Project Constitution (Priority: P1) MVP

**Goal**: Ratify the constitution at `.specify/memory/constitution.md` with all principles, constraints, governance, and program model fully validated against source documents.

**Independent Test**: Read the constitution and confirm every AGENTS.md non-negotiable maps to a principle or constraint. Verify governance section defines amendment procedure, versioning, and compliance review.

### Implementation for User Story 1

- [ ] T007 [US1] Cross-reference extracted AGENTS.md rules (T004) against constitution principles I–IX in `.specify/memory/constitution.md` — confirm 100% coverage, flag any gaps
- [ ] T008 [US1] Cross-reference extracted CLAUDE.md workflow rules (T005) against constitution Development Workflow section in `.specify/memory/constitution.md` — confirm verification commands, Definition of Done, and Memory Sync are complete
- [ ] T009 [US1] Cross-reference extracted plan.md program rules (T006) against constitution Program Model and Governance sections in `.specify/memory/constitution.md` — confirm Phase 1/Phase 2 structure, Spec Kit workflow, and phase-gate compliance are documented
- [ ] T010 [US1] Run constitution self-validation: scan `.specify/memory/constitution.md` for bracket placeholders `[LIKE_THIS]`, vague language ("should" without rationale), non-ISO dates, and version/Sync Impact Report mismatches
- [ ] T011 [US1] If T007–T010 found gaps, update `.specify/memory/constitution.md` with missing rules, bump version per amendment procedure, and update the Sync Impact Report
- [ ] T012 [US1] Verify constitution passes self-validation after any updates (re-run T010 checks)

**Checkpoint**: Constitution v1.1.0+ ratified — all source rules captured, self-validation passes. US2 can now begin.

---

## Phase 4: User Story 2 — Backfill Retroactive Specs (Priority: P2)

**Goal**: Create three retroactive specs documenting accepted behavior for platform architecture, shared UI/tokens, and homepage layout engine.

**Independent Test**: Select any retroactive spec, verify it documents current behavior matching the codebase, identifies accepted behaviors and known gaps, and uses the standard Spec Kit template.

### Implementation for User Story 2

- [ ] T013 [P] [US2] Create feature branch and spec directory for `002-p1-2-architecture-baseline` by running `powershell.exe -NoProfile -File .specify/scripts/powershell/create-new-feature.ps1 "Platform Architecture Baseline — retroactive spec for monorepo boundaries, layer responsibilities, canonical data flow, forbidden patterns" -Json -ShortName "p1-2-architecture-baseline" "Platform Architecture Baseline"`
- [ ] T014 [P] [US2] Create feature branch and spec directory for `003-p1-3-ui-token-baseline` by running `powershell.exe -NoProfile -File .specify/scripts/powershell/create-new-feature.ps1 "Shared UI System and Token Baseline — retroactive spec for RNR contract, token categories, responsive model, guard enforcement" -Json -ShortName "p1-3-ui-token-baseline" "Shared UI Token Baseline"`
- [ ] T015 [P] [US2] Create feature branch and spec directory for `004-p1-5-homepage-engine-baseline` by running `powershell.exe -NoProfile -File .specify/scripts/powershell/create-new-feature.ps1 "Homepage Layout Engine Baseline — retroactive spec for block dispatch, renderer ownership, SSR baseline, accepted block types" -Json -ShortName "p1-5-homepage-engine-baseline" "Homepage Engine Baseline"`
- [ ] T016 [US2] Write retroactive spec for platform architecture at `specs/002-p1-2-architecture-baseline/spec.md` — document: package ownership from AGENTS.md "Layer Responsibilities", canonical data flow, import rules, forbidden patterns, guard enforcement status. Include accepted behaviors list and known gaps assessment.
- [ ] T017 [US2] Write retroactive spec for shared UI/token system at `specs/003-p1-3-ui-token-baseline/spec.md` — document: RNR-centered contract from AGENTS.md "Shared UI Rules", token categories from `packages/tokens/`, Tailwind/Uniwind split, `.native.tsx` pattern usage, responsive model via `useBreakpoint()`. Include accepted behaviors list and known gaps assessment.
- [ ] T018 [US2] Write retroactive spec for homepage layout engine at `specs/004-p1-5-homepage-engine-baseline/spec.md` — document: block dispatch flow from CLAUDE.md "Home Engine — Final State", renderer ownership in `packages/app/features/home/renderers/`, SSR baseline behavior, accepted block types from `packages/app/lib/cms/blocks.ts`. Include accepted behaviors list and known gaps assessment.
- [ ] T019 [US2] Validate all three retroactive specs: each uses Spec Kit template structure, identifies at least one accepted behavior, contains known gaps or explicit "no gaps found" declaration, and documents regression boundaries.

**Checkpoint**: Three retroactive specs complete — baseline behavior locked for architecture, UI/tokens, and homepage engine.

---

## Phase 5: User Story 3 — Establish Naming and Branching Conventions (Priority: P3)

**Goal**: Document the `NNN-pX-Y-short-name` naming convention and verify it is followed by all specs created in this subphase.

**Independent Test**: Confirm naming convention is documented, browse `specs/` directory and verify all branch names match the pattern, confirm the Spec Kit create-feature tooling produces conforming names.

### Implementation for User Story 3

- [ ] T020 [US3] Document the naming convention in the constitution's Governance section at `.specify/memory/constitution.md` — add a subsection or bullet defining the `NNN-pX-Y-short-name` pattern with examples from the projected spec list in `research.md`
- [ ] T021 [US3] Verify all specs created in this subphase follow the convention: `001-constitution-spec-backfill` (foundation exception), `002-p1-2-architecture-baseline`, `003-p1-3-ui-token-baseline`, `004-p1-5-homepage-engine-baseline`
- [ ] T022 [US3] If naming convention was added to constitution in T020, bump constitution version (PATCH), update Sync Impact Report, and update `LAST_AMENDED_DATE`

**Checkpoint**: Naming convention documented and validated — all future specs have a clear naming rule.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and memory sync

- [ ] T023 Run quickstart.md validation checklist at `specs/001-constitution-spec-backfill/quickstart.md` — verify all items pass
- [ ] T024 Update `MEMORY.md` with a pointer to the constitution and the three retroactive specs
- [ ] T025 Verify `specs/` directory structure matches the plan: 001, 002, 003, 004 directories all present with spec.md files

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — extracts source material
- **US1 Constitution (Phase 3)**: Depends on Foundational — needs extracted rules
- **US2 Retroactive Specs (Phase 4)**: Depends on US1 — specs reference constitution for compliance
- **US3 Naming Convention (Phase 5)**: Depends on US2 — convention is validated against created specs
- **Polish (Phase 6)**: Depends on all user stories complete

### Within Each User Story

- US1: T007–T009 can run in parallel (cross-referencing), T010–T012 are sequential (validate → fix → re-validate)
- US2: T013–T015 can run in parallel (branch creation), T016–T018 can run in parallel (spec writing), T019 is sequential (validation)
- US3: T020–T022 are sequential

### Parallel Opportunities

```text
# Phase 2: Extract source material in parallel
T004 (AGENTS.md extraction)
T005 (CLAUDE.md extraction)
T006 (plan.md extraction)

# US1: Cross-reference in parallel
T007 (AGENTS.md vs constitution)
T008 (CLAUDE.md vs constitution)
T009 (plan.md vs constitution)

# US2: Create branches in parallel
T013 (002 branch)
T014 (003 branch)
T015 (004 branch)

# US2: Write specs in parallel
T016 (architecture spec)
T017 (UI/token spec)
T018 (homepage engine spec)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: US1 — Constitution ratified
4. **STOP and VALIDATE**: Constitution passes self-validation
5. This alone delivers value — all future work has a governance foundation

### Incremental Delivery

1. Setup + Foundational → Source material ready
2. US1 → Constitution ratified (MVP)
3. US2 → Three retroactive specs lock baseline behavior
4. US3 → Naming convention documented and validated
5. Polish → Memory updated, quickstart validated

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- This is a documentation-only subphase — no `yarn guard:checks` or `yarn tsc` needed
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
