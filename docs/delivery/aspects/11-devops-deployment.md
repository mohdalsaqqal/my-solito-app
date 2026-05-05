# 11 DevOps & Deployment

Status: `[~]`

## Goal

Deliver CI/CD, Vercel deployment, EAS build/submit/update, environments, secrets, backups, staging, and rollback.

## Current State

- [x] GitHub Actions workflow exists.
- [x] Vercel/Next scripts exist.
- [x] Vercel Preview deployed on 2026-05-05 with Neon Prisma admin/auth/CMS database.
- [x] `eas.json` exists.
- [x] EAS runbook exists.
- [~] Infisical/Doppler integration not implemented.
- [x] `new-client.ts` provisioning implemented.
- [ ] Backups/PITR not documented complete.

## Tasks

- [ ] Run EAS preview build after client Expo project setup.
- [x] Implement `new-client.ts`.
- [ ] Document backup/PITR operations.
- [x] Add staging deployment process.
- [x] Resolve `BLK-003` â€” committed 2277 staged deletions, hygiene passes clean.

## Verification

```bash
yarn verify:delivery
yarn verify:delivery --profile deploy
```

Preview deployment verification:
- `yarn verify:devops-deployment`
- `yarn verify:delivery --profile deploy`
- `vercel inspect dpl_DSDncbFqbRiapFazQEwaxopHJuGV`
- `vercel curl /api/health --deployment https://my-solito-gzefksc8i-moes-projects-cfd9e85f.vercel.app`

2026-05-05 continuation:
- `vercel inspect` confirms `dpl_DSDncbFqbRiapFazQEwaxopHJuGV` is `Ready` and `preview`.
- Plain public requests are currently blocked by Vercel Deployment Protection before reaching Next.js.
- Protected CLI access reaches app routes; direct CLI auth POST can be rejected by trusted-request checks as `AUTH_UNTRUSTED_REQUEST`, so final admin login should be browser-verified after Vercel access is available.
- `node scripts/verify-devops-deployment.mjs`, Next typecheck, and `yarn verify:delivery --profile deploy` pass locally.

## Blockers

- ~~`BLK-003`~~ Resolved.
- Client Expo/store credentials.
- Vercel project-level Preview env persistence remains branch-gated until a non-production branch exists in the connected Git repository; current Preview used deployment-scoped env vars.

