# 02 Architecture & Design System

Status: `[x]`

## Goal

Keep the platform aligned to `AGENTS.md`: canonical data flow, shared UI contract, tokens, Solito navigation, and Prisma CMS persistence.

## Current State

- [x] `AGENTS.md` is the source of truth.
- [x] Canonical flow is UI -> Next server -> services -> provider registry -> adapters.
- [x] Shared UI contract is RNR-centered with token enforcement.
- [x] Solito and Expo guidance are installed as skills.
- [x] Architecture/design-system delivery gate is documented in `docs/delivery/runbooks/architecture-design-system.md`.
- [x] Shared package type hygiene now includes a passing Expo typecheck gate.

## Tasks

- [x] Keep `guard:checks` as the architecture gate.
- [x] Document the per-feature architecture/design-system delivery gate.
- [x] Promote Expo typecheck after `BLK-001` is cleared.
- [x] Refresh graphify after substantial architecture changes; no graph refresh was required for this documentation-only slice.

## Verification

```bash
yarn verify:delivery
node --max-old-space-size=4096 node_modules/typescript/bin/tsc -p apps/next/tsconfig.json --noEmit --incremental false
```

## Blockers

- None for this aspect's local gates.
