# Phase 1 Data Model: Platform Hygiene and Agent-Doc Source-of-Truth Remediation

**Feature**: `003-platform-hygiene-remediation`
**Date**: 2026-04-11

This feature has no runtime data model (no database, no user-facing entities). The "data" is configuration, file-system policy, and guard-check state. This document captures each entity as a declarative record so the tasks phase and contracts have a shared vocabulary.

---

## Entity: SourceOfTruthPolicy

**What it represents**: The declaration that `AGENTS.md` is canonical and which files are support shims.

**Location**: `AGENTS.md` — inside a new top-level section named `## Source of Truth`.

**Fields**:
| Field | Type | Description |
|---|---|---|
| `canonical` | `string` (file path) | Always `"AGENTS.md"`. Single value. |
| `supportShims` | `Array<ShimDescriptor>` | Finite list, enumerated below. |
| `policyStatementLink` | `string` (section anchor) | Link back to Constitution Principle XIV. |

**Validation rules**:
- `canonical` MUST be exactly `"AGENTS.md"`. Any other value is a policy violation.
- `supportShims` MUST match the list in Constitution Principle XIV byte-for-byte.
- The section MUST be discoverable by the pattern `^##\s+Source of Truth` at the top of `AGENTS.md` (within the first 30 lines).

---

## Entity: ShimDescriptor

**What it represents**: A single support-shim file entry.

**Fields**:
| Field | Type | Description |
|---|---|---|
| `path` | `string` (repo-relative) | e.g. `"CLAUDE.md"`, `".github/copilot-instructions.md"` |
| `agentName` | `string` | Human-readable agent name, e.g. `"Claude Code"` |
| `allowedSections` | `Array<"pointer" \| "tool-specific" \| "repo-glance">` | Fixed set of three per R-010 |
| `lineCeiling` | `number` | `150` |

**Validation rules** (enforced by `scripts/check-agent-docs.mjs`):
- The file at `path` MUST exist.
- The first 30 lines MUST contain the phrase `"AGENTS.md is the source of truth"` (case-insensitive match) and a link to `AGENTS.md`.
- Total line count MUST be ≤ `lineCeiling`. A file exceeding the ceiling produces a WARN, not a failure, per Edge Case guidance in spec.md.
- The file MUST NOT contain any of the constitution's non-negotiable phrases copied verbatim (see `ForbiddenPhraseSet` below). Verbatim duplication is a FAIL.

**Finite set** (populated from Constitution Principle XIV):
```
{ path: "CLAUDE.md",                        agentName: "Claude Code",   ... }
{ path: "GEMINI.md",                        agentName: "Gemini CLI",    ... }
{ path: ".github/copilot-instructions.md",  agentName: "GitHub Copilot",... }
{ path: ".codex/context.md",                agentName: "Codex CLI",     ... }
{ path: ".qwen/PROJECT_SUMMARY.md",         agentName: "Qwen",          ... }
{ path: ".impeccable.md",                   agentName: "Impeccable",    ... }
```

**State transitions**: None — the set is a policy constant, not runtime state.

---

## Entity: ForbiddenPhraseSet

**What it represents**: The set of architecture-rule phrases that may NOT be duplicated into a support shim. Used by the agent-docs guard to detect violations.

**Fields**:
| Field | Type | Description |
|---|---|---|
| `phrases` | `Array<string>` | Exact sub-strings considered "architecture rule" text |
| `allowedExceptionFiles` | `Array<string>` | Files permitted to contain these phrases — always `["AGENTS.md", ".specify/memory/constitution.md"]` |

**Seed phrases** (extracted from `AGENTS.md` non-negotiables and Constitution Principle lists):
- `"Server Components MUST NOT call internal Route Handlers"`
- `"apiClient is banned server-side"`
- `"No Touchable-style legacy primitives"`
- `"Tokens over hardcoded values"`
- `"Adapters over direct external calls"`
- `"Providers over adapter imports"`
- `"CMS controls content, not layout"`
- `"Cache Components are enabled"`
- `"proxy.ts handles routing, auth, and locale"`

**Validation rule**: If a support shim contains any phrase from this set AND its path is not in `allowedExceptionFiles`, the guard emits a FAIL with the file path, line number, and matched phrase.

**Rationale for maintenance**: The seed list lives inside `scripts/check-agent-docs.mjs` as a `const` array. Updating it is part of any future constitution amendment that changes non-negotiables. The list is intentionally small and obvious so false positives stay low.

---

## Entity: HygieneRule

**What it represents**: A declarative rule about what the repository tree may or may not contain. Enforced by `scripts/guard-hygiene.mjs`.

**Fields**:
| Field | Type | Description |
|---|---|---|
| `id` | `string` | e.g. `"HY-001"` — stable identifier for error messages |
| `kind` | `"forbidden-path" \| "required-gitignore" \| "forbidden-staged-file" \| "required-annotation"` | Rule category |
| `pattern` | `string` (glob or regex) | What to match |
| `scope` | `"repo-root" \| "anywhere" \| "package.json-scripts"` | Where the rule applies |
| `severity` | `"FAIL" \| "WARN"` | Whether the rule blocks CI |
| `message` | `string` | Human-readable error template |
| `principleRef` | `string` | Constitution principle reference (always `"XV"` or `"XVI"`) |

**Seed rules**:

| id | kind | pattern | scope | severity |
|---|---|---|---|---|
| `HY-001` | `required-gitignore` | `.{adal,augment,...,zencoder}/` | `repo-root` | FAIL |
| `HY-002` | `forbidden-path` | `*_audit.md` | `repo-root` | FAIL |
| `HY-003` | `forbidden-path` | `*_old.md` | `repo-root` | FAIL |
| `HY-004` | `forbidden-path` | `current-*-snapshot.md` | `repo-root` | FAIL |
| `HY-005` | `forbidden-path` | `issues.md` | `repo-root` | FAIL |
| `HY-006` | `forbidden-path` | `AUDIT_REPORT.md` | `repo-root` | FAIL |
| `HY-007` | `required-gitignore` | `.next/` `dist/` `coverage/` `.turbo/` | `anywhere` | FAIL |
| `HY-008` | `forbidden-staged-file` | `> 50 files staged as D` | `anywhere` | WARN |
| `HY-009` | `required-annotation` | `NODE_OPTIONS=--max-old-space-size` | `package.json-scripts` | FAIL if no runbook entry |
| `HY-010` | `required-annotation` | workspace exclusions | `package.json` | FAIL if no doc reference |
| `HY-012` | `forbidden-path` | `*.plan.md`, `*_PLAN.md`, `Delivery*.md`, `Milestones.md`, `Req*.md`, `Tasks.md`, `*_TRACEABILITY.md`, `*_BLUEPRINT.md`, `*_STRATEGY.md`, `*_CHECKLIST.md` | `repo-root` (excludes `docs/plans/**`) | FAIL |

**HY-012 rationale**: Enforces FR-012 (active plans live only under `docs/plans/`). Any plan-like markdown at the repository root is a violation because it means a plan was started but never migrated to the canonical plans directory or was left behind after completion. The `docs/plans/**` subtree is explicitly excluded from the match scope so canonical plans are not flagged.

**State transitions**: None. Rules are policy constants versioned alongside the constitution.

---

## Entity: ServiceFileCoverage

**What it represents**: A record showing whether a service file has the required test coverage.

**Fields**:
| Field | Type | Description |
|---|---|---|
| `servicePath` | `string` (repo-relative) | e.g. `"apps/next/server/services/cart/cart.service.ts"` |
| `testPath` | `string` (repo-relative) \| `null` | Corresponding test file, or `null` if missing |
| `happyPathTestPresent` | `boolean` | True iff the test file contains a test name containing `"happy path"` (or matches the template regex) |
| `failurePathTestPresent` | `boolean` | True iff the test file contains a test name containing `"failure path"` |
| `exempt` | `boolean` | True iff the file is a barrel re-export with a documented exemption comment |

**Validation rule**: For each file under `apps/next/server/services/` that is not marked `exempt`, both `happyPathTestPresent` and `failurePathTestPresent` MUST be `true`. Otherwise the `test-service-layer` CI job fails with the list of uncovered files.

**Exemption mechanism**: A service file may include the comment `// @hygiene-exempt: barrel-reexport` at the top. The `scripts/list-service-files.mjs` helper honors this marker and removes the file from the coverage requirement. Edge case from spec covered.

**Seed inventory** (populated by `scripts/list-service-files.mjs` at runtime, snapshot as of 2026-04-11):
- 28 files across 16 subdirectories under `apps/next/server/services/`
- 0 existing co-located tests

---

## Entity: QualityGate

**What it represents**: A single CI job that validates one dimension of project health.

**Fields**:
| Field | Type | Description |
|---|---|---|
| `name` | `string` | e.g. `"typecheck-next"`, `"guard-hygiene"` |
| `command` | `string` | Exact yarn command to run |
| `dependsOn` | `Array<string>` | Other gate names that must pass first (empty for parallel gates) |
| `runsOn` | `string` | GitHub runner label, always `"ubuntu-latest"` for this feature |
| `timeoutMinutes` | `number` | Per-gate timeout |
| `required` | `boolean` | Whether listed as a required status check for `main` |
| `retryable` | `boolean` | Whether the gate can be re-run independently |

**Seed inventory** (11 gates — see research.md R-007):

| name | command | timeoutMinutes | required |
|---|---|---|---|
| `lint` | `yarn lint` | 5 | true |
| `typecheck-next` | `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false` | 10 | true |
| `typecheck-app` | `yarn tsc -p packages/app/tsconfig.json --noEmit --incremental false` | 10 | true |
| `typecheck-ui` | `yarn tsc -p packages/ui/tsconfig.json --noEmit --incremental false` | 10 | true |
| `guard-architecture` | `yarn guard:checks` | 5 | true |
| `guard-hygiene` | `yarn guard:hygiene` | 5 | true |
| `guard-agent-docs` | `yarn guard:agent-docs` | 5 | true |
| `test-service-layer` | `yarn --cwd apps/next test:api` | 10 | true |
| `test-unit` | `yarn test` | 10 | true |
| `e2e-a11y` | `yarn e2e:a11y` | 15 | true |
| `build` | `yarn --cwd apps/next build` | 15 | true |

**State transitions**: A gate transitions through `queued → running → (success | failure | cancelled | timed_out)` per GitHub Actions standard. No custom state machine.

---

## Entity: FrameworkPin

**What it represents**: An exact-version declaration for a framework-tier dependency.

**Fields**:
| Field | Type | Description |
|---|---|---|
| `name` | `string` | Package name |
| `version` | `string` | Exact semver (no `^` or `~`) |
| `manifest` | `string` (repo-relative) | Which `package.json` declares it |

**Validation rule**: For each `(name, manifest)` pair where `name` is in the pinned set, the declared version string MUST NOT start with `^` or `~`. Enforced by `scripts/guard-hygiene.mjs` rule `HY-011` (added to HygieneRule seed list).

**Pinned set**: `next`, `react`, `react-dom`, `react-native`, `react-native-reanimated`, `react-native-web`, `typescript`.

**State transitions**: Framework pins change via deliberate commit only. Each bump is a single-line diff in the manifest plus a lockfile update, reviewed in isolation per FR-020.

---

## Relationships

```
SourceOfTruthPolicy ──has──> ShimDescriptor (×6)
ShimDescriptor ──validated-by──> ForbiddenPhraseSet
HygieneRule (set of ~11) ──enforced-by──> scripts/guard-hygiene.mjs
ServiceFileCoverage (set of 28) ──enforced-by──> scripts/list-service-files.mjs + test-service-layer gate
QualityGate (set of 11) ──registered-in──> .github/workflows/ci.yml + docs/BRANCH_PROTECTION.md
FrameworkPin (set of 7 × manifests) ──enforced-by──> HygieneRule HY-011
```

All entities are static policy. Nothing is user-generated. Nothing persists beyond files in git.
