# Branch Protection Rules

This document describes the recommended branch protection rules for this repository.
These rules must be configured manually in **GitHub Settings -> Branches -> Branch protection rules**.

## `main` Branch

**Required settings:**
- [x] **Require a pull request before merging**
- [x] **Require approvals** - Minimum 1 approval
- [x] **Dismiss stale pull request approvals when new commits are pushed**
- [x] **Require status checks to pass before merging**

**Required status checks** (match the job `name` fields in [.github/workflows/ci.yml](../.github/workflows/ci.yml)):

Continuous integration currently exposes 9 trustworthy parallel jobs. Register these 9 checks as required status checks.

| # | Status Check Name | Job ID | Purpose |
|---|---|---|---|
| 1 | `Lint` | `lint` | ESLint across the Next.js workspace |
| 2 | `Type Check (Next)` | `typecheck-next` | `tsc --noEmit` for `apps/next` |
| 3 | `Guard: Architecture` | `guard-architecture` | `yarn guard:checks` - token/class/env/hex violations |
| 4 | `Guard: Hygiene` | `guard-hygiene` | `yarn guard:hygiene` - Principle XV enforcement (HY-001..HY-012) |
| 5 | `Guard: Agent Docs` | `guard-agent-docs` | `yarn guard:agent-docs` - Principle XIV enforcement |
| 6 | `Test: Service Layer` | `test-service-layer` | Node `--test` run of `apps/next/server/services/**/*.test.ts` |
| 7 | `Test: Unit` | `test-unit` | Node `--test` run of `apps/next/app/api/**/*.test.ts` |
| 8 | `E2E: Accessibility` | `e2e-a11y` | Playwright accessibility suite |
| 9 | `Build` | `build` | Next.js production build |

**Additional settings:**
- [x] **Require branches to be up to date before merging**
- [x] **Require conversation resolution before merging**
- [x] **Include administrators** (applies rules to admin users too)
- [x] **Do not allow bypassing the above settings**

**Optional (for mature CI):**
- [ ] **Require linear history** (no merge commits, use squash or rebase)
- [ ] **Restrict who can push to matching branches** (limit to maintainers)

## Rationale

These rules ensure that:
1. **No code reaches main without passing every trustworthy hosted check** - each gate surfaces a distinct failure mode
2. **Each gate is independently retryable** - infrastructure flakes in one job do not force re-running the full suite (FR-018)
3. **No direct pushes to main** - all changes go through reviewed PRs
4. **No stale approvals** - new code requires fresh review
5. **Admins follow the same rules** - no bypassing for anyone

## Current CI Scope

Feature `003-platform-hygiene-remediation` originally documented 11 jobs, including standalone `packages/app` and `packages/ui` typecheck jobs. Those package-level entrypoints are not yet a credible standalone TypeScript boundary in the current repo. Until shared packages have real package-local compile targets, branch protection should follow the 9 hosted checks that are both implemented and trustworthy.

## Setup Steps

1. Go to **Settings -> Branches -> Add branch protection rule**
2. Branch name pattern: `main`
3. Enable all settings listed above under "Required settings"
4. Under "Status checks that are required", search for and select all 9 checks from the table above:
   - `Lint`
   - `Type Check (Next)`
   - `Guard: Architecture`
   - `Guard: Hygiene`
   - `Guard: Agent Docs`
   - `Test: Service Layer`
   - `Test: Unit`
   - `E2E: Accessibility`
   - `Build`
5. Click **Create**

## Notes

- Status check names must exactly match the `name` field in each job in `.github/workflows/ci.yml`
- If you rename jobs in the workflow file, update this document AND the GitHub branch protection rules accordingly
- New quality gates added in future features MUST be added to both places in the same pull request
- Historical note: before feature `003-platform-hygiene-remediation`, CI was bundled into 5 jobs (`Guard Checks`, `TypeScript`, `API Tests`, `E2E Tests`, `Build`). The current workflow is a 9-job split that preserves discrete hosted checks without advertising unsupported standalone package typecheck jobs.
