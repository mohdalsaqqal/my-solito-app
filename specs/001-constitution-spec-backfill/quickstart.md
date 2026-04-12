# Quickstart: Constitution and Spec Backfill Validation

**How to verify this subphase is complete and correct.**

## Prerequisites

- Access to the repository on branch `001-constitution-spec-backfill` (or merged to main)
- Familiarity with AGENTS.md and CLAUDE.md

## Validation Steps

### 1. Verify Constitution Completeness

Open `.specify/memory/constitution.md` and check:

- [ ] Version line exists at bottom (format: `**Version**: X.Y.Z | **Ratified**: YYYY-MM-DD | **Last Amended**: YYYY-MM-DD`)
- [ ] Sync Impact Report exists as HTML comment at top
- [ ] All 9 principles (I through IX) are present with name, description, and rationale
- [ ] Architecture Constraints section lists all forbidden patterns from AGENTS.md
- [ ] Program Model section documents Phase 1 and Phase 2 with subphase counts
- [ ] Development Workflow section includes verification commands and Definition of Done
- [ ] Governance section includes amendment procedure, Spec Kit workflow, phase-gate compliance
- [ ] No bracket placeholders `[LIKE_THIS]` remain unexplained
- [ ] No vague language — search for "should" without explicit rationale

### 2. Cross-Reference Against AGENTS.md

For each rule in AGENTS.md "Non-Negotiables" and "Forbidden" sections:

- [ ] The rule appears in either a numbered principle or an architecture constraint
- [ ] The constitution rule does not contradict the AGENTS.md source

### 3. Verify Retroactive Specs Exist

Check that exactly three retroactive specs have been created:

- [ ] `specs/002-p1-2-architecture-baseline/spec.md` exists and documents platform architecture
- [ ] `specs/003-p1-3-ui-token-baseline/spec.md` exists and documents shared UI and token system
- [ ] `specs/004-p1-5-homepage-engine-baseline/spec.md` exists and documents homepage layout engine

For each retroactive spec:

- [ ] Uses the standard Spec Kit template (User Scenarios, Requirements, Success Criteria, Assumptions)
- [ ] Identifies at least one accepted behavior
- [ ] Contains either known gaps or an explicit "no gaps found" declaration
- [ ] Documents regression boundaries

### 4. Verify Naming Convention

- [ ] This spec (001) is named `001-constitution-spec-backfill`
- [ ] Retroactive specs follow the `NNN-pX-Y-short-name` convention
- [ ] Branch names match directory names in `specs/`

### 5. Verify Spec Kit Workflow Adherence

For this spec (001):

- [ ] `spec.md` exists (from `/speckit.specify`)
- [ ] `spec.md` contains a Clarifications section (from `/speckit.clarify`)
- [ ] `plan.md` exists (from `/speckit.plan`)
- [ ] `research.md` exists (Phase 0 output)
- [ ] `data-model.md` exists (Phase 1 output)
- [ ] `quickstart.md` exists (this file — Phase 1 output)

## Expected Result

When all checkboxes pass, subphase 1.1 is complete and the project has:
1. A ratified constitution governing all future work
2. Three retroactive specs locking baseline behavior for architecture, UI/tokens, and homepage engine
3. A naming convention that maps every future spec to its plan.md subphase
