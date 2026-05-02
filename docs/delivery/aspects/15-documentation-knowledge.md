# 15 Documentation & Knowledge

Status: `[~]`

## Goal

Deliver developer onboarding, API docs, component docs, CMS user guide, operator handbook, and handoff docs.

## Current State

- [x] `AGENTS.md`, architecture index, graphify, memory, and skills exist.
- [x] Production blueprint and SaaS migration docs exist.
- [x] EAS runbook exists.
- [x] Operator handbook index exists.
- [x] CMS user guide — `docs/delivery/runbooks/cms-store-manager.md` (admin surface, block editing, lifecycle, media library, rollback/scheduling).
- [x] Odoo mapping/handoff — `docs/delivery/runbooks/odoo-connection.md` + `docs/delivery/CLIENT_HANDOFF_PACK.md`.
- [x] Payment gateway vendor handoff — `docs/delivery/runbooks/custom-payment-gateway.md` (API contract, webhook, sandbox cards, adapter customization).
- [x] Client handoff pack — `docs/delivery/CLIENT_HANDOFF_PACK.md` (env vars, Odoo, payment, blockers, referral/loyalty/pharmacist).
- [x] Production blockers — `docs/delivery/PRODUCTION_BLOCKERS.md` (15 blockers across 5 categories).
- [x] Component catalog exists in `docs/delivery/runbooks/component-catalog.md`.
- [x] Documentation/knowledge smoke exists through `yarn verify:documentation-knowledge`.
- [ ] Full Storybook not implemented.

## Tasks

- [x] Add CMS user guide.
- [x] Add operator handbook index.
- [x] Add Odoo mapping/handoff docs.
- [x] Add payment gateway vendor handoff docs.
- [x] Add component catalog docs.
- [x] Add documentation/knowledge verification gate.

## Verification

```bash
yarn verify:documentation-knowledge
node scripts/verify-delivery.mjs --profile docs
```

- 2026-05-01 local result: `node scripts/verify-delivery.mjs --profile docs` passed.

## Blockers

- Client-specific integration details.
- Full Storybook remains a future UI workstream item.
