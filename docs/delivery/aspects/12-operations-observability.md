# 12 Operations & Observability

Status: `[~]`

## Goal

Deliver Sentry/error tracking, performance monitoring, uptime monitoring, centralized logs, alerts, health checks, and incident runbooks.

## Current State

- [~] Service-level error handling exists.
- [~] Rate limiting exists and can use Prisma-backed storage.
- [x] Health endpoint exists at `GET /api/health`.
- [x] Health service reports runtime, provider readiness, search health, and notification status.
- [x] Uptime monitor runbook exists in `docs/delivery/runbooks/uptime-monitoring.md`.
- [x] Incident response runbook exists in `docs/delivery/runbooks/incident-response.md`.
- [x] Operations/observability smoke exists through `yarn verify:operations-observability`.
- [ ] Sentry integration not confirmed.
- [ ] Centralized logging/alerting vendor not implemented.
- [x] Provider health dashboard/status page implemented (2026-05-01): `/admin/operations/health` shows overall status + runtime/providers/search/notifications component cards.

## Tasks

- [ ] Add Sentry to Next and Expo.
- [x] Add health check endpoints/status page foundation.
- [x] Add uptime monitor runbook.
- [x] Add incident and rollback runbook.
- [x] Add operations/observability verification gate.

## Verification

```bash
yarn verify:operations-observability
node scripts/verify-delivery.mjs --profile operations
```

Credential-gated:

- Sentry smoke event in staging.
- External uptime check reports healthy.

## Blockers

- Observability vendor choices and credentials block Sentry, centralized logging, alert delivery, and hosted uptime checks.
