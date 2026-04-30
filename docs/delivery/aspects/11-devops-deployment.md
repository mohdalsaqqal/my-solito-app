# 11 DevOps & Deployment

Status: `[~]`

## Goal

Deliver CI/CD, Vercel deployment, EAS build/submit/update, environments, secrets, backups, staging, and rollback.

## Current State

- [x] GitHub Actions workflow exists.
- [x] Vercel/Next scripts exist.
- [x] `eas.json` exists.
- [x] EAS runbook exists.
- [~] Infisical/Doppler integration not implemented.
- [x] `new-client.ts` provisioning implemented.
- [ ] Backups/PITR not documented complete.

## Tasks

- [ ] Run EAS preview build after client Expo project setup.
- [x] Implement `new-client.ts`.
- [ ] Document backup/PITR operations.
- [ ] Add staging deployment process.
- [x] Resolve `BLK-003` — committed 2277 staged deletions, hygiene passes clean.

## Verification

```bash
yarn verify:delivery
```

Add deploy-specific commands once credentials exist.

## Blockers

- ~~`BLK-003`~~ Resolved.
- Client Expo/Vercel/store credentials.
