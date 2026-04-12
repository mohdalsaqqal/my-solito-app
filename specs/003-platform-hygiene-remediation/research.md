# Phase 0 Research: Platform Hygiene and Agent-Doc Source-of-Truth Remediation

**Feature**: `003-platform-hygiene-remediation`
**Date**: 2026-04-11
**Purpose**: Resolve all open technical decisions before Phase 1 design. The spec left no `[NEEDS CLARIFICATION]` markers; this document captures the implementation-level choices made while drafting the plan.

## R-001 — Guard script runtime and module format

**Decision**: Pure Node.js ESM scripts using `.mjs` extension, executed directly by `node`. No bundler, no TypeScript compile step for scripts.

**Rationale**: The existing [scripts/guard-checks.mjs](../../scripts/guard-checks.mjs) is already Node.js ESM. Matching that pattern means contributors do not learn a new convention, and the new scripts can `import` from or share helpers with `guard-checks.mjs` if needed. No runtime install cost, no bundler configuration, no type overhead for what is essentially file-system + regex work.

**Alternatives considered**:
- **TypeScript via tsx**: adds an import step (`npx tsx scripts/guard-hygiene.ts`) and type-checking overhead for 200 lines of glob/regex logic. Rejected — the marginal type safety does not justify the new layer.
- **Shell script**: platform-incompatible (Windows contributors exist per `scripts/guard-checks.sh` + `scripts/guard-checks.lf.sh` duplication pain). Rejected — would perpetuate the dual-shell problem.
- **Turbo task**: unnecessary indirection. Guards are one-off scripts called from `package.json`, not task graphs.

---

## R-002 — Directory enumeration for AI tool vendor ignore list

**Decision**: Hardcode the 27 vendor directories enumerated in Constitution Principle XV directly into `.gitignore` and `scripts/guard-hygiene.mjs`. No auto-discovery.

**Rationale**: The list is a closed set defined in the constitution and updates are rare (new agent tools emerge maybe once a quarter). Updating two places via a constitution-patch amendment is simpler and more auditable than a discovery algorithm that could mask real configuration files. Hardcoding keeps the rule readable by humans.

**Alternatives considered**:
- **Glob pattern like `.{adal,augment,...}*/`**: less readable, harder to search for "why is `.cline/` ignored?"
- **Auto-discovery by presence of `SKILL.md`**: false positives on legitimate project directories. Rejected — explicit beats implicit for a policy list.

---

## R-003 — Service-layer test framework

**Decision**: Reuse the existing Node.js built-in `--test` runner via `tsx` that already powers [apps/next/package.json:10](../../apps/next/package.json#L10)'s `test:api` script. No new framework.

**Rationale**: It is already wired, already trusted, already runs in CI. Introducing Vitest or Jest would require a new dependency, config file, and ESM interop work on an already-complex Next.js 16 + React Native 0.81 + reanimated toolchain. Every new test framework is a new source of build failures. The `node --test` runner is sufficient for smoke tests and is what the existing API tests already use.

**Alternatives considered**:
- **Vitest**: popular, great DX, but adds a dependency tree and ESM interop surface. Rejected — zero value over the existing runner for smoke tests.
- **Jest**: legacy, heavier, worse ESM story on this stack. Rejected.
- **Cross-workspace Turbo test orchestration with a new test framework per package**: creates configuration sprawl. Rejected.

---

## R-004 — Service-layer test discovery pattern

**Decision**: Replace the hand-listed `test:api` file list with a glob `app/api/**/*.test.ts apps/next/server/services/**/*.test.ts` passed to `node --test`. Add a helper script `scripts/list-service-files.mjs` used by CI to assert parity between service files and service test files.

**Rationale**: Principle XVI explicitly forbids hand-maintained test lists. `node --test` supports positional glob arguments on Node 22 (verified). The parity check is a separate concern from test discovery: it answers the question "does every service file have at least one test file?" and runs as its own CI step, producing a clear error when a new service lacks a test.

**Alternatives considered**:
- **Single glob without parity check**: discovery works, but an engineer could add a service without a test file and the tests would silently pass. Rejected.
- **Co-located `__tests__/` directories**: fine in principle but breaks existing convention where `.test.ts` files sit next to source files. Rejected — matching existing convention wins.

---

## R-005 — Happy-path / failure-path smoke test shape

**Decision**: Each service test file follows a minimal template:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { <exports> } from './<service-file>.ts';

test('<serviceName> - happy path returns expected shape', async () => {
  // Arrange: seed mock provider / stub inputs
  // Act: call the service export
  // Assert: shape matches the provider contract
});

test('<serviceName> - failure path surfaces a typed error', async () => {
  // Arrange: inject a provider failure or invalid input
  // Act + Assert: expect the service to throw or return a typed error
});
```

**Rationale**: Smoke tests are not exhaustive — they exist to catch the service-is-completely-broken case and to provide a landing pad for future regression tests. The two-test minimum (happy + failure) maps directly to FR-014 and SC-005 and can be auto-generated from service file exports by the parallel agent dispatch. No test generator is required; each file is a short, self-contained template.

**Alternatives considered**:
- **Property-based tests (fast-check)**: overkill for smoke coverage, adds a dependency. Rejected.
- **Snapshot tests**: fragile, high churn. Rejected.
- **One test per export instead of one happy + one failure**: loses the "does this service fail predictably?" signal, which is the most important thing a smoke test can catch. Rejected.

---

## R-006 — Provider mock strategy for service tests

**Decision**: Use the existing mock adapters from `packages/adapters/mock/**` via the existing provider registry (`packages/providers`). Service tests call the service function; the service calls the registry; the registry is already configured to return mocks in test mode. No new mocking framework.

**Rationale**: The entire adapter surface is already mock-first per Constitution Principle III. Tests exercise the real registry path, which is closer to production behavior than hand-rolled per-test mocks. This also means the service tests double as integration tests for the provider-mediated integration boundary.

**Alternatives considered**:
- **Hand-rolled stubs with `node:test` mocks**: duplicates the mock adapter work already done. Rejected.
- **Dependency injection per test**: requires refactoring service signatures, out of scope. Rejected.

---

## R-007 — CI job split shape

**Decision**: Split [.github/workflows/ci.yml](../../.github/workflows/ci.yml) into 8 parallel jobs, each matching one quality gate:

| Job | Command | Depends on |
|---|---|---|
| `lint` | `yarn lint` | — |
| `typecheck-next` | `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false` | — |
| `typecheck-app` | `yarn tsc -p packages/app/tsconfig.json --noEmit --incremental false` | — |
| `typecheck-ui` | `yarn tsc -p packages/ui/tsconfig.json --noEmit --incremental false` | — |
| `guard-architecture` | `yarn guard:checks` | — |
| `guard-hygiene` | `yarn guard:hygiene` | — |
| `guard-agent-docs` | `yarn guard:agent-docs` | — |
| `test-service-layer` | `yarn --cwd apps/next test:api` | — |
| `test-unit` | `yarn test` (root, via Turbo) | — |
| `e2e-a11y` | `yarn e2e:a11y` | — |
| `build` | `yarn --cwd apps/next build` | — |

**Rationale**: Each job is independent and independently retryable per FR-018. The existing ci.yml already has partial separation (guard, tsc, api-tests). The new jobs follow the same `actions/checkout@v4` + `setup-node@v4` + `corepack enable` + `yarn install --immutable` preamble. All jobs share a Yarn cache via `actions/setup-node@v4`'s built-in cache to keep total wall-clock time ≤ current bundled workflow per SC-007.

**Alternatives considered**:
- **Single reusable workflow with matrix strategy**: more concise but harder to read in the Actions UI. Rejected — readability wins.
- **Turbo remote cache**: valuable but out of scope for this feature. Tracked as a future optimization.
- **Collapse typecheck jobs into one**: loses the ability to see which project failed without re-running. Rejected — the split is the point.

---

## R-008 — Framework version pinning mechanics

**Decision**: Remove the `^` prefix from the seven framework-tier entries in every manifest. Use the exact version currently resolved in `yarn.lock` as the pinned value so `yarn install --immutable` continues to pass without re-resolving. Document the list in a comment in the root `package.json` for discoverability.

**Target manifests**: root `package.json`, `apps/next/package.json`, `apps/expo/package.json`, and any workspace package that directly declares these dependencies.

**Pinned deps**: `next`, `react`, `react-dom`, `react-native`, `react-native-reanimated`, `react-native-web`, `typescript`.

**Rationale**: Pinning to the currently-resolved version is a zero-risk change — the dependency graph does not move. The next upgrade becomes a deliberate commit per FR-020 and SC-008. Comment in root `package.json` documents the rule for future contributors.

**Alternatives considered**:
- **Use `resolutions` field instead of pinning**: works but hides the pin from per-package manifests, defeating the purpose of making upgrades visible per-package. Rejected.
- **Pin ALL dependencies, not just framework tier**: overkill; caret ranges on leaf dependencies are fine and constantly churning the lockfile on every minor upgrade adds noise. Rejected — the principle names framework-tier only.

---

## R-009 — Memory override annotation format

**Decision**: Each occurrence of `NODE_OPTIONS=--max-old-space-size=*` in a script gets an inline comment in the `package.json` scripts object (via a sidecar `.md` note, since JSON does not support comments), plus a link to an issue tracked in `docs/plans/003-hygiene-remediation-runbook.md`. The runbook entry captures the known cause (Next.js 16 development server memory pressure on this specific dependency graph) and the condition under which the override can be removed (upstream Next.js memory profile improvement or bundler migration).

**Rationale**: JSON has no native comments, but the spec requires traceability (FR-021). A runbook entry linked from the feature's documentation directory is the minimum credible tracking, and the hygiene guard can grep for the pattern and fail if no corresponding runbook entry exists.

**Alternatives considered**:
- **Migrate scripts to `scripts/*.mjs` so they can carry comments**: breaks the existing `yarn <script>` entry surface and adds indirection. Rejected.
- **Add `package.json5`**: tool-specific, not standard, contributors would resist. Rejected.

---

## R-010 — Support-shim rewrite length budget and content scope

**Decision**: Each support shim is ≤150 lines, opens with the mandated pointer paragraph, and contains exactly three allowed sections:
1. **Source of Truth Pointer** (≤10 lines): "AGENTS.md is the source of truth. Read it first."
2. **Tool-Specific Operational Notes** (≤100 lines): invocation patterns, memory/hooks, local skill references, tool-native shortcuts — anything that is true only for this specific agent.
3. **Minimal Repo Glance** (≤40 lines): project stack name, the canonical data flow diagram, and links to `AGENTS.md`, `CLAUDE.md` (or equivalent), and the architecture index. This is duplicated across shims *by design* as the orientation header — it is not an architecture rule.

**Rationale**: The 150-line ceiling is enforced by the agent-docs guard. Allowing the repo-glance orientation header keeps each shim self-contained enough that its primary agent does not need to cross-reference AGENTS.md for basic "where am I?" context. The guard distinguishes between forbidden duplication (architecture rules, non-negotiables) and permitted orientation content (stack name, data flow arrow).

**Alternatives considered**:
- **Zero-duplication policy** (shim is only a pointer): produces a bad contributor experience. Rejected.
- **Per-shim custom ceiling**: inconsistent. Rejected — 150 is the number.

---

## R-011 — Branch-protection update mechanism

**Decision**: [docs/BRANCH_PROTECTION.md](../../docs/BRANCH_PROTECTION.md) is updated to list the 11 new required status checks. The actual branch-protection rule on the `main` branch is updated via GitHub UI or `gh api` as an operational step in the runbook, not automated by this feature.

**Rationale**: Branch-protection rules live in GitHub's configuration, not in the repo, so the feature cannot programmatically enforce them. The doc update is the contractual record; the runbook specifies the operational step for whoever is doing the merge.

**Alternatives considered**:
- **Terraform GitHub provider**: introduces infrastructure-as-code tooling not otherwise used by this project. Rejected.
- **`gh` CLI script in CI**: requires admin token and runs on every PR. Rejected — operational step is correct here.

---

## R-012 — Rollback strategy if a guard script flags legitimate work

**Decision**: Both new guards support a `--since <ref>` flag to scope the check to files changed since a reference commit, matching the existing `guard-checks.mjs` convention. In case a guard script is wrong (false positive), contributors can temporarily skip it with `SKIP_GUARD_HYGIENE=1` or `SKIP_GUARD_AGENT_DOCS=1` environment variables, and the skip is logged to the CI output. Skips are surfaced in the PR check title so reviewers see them. Guards cannot be skipped on `main`.

**Rationale**: Guards should be improvable, not brittle. A documented escape hatch during early rollout prevents the guards from blocking legitimate work while bugs are found. Once the guards have run clean for two weeks, the escape hatch stays but usage is monitored.

**Alternatives considered**:
- **No escape hatch**: risks blocking legitimate merges over guard bugs. Rejected.
- **Permanent flag in a config file**: hides skips from reviewers. Rejected.

---

## Summary of Resolutions

| # | Topic | Decision |
|---|---|---|
| R-001 | Guard runtime | Node.js ESM `.mjs`, matching `guard-checks.mjs` |
| R-002 | Vendor list enumeration | Hardcoded from constitution |
| R-003 | Test framework | Reuse `node --test` + `tsx` |
| R-004 | Test discovery | Glob + parity-check helper |
| R-005 | Smoke test shape | Happy + failure, minimal template |
| R-006 | Provider mocking | Existing mock adapters via registry |
| R-007 | CI split | 11 parallel jobs |
| R-008 | Version pinning | Exact versions from `yarn.lock`, seven frameworks |
| R-009 | Memory override | Runbook entry + guard grep check |
| R-010 | Shim length | 150 lines, three allowed sections |
| R-011 | Branch protection | Doc update + operational step |
| R-012 | Guard rollback | `--since`, env-var skip with logging |

No `[NEEDS CLARIFICATION]` markers remain. Phase 1 design may proceed.
