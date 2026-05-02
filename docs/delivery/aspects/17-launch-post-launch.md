# 17 Launch & Post-Launch

Status: `[~]`

## Goal

Prepare beta launch, migration, go-live, SLA/support, and feedback loop.

## Current State

- [~] Beta client program is planned; first client details are not confirmed.
- [x] Content/product/order/customer migration checklist exists.
- [x] Go-live checklist exists.
- [x] SLA/support channel checklist exists.
- [x] Feedback loop is documented.
- [x] Launch/post-launch smoke exists through `yarn verify:launch-post-launch`.

## Tasks

- [x] Create beta-client plan.
- [x] Create migration checklist.
- [x] Create go-live checklist for DNS, SSL, payment keys, app review, push certificates.
- [x] Define SLA and support channels.
- [x] Define feedback review cadence.
- [x] Add launch/post-launch verification gate.

## Verification

```bash
yarn verify:launch-post-launch
node scripts/verify-delivery.mjs --profile launch
```

- 2026-05-01 local result: `node scripts/verify-delivery.mjs --profile launch` passed.

## Blockers

- First beta client details block actual beta launch.
- Production domains, payment live keys, app store accounts, push certificates, and client support contacts are external launch inputs.
