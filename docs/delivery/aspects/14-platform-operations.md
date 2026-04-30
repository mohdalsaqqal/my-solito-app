# 14 Platform Operations

Status: `[ ]`

## Goal

Deliver tenant provisioning, adapter/gateway configuration, patch strategy, support triage, and client offboarding.

## Current State

- [~] Tenant-readiness architecture rules exist.
- [x] `new-client.ts` implemented.
- [ ] Centralized tenant config UI not implemented.
- [ ] Cross-client update/patch strategy not complete.
- [ ] Offboarding/source-code buyout runbook not complete.

## Tasks

- [x] Implement idempotent `new-client.ts`.
- [ ] Create tenant config file format.
- [ ] Create support triage runbook.
- [ ] Create offboarding handoff checklist.

## Verification

```bash
npx tsx scripts/new-client.ts --slug test --dry-run
npx tsx scripts/new-client.ts --slug test
```

- Provisioning dry-run command.
- Generated client config passes validation.

## Blockers

- Deployment provider/client account decisions.
