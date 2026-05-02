# Platform Operations Runbook

Purpose: operate clients as isolated deployments today while keeping the tenant model ready for future shared infrastructure.

## Tenant Provisioning

Use the idempotent provisioning command:

```bash
npx tsx scripts/new-client.ts --slug client-slug --name "Client Name" --domains "store.example.com,www.store.example.com"
```

Expected outputs:

- `clients/<slug>/.env`
- `clients/<slug>/client.json`

The command must be safe to rerun. Without `--force`, an existing client exits without changing files. With `--dry-run`, it prints the planned files and writes nothing.

## Tenant Config Format

`client.json` is the operator-owned config record for an isolated client deployment.

Required fields:

- `slug`: URL-safe tenant/client identifier.
- `name`: human-readable client name.
- `domains`: production domains.
- `secrets`: secret keys by name, with values stored outside git.
- `adapters.catalog`: catalog provider choice.
- `adapters.orderWriteBack`: order write-back provider choice.
- `adapters.payment`: payment provider choice.
- `adapters.search`: search provider choice.
- `adapters.notification`: notification provider choice.
- `provisioningChecklist`: deployment and handoff tasks.

Do not store real secret values in `client.json`.

## Adapter And Gateway Configuration

Configure providers in the generated `.env`, then run the relevant smoke:

```bash
node scripts/smoke-odoo-connection.mjs
yarn verify:payments-checkout
yarn verify:search-discovery
yarn verify:notifications
```

Real Odoo and custom payment gateway activation remains blocked until the client provides endpoints, credentials, sandbox behavior, and webhook signing details.

## Cross-Client Patch Strategy

All clients stay on the same codebase. For each framework/security patch:

1. Create a normal delivery branch.
2. Run the focused aspect gate and `yarn verify:delivery:quality`.
3. Deploy to one staging client first.
4. Monitor `/api/health`, Sentry, checkout, search, and notifications.
5. Roll out to remaining clients in priority order.
6. Record exceptions in the relevant aspect file and `docs/delivery/BLOCKERS.md`.

Native changes must account for EAS build/review timelines. JavaScript-only mobile fixes may use EAS Update when safe.

## Support Triage

Use `sla-support.md` for severity and response targets.

Operator triage checklist:

1. Confirm the affected client slug, domain, market, and platform.
2. Check `/api/health`.
3. Check latest deployment and environment changes.
4. Check provider readiness: catalog, order, payment, search, notification.
5. Reproduce with the smallest relevant verifier.
6. Record incident notes in `incident-response.md` format.
7. Add follow-up work to the relevant aspect file.

## Client Offboarding

Use `source-code-buyout.md` when source handoff is included.

Minimum offboarding checklist:

- Freeze scope and handoff date.
- Export client config and environment inventory.
- Export database/content according to the agreement.
- Remove unrelated clients, local artifacts, and private operator notes.
- Run `yarn verify:delivery:functional` on the handoff snapshot.
- Transfer secrets through an approved secure channel.
- Revoke platform-owned credentials after confirmation.

## Verification

```bash
yarn verify:platform-operations
node scripts/verify-delivery.mjs --profile platform
```
