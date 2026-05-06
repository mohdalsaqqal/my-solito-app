# Operator Handbook Index

One-stop index for operators: store managers, support staff, DevOps, and client admins.

## Store Manager (CMS + Content)

| Runbook | Covers |
|---|---|
| `cms-store-manager.md` | Homepage block editing, release lifecycle, reorder, preview, publish, rollback, scheduling, media library |
| `odoo-connection.md` | Odoo product/category/brand mapping, production switch checklist, troubleshooting |

## Support & Operations

| Runbook | Covers |
|---|---|
| `sla-support.md` | Severity levels, response targets, escalation paths |
| `client-onboarding.md` | Phase-by-phase onboarding: sales handoff → provisioning → adapter config → content migration → go-live |
| `client-agreement-checklist.md` | Commercial/legal frame: parties, platform ownership, data isolation, integrations, SLAs, acceptance |

## DevOps & Infrastructure

| Runbook | Covers |
|---|---|
| `architecture-design-system.md` | Architecture overview, design system, provider/contract/adapter pattern |
| `environment-data-source-matrix.md` | Local dev, local production build, Vercel Preview, and Vercel Production data-source rules |
| `backup-recovery.md` | Backup scope, schedule, PITR, disaster recovery, provider-specific notes, retention policy |
| `uptime-monitoring.md` | `/api/health`, external monitors, alert routing, verification |
| `incident-response.md` | Severity, triage, rollback, communication, post-incident closeout |
| `security-compliance.md` | Validation, auth, headers, scans, secret handling, penetration-test scope |
| `platform-operations.md` | Tenant provisioning, tenant config, patch strategy, support triage, offboarding |
| `launch-post-launch.md` | Beta launch, migration, go-live checklist, support channels, feedback loop |
| `component-catalog.md` | Shared UI/component map, CMS renderer pattern, Storybook status |
| `source-code-buyout.md` | Source code buyout option terms and deliverables |

## Integration Adapters

| Runbook | Covers |
|---|---|
| `odoo-connection.md` | Odoo ERP: REST API contract, data mapping, verification (static → health → full → functional), order write-back |
| `custom-payment-gateway.md` | Custom payment: API contract, webhook format, HMAC verification, sandbox test cards, adapter customization |
| `shopify-adapter-scope.md` | Shopify merchant backend: scope, contract mapping, verification smoke |
| `custom-postgresql-adapter-mapping.md` | Custom PostgreSQL backend: schema mapping, read/write contract, SSL, verification |
| `meilisearch-adapter.md` | Meilisearch search provider: index config, API key, tenant isolation, verification |

## Retention & Consultation

| Runbook | Covers |
|---|---|
| `referral-loyalty-pharmacist-tests.md` | Referral/loyalty/pharmacist acceptance criteria and verification |
| `retention-consultation-persistence.md` | Production persistence for referral, loyalty, and pharmacist consultation records |

## Core Delivery Docs

| Document | Covers |
|---|---|
| `../CLIENT_HANDOFF_PACK.md` | Full env vars, Odoo mapping, payment gateway contract, non-UI blockers, referral/loyalty/pharmacist acceptance |
| `../PRODUCTION_BLOCKERS.md` | 15 non-UI production blockers with detection and resolution |
| `../DELIVERY_MATRIX.md` | Gate profiles, aspect ownership, verification commands |
| `../BLOCKERS.md` | Current delivery blockers |

## Quick Reference

### Verification Commands

```bash
yarn verify:functional-storefront    # Web storefront end-to-end (24 checks)
yarn verify:cms-lifecycle            # CMS release/block/publish/rollback (14 checks)
yarn verify:retention-consultation   # Referral, loyalty, pharmacist tests
yarn verify:pharmacist-browser       # Web pharmacist browser-click smoke
yarn verify:expo-functional          # Expo static app/config/router/push/EAS checks
yarn verify:operations-observability # Health endpoint, uptime/incident runbooks
yarn verify:security-compliance      # Headers, auth security, scans, penetration-test readiness
yarn verify:platform-operations      # Tenant provisioning/config/operator runbooks
yarn verify:documentation-knowledge  # Developer docs, operator index, component catalog
yarn verify:launch-post-launch       # Beta/migration/go-live/support/feedback docs
yarn verify:delivery                 # All delivery gates
yarn --cwd apps/next test:api        # Full API suite (217 tests)
```

### Common Operations

| Operation | Command / Doc |
|---|---|
| Edit homepage hero | `/admin/marketing/cms/blocks` → select release → edit hero block → save → preview → publish |
| Publish new release | `cms-store-manager.md` — verified lifecycle steps 1-9 |
| Rollback release | API route: `POST /api/admin/cms/releases/:id/rollback` (verified by cms-lifecycle) |
| Check production blockers | `docs/delivery/PRODUCTION_BLOCKERS.md` |
| Onboard new client | `client-onboarding.md` — phases 1-6 |
| Provision client config | `platform-operations.md` — tenant provisioning and config format |
| Prepare launch | `launch-post-launch.md` — beta, migration, go-live, support, feedback |
| Connect Odoo | `odoo-connection.md` — production switch checklist |
| Connect payment gateway | `custom-payment-gateway.md` — production verification checklist |
