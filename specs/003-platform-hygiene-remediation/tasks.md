---
description: "Task list for feature 003-platform-hygiene-remediation"
---

# Tasks: Platform Hygiene and Agent-Doc Source-of-Truth Remediation

**Input**: Design documents from `/specs/003-platform-hygiene-remediation/`
**Prerequisites**: plan.md âœ…, spec.md âœ…, research.md âœ…, data-model.md âœ…, contracts/ âœ…, quickstart.md âœ…

**Tests**: Tests are REQUIRED for this feature. FR-014 and User Story 3 make service-layer smoke tests a first-class deliverable. Guard scripts MUST also ship with unit tests per contracts.

**Organization**: Tasks are grouped by user story. P1 stories (US1, US2, US3) form the MVP. P2 stories (US4, US5) add CI and dependency discipline. US6 is the long-tail annotation work.

## Audit Cleanup Status (2026-04-12)

Verified green after cleanup:
- `T004` - artifact inventory exists
- `T020` - `guard:agent-docs` and its test suite pass
- `T032` and `T033` - hygiene guard and tests pass
- `T066` - `yarn --cwd apps/next test:api` passes (`118/118`)
- `T067` and `T089` - service parity check passes
- `T068` - CI no longer masks `test-unit` failures
- `T086` - full local verification now passes, including `yarn e2e:a11y`
- `T087` and `T088` - memory/history docs updated in this cleanup pass

Still open or operational follow-up:
- `T072` - deliberate PR typecheck experiment not replayed locally
- `T090` - ship checklist still needs explicit end-to-end box ticking after the final audit pass
- `T091` - final PR + 11 green CI jobs not confirmed here

Audit note:
- The original `T086` verification line referenced `packages/app/tsconfig.json` and `packages/ui/tsconfig.json`, but those files do not exist in this repo.

---## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks in this list)
- **[Story]**: US1â€“US6 map to the six user stories in [spec.md](./spec.md)
- All file paths are repository-relative

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Clean the working tree so later changes land on a known baseline. No code yet.

- [ ] T001 Inspect pending working-tree state with `git status --short` from repository root and capture the list of pending deletions for reference
- [ ] T002 Stage and commit all pending deletions and modifications from prior sessions with message `chore: commit pending hygiene deletions from prior sessions` in repository root
- [ ] T003 [P] Create the feature runbook directory and stub file at `docs/plans/003-hygiene-remediation-runbook.md` with placeholder sections for "Memory override root cause" and "Workspace exclusions"
- [ ] T004 [P] Create `specs/003-platform-hygiene-remediation/ARTIFACT_INVENTORY.md` listing the 28 service files targeted for test coverage (sourced from [data-model.md](./data-model.md) ServiceFileCoverage entity seed)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The `.gitignore` extension and the runbook skeleton MUST land before any guard script runs, and the pointer section in `AGENTS.md` MUST exist before any shim can reference it.

**âš ï¸ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T005 Extend `.gitignore` with the 27 AI-tool vendor directories enumerated in Constitution Principle XV (`.adal/`, `.augment/`, `.cline/`, `.codebuddy/`, `.commandcode/`, `.continue/`, `.crush/`, `.cursor/`, `.factory/`, `.goose/`, `.iflow/`, `.junie/`, `.kilocode/`, `.kiro/`, `.kode/`, `.mcpjam/`, `.mux/`, `.neovate/`, `.openhands/`, `.pi/`, `.pochi/`, `.qoder/`, `.roo/`, `.trae/`, `.vibe/`, `.windsurf/`, `.zencoder/`) and missing build artifacts (`.next/`, `dist/`, `coverage/`, `.turbo/`)
- [ ] T006 [P] Populate `docs/plans/003-hygiene-remediation-runbook.md` with the "Memory override" entries documenting BOTH occurrences: (a) root `package.json` `NODE_OPTIONS=--max-old-space-size=8192` root cause (Next.js 16 dev server memory pressure) with removal criteria; AND (b) `apps/next/package.json` `test:api` `--max-old-space-size=4096` root cause (tsx `--test` heap pressure during service-layer test run) with removal criteria (migrate tests off `tsx --test` or eliminate the in-process mock adapter retention), per R-009. Every `--max-old-space-size=*` occurrence across every manifest MUST have a dedicated runbook entry to satisfy HY-009
- [ ] T007 [P] Populate `docs/plans/003-hygiene-remediation-runbook.md` with the "Workspace exclusions" entry explaining why `apps/strapi` is excluded from the root `workspaces` list via `"!apps/strapi"`
- [ ] T008 Add a new `## Source of Truth` section within the first 30 lines of `AGENTS.md` declaring AGENTS.md canonical and enumerating the six support-shim files with their allowed scope (content addition only â€” no architecture rule changes)
- [ ] T009 [P] Add `guard:hygiene` and `guard:agent-docs` script stubs (pointing to `node scripts/guard-hygiene.mjs` and `node scripts/check-agent-docs.mjs`) to root `package.json` scripts so later phases can wire them without editing package.json again

**Checkpoint**: `.gitignore` is updated, runbook is populated, AGENTS.md has the source-of-truth declaration, and the two guard commands resolve to scripts (which will be written next). User story implementation can begin.

---

## Phase 3: User Story 1 â€” New Contributor Onboards Without Confusion (Priority: P1) ðŸŽ¯ MVP

**Goal**: Establish `AGENTS.md` as the sole source of truth and rewrite all six support shims as thin pointers, enforced by an automated guard.

**Independent Test**: A fresh reader opens any agent-support file, sees the AGENTS.md pointer within the first 10 lines, and the `yarn guard:agent-docs` command passes clean. Deliberately duplicating an architecture rule into a shim makes the guard fail with a clear message.

### Tests for User Story 1 (REQUIRED)

- [ ] T010 [P] [US1] Write `scripts/check-agent-docs.test.mjs` covering all six test cases from [contracts/guard-agent-docs.cli.md](./contracts/guard-agent-docs.cli.md) Â§Test Contract: clean-state pass, missing pointer fail (AD-002), forbidden phrase fail (AD-004), over-ceiling warn (AD-003), missing-shim fail (AD-001), missing SoT section fail (AD-000)

### Implementation for User Story 1

- [ ] T011 [US1] Implement `scripts/check-agent-docs.mjs` per [contracts/guard-agent-docs.cli.md](./contracts/guard-agent-docs.cli.md): Node.js ESM script that reads `AGENTS.md`, validates the six ShimDescriptor entries, scans each shim for ForbiddenPhraseSet matches, and emits human + JSON output with exit codes 0/1/2
- [ ] T012 [US1] Add the `ForbiddenPhraseSet` constant array inside `scripts/check-agent-docs.mjs` with the seed phrases from [data-model.md](./data-model.md) Â§ForbiddenPhraseSet (9 phrases from AGENTS.md non-negotiables)
- [ ] T013 [US1] Add `SKIP_GUARD_AGENT_DOCS` escape-hatch logic to `scripts/check-agent-docs.mjs` per R-012 (logs warning, exits 0 off-main, exits 1 on main)
- [ ] T014 [P] [US1] Rewrite `CLAUDE.md` as a thin shim (â‰¤150 lines): AGENTS.md pointer header, tool-specific notes for Claude Code (skill invocation, memory paths, shortcuts), minimal repo-glance orientation. Remove every verbatim architecture rule â€” replace with references to AGENTS.md
- [ ] T015 [P] [US1] Rewrite `GEMINI.md` as a thin shim (â‰¤150 lines) following the same structure â€” Gemini CLI-specific notes only
- [ ] T016 [P] [US1] Rewrite `.github/copilot-instructions.md` as a thin shim (â‰¤150 lines) â€” GitHub Copilot-specific notes only
- [ ] T017 [P] [US1] Rewrite `.codex/context.md` as a thin shim (â‰¤150 lines) â€” Codex CLI-specific notes only
- [ ] T018 [P] [US1] Rewrite `.qwen/PROJECT_SUMMARY.md` as a thin shim (â‰¤150 lines) â€” Qwen-specific notes only
- [ ] T019 [P] [US1] Rewrite `.impeccable.md` as a thin shim (â‰¤150 lines) â€” Impeccable-specific notes only
- [ ] T020 [US1] Run `yarn guard:agent-docs` and `node --test scripts/check-agent-docs.test.mjs` from repository root and verify both exit 0

**Checkpoint**: `yarn guard:agent-docs` passes on the now-clean shim set. The source-of-truth rule is enforced end-to-end. User Story 1 is independently testable and could ship on its own as a "source of truth" MVP.

---

## Phase 4: User Story 2 â€” Working Tree Reflects the Project (Priority: P1) ðŸŽ¯ MVP

**Goal**: Ship the repo-hygiene guard and delete every repo-root file violating Principle XV. After this phase, the repository root contains only canonical artifacts.

**Independent Test**: A fresh clone of the branch shows zero pending deletions, zero untracked vendor directories, and zero forbidden-pattern files at the repository root. Staging a deliberate `test_audit.md` at root makes `yarn guard:hygiene` fail with a clear message.

### Tests for User Story 2 (REQUIRED)

- [ ] T021 [P] [US2] Write `scripts/guard-hygiene.test.mjs` covering all six test cases from [contracts/guard-hygiene.cli.md](./contracts/guard-hygiene.cli.md) Â§Test Contract: clean tree pass, staged AUDIT_REPORT.md â†’ HY-006 fail, missing `.cline/` â†’ HY-001 fail, `"next": "^16.2.1"` â†’ HY-011 fail, `SKIP_GUARD_HYGIENE=1` off-main â†’ pass, on-main â†’ fail

### Implementation for User Story 2

- [ ] T022 [US2] Implement `scripts/guard-hygiene.mjs` per [contracts/guard-hygiene.cli.md](./contracts/guard-hygiene.cli.md): Node.js ESM script that loads the HygieneRule seed list, evaluates each rule, collects Finding records grouped by severity, and emits human + JSON output with exit codes 0/1/2
- [ ] T023 [US2] Seed `scripts/guard-hygiene.mjs` with rules HY-001 through HY-012 from [data-model.md](./data-model.md) Â§HygieneRule, including the framework-pin rule HY-011 (exercised in Phase 7) and the plans-discipline rule HY-012 (FR-012 enforcement: rejects plan-like markdown at repo root, excluding the `docs/plans/**` subtree)
- [ ] T024 [US2] Add `SKIP_GUARD_HYGIENE` escape-hatch logic to `scripts/guard-hygiene.mjs` per R-012
- [ ] T025 [US2] Add `--since <ref>` flag support to `scripts/guard-hygiene.mjs` matching the convention used by `scripts/guard-checks.mjs`
- [ ] T026 [US2] Add `--json` output flag to `scripts/guard-hygiene.mjs` matching the JSON schema in the contract
- [ ] T027 [P] [US2] Delete `AGENTS_old.md` from repository root
- [ ] T028 [P] [US2] Delete `AUDIT_REPORT.md` from repository root
- [ ] T029 [P] [US2] Delete `claude_audit.md`, `codex_audit.md`, and `gemini_audit.md` from repository root
- [ ] T030 [P] [US2] Delete `issues.md` and `current-home-snapshot.md` from repository root
- [ ] T031 [P] [US2] Delete `.tmp/frontend-design-remote.md` and any other `.tmp/*` files from repository root
- [ ] T032 [US2] Run `yarn guard:hygiene` from repository root and verify it exits 0 on the now-clean tree
- [ ] T033 [US2] Run `node --test scripts/guard-hygiene.test.mjs` from repository root and verify it exits 0

**Checkpoint**: Repository root is clean. The hygiene guard passes. Staging any forbidden file makes it fail. User Story 2 is independently testable and shippable.

---

## Phase 5: User Story 3 â€” Service Layer Has Basic Test Coverage (Priority: P1) ðŸŽ¯ MVP

**Goal**: Ship one smoke test per service file (28 files) covering a happy path and a failure path, wire the glob-based discovery, and add a parity check that fails CI when a new service arrives without a test.

**Independent Test**: `yarn --cwd apps/next test:api` runs â‰¥56 tests covering every service file; `node scripts/list-service-files.mjs --check-parity` exits 0; deleting a single service test file makes the parity check fail.

### Tests for User Story 3 (REQUIRED â€” the tests ARE the deliverable)

**Generator tooling tasks** (prepare the ground):

- [ ] T034 [US3] Write `scripts/list-service-files.mjs` helper that globs `apps/next/server/services/**/*.ts` (excluding `*.test.ts`), honors the `// @hygiene-exempt: barrel-reexport` marker from [contracts/service-tests.schema.md](./contracts/service-tests.schema.md), and supports `--check-parity` flag to verify each non-exempt service has a sibling `*.test.ts` with tests matching `/happy\s+path/i` and `/failure\s+path/i`

**Service-layer test generation** (all 28 tasks parallelizable â€” each writes a distinct file; dispatch via Principle VII):

- [ ] T035 [P] [US3] Write `apps/next/server/services/_lib/public-discovery.test.ts` with happy-path + failure-path smoke tests per [contracts/service-tests.schema.md](./contracts/service-tests.schema.md)
- [ ] T036 [P] [US3] Write `apps/next/server/services/_lib/service-error.test.ts` with happy-path + failure-path smoke tests
- [ ] T037 [P] [US3] Write `apps/next/server/services/account/account-addresses.service.test.ts` with happy-path + failure-path smoke tests
- [ ] T038 [P] [US3] Write `apps/next/server/services/account/account-page.service.test.ts` with happy-path + failure-path smoke tests
- [ ] T039 [P] [US3] Write `apps/next/server/services/account/account-test-detail.service.test.ts` with happy-path + failure-path smoke tests
- [ ] T040 [P] [US3] Write `apps/next/server/services/admin/admin-cache.service.test.ts` with happy-path + failure-path smoke tests
- [ ] T041 [P] [US3] Write `apps/next/server/services/admin/admin-menus.service.test.ts` with happy-path + failure-path smoke tests
- [ ] T042 [P] [US3] Write `apps/next/server/services/admin/admin-orders.service.test.ts` with happy-path + failure-path smoke tests
- [ ] T043 [P] [US3] Write `apps/next/server/services/admin/admin-product-queries.service.test.ts` with happy-path + failure-path smoke tests
- [ ] T044 [P] [US3] Write `apps/next/server/services/admin/admin-products.service.test.ts` with happy-path + failure-path smoke tests
- [ ] T045 [P] [US3] Write `apps/next/server/services/cart/cart-page.service.test.ts` with happy-path + failure-path smoke tests
- [ ] T046 [P] [US3] Write `apps/next/server/services/catalog/product-list.service.test.ts` with happy-path + failure-path smoke tests
- [ ] T047 [P] [US3] Write `apps/next/server/services/categories/categories-page.service.test.ts` with happy-path + failure-path smoke tests
- [ ] T048 [P] [US3] Write `apps/next/server/services/checkout/checkout-page.service.test.ts` with happy-path + failure-path smoke tests
- [ ] T049 [P] [US3] Write `apps/next/server/services/checkout/checkout-quote.service.test.ts` with happy-path + failure-path smoke tests
- [ ] T050 [P] [US3] Write `apps/next/server/services/checkout/checkout-success-page.service.test.ts` with happy-path + failure-path smoke tests
- [ ] T051 [P] [US3] Write `apps/next/server/services/home/home-cms.service.test.ts` with happy-path + failure-path smoke tests
- [ ] T052 [P] [US3] Write `apps/next/server/services/home/home-layout-data.service.test.ts` with happy-path + failure-path smoke tests
- [ ] T053 [P] [US3] Write `apps/next/server/services/home/home-page.service.test.ts` with happy-path + failure-path smoke tests
- [ ] T054 [P] [US3] Write `apps/next/server/services/home/normalize-home-blocks.test.ts` with happy-path + failure-path smoke tests
- [ ] T055 [P] [US3] Write `apps/next/server/services/navigation/resolve-shell-menus.service.test.ts` with happy-path + failure-path smoke tests
- [ ] T056 [P] [US3] Write `apps/next/server/services/orders/order-access.service.test.ts` with happy-path + failure-path smoke tests
- [ ] T057 [P] [US3] Write `apps/next/server/services/orders/order-detail.service.test.ts` with happy-path + failure-path smoke tests
- [ ] T058 [P] [US3] Write `apps/next/server/services/orders/place-order.service.test.ts` with happy-path + failure-path smoke tests
- [ ] T059 [P] [US3] Write `apps/next/server/services/payments/networks-webhook.service.test.ts` with happy-path + failure-path smoke tests
- [ ] T060 [P] [US3] Write `apps/next/server/services/pharmacist/pharmacist-bootstrap.service.test.ts` with happy-path + failure-path smoke tests
- [ ] T061 [P] [US3] Write `apps/next/server/services/product/product-page.service.test.ts` with happy-path + failure-path smoke tests
- [ ] T062 [P] [US3] Write `apps/next/server/services/search/search.service.test.ts` with happy-path + failure-path smoke tests

### Implementation for User Story 3 (discovery wiring)

- [ ] T063 [US3] Replace the hand-listed `test:api` command in `apps/next/package.json` with a glob-based invocation: `node --max-old-space-size=4096 ../../node_modules/tsx/dist/cli.mjs --test --test-concurrency=1 'app/api/**/*.test.ts' 'server/services/**/*.test.ts'`
- [ ] T064 [US3] Add a root-level `"test": "turbo run test"` script to the root `package.json` scripts section
- [ ] T065 [US3] Add a `test` task to `turbo.json` wired to workspace-level `test` scripts (create if missing) so `yarn test` orchestrates service-layer tests plus any other workspace tests
- [ ] T066 [US3] Run `yarn --cwd apps/next test:api` from repository root and verify all 56+ tests pass
- [ ] T067 [US3] Run `node scripts/list-service-files.mjs --check-parity` from repository root and verify it exits 0

**Checkpoint**: Every service file has smoke coverage. Glob-based discovery works. Parity check passes. User Story 3 is independently testable. **MVP is now complete** â€” stopping here delivers the three P1 stories.

---

## Phase 6: User Story 4 â€” CI Reports Each Failure Independently (Priority: P2)

**Goal**: Split `.github/workflows/ci.yml` into 11 distinct parallel jobs per R-007 so a single failure surfaces discretely.

**Independent Test**: Opening a pull request with a deliberate typecheck error makes only the `typecheck-next` job fail while the other 10 jobs run to completion. Branch-protection doc lists the 11 required checks.

### Implementation for User Story 4

- [ ] T068 [US4] Rewrite `.github/workflows/ci.yml` to define 11 parallel jobs with the shared `actions/checkout@v4` + `setup-node@v4` (Node 22, built-in Yarn cache) + `corepack enable` + `yarn install --immutable` preamble: `lint`, `typecheck-next`, `typecheck-app`, `typecheck-ui`, `guard-architecture`, `guard-hygiene`, `guard-agent-docs`, `test-service-layer`, `test-unit`, `e2e-a11y`, `build` (per [data-model.md](./data-model.md) Â§QualityGate seed inventory)
- [ ] T069 [US4] Verify each job in `.github/workflows/ci.yml` has an explicit `timeout-minutes` value matching the QualityGate seed (lint/guards: 5, typecheck/tests: 10, e2e/build: 15)
- [ ] T070 [US4] Enable `actions/setup-node@v4`'s built-in Yarn cache on every job in `.github/workflows/ci.yml` to keep total wall-clock time â‰¤ the current bundled workflow (SC-007 constraint)
- [ ] T071 [P] [US4] Update `docs/BRANCH_PROTECTION.md` to list all 11 new required status checks by their job name, replacing the previous bundled-workflow reference
- [ ] T072 [US4] Open a draft pull request containing a deliberate one-line typecheck error in a non-critical file, observe that only the `typecheck-next` job fails while the other 10 report their own state, then revert the deliberate error

**Checkpoint**: CI shows 11 independent checks on every PR. Branch protection is documented. User Story 4 delivers on its own â€” ships independently of the P1 MVP.

---

## Phase 7: User Story 5 â€” Framework Versions Are Reproducible (Priority: P2)

**Goal**: Pin seven framework-tier dependencies to exact versions across all manifests so builds are reproducible and upgrades are deliberate events.

**Independent Test**: `grep -rE '"(next|react|react-dom|react-native|react-native-reanimated|react-native-web|typescript)"\s*:\s*"\^'` returns zero matches; `yarn install --immutable` still passes. The hygiene guard rule HY-011 rejects any reintroduction of a caret range.

### Implementation for User Story 5

- [ ] T073 [US5] Read `yarn.lock` from repository root to capture the currently-resolved exact versions of `next`, `react`, `react-dom`, `react-native`, `react-native-reanimated`, `react-native-web`, `typescript` for use in the following pin tasks
- [ ] T074 [P] [US5] Remove the `^` prefix from any of the seven framework-tier dependencies declared in root `package.json`, pinning each to the version resolved in `yarn.lock`
- [ ] T075 [P] [US5] Remove the `^` prefix from any of the seven framework-tier dependencies declared in `apps/next/package.json`
- [ ] T076 [P] [US5] Remove the `^` prefix from any of the seven framework-tier dependencies declared in `apps/expo/package.json`
- [ ] T077 [P] [US5] Remove the `^` prefix from any of the seven framework-tier dependencies declared in `packages/ui/package.json`
- [ ] T078 [P] [US5] Remove the `^` prefix from any of the seven framework-tier dependencies declared in `packages/app/package.json`
- [ ] T079 [P] [US5] Remove the `^` prefix from any of the seven framework-tier dependencies declared in `packages/providers/package.json`, `packages/adapters/package.json`, and `packages/tokens/package.json`
- [ ] T080 [US5] Run `yarn install --immutable` from repository root and verify it exits 0 (no resolution changes expected â€” pinning to already-resolved versions)
- [ ] T081 [US5] Run `yarn guard:hygiene` from repository root and verify rule HY-011 passes (no remaining carets on framework-tier deps)

**Checkpoint**: All seven frameworks pinned everywhere. Reinstalling on any date produces byte-identical versions. HY-011 enforces the rule going forward. User Story 5 delivers independently.

---

## Phase 8: User Story 6 â€” Operational Overrides Have Documented Root Causes (Priority: P3)

**Goal**: Ensure every `NODE_OPTIONS=--max-old-space-size=*` occurrence and every workspace exclusion has a documented root cause traceable from the manifest to the runbook.

**Independent Test**: `yarn guard:hygiene` passes rule HY-009 (memory override annotation) and HY-010 (workspace exclusion annotation). A reviewer can follow the thread from any override in a `package.json` to the root-cause entry in the runbook.

### Implementation for User Story 6

- [ ] T082 [P] [US6] Verify every `NODE_OPTIONS=--max-old-space-size=*` occurrence in root `package.json` has a corresponding entry in `docs/plans/003-hygiene-remediation-runbook.md` (runbook was populated in T006)
- [ ] T083 [P] [US6] Verify every `NODE_OPTIONS=--max-old-space-size=*` occurrence in `apps/next/package.json` has a corresponding runbook entry
- [ ] T084 [US6] Verify the `"!apps/strapi"` workspace exclusion in root `package.json` has a corresponding runbook entry (runbook was populated in T007)
- [ ] T085 [US6] Run `yarn guard:hygiene` from repository root and verify rules HY-009 and HY-010 pass

**Checkpoint**: Every operational override has a paper trail. User Story 6 delivers independently.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final integration verification, documentation updates, and the constitution Definition-of-Done gate.

- [ ] T086 Run the full verification flow from repository root in order: `yarn guard:checks`, `yarn guard:hygiene`, `yarn guard:agent-docs`, `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false`, `node scripts/list-service-files.mjs --check-parity`, `yarn --cwd apps/next test:api`, `yarn test`, `yarn e2e:a11y`. Every command MUST exit 0. Audit note: the earlier references to `packages/app/tsconfig.json` and `packages/ui/tsconfig.json` were stale because those files do not exist in this repo.
- [ ] T087 [P] Update `MEMORY.md` with a pointer to the new `003-platform-hygiene-remediation` feature and its enforcement scripts, per the constitution's Memory Sync rule
- [ ] T088 [P] Update `.context/history/commits.md` with a one-line entry summarizing the feature ship
- [ ] T089 Run `node scripts/list-service-files.mjs --check-parity` a final time from repository root to verify no service file was added during the feature that lacks a test
- [ ] T090 Walk the [quickstart.md](./quickstart.md) "Ship Criteria Checklist" end to end and verify every box is checked
- [ ] T091 Open the final pull request referencing `003-platform-hygiene-remediation` and confirm all 11 CI jobs pass before requesting review

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies â€” can start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 â€” BLOCKS all user stories
- **Phase 3 (US1)**: Depends on Phase 2 â€” can proceed in parallel with Phase 4 and Phase 5
- **Phase 4 (US2)**: Depends on Phase 2 â€” can proceed in parallel with Phase 3 and Phase 5
- **Phase 5 (US3)**: Depends on Phase 2 â€” can proceed in parallel with Phase 3 and Phase 4
- **Phase 6 (US4)**: Depends on Phases 3, 4, 5 completing (needs `guard:hygiene`, `guard:agent-docs`, and `test-service-layer` targets to exist before CI jobs can reference them)
- **Phase 7 (US5)**: Depends on Phase 4 only (needs `guard:hygiene` HY-011 to exist)
- **Phase 8 (US6)**: Depends on Phase 4 (for `guard:hygiene` HY-009/HY-010) and Phase 2 (for runbook content)
- **Phase 9 (Polish)**: Depends on all desired phases being complete

### User Story Dependencies

- **US1 (P1)**: Independent after Foundational
- **US2 (P1)**: Independent after Foundational
- **US3 (P1)**: Independent after Foundational
- **US4 (P2)**: Depends on US1 + US2 + US3 (CI split references all three guard/test targets)
- **US5 (P2)**: Depends on US2 (HY-011 rule added there)
- **US6 (P3)**: Depends on US2 (HY-009/HY-010 rules added there)

### Within Each User Story

- Guard script tests (T010, T021) are written before the scripts themselves land their full behavior â€” each test MUST fail initially, then pass as the implementation tasks complete
- Contracts define the shape; tasks implement and verify against the contract
- Parity check (T067) runs after all service test files are generated

### Parallel Opportunities

- **Phase 1**: T003 and T004 in parallel (different files)
- **Phase 2**: T006, T007, and T009 in parallel (different sections/files) after T005 completes
- **Phase 3 (US1)**: T014 through T019 â€” six shim rewrites in parallel via Principle VII dispatch
- **Phase 4 (US2)**: T027 through T031 â€” deletion tasks in parallel (though they can also be a single `git rm` batch)
- **Phase 5 (US3)**: T035 through T062 â€” **28 test file generations in parallel** via Principle VII dispatch (this is the largest parallel batch in the entire plan)
- **Phase 6 (US4)**: T071 in parallel with T068â€“T070
- **Phase 7 (US5)**: T074 through T079 â€” six manifest pin tasks in parallel
- **Phase 8 (US6)**: T082 and T083 in parallel
- **Cross-phase parallelism**: Once Phase 2 is done, Phases 3, 4, and 5 can be worked on by three different agents/developers simultaneously

---

## Parallel Example: Phase 5 (User Story 3) â€” 28 Service Tests

Dispatched via Principle VII parallel agent dispatch. Pre-read all 28 service files from the repository, then launch 28 agents simultaneously, each receiving:
- The exact content of its assigned service file
- The test template from [contracts/service-tests.schema.md](./contracts/service-tests.schema.md)
- The exact output path (e.g., `apps/next/server/services/cart/cart-page.service.test.ts`)
- Instruction to write exactly one file and exit

```bash
# Orchestrator pre-read (main context):
Read apps/next/server/services/_lib/public-discovery.ts
Read apps/next/server/services/_lib/service-error.ts
Read apps/next/server/services/account/account-addresses.service.ts
... (28 reads total, ~5 minutes)

# Parallel dispatch (28 sub-agents, ~8 minutes):
Agent T035 â†’ writes _lib/public-discovery.test.ts
Agent T036 â†’ writes _lib/service-error.test.ts
Agent T037 â†’ writes account/account-addresses.service.test.ts
...
Agent T062 â†’ writes search/search.service.test.ts

# Orchestrator verification:
Run: yarn --cwd apps/next test:api
Run: node scripts/list-service-files.mjs --check-parity
```

## Parallel Example: Phase 3 (User Story 1) â€” 6 Shim Rewrites

```bash
# Orchestrator pre-read (main context):
Read CLAUDE.md
Read GEMINI.md
Read .github/copilot-instructions.md
Read .codex/context.md
Read .qwen/PROJECT_SUMMARY.md
Read .impeccable.md

# Parallel dispatch (6 sub-agents):
Agent T014 â†’ rewrites CLAUDE.md (â‰¤150 lines, pointer + Claude-specific)
Agent T015 â†’ rewrites GEMINI.md
Agent T016 â†’ rewrites .github/copilot-instructions.md
Agent T017 â†’ rewrites .codex/context.md
Agent T018 â†’ rewrites .qwen/PROJECT_SUMMARY.md
Agent T019 â†’ rewrites .impeccable.md

# Orchestrator verification:
Run: yarn guard:agent-docs
```

---

## Implementation Strategy

### MVP First (User Stories 1â€“3 only)

1. Complete Phase 1 (Setup) â€” clean working tree baseline
2. Complete Phase 2 (Foundational) â€” `.gitignore`, runbook, AGENTS.md SoT section
3. Complete Phase 3 (US1) â€” source-of-truth guard + 6 shim rewrites
4. Complete Phase 4 (US2) â€” hygiene guard + root cleanup
5. Complete Phase 5 (US3) â€” 28 service tests + glob discovery + parity check
6. **STOP and VALIDATE**: Run T086 verification flow. All P1 stories ship.
7. Open MVP pull request. Merge. Branch protection still has the old bundled CI â€” this MVP ship does not yet require the split jobs.

### Incremental Delivery (full feature)

1. MVP as above
2. Phase 6 (US4) â€” CI split â€” ships as a second PR referencing the MVP merge
3. Phase 7 (US5) â€” framework pins â€” third PR
4. Phase 8 (US6) â€” operational annotations â€” fourth PR (tiny)
5. Phase 9 (Polish) â€” final verification PR updating `docs/BRANCH_PROTECTION.md` to require the new split jobs

### Parallel Team Strategy (single branch, multiple agents)

With 3 agents working after Phase 2 completes:

1. Agent A: Phase 3 (US1 â€” source-of-truth guard + shim rewrites)
2. Agent B: Phase 4 (US2 â€” hygiene guard + root cleanup)
3. Agent C: Phase 5 (US3 â€” service tests via its own 28-way parallel dispatch)

All three phases land in the same branch. Phase 6 (US4) then depends on all three. Phases 7 and 8 proceed in parallel with Phase 6 because they only depend on Phase 4.

---

## Notes

- **[P] tasks** touch different files and have no dependencies on incomplete tasks earlier in the list. Honor the ordering within a single phase â€” `T022` must complete before `T032` for example, because `T032` runs the guard that `T022` implements.
- **[Story] labels** map every task back to the user story it serves in [spec.md](./spec.md). Setup, Foundational, and Polish phases have no story label per the checklist format rule.
- **Each user story is independently testable** via its Independent Test criterion at the top of its phase. Stopping after any checkpoint leaves the project in a working state.
- **Commit after each phase** (or each logical group within a phase) so rollback is surgical â€” matches R-012.
- **Guard script tests fail before the scripts exist**, which matches the constitution's test-first spirit even though no framework-level TDD is imposed.
- **No cross-story dependencies break independence**: US1, US2, and US3 are each independently shippable as small PRs if the team prefers many small merges over one big merge. The dependency arrows in Â§Phase Dependencies are about what work *must* exist before later phases can reference it, not about cross-story coupling.
- **The 28 parallel test-generation tasks (T035â€“T062) are the highest-value parallel block in the entire plan** â€” each sub-agent needs only the target service file plus the template, no codebase exploration. This is the exact scenario Constitution Principle VII was written for.



