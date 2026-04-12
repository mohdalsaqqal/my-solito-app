# Tasks: Audit Remediation Plan

**Input**: Design documents from `/specs/002-audit-remediation/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`

**Tests**: This feature explicitly includes verification repair, so test and guard tasks are required.

**Organization**: Tasks are grouped by user story so each remediation slice can be implemented and verified independently.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish shared security and verification primitives used by all remediation work.

- [X] T001 Create shared security policy constants and environment guards in `apps/next/app/api/_lib/security-policy.ts`
- [X] T002 [P] Add shared request-validation test helpers in `apps/next/app/api/_lib/security-test-helpers.ts`
- [X] T003 [P] Add root-safe validation notes and remediation verification steps to `specs/002-audit-remediation/quickstart.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before user-story work can be trusted.

**CRITICAL**: No user story work should be considered complete until these tasks are done.

- [X] T004 Refactor session cookie issuance and clearing policy in `apps/next/app/api/_lib/auth-session.ts`
- [X] T005 [P] Align proxy-side session parsing and redirect behavior with the hardened policy in `apps/next/proxy.ts`
- [X] T006 Create trusted-request validation helpers and exemption rules in `apps/next/app/api/_lib/request-auth.ts`
- [X] T007 [P] Make provider readiness tiers and fallback behavior explicit in `packages/providers/registry.ts`

**Checkpoint**: Shared security and readiness primitives are in place.

---

## Phase 3: User Story 1 - Secure Authenticated Operations (Priority: P1) MVP

**Goal**: Harden customer and admin mutation routes so protected actions fail closed without breaking approved flows.

**Independent Test**: Sign in, execute allowed customer and admin mutations, then replay representative protected requests with invalid sessions or untrusted request context and confirm they are rejected before state changes occur.

### Tests for User Story 1

- [X] T008 [P] [US1] Add auth-session coverage for secret requirements and cookie attributes in `apps/next/app/api/_lib/auth-session.test.ts`
- [X] T009 [P] [US1] Add request-validation coverage for trusted and untrusted mutation contexts in `apps/next/app/api/_lib/request-auth.test.ts`
- [X] T010 [P] [US1] Extend hardened auth route coverage in `apps/next/app/api/auth/route.test.ts`

### Implementation for User Story 1

- [X] T011 [US1] Update `apps/next/app/api/auth/login/route.ts`, `apps/next/app/api/auth/register/route.ts`, and `apps/next/app/api/auth/logout/route.ts` to use the hardened session cookie policy
- [X] T012 [US1] Apply trusted-request validation to customer mutation routes in `apps/next/app/api/account/addresses/route.ts`, `apps/next/app/api/account/addresses/[id]/route.ts`, `apps/next/app/api/account/addresses/[id]/set-default/route.ts`, `apps/next/app/api/referral/apply/route.ts`, and `apps/next/app/api/orders/place/route.ts`
- [X] T013 [US1] Apply trusted-request validation to admin CMS mutation routes in `apps/next/app/api/admin/cms/banners/route.ts`, `apps/next/app/api/admin/cms/brand-spotlights/route.ts`, `apps/next/app/api/admin/cms/brand-spotlights/[id]/route.ts`, `apps/next/app/api/admin/cms/menus/route.ts`, `apps/next/app/api/admin/cms/menus/[id]/route.ts`, `apps/next/app/api/admin/cms/offer-banners/route.ts`, `apps/next/app/api/admin/cms/offer-banners/[id]/route.ts`, `apps/next/app/api/admin/cms/site-config/route.ts`, `apps/next/app/api/admin/cms/toggles/route.ts`, `apps/next/app/api/admin/cms/toggles/[id]/route.ts`, and `apps/next/app/api/admin/cms/ugc/route.ts`
- [X] T014 [US1] Apply trusted-request validation to admin release-management mutation routes in `apps/next/app/api/admin/release-blocks/route.ts`, `apps/next/app/api/admin/release-blocks/[id]/route.ts`, `apps/next/app/api/admin/releases/route.ts`, `apps/next/app/api/admin/releases/[id]/route.ts`, and `apps/next/app/api/admin/releases/[id]/publish/route.ts`
- [X] T015 [US1] Preserve explicit machine-route exemptions while adopting trusted-request validation in `apps/next/app/api/payments/networks/webhook/route.ts`

**Checkpoint**: Protected customer and admin mutations enforce hardened session and request-validation rules without breaking intended flows.

---

## Phase 4: User Story 2 - Reliable Verification and Release Gating (Priority: P2)

**Goal**: Restore trust in repository verification by eliminating harness defects and outdated assertions.

**Independent Test**: Run the documented root verification commands multiple times and confirm they fail only for real regressions, not path assumptions or unsupported test APIs.

### Tests for User Story 2

- [X] T016 [P] [US2] Repair path-stable CMS home route expectations in `apps/next/app/api/cms/home/route.test.ts`
- [X] T017 [P] [US2] Repair quote-expiration fixture behavior in `apps/next/app/api/orders/place/route.test.ts`
- [X] T018 [P] [US2] Update accessibility assertions and skip-link coverage in `e2e/accessibility.spec.ts`

### Implementation for User Story 2

- [X] T019 [US2] Fix the shared UI guard violation in `packages/ui/components/chrome/StorefrontStatusPanel.tsx`
- [X] T020 [US2] Normalize root-relative assertion paths in `apps/next/app/api/admin/product-queries/route.test.ts`, `apps/next/app/api/cms/home/route.shape.test.ts`, `apps/next/app/api/search/route.shape.test.ts`, and `apps/next/app/api/provider-readiness.test.ts`
- [X] T021 [US2] Normalize root-safe temp and data directory assumptions in `apps/next/app/api/checkout/quote/route.test.ts`, `apps/next/app/api/account/referral/route.test.ts`, `apps/next/app/api/referral/validate/route.test.ts`, `apps/next/app/api/admin/layout-versioning.test.ts`, `apps/next/app/api/admin/page-block-editor.test.ts`, `apps/next/app/api/admin/release-persistence.test.ts`, `apps/next/app/api/admin/referral/settings/route.test.ts`, and `apps/next/app/api/admin/referral/profiles/route.test.ts`
- [X] T022 [US2] Ensure the root verification workflow remains documented and executable through `package.json`, `playwright.config.ts`, and `specs/002-audit-remediation/quickstart.md`

**Checkpoint**: The root verification flow is stable and failures now reflect actual regressions.

---

## Phase 5: User Story 3 - Production Readiness and Contract Alignment (Priority: P3)

**Goal**: Align upload behavior, provider readiness, and shared guardrails with the documented production contract.

**Independent Test**: Validate that disallowed admin uploads are rejected, provider readiness is explicit, and repository guardrails reflect the intended production contract without ad hoc exceptions.

### Tests for User Story 3

- [X] T023 [P] [US3] Add upload-policy coverage for branding and CMS upload routes in `apps/next/app/api/admin/cms/site-config/logo-upload/route.test.ts`, `apps/next/app/api/admin/cms/offer-banners/upload/route.test.ts`, and `apps/next/app/api/admin/cms/blocks/upload/route.test.ts`
- [X] T024 [P] [US3] Add provider-readiness coverage for registry selection behavior in `packages/providers/registry.test.ts`
- [X] T025 [P] [US3] Extend webhook signature and exemption coverage in `packages/adapters/payment-networks/__tests__/networks-security.test.ts`

### Implementation for User Story 3

- [X] T026 [US3] Remove unsafe same-origin asset support from `apps/next/app/api/admin/cms/site-config/logo-upload/route.ts`
- [X] T027 [US3] Align admin upload validation and error behavior in `apps/next/app/api/admin/cms/offer-banners/upload/route.ts` and `apps/next/app/api/admin/cms/blocks/upload/route.ts`
- [X] T028 [US3] Harden webhook signature handling in `packages/adapters/payment-networks/client.ts` and `packages/adapters/payment-networks/webhook-handler.ts`
- [X] T029 [US3] Finalize provider readiness behavior and release-facing documentation in `packages/providers/registry.ts`, `.env.example`, and `docs/adapter-integration-guide.md`

**Checkpoint**: Upload and provider behavior match the documented release-ready contract.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validate the whole remediation slice and sync project memory and documentation.

- [X] T030 [P] Run the full remediation verification set from repository root and capture outcomes in `specs/002-audit-remediation/quickstart.md`
- [X] T031 Update repo memory files `SESSION-STATE.md`, `RECENT_CONTEXT.md`, and `MEMORY.md` with the remediation decisions and verification status
- [X] T032 Review `AGENTS.md` for any permanent rule changes required by the finalized remediation contract

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1**: Can start immediately
- **Phase 2**: Depends on Phase 1 and blocks all user stories
- **Phase 3**: Depends on Phase 2
- **Phase 4**: Depends on Phase 2 and can proceed in parallel with Phase 5 once shared helpers are in place
- **Phase 5**: Depends on Phase 2 and can proceed in parallel with Phase 4 if staffing allows
- **Phase 6**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1**: Depends only on the foundational hardening helpers
- **US2**: Depends on the foundational helpers and is independently testable once the brittle harness assumptions are repaired
- **US3**: Depends on foundational readiness rules and is independently testable once upload and provider contracts are implemented

### Within Each User Story

- Tests should fail before implementation changes are considered complete
- Shared helpers before route adoption
- Route hardening before end-to-end verification
- Contract-alignment changes before documentation and memory sync

### Parallel Opportunities

- T002 and T003 can run in parallel
- T005 and T007 can run in parallel after T004 starts
- T008, T009, and T010 can run in parallel
- T016, T017, and T018 can run in parallel
- T023, T024, and T025 can run in parallel

---

## Parallel Example: User Story 1

```bash
# Parallel test preparation for US1
Task: "Add auth-session coverage in apps/next/app/api/_lib/auth-session.test.ts"
Task: "Add request-validation coverage in apps/next/app/api/_lib/request-auth.test.ts"
Task: "Extend auth route coverage in apps/next/app/api/auth/route.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2
2. Complete User Story 1
3. Run the root verification baseline for the hardened auth and mutation scope
4. Validate customer and admin protected flows before moving on

### Incremental Delivery

1. Land the foundational session and request-validation primitives
2. Harden protected mutation routes
3. Stabilize verification and release gating
4. Finish provider and upload readiness alignment
5. Close with full verification and memory sync

### Parallel Team Strategy

1. One engineer owns shared security primitives and route adoption
2. One engineer owns verification and test-harness repair
3. One engineer owns provider and upload readiness alignment
4. Merge into a final cross-cutting verification pass

---

## Notes

- Tasks marked `[P]` are parallelizable because they touch different files or isolated test suites.
- Shared route hardening should prefer centralized helpers over per-route custom logic.
- Any newly discovered permanent repo rule change should be reflected back into `AGENTS.md` during the final phase.
