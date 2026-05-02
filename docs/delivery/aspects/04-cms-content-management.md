# 04 CMS & Content Management

Status: `[x]`

## Goal

Provide Prisma-backed CMS pages, blocks, zones, global settings, media, releases, preview, schedule, publish, and rollback workflows.

## Current State

- [x] Prisma CMS foundation exists.
- [x] CMS services exist under `apps/next/server/services/cms`.
- [x] Home block renderer dispatch pattern exists.
- [x] Admin CMS UI exists.
- [x] Release edit, reorder, publish, rollback, and scheduled draft creation are covered by `yarn verify:cms-lifecycle`.
- [x] Media-library limitations are documented for first client delivery.
- [x] CMS user guide/runbook exists at `docs/delivery/runbooks/cms-store-manager.md`.

## Tasks

- [x] Store-manager script: edit hero, reorder block, preview/published response, publish.
- [x] Verify rollback and scheduling with current admin/API workflow.
- [x] Complete or document media-library limitations.
- [x] Add CMS user guide.

## Verification

```bash
node --max-old-space-size=4096 node_modules/typescript/bin/tsc -p apps/next/tsconfig.json --noEmit --incremental false
yarn verify:cms-lifecycle
```

Add focused CMS tests per changed service.

## Blockers

- None named yet.
