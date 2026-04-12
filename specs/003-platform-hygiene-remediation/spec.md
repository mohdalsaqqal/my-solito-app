# Feature Specification: Platform Hygiene and Agent-Doc Source-of-Truth Remediation

**Feature Branch**: `003-platform-hygiene-remediation`
**Created**: 2026-04-11
**Status**: Draft
**Input**: User description: "Establish AGENTS.md as the sole source of truth for agent guidance, enforce repo hygiene and working-tree discipline, and raise the operational quality baseline (service-layer tests, split CI, framework version pinning) per Constitution v1.3.0 Principles XIV, XV, and XVI."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A New Contributor Onboards Without Confusion (Priority: P1)

As a new contributor (human or AI agent) joining the project, I need to know exactly one document that tells me the architecture rules and non-negotiables, so I do not waste time reconciling conflicting guidance across multiple agent-specific files and do not accidentally follow outdated rules.

**Why this priority**: Today the project has at least six files that each appear to describe "how to work on this codebase" (AGENTS.md, CLAUDE.md, GEMINI.md, `.github/copilot-instructions.md`, `.codex/context.md`, `.qwen/PROJECT_SUMMARY.md`, `.impeccable.md`). They partially overlap and can drift. New contributors do not know which file wins. This is the single biggest onboarding friction and the root cause of architectural drift over time. Every other remediation depends on first fixing the source-of-truth confusion.

**Independent Test**: A new contributor reads the project's top-level instructions for their specific agent (e.g., Claude Code), and within five minutes knows (a) that `AGENTS.md` is canonical, (b) that their agent-specific file only contains tool-specific quirks, and (c) where to look for architecture rules. Can be verified by giving a fresh reader the repo and asking them to state the source-of-truth rule back.

**Acceptance Scenarios**:

1. **Given** a new contributor opens any agent-support file (e.g., `CLAUDE.md`), **When** they read the first paragraph, **Then** they see an explicit pointer stating that `AGENTS.md` is the source of truth and the current file exists only to surface tool-specific operational quirks.
2. **Given** a maintainer updates an architecture rule, **When** they edit `AGENTS.md`, **Then** no support-shim file needs to be touched unless the change affects tool-specific operation, and no support shim contains a duplicate of the rule that could drift.
3. **Given** a contributor tries to merge a change that duplicates architecture rules into a support shim, **When** continuous integration runs, **Then** the build fails with a clear message naming the offending file and the duplicated rule.
4. **Given** a maintainer needs to know which files are "support shims" and which are canonical, **When** they read `AGENTS.md`, **Then** an explicit list of support-shim files and their allowed scope is visible.

---

### User Story 2 - The Working Tree Reflects the Project, Not a Scratchpad (Priority: P1)

As a maintainer, reviewer, or new contributor, I need the repository root and working tree to contain only files that belong to the project, so the signal-to-noise ratio stays high and new violations are visible against a clean baseline.

**Why this priority**: Today the repository root carries 30+ deleted-but-uncommitted AI tool vendor directories, 15+ abandoned top-level planning markdown files, parallel `*_old.md` files, and multiple audit reports rotting next to canonical documents. The mess normalizes further mess and hides intent from reviewers. Cleanup is cheap; retrofitting discipline later is prohibitively expensive. This is P1 because every subsequent change lands on top of this baseline and inherits its noise.

**Independent Test**: A reviewer runs `git status` on a fresh clone of the branch and sees zero untracked or staged files outside the expected working set; a reviewer lists the repository root directory and sees only canonical documents (`AGENTS.md`, `CLAUDE.md`, `README.md`, configuration files) with no audit logs, snapshots, or parallel `*_old.md` artifacts.

**Acceptance Scenarios**:

1. **Given** a fresh clone of the branch, **When** a contributor runs the standard status command, **Then** no AI-tool vendor directories appear as tracked or untracked files because they are all gitignored.
2. **Given** a contributor inspects the repository root directory, **When** they list its contents, **Then** they see only canonical project files — no `*_audit.md`, `*_old.md`, `current-*-snapshot.md`, `issues.md`, or abandoned planning files.
3. **Given** a contributor attempts to commit a new AI tool vendor directory or an audit-style file at the repository root, **When** continuous integration runs the hygiene guard, **Then** the build fails with a message identifying the violation and referencing the relevant principle.
4. **Given** an active plan is committed under `docs/plans/` and subsequently completed, **When** the delivering change lands, **Then** the plan file is either removed or marked complete in the same change set — never left to rot.
5. **Given** a contributor leaves mass file deletions staged across a working session, **When** they try to push, **Then** the pre-push check surfaces the staged deletions as a warning so they are not silently carried across branches.

---

### User Story 3 - The Service Layer Has Basic Test Coverage (Priority: P1)

As a release owner, I need the server service layer — the highest-risk architectural surface — to have basic test coverage so a regression in business logic is caught before it reaches production, not discovered in a customer incident.

**Why this priority**: The constitution identifies `apps/next/server/services/` as the single point where all data access flows through. It is the place where a silent bug causes the most damage (wrong prices, broken orders, incorrect auth decisions). Today this layer has near-zero direct test coverage while less critical surfaces (UI rendering, mock adapters) are well tested. Fixing this inverts the risk profile and protects the architectural investment.

**Independent Test**: A reviewer picks any file in `apps/next/server/services/` and runs the test runner; at least one smoke test exists for that file exercising a happy path and one failure path, and all tests pass. Can be verified by counting service files versus service test files and confirming parity.

**Acceptance Scenarios**:

1. **Given** the service layer directory contains N files, **When** the test runner is invoked, **Then** each file has at least one associated test that exercises a happy path and one that exercises a failure path.
2. **Given** a contributor adds a new service file, **When** continuous integration runs, **Then** the build fails if no corresponding test file is discovered for it.
3. **Given** a contributor runs the project-level test command from the repository root, **When** the command completes, **Then** service-layer tests have been executed as part of the run alongside other workspace tests.
4. **Given** a maintainer inspects how tests are discovered, **When** they read the test runner configuration, **Then** tests are discovered via a glob pattern rather than a hand-maintained file list.

---

### User Story 4 - Continuous Integration Reports Each Failure Independently (Priority: P2)

As a contributor waiting on a pull-request check, I need to see which specific quality gate failed without re-running the entire suite, so I can fix the right thing quickly and avoid wasted cycle time.

**Why this priority**: Today continuous integration bundles lint, typecheck, guards, unit tests, integration tests, and build into one workflow. When it fails, contributors see one red check and must run everything locally to figure out which step broke. Splitting the workflow is a force multiplier for every future change but is lower priority than fixing the source-of-truth and service-layer gaps because those are root causes while this is friction.

**Constitution note**: Principle XVI mandates split CI jobs as a MUST, which would normally forbid a P2 classification. US4 is sequenced post-MVP solely because the jobs it defines *reference targets that must exist first* — `guard:hygiene`, `guard:agent-docs`, and the `test-service-layer` test file set are all created in US1/US2/US3. US4 MUST land within one week of the MVP merge to honor Principle XVI; the P2 label reflects ordering, not optionality.

**Independent Test**: A contributor opens a pull request that introduces a known type error; continuous integration runs and reports a failure only in the typecheck job, while lint, guards, tests, and build either pass or run independently. Can be verified by introducing a deliberate single-gate failure and confirming the check surface shows it discretely.

**Acceptance Scenarios**:

1. **Given** a pull request, **When** continuous integration runs, **Then** each quality gate (lint, typecheck, hygiene, guards, unit tests, service-layer tests, end-to-end accessibility, build) appears as a distinct check with independent pass/fail state.
2. **Given** one gate fails, **When** a contributor views the pull-request status, **Then** all other gates that have no dependency on the failing one continue to run and report their own result.
3. **Given** the project enforces required checks on the main branch, **When** a pull request is opened, **Then** all split gates are listed as required status checks per the branch-protection policy.

---

### User Story 5 - Framework Versions Are Reproducible (Priority: P2)

As a maintainer running a build at any point in the future, I need the framework versions used by the build to be identical to the versions used when the code was originally written, so upgrades are deliberate events and not silent surprises that break unrelated changes.

**Why this priority**: Today the project uses caret ranges (`^`) on framework majors including `next`, `react`, `react-native`, and `react-native-reanimated`. A new developer installing dependencies months later may receive different minor or patch versions than the ones the code was tested against. This is how subtle production regressions get introduced by upstream changes. Lower priority than source-of-truth and testing because it is a slow-burn risk rather than an immediate confusion or gap.

**Independent Test**: A maintainer deletes the local install and reinstalls on two different dates; the framework versions resolved on both dates are byte-identical. Can be verified by reading the version strings in the lock file and confirming no caret or tilde ranges exist on the framework list.

**Acceptance Scenarios**:

1. **Given** a contributor reads any package manifest, **When** they inspect the version of a framework-tier dependency, **Then** the version is an exact pin (no `^` or `~`).
2. **Given** a new contributor installs dependencies, **When** they compare the installed framework versions against the lockfile, **Then** every version matches exactly what the lockfile declares with no surprise upgrades.
3. **Given** a contributor wants to upgrade a framework, **When** they change the version in the manifest, **Then** the change is a single deliberate commit visible in history, not an invisible side effect of a different task.

---

### User Story 6 - Operational Overrides Have Documented Root Causes (Priority: P3)

As a reviewer evaluating technical debt, I need every operational workaround — like the 8-gigabyte heap override on the development server — to reference a tracked root-cause issue so workarounds do not become permanent invisible scars.

**Why this priority**: The development and build scripts currently pass `NODE_OPTIONS=--max-old-space-size=8192`. This suggests a memory leak or unusually heavy build graph. Without a tracked root cause, future contributors will copy the override into more places and the underlying issue will never be investigated. P3 because it is a maintenance-quality concern rather than a blocker.

**Independent Test**: A reviewer searches for memory-override strings in package scripts; every occurrence has an adjacent comment or is linked in documentation to a tracked issue explaining the underlying cause and the condition under which the override can be removed.

**Acceptance Scenarios**:

1. **Given** a contributor finds a memory-override string in a script, **When** they search for its justification, **Then** they find either an inline comment with an issue reference or a documented entry explaining the cause.
2. **Given** a workspace is excluded from the root workspace list, **When** a contributor asks why, **Then** the reason is documented in the manifest or in a referenced documentation file.

---

### Edge Cases

- **What happens when an agent-support file is updated with a legitimate tool-specific quirk that coincidentally uses wording similar to an AGENTS.md rule?** The guard script must distinguish between "pointer to rule" and "duplicate of rule" and must not block legitimate shim updates that reference architecture without restating it.
- **What happens when a contributor needs to add a new AI tool vendor directory for local use that the project does not yet know about?** The hygiene guard must not block local usage — only prevent commits. Local tooling stays local.
- **What happens when a service file is intentionally a pure barrel re-export and has nothing meaningful to test?** The service-layer coverage requirement must accommodate re-export-only files with a documented exemption mechanism, not force meaningless test scaffolding.
- **What happens when continuous integration splits into many jobs and a flaky infrastructure failure causes a non-deterministic red check?** Each split job must be independently retryable without re-running gates that already passed.
- **What happens when a framework pin needs a security patch upgrade?** The pinning rule must permit deliberate patch-level upgrades via an explicit commit — it forbids implicit upgrades, not all upgrades.
- **What happens when a support-shim file legitimately needs to exceed the 150-line ceiling because its agent has many tool-specific quirks?** The constitution's line ceiling must be treated as a smell signal, not a hard gate — the guard should warn but allow an override with explicit justification.
- **What happens when `AGENTS.md` itself grows too large and contributors start skipping parts?** Out of scope for this remediation but must be tracked as a future concern.

## Requirements *(mandatory)*

### Functional Requirements

**Source-of-Truth Enforcement (Principle XIV)**

- **FR-001**: The project MUST declare `AGENTS.md` as the sole source of truth for architecture rules, platform operating model, and non-negotiables.
- **FR-002**: The project MUST maintain an explicit list of "support shim" files and their allowed scope, visible inside `AGENTS.md`.
- **FR-003**: Every support shim file (`CLAUDE.md`, `GEMINI.md`, `.github/copilot-instructions.md`, `.codex/context.md`, `.qwen/PROJECT_SUMMARY.md`, `.impeccable.md`) MUST open with an explicit pointer to `AGENTS.md` as the source of truth.
- **FR-004**: Every support shim file MUST contain only tool-specific operational notes that do not belong in `AGENTS.md`.
- **FR-005**: The project MUST reject any change that duplicates architecture rules or non-negotiables into a support shim. Enforcement MUST run as an automated check in continuous integration.
- **FR-006**: The automated source-of-truth check MUST produce a clear error message naming the offending file and the duplicated rule when it fails.
- **FR-007**: The project MUST warn when any support shim exceeds 150 lines (the length ceiling established by Constitution Principle XIV), with the warning treated as a signal to review rather than an automatic block.

**Repo Hygiene (Principle XV)**

- **FR-008**: The project MUST ignore all AI-tool vendor directories at the repository root from version control. The list of ignored directories MUST match the list in Constitution Principle XV.
- **FR-009**: The project MUST forbid planning, audit, snapshot, or parallel source-of-truth files (`*_audit.md`, `*_old.md`, `current-*-snapshot.md`, `issues.md`, abandoned top-level requirements and milestones files) at the repository root. Enforcement MUST run as an automated check in continuous integration.
- **FR-010**: The project MUST ignore build artifacts (`.next/`, `dist/`, `coverage/`, `.turbo/`) from version control and reject any commit that reintroduces them.
- **FR-011**: Contributors MUST commit or restore working-tree file deletions within the same task. The hygiene guard MUST surface lingering mass deletions (>50 files staged as D) as a WARN finding during continuous integration so they are not silently carried across branches. A local pre-push hook is out of scope for this feature; the CI-time WARN is the canonical surfacing point.
- **FR-012**: Active plans MUST live under `docs/plans/` only. Completed plans MUST be closed out in the same change set that delivers the work — either removed or explicitly marked complete.
- **FR-013**: The hygiene check MUST produce a clear error message identifying the violating path and referencing the relevant constitutional principle when it fails.

**Operational Quality Baseline (Principle XVI)**

- **FR-014**: Every file in the server service layer (`apps/next/server/services/`) MUST have at least one associated test covering a happy path and one failure path.
- **FR-015**: Test discovery MUST use glob patterns — no hand-maintained test file lists in runner configuration.
- **FR-016**: The project MUST expose a single top-level test command that runs every workspace's tests via the monorepo task runner.
- **FR-017**: The continuous integration workflow MUST split quality gates into distinct parallel jobs: lint, typecheck, architecture guard, hygiene guard, source-of-truth guard, unit tests, service-layer tests, end-to-end accessibility, and build.
- **FR-018**: Each split continuous integration job MUST be independently runnable and independently retryable.
- **FR-019**: All split jobs MUST be registered as required status checks on the main branch per the project's branch protection policy.
- **FR-020**: Framework-tier dependencies (`next`, `react`, `react-dom`, `react-native`, `react-native-reanimated`, `react-native-web`, `typescript`) MUST be pinned to exact versions in every manifest — no caret or tilde ranges.
- **FR-021**: Any memory-limit override passed to the runtime (`NODE_OPTIONS=--max-old-space-size=*`) MUST reference a tracked root-cause issue explaining the underlying condition and the criteria for removing the override.
- **FR-022**: Any workspace excluded from the root workspace list MUST have its exclusion reason documented in the manifest or in project documentation.

**Verification Integration**

- **FR-023**: The project's standard verification command MUST run the hygiene check and the source-of-truth check in addition to the existing architecture and typecheck gates.
- **FR-024**: The constitution verification flow MUST NOT mark a task as done until all guard checks and the typecheck pass clean.

### Key Entities

- **Source of Truth Document**: The canonical reference governing architecture and non-negotiables. Currently `AGENTS.md`. Exactly one exists.
- **Support Shim**: An agent-specific file surfacing tool-specific operational quirks only, without duplicating architecture rules. A finite list exists and is declared in the source-of-truth document.
- **Hygiene Rule**: A declarative rule about what may or may not appear in the working tree or repository root, enforced by automation.
- **Quality Gate**: A single, independently-runnable check in continuous integration that validates one dimension of project health (lint, types, guards, tests, build).
- **Framework Pin**: An exact-version declaration for a framework-tier dependency that excludes semver-range operators.
- **Operational Override**: A script-level runtime flag (memory, workers, environment) that modifies default behavior and requires a documented root cause.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new contributor, given only the repository, can state within five minutes which file is the source of truth for architecture rules and can name the role of support shims.
- **SC-002**: The source-of-truth guard catches at least one real-world violation in the first week after it is enabled (either during cleanup or on a new change), demonstrating it is wired into the contributor path rather than sitting dormant.
- **SC-003**: The repository root directory listing contains zero files matching forbidden patterns (audit, snapshot, old, abandoned planning) and zero untracked AI-tool vendor directories, verified on a fresh clone.
- **SC-004**: The hygiene guard rejects a deliberate test violation (e.g., a contributor stages a file named `test_audit.md` at the root) and passes on the clean baseline, with a clear error message in both runs.
- **SC-005**: Every file in `apps/next/server/services/` has at least one happy-path test and one failure-path test, with parity verifiable by a simple file-count comparison between the services directory and its test equivalents.
- **SC-006**: A contributor who introduces a deliberate typecheck error sees exactly one failed quality gate in continuous integration — the typecheck job — while all other jobs run to completion and report independently.
- **SC-007**: Continuous integration total wall-clock time for a passing pull request is no worse than the current bundled workflow, and is ideally shorter due to job parallelism.
- **SC-008**: A deliberate reinstall on two different dates produces byte-identical framework versions, verified by comparing the resolved versions in the lockfile before and after.
- **SC-009**: Every `NODE_OPTIONS=--max-old-space-size=*` occurrence in package scripts references a tracked root-cause issue or inline justification, verified by a search across all manifests.
- **SC-010**: Zero architecture rules appear verbatim or near-verbatim in any support shim file, verified by the source-of-truth guard.
- **SC-011**: The standard verification command (`yarn guard:checks`, hygiene guard, agent-doc guard, typecheck) runs to completion in under three minutes on a developer laptop for a no-change working tree.
- **SC-012**: The constitution's Definition of Done references all three new guards, and every pull request merged after this feature ships has gone through them.

## Assumptions

- **Constitution version**: This feature targets Constitution v1.3.0 Principles XIV, XV, and XVI, which are already ratified. The principles define the rules; this feature builds the enforcement.
- **Monorepo task runner**: The existing monorepo task runner (Turbo, already present in the project) can orchestrate the new top-level test command without a migration to a different tool.
- **Continuous integration platform**: The project uses GitHub Actions. Job parallelism is assumed to be available at the existing plan tier.
- **Branch protection**: The project already maintains a branch-protection policy document at `docs/BRANCH_PROTECTION.md`. Updating it to require the new split checks is a simple edit rather than a new policy.
- **Agent-doc audience**: The current agent-support files exist for well-understood tools (Claude Code, Gemini CLI, Codex, Copilot, Qwen, Impeccable). New agent tools can be added to the support-shim list via a constitution patch amendment without a new feature cycle.
- **Lockfile**: The project uses a Yarn 4 lockfile that supports exact-version resolution. No package-manager migration is required.
- **Service-layer test framework**: The existing test runner (Node `--test` plus `tsx`) used in `apps/next/test:api` can be reused for service-layer tests without introducing a new test framework.
- **Memory override root cause**: The `NODE_OPTIONS=--max-old-space-size=8192` override is assumed to be either a real memory-pressure issue with the Next.js development server or a historical precaution. This feature requires it to be tracked, not that it be removed.
- **Strapi workspace**: `apps/strapi` is already excluded from the root workspace list via `"!apps/strapi"`. This feature requires the exclusion reason to be documented, not that the exclusion be changed.
- **Fresh-clone verification**: "Fresh clone" in acceptance criteria means a clean `git clone` of the feature branch after merge, without running any local tooling.
- **Out-of-scope — AGENTS.md content**: This feature does not modify the architectural content of `AGENTS.md`. It only adds the source-of-truth declaration and the support-shim list.
- **Out-of-scope — service-layer refactor**: This feature does not refactor service-layer code; it only requires tests to exist for the current shape.
- **Out-of-scope — memory leak fix**: This feature does not fix whatever causes the 8-gigabyte heap override; it only requires the root cause to be tracked.
- **Out-of-scope — CI platform migration**: This feature does not migrate continuous integration away from GitHub Actions.
