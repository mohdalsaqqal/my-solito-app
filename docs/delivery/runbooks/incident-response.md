# Incident Response Runbook

Purpose: give operators a repeatable path for production incidents.

## Severity

| Severity | Examples | Response |
|---|---|---|
| P0 | Storefront down, checkout unavailable, payment writes failing | Immediate response, client notified |
| P1 | Search down, admin cannot publish, order status updates failing | Same business day or faster |
| P2 | Non-critical CMS issue, delayed notification, degraded provider | Planned fix |

## First 10 Minutes

1. Confirm incident through `/api/health`, uptime monitor, Sentry/logs, and customer/admin report.
2. Identify affected environment: staging or production.
3. Check latest deployment, EAS update, database migration, provider credential change.
4. Stop active rollout if one is running.
5. Open incident notes with timeline, owner, and current customer impact.

## Triage Commands

```bash
curl https://client.example.com/api/health
vercel logs <deployment-url>
vercel inspect <deployment-url>
```

For local reproduction:

```bash
yarn verify:delivery:quality
FUNCTIONAL_BASE_URL=https://client.example.com yarn verify:functional-storefront
```

## Rollback

Web:

```bash
vercel rollback
```

Mobile OTA:

```bash
npx eas-cli@latest update:republish --channel production
```

Database:

- Do not roll back schema blindly.
- Restore to a new database if data corruption is suspected.
- Follow `backup-recovery.md` for PITR.

## Communication

For P0/P1:

- notify client contact with impact and next update time
- update every 30 minutes until resolved
- send post-incident summary within 1 business day

## Done Means

- `/api/health` is healthy or expected degraded state is documented.
- Customer-facing smoke passes.
- Root cause and prevention action are recorded.
- Follow-up ticket exists for any deferred fix.
