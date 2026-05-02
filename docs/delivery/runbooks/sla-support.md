# SLA And Support Expectations

Purpose: define support tiers, severity levels, response targets, and escalation rules for client operations.

## Support Channels

- Primary: shared support inbox or ticketing workspace.
- Emergency: dedicated phone/WhatsApp/Slack channel if included in the client plan.
- Operational updates: incident notes and resolution summaries.

## Severity Levels

| Severity | Definition | Examples | Initial Response Target | Update Frequency |
|---|---|---|---|---|
| Sev 1 | Storefront or checkout is unusable for most customers | Web down, checkout down, payment capture broken | 2 business hours, or contract-specific emergency window | Every 60 minutes during active incident |
| Sev 2 | Major workflow degraded but workaround exists | Search degraded, admin publish blocked, mobile crash in one flow | 1 business day | Daily |
| Sev 3 | Minor defect or content/admin issue | Styling issue, non-critical CMS bug, report mismatch | 2 business days | As milestone changes |
| Sev 4 | Request, enhancement, or advisory | New CMS block, new adapter field, training question | Planned into backlog | On planning cadence |

## Uptime Target

- Target storefront uptime: 99.5% unless the signed agreement defines another target.
- Exclusions: third-party provider outage, payment gateway outage, merchant backend outage, client DNS changes, scheduled maintenance, app store review delay.

## Incident Flow

1. Acknowledge issue and assign severity.
2. Check monitoring, logs, recent deploys, payment provider, backend adapter, and DNS.
3. Mitigate first, then root-cause.
4. Communicate status at the agreed frequency.
5. Record incident notes and follow-up tasks.
6. Add recurring prevention work to the relevant delivery aspect.

## Maintenance Windows

- Planned maintenance should be announced in advance.
- Emergency security fixes may be deployed without standard notice.
- Mobile native changes require store/EAS build timelines; JavaScript-only hotfixes may use EAS Update when safe.

## Client Responsibilities

- Keep backend, payment, store, and app store credentials active.
- Notify the platform operator before DNS/backend/payment changes.
- Provide timely approval for app store submissions and production changes.
- Maintain accurate business contacts for incident escalation.

## Platform Responsibilities

- Maintain the shared framework and deployment process.
- Monitor configured storefront surfaces.
- Apply security patches and dependency updates according to the update strategy.
- Communicate known third-party outages when they affect client operations.
