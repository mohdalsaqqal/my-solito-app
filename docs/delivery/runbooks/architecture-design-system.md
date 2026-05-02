# Architecture & Design System Delivery Gate

Use this runbook for Aspect 02 work and for every feature that changes architecture, shared UI, navigation, CMS layout data, provider contracts, or shared screens.

## Purpose

Keep delivery work aligned with `AGENTS.md` while making the verification path explicit. This runbook does not create new architecture rules; `AGENTS.md` remains the sole source of truth.

## Scope

- Canonical data flow: UI -> Next.js server layer -> services -> provider registry -> adapters.
- Shared UI flow: shared consumers -> `packages/ui/components` -> `packages/ui/reusables`.
- Shared screens under `packages/app/screens`.
- Provider contracts under `packages/providers/contracts`.
- External integrations under `packages/adapters`.
- CMS layout-as-data flow through service-normalized blocks.
- Solito navigation across Next.js and Expo.

## Feature Gate Checklist

Before implementation:

- [ ] Read `AGENTS.md`, `checklist.md`, `docs/delivery/DELIVERY_MATRIX.md`, `docs/delivery/BLOCKERS.md`, and the relevant aspect file.
- [ ] Select the smallest bounded context graph before opening raw files.
- [ ] Define the ticket with one narrow outcome and exact verification commands.
- [ ] Confirm whether the change touches web-only, native-only, shared screen, shared UI, provider, adapter, or server-service layers.

During implementation:

- [ ] Keep data access in the Next.js server layer.
- [ ] Keep route handlers and server actions thin; delegate business logic to services.
- [ ] Import providers from services, not adapters.
- [ ] Do not import adapters, `process.env`, `className`, or web-only routing APIs from shared packages.
- [ ] Use tokens for shared UI values.
- [ ] Use `useBreakpoint()` or approved platform wrappers for responsive/shared behavior.
- [ ] Keep CMS-controlled content as data; do not let CMS define arbitrary layout code.
- [ ] Keep Solito navigation URL-first, with App Router hooks only in client components.

Before marking done:

- [ ] The changed layer still follows the canonical flow.
- [ ] The shared UI contract remains RNR-centered.
- [ ] No customer-facing path depends on mock CMS data as the canonical source.
- [ ] Any blocker has a reproducible entry in `docs/delivery/BLOCKERS.md`.
- [ ] `checklist.md`, the relevant aspect file, and memory files are updated when status changed.

## Required Verification

Current required gate:

```bash
yarn verify:delivery
```

Layer-specific gates:

```bash
node scripts/guard-checks.mjs
node --max-old-space-size=4096 node_modules/typescript/bin/tsc -p apps/next/tsconfig.json --noEmit --incremental false
yarn verify:expo-functional
```

Use the Next typecheck for Next/server/shared changes. Use the Expo functional smoke for mobile shell, native config, push, deep-link, or shared-screen delivery changes.

## Known Partial Gate

Broad Expo TypeScript promotion remains blocked by `BLK-001`. Until that blocker is cleared, Aspect 02 stays partial even when the architecture runbook and current delivery gate pass.

## Done Means

- `yarn verify:delivery` passes.
- Layer-specific verification passes, or the failure is recorded as a blocker.
- The aspect tracker reflects the true status.
- Memory and checklist updates are in sync.
