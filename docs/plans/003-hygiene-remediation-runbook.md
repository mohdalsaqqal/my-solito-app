# 003 Hygiene Remediation Runbook

## Purpose

This runbook documents intentional hygiene exceptions that are still present while the monorepo cleanup and production hardening work continues.

## Memory Overrides

`apps/next/package.json` uses `NODE_OPTIONS=--max-old-space-size=8192` for Next dev/build commands.

Reason:
- Next 16 with Cache Components, React Native Web, generated commerce data, and large App Router route coverage can exceed default Node memory during local and CI build workflows.
- The override is a stability measure for the current app size, not a permanent architecture preference.

Exit criteria:
- Revisit after provider/search/CMS cleanup reduces build graph size.
- Remove or lower the override once `yarn workspace next-app build` and `yarn web` stay stable without it across local Windows and CI Linux.

## Workspace Exclusions

Root `package.json` excludes `apps/strapi` from Yarn workspaces.

Reason:
- `apps/strapi` is not part of the active platform architecture.
- `AGENTS.md` defines Prisma/Postgres in `apps/next` as the canonical mutable CMS store.
- Keeping `apps/strapi` outside workspaces prevents stale/dead scaffold dependencies from affecting install, CI, and framework pin checks.

Exit criteria:
- Delete the stale scaffold from tracked source, or reintroduce it only after `AGENTS.md` explicitly changes the CMS architecture.

## Local Worktrees

Local `.worktrees/` directories are excluded from hygiene package scanning.

Reason:
- They are alternate checkout snapshots, not source within the current worktree.
- Scanning nested worktrees double-counts stale package manifests and produces false framework-pin failures for deleted or inactive scaffolds.

Operator action:
- Keep `.worktrees/` out of release commits.
- Run hygiene from the target worktree itself when validating a separate branch.
