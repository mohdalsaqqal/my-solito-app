# User and Account Management Runbook

This runbook defines the current account-management contract for customer identity, account surfaces, referral, loyalty, hair/skin tests, tenant memberships, and optional OAuth.

## Architecture

```
Web / mobile account UI
-> Next.js server services
-> Better Auth session boundary
-> app-owned role and tenant membership model
-> AccountProvider / ReferralProvider / OrderProvider
```

Customers use web and mobile account surfaces. Pharmacist access is web-only and remains behind pharmacist/admin roles.

## Current Account Scope

- Better Auth owns identity and sessions.
- App roles are app-owned, not inferred from the client.
- Account page data is resolved by `apps/next/server/services/account/account-page.service.ts`.
- Account test detail is resolved by `apps/next/server/services/account/account-test-detail.service.ts`.
- Referral, loyalty, order history, QR, wishlist, and hair/skin tests are provider-backed.
- Customer-visible hair/skin test details include questionnaire answers and recommended products.

## Tenant Membership Model

The current production delivery model is one tenant per deployment, but the database now includes a shared-ready membership shape:

- `Tenant`
- `TenantUser`

Rules:

- `TenantUser` is unique by `tenantId + userId`.
- Tenant membership role uses the same `AppAuthRole` enum as the app role boundary.
- `TenantUser.status` supports active/suspended/offboarded style flows without deleting history.
- Existing `AppAuthRoleMapping` remains a compatibility role source during isolated deployment.
- When shared infrastructure starts, role resolution should prefer active `TenantUser` for the resolved tenant and fall back closed to `customer` when membership is missing in release-like environments.

## Account Flow Acceptance

Before client handoff, the account flow must prove:

- logged-out account requests return an empty account state, not protected data.
- logged-in customer account requests return overview, orders, loyalty wallet/history, referral summary, QR, and test history.
- account test detail returns the requested customer's test only.
- test detail includes hair/skin template identity, questionnaire answers, metrics, pharmacist summary, and recommended products.
- customer mobile reads account/test results only; pharmacist workflows stay web-only.

## OAuth Setup

OAuth is optional until the first client chooses providers.

Supported setup direction:

- Keep email/password enabled.
- Add Better Auth social provider configuration only after the client provides provider choice and credentials.
- Store OAuth client IDs/secrets in the deployment secret manager.
- Do not expose provider secrets to shared packages or mobile bundles.

Recommended environment placeholders:

- `BETTER_AUTH_GOOGLE_CLIENT_ID`
- `BETTER_AUTH_GOOGLE_CLIENT_SECRET`
- `BETTER_AUTH_APPLE_CLIENT_ID`
- `BETTER_AUTH_APPLE_CLIENT_SECRET`

When OAuth is enabled, add focused auth tests for callback/session normalization and verify that app-owned roles/tenant membership still control authorization.

## Verification

```bash
yarn verify:account-management
node scripts/guard-checks.mjs
```

The account-management verifier checks:

- Better Auth session tests.
- Account page/test-detail focused tests.
- Address service tests.
- Retention/consultation tests for referral, loyalty, hair/skin, and pharmacist flow.
- Prisma schema and migration contain the tenant membership model.
