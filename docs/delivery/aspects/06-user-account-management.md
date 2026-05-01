# 06 User & Account Management

Status: `[x]`

## Goal

Deliver Better Auth-backed identity, sessions, OAuth direction, role/permission checks, account profile, and order history.
This aspect also owns customer referral, loyalty, and hair/skin test account surfaces.

## Current State

- [x] Better Auth foundation exists.
- [x] App-owned RBAC exists with dynamic per-user domain permissions (2026-04-30: super admin creates users with custom section access — catalog/marketing/sales/inventory/ops/customers. Toggle per domain: None/Read/Full. Custom permissions override role-based matrix. Live Docker PostgreSQL.)
- [x] Account/order screens exist.
- [x] Account page loads referral summary, loyalty wallet/history, and test history through server/provider boundaries.
- [x] Focused referral/loyalty/pharmacist account verification exists through `yarn verify:retention-consultation`.
- [x] Hair/skin tests expose explicit consultation template identity in account and pharmacist contracts.
- [x] Client-specific questionnaire fields/content are defined for hair and skin templates.
- [x] Tenant-aware user membership database model exists (`Tenant`, `TenantUser`) with migration.
- [x] OAuth setup direction is documented; provider activation remains client-choice dependent.

## Tasks

- [x] Verify account flows on web and static native account surfaces.
- [x] Verify referral summary, referral code copy/apply path, loyalty wallet/history, and test detail from account.
- [x] Model hair test and skin test templates explicitly before client handoff.
- [x] Define client-specific questionnaire fields/content for hair and skin templates.
- [x] Complete tenant-aware user membership model when tenant persistence work starts.
- [x] Add OAuth provider setup direction; provider activation is external/client-dependent.

## Verification

```bash
node --max-old-space-size=4096 node_modules/typescript/bin/tsc -p apps/next/tsconfig.json --noEmit --incremental false
yarn verify:account-management
yarn verify:retention-consultation
node scripts/verify-delivery.mjs --profile account
```

Run focused auth/account tests for changes.

## Blockers

- OAuth provider activation is client-dependent; setup direction and env placeholders are documented.
- Native device/simulator account smoke remains tracked under Aspect 03.
