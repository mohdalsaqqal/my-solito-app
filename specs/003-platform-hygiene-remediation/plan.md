# Implementation Plan: Platform Hygiene and Agent-Doc Source-of-Truth Remediation

**Branch**: `003-platform-hygiene-remediation` | **Date**: 2026-04-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-platform-hygiene-remediation/spec.md`

## Summary

Codify `AGENTS.md` as the sole architectural source of truth, wire two new repository guards (hygiene + agent-docs) into the existing guard infrastructure, add service-layer smoke tests for all 28 files under `apps/next/server/services/`, split CI into discrete parallel jobs per quality gate, and pin framework-tier dependencies to exact versions. Enforcement is script-first: every rule becomes a Node.js guard script that runs locally (`yarn guard:*`) and in CI. No architectural refactor. No new framework. Zero changes to `packages/ui`, `packages/app`, or `packages/tokens` except the `.gitignore` and root-level cleanup.

## Technical Context

**Language/Version**: Node.js 22 (CI pinned), TypeScript 5.2.2
**Primary Dependencies**: Yarn 4.13.0 workspaces, Turbo 2.4.4, Node `--test` + `tsx` 4.20.5 (existing test runner for `apps/next`), GitHub Actions
**Storage**: N/A — remediation feature touches scripts, configuration, and tests only
**Testing**: Node `--test` via `tsx` (reused from existing `apps/next/test:api`); no new framework
**Target Platform**: Contributor laptops (Windows/macOS/Linux) + GitHub Actions Linux runners (`ubuntu-latest`)
**Project Type**: Monorepo remediation / infrastructure — touches `.github/workflows/`, `scripts/`, root config, and `apps/next/server/services/**/*.test.ts`
**Performance Goals**: Every new guard script MUST complete in under 5 seconds on a clean working tree for the full repository. Split CI workflow total wall-clock MUST be ≤ current bundled workflow (SC-007).
**Constraints**: Zero modification of `AGENTS.md` architecture rules, `packages/app`, `packages/ui`, `packages/tokens`, or `packages/providers`. Zero new runtime dependencies. Zero new test framework. All guards MUST be pure Node.js (no Python, no Go).
**Scale/Scope**: 28 service files needing tests; 1 CI workflow split into 11 parallel jobs (per research.md R-007); 6 support-shim files to rewrite; 27 AI tool vendor directories to gitignore; ~15 repo-root markdown files to remove; 7 framework-tier dependencies to pin; 1 workspace exclusion (`apps/strapi`) to document; 2 memory overrides to annotate (root dev server 8192 + `apps/next` test:api 4096).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Gates derived from Constitution v1.3.0. Every principle evaluated against this feature's planned scope.

### Principle I — Server-Owned Data Access
**Status**: ✅ Not applicable. No data access is introduced or modified by this feature.

### Principle II — Token-Driven Design
**Status**: ✅ Not applicable. No UI is touched.

### Principle III — Provider-Mediated Integration
**Status**: ✅ Not applicable. No adapters or providers are touched.

### Principle IV — Width-Driven Responsive Layout and Touch Compliance
**Status**: ✅ Not applicable. No UI is touched.

### Principle V — Layered Package Boundaries
**Status**: ✅ Pass. New scripts live under `scripts/` (a repo-root tool directory, not inside any package). New tests live under `apps/next/server/services/**` co-located with the code they test. No cross-package imports are introduced.

### Principle VI — CMS Controls Content, Not Layout
**Status**: ✅ Not applicable. No CMS or layout work.

### Principle VII — Parallel Agent Dispatch for Multi-File Work
**Status**: ✅ Pass. The service-layer test generation (28 files) is the largest multi-file task in this plan. It will be dispatched as one sub-agent per file per Principle VII, with each sub-agent receiving a self-contained prompt and the exact service file content as context. The orchestrator will pre-read services first.

### Principle VIII — Spec-Driven Delivery
**Status**: ✅ Pass. This plan is itself the `speckit.plan` output for feature 003, following the `constitution → specify → plan → tasks → analyze → implement` flow. The spec is complete and checklist-validated.

### Principle IX — Phase Isolation
**Status**: ✅ Pass. This feature is purely additive to Phase 1. It adds tests, guards, and CI jobs. It changes zero product behavior. Real Cosmetics continues to function unchanged.

### Principle X — Accessibility as a First-Class Concern
**Status**: ✅ Not applicable. No user-facing UI is touched.

### Principle XI — Performance Baseline
**Status**: ✅ Not applicable to the feature work itself. Guard scripts MUST stay under 5 seconds per run (tracked as a Technical Context constraint, not a principle gate).

### Principle XII — Theme Completeness
**Status**: ✅ Not applicable. No theming work.

### Principle XIII — Visual Quality Standards
**Status**: ✅ Not applicable. No UI work.

### Principle XIV — AGENTS.md as Sole Source of Truth
**Status**: ✅ This feature IMPLEMENTS the principle. The plan:
1. Adds the "Source of Truth" declaration and support-shim list to `AGENTS.md` (content addition, not architectural rule change).
2. Rewrites all 6 support shims to thin pointer format (≤150 lines each, pointer header, no duplicated rules).
3. Ships `scripts/check-agent-docs.mjs` that enforces shim constraints in CI.

Gate check: the plan does not duplicate architecture rules anywhere. Every shim rewrite is a removal or pointer; no rule text is copied. **Pass.**

### Principle XV — Repo Hygiene and Working Tree Discipline
**Status**: ✅ This feature IMPLEMENTS the principle. The plan:
1. Extends `.gitignore` with the 27 AI tool vendor directories enumerated in the constitution.
2. Commits all pending working-tree deletions (30+ vendor skill dirs, 15+ abandoned root markdown files, `AGENTS_old.md`, audit logs).
3. Ships `scripts/guard-hygiene.mjs` that enforces repo-root forbidden-file patterns, vendor-dir ignore rules, and build-artifact gitignore in CI.
4. Surfaces staged mass deletions via a lightweight pre-push advisory (non-blocking by default per Edge Case guidance).

Gate check: all rule-enforcement lives in a script, not in prose. **Pass.**

### Principle XVI — Operational Quality Baseline
**Status**: ✅ This feature IMPLEMENTS the principle. The plan:
1. Generates 28 service-layer smoke test files (one per service file) with happy-path + failure-path coverage.
2. Replaces the hand-listed `test:api` pattern in [apps/next/package.json:10](../../apps/next/package.json#L10) with a glob `"**/*.test.ts"`.
3. Adds a root-level `yarn test` orchestrating all workspace tests via Turbo.
4. Splits [.github/workflows/ci.yml](../../.github/workflows/ci.yml) (currently 178 lines, partial split into 3 jobs) into 8 distinct parallel jobs.
5. Pins exact versions for `next`, `react`, `react-dom`, `react-native`, `react-native-reanimated`, `react-native-web`, `typescript` across all manifests.
6. Annotates every `NODE_OPTIONS=--max-old-space-size=*` occurrence with an issue reference comment.
7. Adds a comment to root `package.json` explaining the `"!apps/strapi"` exclusion.

Gate check: glob-based test discovery (no hand-list); split CI jobs independently retryable; exact pins with no `^`/`~`; root causes tracked. **Pass.**

### Constitution Check Summary
**All gates pass. No violations to justify.** Proceed to Phase 0.

### Post-Design Re-Check (after Phase 1 artifacts)

Re-evaluation after `research.md`, `data-model.md`, `contracts/*`, and `quickstart.md` were written:

- **Principle V (Layered Package Boundaries)**: Phase 1 design confirms no cross-package imports. All scripts live under `scripts/`. All tests live co-located under `apps/next/server/services/`. ✅ Pass.
- **Principle VII (Parallel Agent Dispatch)**: Quickstart Step 5 and Step 7 both explicitly use parallel dispatch (6 shims and 28 service tests respectively), with pre-read context and self-contained prompts per the principle. ✅ Pass.
- **Principle XIV (AGENTS.md as Sole Source of Truth)**: [data-model.md](./data-model.md) formalizes the ShimDescriptor and ForbiddenPhraseSet entities; [contracts/guard-agent-docs.cli.md](./contracts/guard-agent-docs.cli.md) defines the enforcing script. No duplication introduced anywhere in the Phase 1 artifacts. ✅ Pass.
- **Principle XV (Repo Hygiene)**: [contracts/guard-hygiene.cli.md](./contracts/guard-hygiene.cli.md) defines the 11-rule seed list matching the data-model HygieneRule entity. Phase 1 did not introduce any new forbidden path. ✅ Pass.
- **Principle XVI (Operational Quality Baseline)**: [contracts/service-tests.schema.md](./contracts/service-tests.schema.md) defines the happy/failure template; [research.md R-007](./research.md) confirms 11 split CI jobs; R-008 confirms exact-pin strategy; R-009 confirms memory-override annotation mechanism. ✅ Pass.
- **Principles I–IV, VI, VIII–XIII**: Unchanged — no new architectural surface touched in Phase 1 design. ✅ Not applicable.

**Post-design Constitution Check: all gates still pass.** Proceed to `/speckit.tasks`.

## Project Structure

### Documentation (this feature)

```text
specs/003-platform-hygiene-remediation/
├── plan.md              # This file (/speckit.plan command output)
├── spec.md              # /speckit.specify output
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── guard-hygiene.cli.md
│   ├── guard-agent-docs.cli.md
│   └── service-tests.schema.md
├── checklists/
│   └── requirements.md  # /speckit.specify output
└── tasks.md             # Phase 2 output (/speckit.tasks command — NOT created here)
```

### Source Code (repository root)

```text
# Repository-level scripts and configuration
scripts/
├── guard-checks.mjs              # existing — unchanged
├── guard-hygiene.mjs             # NEW — Principle XV enforcement
├── check-agent-docs.mjs          # NEW — Principle XIV enforcement
└── list-service-files.mjs        # NEW — helper for CI job to verify service test parity

.github/
└── workflows/
    └── ci.yml                    # MODIFIED — split into 8 parallel jobs

.gitignore                        # MODIFIED — add 27 AI tool vendor dirs + .turbo/ + coverage/
package.json                      # MODIFIED — add yarn test, yarn guard:hygiene, yarn guard:agent-docs, pin framework versions, comment strapi exclusion
docs/
├── BRANCH_PROTECTION.md          # MODIFIED — require new split jobs
└── plans/
    └── 003-hygiene-remediation-runbook.md   # NEW — completion runbook

# Canonical agent-doc files (rewritten as thin shims)
AGENTS.md                         # MODIFIED — add Source-of-Truth section + support-shim list (content addition only; no rule changes)
CLAUDE.md                         # REWRITTEN — thin shim, ≤150 lines, pointer header
GEMINI.md                         # REWRITTEN — thin shim
.github/copilot-instructions.md   # REWRITTEN — thin shim
.codex/context.md                 # REWRITTEN — thin shim
.qwen/PROJECT_SUMMARY.md          # REWRITTEN — thin shim
.impeccable.md                    # REWRITTEN — thin shim

# Service-layer smoke tests (28 new files, one per service)
apps/next/server/services/
├── _lib/**/*.test.ts             # NEW
├── account/**/*.test.ts          # NEW
├── admin/**/*.test.ts            # NEW
├── cart/**/*.test.ts             # NEW
├── catalog/**/*.test.ts          # NEW
├── categories/**/*.test.ts       # NEW
├── checkout/**/*.test.ts         # NEW
├── graphify-out/**/*.test.ts     # NEW
├── home/**/*.test.ts             # NEW
├── navigation/**/*.test.ts       # NEW
├── orders/**/*.test.ts           # NEW
├── payments/**/*.test.ts         # NEW
├── pharmacist/**/*.test.ts       # NEW
├── product/**/*.test.ts          # NEW
└── search/**/*.test.ts           # NEW

apps/next/package.json            # MODIFIED — test:api glob pattern, pinned next/react/react-dom

# Root cleanup (committed deletions of pending working-tree state)
AGENTS_old.md                     # DELETE
AUDIT_REPORT.md                   # DELETE
claude_audit.md                   # DELETE
codex_audit.md                    # DELETE
gemini_audit.md                   # DELETE
issues.md                         # DELETE
current-home-snapshot.md          # DELETE
DOCUMENTATION.md                  # DELETE
DeliveryExecution*.md             # DELETE (already pending in working tree)
FeatureExtensionBlueprint.md      # DELETE
Milestones.md                     # DELETE
PROMPT.md                         # DELETE
Req.md / Requirments.md / Tasks.md / RequirementClosureMatrix.md / RequirementsTraceability.md / UI_EXECUTION_STRATEGY.md / ADMIN_UI_SYSTEM_SPEC.md
                                  # DELETE (already pending)
```

**Structure Decision**: Monorepo remediation feature. No new packages or apps are introduced. All enforcement lives under `scripts/` (Node.js ESM modules matching the existing `guard-checks.mjs` pattern). All new tests live co-located under `apps/next/server/services/**`. The CI workflow change is a single-file edit. The agent-doc rewrite touches 7 existing files (AGENTS.md as canonical, 6 shims). This follows the existing repository conventions exactly — there are no new patterns to learn.

## Complexity Tracking

> No Constitution Check violations. This section is intentionally empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| — | — | — |
