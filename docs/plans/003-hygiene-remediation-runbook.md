# 003 Hygiene Remediation — Completion Runbook

**Feature**: `003-platform-hygiene-remediation`
**Created**: 2026-04-11

---

## Memory Override Root Causes

### 1. Root `package.json` — `NODE_OPTIONS=--max-old-space-size=8192` (dev server)

**Location**: Root `package.json` `scripts.web` command
**Value**: `cd apps/next && NODE_OPTIONS=--max-old-space-size=8192 yarn dev:stable`
**Root cause**: Next.js 16 dev server memory pressure during development with large component tree, turbo build graph, and Uniwind token bridge. The dev server accumulates module graphs without releasing them under Windows.
**Removal criteria**:
1. Migrate off `dev:stable` to a leaner dev profile, OR
2. Upgrade to a Next.js version that resolves the dev-server memory leak, AND
3. Verify dev server runs cleanly under default Node.js heap (1.4 GB) for 30+ minutes of active HMR on a typical dev laptop.

### 2. `apps/next/package.json` — `NODE_OPTIONS=--max-old-space-size=4096` (test:api)

**Location**: `apps/next/package.json` `scripts.test:api` command
**Value**: `node --max-old-space-size=4096 ...tsx --test ...`
**Root cause**: `tsx --test` heap pressure during service-layer test run. The tsx transpiler holds the entire module graph in memory when glob-discovering many test files.
**Removal criteria**:
1. Migrate tests off `tsx --test` to a lower-overhead runner (e.g., Vitest, or Node native ESM with `.ts` support), AND
2. Verify full service-layer test suite runs under default Node.js heap without OOM.

---

## Workspace Exclusions

### `!apps/strapi` in root `package.json` `workspaces`

**Reason**: `apps/strapi` is a separate Strapi CMS instance with its own `package.json`, `yarn.lock`, and dependency tree. It is NOT part of the Solito monorepo build graph. Including it in root workspaces would cause dependency resolution conflicts and break the Yarn 4 workspace install. It is managed independently and excluded via `"!apps/strapi"`.

---

## Source of Truth

This runbook is the canonical reference for all operational overrides and workspace exclusions introduced or inherited by this project. Any new `--max-old-space-size` or workspace exclusion MUST be documented here before merge.
