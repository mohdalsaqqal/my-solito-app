# Feature Specification: Constitution and Spec Backfill

**Feature Branch**: `001-constitution-spec-backfill`
**Created**: 2026-04-03
**Status**: Draft
**Input**: User description: "Phase 1.1 — Create repo constitution from existing architecture and design rules, backfill retroactive specs for already-implemented work, establish naming and branching conventions for future specs."

## Clarifications

### Session 2026-04-03

- Q: Should this subphase backfill retroactive specs for all implemented areas or only a minimum set? → A: Minimum three only (platform architecture, shared UI/tokens, homepage engine). Others deferred to their respective subphases.
- Q: Should spec short names embed the phase number for traceability back to plan.md? → A: Yes — use phase-prefixed short names (e.g., `002-p1-2-architecture-baseline`, `003-p1-3-ui-token-baseline`).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Establish Project Constitution (Priority: P1)

A development team member (human or AI agent) begins work on a new feature. Before writing any code, they consult the project constitution to understand the non-negotiable architectural principles, required verification steps, and governance rules. The constitution provides clear, testable rules that prevent architecture violations before they happen.

**Why this priority**: Without a ratified constitution, there is no single source of truth for architectural decisions. Every subsequent spec, plan, and implementation depends on these rules being documented and enforceable. This is the foundation for all future Spec Kit work.

**Independent Test**: Can be verified by reading the constitution file and confirming that every principle maps to an existing rule in AGENTS.md or CLAUDE.md, that all principles are declarative and testable, and that the governance section defines amendment and compliance procedures.

**Acceptance Scenarios**:

1. **Given** a new developer joins the project, **When** they read the constitution at `.specify/memory/constitution.md`, **Then** they can identify all non-negotiable architectural rules, package boundaries, and verification requirements without consulting any other file.
2. **Given** an AI agent is about to implement a feature, **When** it runs a Constitution Check as part of the Spec Kit plan phase, **Then** it can validate its approach against each numbered principle and identify violations before writing code.
3. **Given** a principle needs to change, **When** a team member proposes an amendment, **Then** the governance section defines the exact procedure: rationale, Sync Impact Report, semantic version bump, date update, and template propagation.

---

### User Story 2 - Backfill Retroactive Specs for Implemented Work (Priority: P2)

A team member needs to understand the accepted behavior of an already-implemented feature (e.g., the homepage layout engine, the design token system, or the server-first data flow). They look up the retroactive spec, which documents the current state, accepted behavior, known gaps, and regression boundaries — without requiring them to reverse-engineer the codebase.

**Why this priority**: The project is brownfield. Major features are already built but undocumented in Spec Kit format. Without retroactive specs, future work risks silently regressing existing behavior. This story locks the baseline before any redesign or extension begins.

**Independent Test**: Can be verified by selecting any already-implemented feature area (e.g., homepage layout engine), confirming a retroactive spec exists that describes its current behavior, and checking that the spec identifies any known gaps or debt.

**Acceptance Scenarios**:

1. **Given** the homepage layout engine is already implemented (Phases 1–6 complete), **When** a retroactive spec is written for it, **Then** the spec documents: block source, SSR slot behavior, renderer ownership, dispatch flow, and accepted block types — matching the current codebase.
2. **Given** the shared UI token system is already implemented, **When** a retroactive spec is written, **Then** it documents: which tokens exist, enforcement rules (guard:checks), Tailwind/Uniwind usage in reusables vs inline tokens in components, and the RNR contract.
3. **Given** a retroactive spec exists for a feature, **When** a future change is proposed that would alter that feature's behavior, **Then** the spec serves as the regression boundary — the change must be explicitly justified against the documented accepted behavior.

---

### User Story 3 - Establish Spec Naming and Branching Conventions (Priority: P3)

A team member is about to start a new Spec Kit feature. They need to know how to name the spec, what branch prefix to use, and how the spec directory structure should be organized. The conventions are documented and enforced by the Spec Kit tooling so that all future specs follow a consistent pattern.

**Why this priority**: Conventions prevent organizational drift as the spec library grows across 14+ Phase 1 subphases and 8+ Phase 2 subphases. Without them, specs become hard to navigate and cross-reference.

**Independent Test**: Can be verified by confirming that naming conventions are documented, that the Spec Kit create-new-feature script enforces them, and that at least one spec (this one) follows the convention as a reference example.

**Acceptance Scenarios**:

1. **Given** a team member runs the Spec Kit create-feature command for a plan.md subphase, **When** they provide a feature description, **Then** the tooling generates a branch name following the convention `NNN-pX-Y-short-name` (e.g., `002-p1-2-architecture-baseline`) and creates the spec directory at `specs/NNN-pX-Y-short-name/`.
2. **Given** the plan.md defines subphase 1.7 (Homepage Redesign), **When** a spec is created for it, **Then** the short name is `NNN-p1-7-homepage-redesign`, embedding the phase number for traceability.
3. **Given** 20+ specs exist in the repository, **When** a team member browses the `specs/` directory, **Then** specs are ordered by creation sequence and each directory name clearly identifies the feature area.

---

### Edge Cases

- What happens when a retroactive spec reveals that current implementation violates constitution principles? The gap MUST be documented in the spec as known debt with a remediation recommendation, but it does not block the retroactive spec from being accepted.
- What happens when two already-implemented features overlap in scope? Each feature gets its own retroactive spec. Shared concerns (e.g., token system used by both homepage and storefront) are documented in whichever spec owns the foundational layer, with cross-references from dependent specs.
- What happens when an existing feature has no tests or verification? The retroactive spec documents the current verification state (including "none") and flags it as a gap. This does not block the spec but creates a tracked remediation item.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The project MUST have a ratified constitution at `.specify/memory/constitution.md` that codifies all non-negotiable architectural principles from AGENTS.md and CLAUDE.md.
- **FR-002**: Each constitution principle MUST be declarative, testable, and free of vague language — using MUST/MUST NOT rather than "should" or "try to."
- **FR-003**: The constitution MUST include a governance section defining: amendment procedure, semantic versioning policy, and compliance review expectations.
- **FR-004**: The constitution MUST include a program model section documenting the Phase 1 / Phase 2 structure and the rule that Phase 2 must not break Phase 1.
- **FR-005**: Retroactive specs MUST be created for each major already-implemented feature area, documenting: current behavior, accepted contracts, known gaps, and regression boundaries.
- **FR-006**: Each retroactive spec MUST follow the same Spec Kit template structure as forward-looking specs (user scenarios, requirements, success criteria, assumptions).
- **FR-007**: Spec naming MUST follow the convention `NNN-pX-Y-short-name` where NNN is a zero-padded sequential number, `pX-Y` is the phase and subphase number from plan.md, and short-name is a 2-4 word kebab-case descriptor (e.g., `002-p1-2-architecture-baseline`).
- **FR-008**: The Spec Kit workflow for each subphase MUST follow the defined order: constitution → specify → clarify → plan → tasks → analyze → implement.
- **FR-009**: The constitution MUST define a verification workflow (guard:checks, tsc, optional build) that is required after every implementation task.
- **FR-010**: Retroactive specs for already-implemented work MUST identify any gaps between current implementation and constitution principles, documenting them as known debt.

### Key Entities

- **Constitution**: The single highest-authority governance document. Contains numbered principles, architecture constraints, program model, development workflow, and governance rules. Versioned semantically.
- **Retroactive Spec**: A Spec Kit specification written for an already-implemented feature. Documents accepted current behavior rather than proposing new behavior. Serves as the regression boundary for future changes.
- **Principle**: A numbered, declarative rule in the constitution. Each principle has a name, description of what MUST or MUST NOT be done, and a rationale explaining why.
- **Subphase**: A numbered work unit within Phase 1 or Phase 2 of the program plan. Each subphase maps to one Spec Kit spec.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of non-negotiable rules from AGENTS.md and CLAUDE.md are captured as numbered principles in the constitution, with no rule missing or contradicted.
- **SC-002**: The constitution passes its own validation: no unexplained bracket tokens, no vague language ("should" without rationale), all dates in ISO format, version line matches the Sync Impact Report.
- **SC-003**: Exactly three retroactive specs are delivered in this subphase: (a) platform architecture and package boundaries, (b) shared UI system and token baseline, (c) homepage layout engine. Additional areas (CMS normalization, server data flow, design system) are deferred to their respective subphases.
- **SC-004**: Every retroactive spec identifies at least one accepted behavior and at least one known gap or "no gaps found" declaration — no spec is left without an explicit assessment.
- **SC-005**: A new team member can locate any architectural rule within 2 minutes by consulting only the constitution and the specs index.
- **SC-006**: The Spec Kit create-feature tooling produces branch names and directory structures that match the documented naming convention on every invocation.

## Assumptions

- The existing AGENTS.md (v4.0) and CLAUDE.md are the authoritative sources for architectural rules. If they conflict, AGENTS.md takes precedence for architecture; CLAUDE.md takes precedence for developer workflow.
- The plan.md Phase 1 / Phase 2 structure is accepted and will not change during this subphase.
- Retroactive specs document current accepted behavior — they do not propose changes. Gaps are logged for future remediation, not fixed in this subphase.
- The Spec Kit tooling (create-new-feature script, sequential numbering) is already functional and does not need modification in this subphase.
- Retroactive backfill in this subphase is scoped to exactly three areas: platform architecture/package boundaries, shared UI/token baseline, and homepage layout engine. All other implemented areas (CMS normalization, server data flow, design system details) will receive retroactive specs as preambles to their respective subphases (1.4, 1.6, etc.).
