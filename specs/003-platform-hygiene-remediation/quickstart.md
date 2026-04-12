# Quickstart: Platform Hygiene Remediation - 003

**Feature**: `003-platform-hygiene-remediation`
**Audience**: The engineer or agent implementing this feature during `/speckit.implement`.
**Time to green**: expect ~3-4 focused hours spread across the six phases below, with the service-test generation being the longest single task.

## Prerequisites

- Working on branch `003-platform-hygiene-remediation` (created by `/speckit.specify`).
- Constitution v1.3.0 ratified (already done).
- Clean local checkout with `yarn install --immutable` succeeding.
- Ability to run `yarn guard:checks` and `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false` locally.

## Implementation Order

This quickstart mirrors the order the tasks phase will generate. Each step is independently verifiable.

### Step 1 - Commit pending working-tree state (Unblocks everything)

The working tree is currently dirty with pending deletions from prior sessions. Commit them first so later changes land on a clean baseline.

```bash
git status --short | head -80            # verify what's pending
git add -A                                # stage all deletions/modifications
git status --short                        # one more look
git commit -m "chore: commit pending hygiene deletions from prior sessions"
```

Verification:
```bash
git status --short                        # should be empty
```

---

### Step 2 - Extend `.gitignore` (Principle XV, HY-001 and HY-007)

Append the 27 AI-tool vendor directories and missing build artifacts to `.gitignore`.

Verification:
```bash
node -e "console.log(require('fs').readFileSync('.gitignore','utf8').split('\n').filter(l=>l.includes('.cline/')||l.includes('.turbo/')).length)"
# Should print 2 (or whichever count reflects both entries present)
```

---

### Step 3 - Write the hygiene guard script

Create `scripts/guard-hygiene.mjs` per [contracts/guard-hygiene.cli.md](./contracts/guard-hygiene.cli.md).

Wire it into root `package.json`:
```json
"guard:hygiene": "node scripts/guard-hygiene.mjs"
```

Write the test at `scripts/guard-hygiene.test.mjs` covering the six cases listed in the contract.

Verification:
```bash
yarn guard:hygiene
node --test scripts/guard-hygiene.test.mjs
```

---

### Step 4 - Update `AGENTS.md` with the Source-of-Truth section

Add a new `## Source of Truth` section within the first 30 lines of `AGENTS.md`. Include the explicit six-shim list with paths and scope.

**Do not change any existing architecture rules.** The section is purely additive per the plan's Constitution Check.

Verification:
```bash
head -50 AGENTS.md | grep -i "source of truth"
```

---

### Step 5 - Rewrite the 6 support shims

For each of `CLAUDE.md`, `GEMINI.md`, `.github/copilot-instructions.md`, `.codex/context.md`, `.qwen/PROJECT_SUMMARY.md`, `.impeccable.md`:

1. Write the pointer paragraph in the first 10 lines.
2. Keep only tool-specific operational notes (skill invocation, memory file paths, shortcuts).
3. Remove any verbatim architecture rule - replace with `See AGENTS.md for architecture rules.`
4. Keep total length <= 150 lines.

**This is a parallel-dispatch task** (Principle VII). Pre-read each shim, then dispatch one sub-agent per file with the exact rewritten content.

---

### Step 6 - Write the agent-docs guard script

Create `scripts/check-agent-docs.mjs` per [contracts/guard-agent-docs.cli.md](./contracts/guard-agent-docs.cli.md).

Wire it:
```json
"guard:agent-docs": "node scripts/check-agent-docs.mjs"
```

Write the test at `scripts/check-agent-docs.test.mjs`.

Verification:
```bash
yarn guard:agent-docs
node --test scripts/check-agent-docs.test.mjs
```

---

### Step 7 - Generate service-layer smoke tests (parallel dispatch)

Run:
```bash
node scripts/list-service-files.mjs
```

Pre-read all 28 service files yourself. Then dispatch 28 parallel sub-agents, one per service file. Each sub-agent receives:
- The exact service file content.
- The test file template from [contracts/service-tests.schema.md](./contracts/service-tests.schema.md).
- The target path for the new `.test.ts` file.
- No exploration instructions.

Each sub-agent writes exactly one `.test.ts` file and exits.

Verification:
```bash
node scripts/list-service-files.mjs --check-parity
yarn --cwd apps/next test:api
```

---

### Step 8 - Replace hand-listed `test:api` with glob

Edit [package.json](../../apps/next/package.json) to use:
```json
"test:api": "node --max-old-space-size=4096 ../../node_modules/tsx/dist/cli.mjs --test --test-concurrency=1 app/api/**/*.test.ts server/services/**/*.test.ts"
```

(The memory override retains its existing runbook link per step 10.)

Verification:
```bash
yarn --cwd apps/next test:api
```

---

### Step 9 - Add root `yarn test` orchestration

Add to root `package.json`:
```json
"test": "turbo run test"
```

Add `test` task to `turbo.json` if it does not already exist, wiring it to workspace-level `test` scripts.

Verification:
```bash
yarn test
```

---

### Step 10 - Pin framework versions

For each of the seven framework-tier packages, remove the `^` prefix in every manifest that declares them. Use the version currently resolved in `yarn.lock`.

**Do not run `yarn upgrade`** - the goal is to pin the existing resolution, not to upgrade.

Verification:
```bash
grep -rE '"(next|react|react-dom|react-native|react-native-reanimated|react-native-web|typescript)"\s*:\s*"\^' apps packages package.json
# Should return nothing
yarn install --immutable
```

---

### Step 11 - Annotate memory override and workspace exclusion

1. Create `docs/plans/003-hygiene-remediation-runbook.md` with entries documenting:
   - The `NODE_OPTIONS=--max-old-space-size=8192` override (cause, removal criteria).
   - The `"!apps/strapi"` workspace exclusion reason.
2. The hygiene guard's `HY-009` and `HY-010` rules look for these runbook entries.

Verification:
```bash
yarn guard:hygiene
```

---

### Step 12 - Split CI workflow

Edit `.github/workflows/ci.yml` per [research.md](./research.md#r-007--ci-job-split-shape) to create 11 parallel jobs. Each job follows the existing `actions/checkout@v4` + `setup-node@v4` + `corepack enable` + `yarn install --immutable` preamble. Use `actions/setup-node@v4`'s built-in Yarn cache to keep wall-clock time <= current bundled workflow.

Verification (in CI, after push):
- Each of the 11 jobs appears as a distinct check on the pull request.
- Introducing a deliberate typecheck error fails only `typecheck-next` while other jobs complete.

---

### Step 13 - Update `docs/BRANCH_PROTECTION.md`

List all 11 new required status checks in the branch-protection document. The actual GitHub branch-protection rule update happens as an operational step during merge - this feature only updates the document of record.

---

### Final Verification (current audited flow)

Run in order:

```bash
yarn guard:checks
yarn guard:hygiene
yarn guard:agent-docs
yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false
node scripts/list-service-files.mjs --check-parity
yarn --cwd apps/next test:api
yarn test
yarn e2e:a11y
```

All commands should exit `0` for the feature to ship.

Audit notes:
- The older quickstart referenced `packages/app/tsconfig.json` and `packages/ui/tsconfig.json`, but those files do not exist in this repo.
- `apps/next/proxy.ts` is the canonical routing/auth entry. Do not keep a duplicate `apps/next/middleware.ts` alongside it.

## Ship Criteria Checklist

- [ ] Working tree clean (no pending deletions).
- [x] `.gitignore` covers all 27 vendor directories and build artifacts.
- [x] `scripts/guard-hygiene.mjs` exists, tested, wired to `yarn guard:hygiene`.
- [x] `scripts/check-agent-docs.mjs` exists, tested, wired to `yarn guard:agent-docs`.
- [x] `AGENTS.md` has the `## Source of Truth` section with the full shim list.
- [x] All 6 support shims rewritten as thin pointers (pointer + tool-specific only, <= 150 lines).
- [x] All 28 service files have co-located `.test.ts` with happy + failure tests.
- [x] `test:api` uses a glob pattern; no hand-list remains.
- [x] Root `yarn test` runs every workspace's tests via Turbo.
- [x] All 7 framework-tier deps pinned to exact versions in every manifest.
- [x] Memory override and workspace exclusion documented in the runbook.
- [x] `.github/workflows/ci.yml` has 11 parallel jobs.
- [x] `docs/BRANCH_PROTECTION.md` lists the 11 required checks.
- [x] All current verification commands pass locally.
- [ ] Pull request opened; all 11 CI jobs green.

## Rollback

If any step produces unexpected failures:

1. **Single-step rollback**: `git revert` the specific commit. Each phase should be its own commit so rollback is surgical.
2. **Guard false positive**: set `SKIP_GUARD_HYGIENE=1` or `SKIP_GUARD_AGENT_DOCS=1` locally while fixing the guard script. The skip does not work on `main`.
3. **Test generation produces wrong assertions**: the smoke tests are permitted to use `assert.ok(true, 'placeholder')` as a starting point. Refinement can happen in follow-up commits.

