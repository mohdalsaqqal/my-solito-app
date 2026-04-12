# Quickstart: Audit Remediation Validation

**How to validate this feature after implementation**

## Prerequisites

- Repository checked out on branch `002-audit-remediation`
- Dependencies installed from the repository root
- Required environment variables set for any release-ready auth or provider paths in scope

## 1. Validate Session Hardening

1. Sign in through the supported auth flow.
2. Confirm the issued session behaves as expected for a normal customer flow.
3. Attempt a protected request with a missing or tampered session.
4. Confirm the request is rejected before protected data or mutations are exposed.

## 2. Validate Protected Mutation Controls

1. Execute an allowed authenticated mutation from the intended storefront or admin origin.
2. Confirm the request succeeds.
3. Replay the same request without trusted request context.
4. Confirm the request is rejected with the documented failure behavior.
5. Confirm exempt machine routes, such as verified payment webhooks, still work through their dedicated validation.

## 3. Validate Upload Policy

1. Upload an allowed admin image file within the size limit.
2. Confirm the file is accepted and returned metadata is usable by the admin UI.
3. Attempt an upload using a now-disallowed asset type.
4. Confirm the upload is rejected and nothing is persisted.

## 4. Validate Provider Readiness Behavior

1. Review the active provider configuration for the remediated domains.
2. Confirm release-ready paths no longer rely on silent development-only fallback.
3. Confirm any remaining mock-only domains are clearly identified as non-production-ready.

## 5. Run Repository Verification

Run from the repository root:

```bash
yarn verify:audit-remediation
```

Expanded equivalent (for isolated reruns):

```bash
yarn guard:checks
yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false
yarn --cwd apps/next test:api
yarn e2e:a11y
```

### Root Invocation Notes

- Always run verification commands from repo root; avoid invoking tests from nested package working directories when the test asserts repository-relative files.
- For local Playwright runs, ensure the web app is reachable at `http://localhost:3000` before executing the accessibility suite.

### Current Verification Snapshot (2026-04-09)

- `yarn verify:audit-remediation`: script executes from root but timed out in this environment while running `guard:checks`
- `yarn guard:checks`: timed out in this environment before completion
- `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false`: failed on pre-existing `packages/ui` type errors (`Button.tsx`, `CheckoutStepper.tsx`, `HeroSlideCard.tsx`)
- `yarn --cwd apps/next test:api`: pass (25/25)
- `yarn e2e:a11y`: pass (6/6)
- `yarn --cwd apps/next tsx --test --test-concurrency=1 app/api/checkout/quote/route.test.ts app/api/account/referral/route.test.ts app/api/referral/validate/route.test.ts app/api/admin/layout-versioning.test.ts app/api/admin/page-block-editor.test.ts app/api/admin/release-persistence.test.ts app/api/admin/referral/settings/route.test.ts app/api/admin/referral/profiles/route.test.ts`: pass (22/22)

## Expected Result

- Protected customer and admin mutations succeed only in trusted contexts.
- Invalid or untrusted request contexts fail closed.
- Disallowed upload types are rejected consistently.
- Provider readiness behavior is explicit and reviewable.
- Required repository verification passes from the repository root without path-sensitive false failures.
