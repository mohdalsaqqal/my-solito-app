# Uptime Monitoring Runbook

Purpose: define the minimum uptime monitor setup for each client storefront.

## Health Endpoint

Use:

```text
GET /api/health
```

Expected response:

- `200` when runtime is reachable and no component is unhealthy.
- `503` when a release-critical provider or component is unhealthy.
- `success: true`
- `data.status`: `healthy`, `degraded`, or `unhealthy`
- `data.components`: runtime, providers, search, notifications

`degraded` is allowed for local/mock-backed staging, but must be reviewed before production.

## External Monitor

Create one uptime check per client environment:

| Environment | URL | Frequency | Alert |
|---|---|---|---|
| staging | `https://client-staging.example.com/api/health` | 5 minutes | Slack/email to platform ops |
| production | `https://client.example.com/api/health` | 1 minute | Pager/phone for P0/P1 |

Monitor must fail on:

- non-2xx/3xx response
- timeout greater than 10 seconds
- TLS certificate expiry under 14 days
- body missing `"success":true`
- body `data.status` equals `unhealthy`

## Suggested Vendors

- Better Uptime
- Checkly
- Pingdom
- Datadog Synthetics
- Grafana Cloud Synthetic Monitoring

Vendor choice is deployment-specific. Store monitor URLs and alert channels in the client handoff notes.

## Alert Routing

| Status | Meaning | Action |
|---|---|---|
| `healthy` | App and monitored providers ready | No action |
| `degraded` | App reachable, non-critical provider issue or mock-backed provider | Investigate during business hours unless checkout/search affected |
| `unhealthy` | Runtime or release-critical dependency failure | Treat as incident, follow incident runbook |

## Verification

Before go-live:

```bash
FUNCTIONAL_BASE_URL=https://client-staging.example.com yarn verify:functional-storefront
curl https://client-staging.example.com/api/health
```

Record:

- monitor URL
- vendor dashboard link
- alert recipients
- last successful check timestamp
