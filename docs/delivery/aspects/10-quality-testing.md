# 10 Quality & Testing

Status: `[~]`

## Goal

Make quality gates explicit and promote them from advisory to required once current blockers are cleared.

## Current State

- [x] Guard checks pass.
- [x] Next typecheck passes.
- [x] Web functional smoke passes.
- [x] Web functional smoke verifies explicit hair/skin test template identity.
- [x] Expo static smoke passes.
- [x] Focused referral/loyalty/account-test/pharmacist suite passes through `yarn verify:retention-consultation`.
- [x] Full API suite passes: 225/225. BLK-002 resolved.
- [x] Expo typecheck passes. BLK-001 resolved.
- [x] Retention/consultation gate is promoted into the current required profile.
- [x] Quality profile exists for client-reviewable milestones.
- [x] Quality profile passes locally through `yarn verify:delivery:quality`.
- [ ] Maestro and Lighthouse CI not implemented.

## Tasks

- [x] Clear `BLK-001` — resolved 2026-04-29.
- [x] Clear `BLK-002` — resolved 2026-04-29.
- [x] Promote retention/consultation gate to current required profile if these flows become client-critical for v1 launch.
- [ ] Add Lighthouse CI.
- [ ] Add Maestro smoke after manual native script is repeatable.
- [x] Promote clean advisory gates to a local quality profile.
- [x] Harden CMS lifecycle smoke so it starts an isolated Next runtime and avoids Windows Prisma client file-lock churn.
- [ ] Promote quality profile to hosted CI after runtime budget is confirmed.

## Verification

```bash
yarn verify:delivery
yarn verify:delivery:quality
yarn verify:delivery:full
```

## Blockers

- ~~`BLK-001`~~ Resolved.
- ~~`BLK-002`~~ Resolved.
- Lighthouse CI and Maestro remain planned hardening work, not current local blockers.
- 2026-04-30: no local blocker after `yarn verify:delivery:quality`; hosted CI promotion remains a runtime-budget decision.
