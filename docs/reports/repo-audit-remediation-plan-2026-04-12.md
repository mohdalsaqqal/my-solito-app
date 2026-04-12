# Remediation Plan

Date: 2026-04-12  
Source audit: [repo-audit-2026-04-12.md](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/docs/reports/repo-audit-2026-04-12.md)

## Goal

Turn the repository from “well-structured and locally credible” into “operationally dependable and professionally hardened.”

## Priority Framework

- `P0`: blocks reliable release confidence
- `P1`: high-value hardening before broad production use
- `P2`: meaningful product-quality improvements
- `P3`: polish and long-tail maintainability

## Phase 1: Restore CI Trust

### `P0` Fix typecheck job drift
Problem:
- CI references `packages/app/tsconfig.json` and `packages/ui/tsconfig.json`, but those files do not exist.

Actions:
1. decide the intended typecheck model
2. either add real package-level tsconfig files or update CI to use the actual compiling entrypoints
3. re-validate all 11 jobs against the live repo structure
4. update branch-protection docs only after CI is confirmed correct

Success criteria:
- hosted CI is green without false failures
- local verification and hosted verification are aligned

Deliverables:
- `.github/workflows/ci.yml`
- `docs/BRANCH_PROTECTION.md`
- optional package-level tsconfig files if that is the chosen fix

## Phase 2: Production Security Hardening

### `P1` Replace in-memory rate limiting
Problem:
- current limiter is per-process and not durable across instances

Actions:
1. move auth and mutation rate limits to a shared backing store
2. define explicit keying strategy for anonymous, authenticated, and machine clients
3. preserve current response headers and error contract
4. add tests for distributed rate-limit behavior assumptions

Success criteria:
- consistent limits across horizontally scaled instances
- no `unknown` shared-bucket abuse problem

### `P1` Improve session architecture
Problem:
- signed cookie payload is readable and includes more identity/session data than necessary

Actions:
1. decide between opaque server-side sessions and encrypted stateless cookies
2. minimize payload if stateless format is retained
3. centralize cookie parsing logic for both API and proxy usage
4. add rotation and invalidation strategy documentation

Success criteria:
- reduced exposure of user/session metadata
- single canonical auth parsing implementation

## Phase 3: Boundary Hardening

### `P1` Reduce HTTP coupling inside services
Problem:
- some services still construct or depend on `Request` objects and request headers

Actions:
1. identify request-derived inputs currently needed by services
2. introduce typed context objects for locale, preview, auth, and store identity
3. keep route/request adaptation in edge-layer helpers
4. migrate service entrypoints incrementally

Success criteria:
- services are easier to test in isolation
- lower transport coupling
- clearer boundary between App Router edge code and domain orchestration

## Phase 4: Shared UI Product Hardening

### `P1` Finish i18n for shared interactive UI
Problem:
- shared commerce UI still contains English strings and TODO i18n markers

Actions:
1. audit all customer-facing shared components for hardcoded copy
2. move labels, statuses, CTA text, and empty states to translation resources
3. verify Arabic rendering and accessible labels
4. add guard coverage for hardcoded user-facing strings in shared UI

Success criteria:
- no hardcoded customer-facing English in shared shopping flows
- consistent Arabic support in overlays, modals, cart, checkout, and quick views

### `P2` Clarify shared styling contract
Problem:
- the repo uses both tokenized inline styles and `className`/CVA reusables

Actions:
1. document the intended split between `components` and `reusables`
2. add examples of correct usage
3. expand lint/guard rules where possible

Success criteria:
- lower onboarding confusion
- fewer style-boundary regressions

## Phase 5: Accessibility Upgrade

### `P1` Move from smoke coverage to real accessibility assurance
Problem:
- current Playwright a11y checks are useful but shallow

Actions:
1. add automated `axe-core` or equivalent checks
2. cover dialogs, forms, auth, checkout, admin, and search flows
3. add contrast-focused checks where feasible
4. add regression checks for focus traps and keyboard escape flows

Success criteria:
- accessibility coverage includes both structural and behavioral checks
- modal and form flows are explicitly protected by tests

## Phase 6: QA Deepening

### `P2` Strengthen critical-flow test coverage
Actions:
1. identify top revenue and trust flows:
   - login
   - cart mutation
   - quote generation
   - place order
   - order lookup
2. add end-to-end path coverage for those flows
3. add admin critical-path coverage for content publishing and operational actions

Success criteria:
- critical user paths are covered by tests that resemble real usage

### `P2` Add responsive verification
Actions:
1. add mobile and tablet viewport checks in Playwright
2. validate touch target behavior and overflow
3. add screenshot-based regression checks for key storefront pages

Success criteria:
- responsive regressions are caught before release

## Suggested Sequencing

### Sprint 1
- CI fix
- branch protection alignment

### Sprint 2
- shared rate limiting
- session design hardening

### Sprint 3
- service-boundary cleanup
- shared UI i18n completion

### Sprint 4
- accessibility automation expansion
- responsive and critical-path E2E coverage

## Success Definition

The remediation program is complete when:
- hosted CI reflects the real repo and is trusted
- rate limiting and session handling are production-grade
- shared UI is fully localized for supported locales
- accessibility checks go beyond smoke tests
- critical user and admin flows are covered end-to-end

## Practical Recommendation

Do not treat this as one giant refactor. Execute it as four short, disciplined hardening tracks:

1. delivery reliability
2. security hardening
3. shared UI/i18n/a11y hardening
4. QA expansion

That approach preserves momentum and reduces regression risk.
