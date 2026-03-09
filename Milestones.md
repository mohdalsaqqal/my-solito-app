# Milestones — Functional MVP to UI Polish

Last updated: 2026-02-22
Source of truth: `docs/plans/2026-02-22-commerce-functional-blueprint-design.md`

## 0) Delivery Rules (Must Hold)
- Architecture chain remains: `UI -> apiClient -> BFF -> provider registry -> adapters`.
- CMS/config controls mutable business logic (payments, loyalty rules, pharmacist permissions).
- Core commerce never imports adapters directly.
- Web + Expo parity required for customer-critical flows.
- Every touched UI block must preserve required states (`loading`, `empty`, `error`, `disabled`, `out-of-stock` when relevant).

---

## Phase A — Core Transaction Reliability (Current Priority)
Goal: customer can place real end-to-end orders with all required branches of checkout logic.

### A1. Auth-gated checkout (web + expo)
- [ ] Enforce sign-in before checkout entry.
- [ ] Keep minimal signup (`name`, `email`, `password`) + social placeholders (`Google`, `Apple`).
- [ ] Preserve post-login return-to-checkout behavior.

Done when:
- Unauthenticated user is redirected to auth from checkout/cart entry points.
- Authenticated user returns to original intended step.

### A2. Checkout form completeness
- [ ] Required fields: `fullName`, `city`, `area`, `building`, `phone`.
- [ ] Optional fields: `floor`, `apartment`, `notes`.
- [ ] Save entered address to account address book path.

Done when:
- Form validates correctly and persists in order payload.
- Address is reusable in account after order.

### A3. Fulfillment modes
- [ ] Delivery option.
- [ ] Branch pickup option.
- [ ] Branch list filtered to branches with stock.
- [ ] Auto-suggest nearest stocked branch if selected branch inventory becomes unavailable.

Done when:
- Both fulfillment paths can complete checkout.
- Stock fallback suggestion works without flow break.

### A4. Payment mode framework (CMS-controlled)
- [ ] Support methods in core:
  - [ ] COD
  - [ ] Card on Delivery (POS)
  - [ ] Online Card
- [ ] Branch pickup payment branch:
  - [ ] Pay at branch
  - [ ] Pay now (online card)
- [ ] Method availability flags read from CMS/config.

Done when:
- Methods can be enabled/disabled without code change.
- Disabled methods do not appear in checkout UI.

Dependencies:
- Requires provider contract additions from Phase C (`PaymentProvider`, branch/inventory provider).

---

## Phase B — Discount and Loyalty Execution
Goal: loyalty and coupon behavior works predictably with conversion-safe rules.

### B1. Discount exclusivity rule
- [ ] Enforce one discount source per order (`loyalty` OR `coupon`).
- [ ] Confirm/switch UX if user changes selected discount source.

Done when:
- Stacking is blocked at BFF validation and reflected in UI.

### B2. Loyalty redemption in checkout
- [ ] Presets: `25%`, `50%`, `100%` of redeemable points.
- [ ] Show preview per preset:
  - points consumed
  - JOD discount
  - updated total
- [ ] Respect CMS rule set:
  - conversion rate
  - max order coverage
  - min cart
  - exclusions

Done when:
- Preview and final applied values match.
- Rule changes via CMS alter behavior without redeploy.

### B3. Bonus points from pharmacist recommendations
- [ ] CMS flag: `bonusPointsOnRecommendedPurchase`.
- [ ] Apply campaign multipliers/caps/time windows when enabled.

Done when:
- Purchases of pharmacist-recommended products earn bonus points only when campaign is active.

---

## Phase C — Provider Contracts and Adapter Readiness
Goal: stabilize extension points before real ERP/payment integration.

### C1. Add/confirm contracts
- [ ] `PaymentProvider`
  - `listAvailableMethods(context)`
  - `createOnlinePaymentIntent(order)`
  - `confirmOnlinePayment(intent)`
- [ ] `Inventory/Branch Provider`
  - `listBranchesWithStock(cart)`
  - `suggestNearestBranchWithStock(branchId, cart)`
- [ ] `LoyaltyProvider`
  - `getBalance(userId)`
  - `previewRedemption(userId, order, percent)`
  - `applyRedemption(userId, order, percent)`
  - `calculateEarnedPoints(order, context)`
- [ ] `PharmacistProvider`
  - `listTests(filters)`
  - `getCustomerTestProfile(customerId)`
  - `createTest(payload)`
  - `searchRecommendableProducts(query)`
- [ ] `AuditProvider`
  - `append(record)`
  - `query(filters)`

### C2. Registry + mock adapter implementation
- [ ] Wire contracts through provider registry.
- [ ] Add mock adapter implementations for all new contracts.
- [ ] Ensure BFF routes consume providers only.

Done when:
- No core/UI changes needed to swap mock to real adapters.

---

## Phase D — Pharmacist Module MVP
Goal: pharmacist workflow works end-to-end with summary safety step.

### D1. Dashboard and QR flow
- [ ] Pharmacist dashboard list:
  - customer name
  - test date
  - result summary
  - recommendations
- [ ] QR lookup opens customer profile context:
  - identity
  - test history
  - recommendation history
  - purchased recommended items and frequency

### D2. New test flow
- [ ] Mock test form schema.
- [ ] Live product search by name/category.
- [ ] Recommendation attachment.
- [ ] Summary review step before submit.
- [ ] Instant publish to customer profile after submit.

### D3. CMS-driven permissions
- [ ] `canCreateTest`
- [ ] `canEditTest`
- [ ] `canDeleteTest`
- [ ] `canRecommendProducts`

Done when:
- Permission toggles affect UI and API behavior.
- No pharmacist loyalty editing paths exist.

---

## Phase E — Admin RBAC and Operations
Goal: role-scoped administration with priority on campaign/CMS control.

### E1. RBAC model
- [ ] Roles:
  - `master-admin`
  - `content-admin`
  - `ops-admin`
  - `loyalty-admin`
  - `pharmacist-audit-admin`
- [ ] Route/API guards enforce role scope.

### E2. Admin surfaces
- [ ] Priority panel: Campaign + CMS content.
- [ ] Orders/operations dashboard.
- [ ] Loyalty rules/tier controls.
- [ ] Pharmacist activity/audit panel.

### E3. Admin user lifecycle (MVP strategy)
- [ ] Seed users/roles via backend/CMS (no full IAM UI in MVP).

Done when:
- Scoped admin cannot access panels outside role scope.
- `master-admin` can access all panels.

---

## Phase F — Audit, Governance, Security
Goal: traceability and policy safety from day 1.

### F1. Audit logs day-1 coverage
- [ ] Log admin actions.
- [ ] Log pharmacist actions.
- [ ] Record fields:
  - actorId, actorRole
  - actionType
  - targetType, targetId
  - before/after snapshot where relevant
  - timestamp
  - requestId/ip/device when available

### F2. Retention policy
- [ ] 12-month retention policy active (`audit.retentionDays`).

### F3. Security hardening
- [ ] Role checks on protected API routes.
- [ ] Session/auth boundaries verified.

Done when:
- Audit records are queryable and complete for critical actions.

---

## Phase G — Acceptance and Release Gate
Goal: verify all MVP functionality before intensive UI refinement.

### G1. Functional test matrix (web + expo)
- [ ] Core path: `Home -> Shop -> PDP -> Cart -> Checkout -> Place Order -> Confirmation`.
- [ ] Search submit opens first-class results surface and drills to PDP.
- [ ] Orders list/detail visible in account.
- [ ] Delivery + pickup paths complete successfully.
- [ ] Payment methods toggle correctly from CMS/config.
- [ ] Coupon/loyalty exclusivity enforced.
- [ ] Pharmacist test + recommendation flow works with summary step.
- [ ] Admin role scoping + panel access verified.
- [ ] Audit records generated for targeted actions.

### G2. Quality gate
- [ ] `yarn guard:checks` passes.
- [ ] LTR/RTL pass for affected screens.
- [ ] Mobile touch behavior verified on device.

Done when:
- All G1 and G2 checks pass with no blocker defects.

---

## Phase H — UI Enhancement (After MVP Functional Pass)
Goal: visual and interaction refinement after functional closure.

### H1. Premium UX polish
- [ ] Spacing rhythm consistency.
- [ ] Motion consistency.
- [ ] Header/search/cart visual parity.
- [ ] Final typography and contrast pass.

### H2. Performance and UX quality
- [ ] Image loading/lazy strategy audit.
- [ ] CLS/LCP checks on web.
- [ ] Expo interaction smoothness checks.

Done when:
- UI is polished without regressing validated functionality.

---

## Immediate Next Executable Work (Start Here)
1. Phase A2 + A3: checkout data model + fulfillment branch.
2. Phase C1 + C2: provider contracts + mocks for payment/branch/loyalty/audit/pharmacist.
3. Phase B1 + B2: loyalty/coupon exclusivity + redemption presets.
4. Phase D1 + D2: pharmacist QR + test summary submit flow.
5. Phase F1: audit append on admin/pharmacist critical actions.
