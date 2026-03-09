# Commerce Functional Blueprint (MVP)
Date: 2026-02-22
Status: Approved design baseline for implementation
Owner: Product + Engineering

## 1. Scope and Goals
This blueprint defines the minimum end-to-end functionality to validate the project before advanced UI polish.

System goals:
- Stable core commerce on web + Expo.
- Role-based extensions (pharmacist/admin) isolated from core.
- CMS/config controls mutable business rules.
- Provider/adapter architecture remains swappable.

Mandatory architecture:
`UI -> apiClient -> BFF -> provider registry -> adapters`

## 2. Customer Journey (Locked)
### 2.1 Discovery and shopping
1. User lands on home page.
2. Delayed promotional/email popup may appear (timing/content configured later).
3. User can navigate to Shop, Search, Product Detail.
4. User adds products to cart.

### 2.2 Checkout and confirmation
- Checkout requires authentication (login/signup/social login).
- Signup minimal fields:
  - name
  - email
  - password
- Social login options:
  - Google
  - Apple
- After auth, user checks out directly.
- Address and phone are collected in checkout form.

Checkout required fields:
- fullName
- city
- area
- building
- phone

Optional fields:
- floor
- apartment
- notes

Order completion:
- Place order -> confirmation/thank-you surface.

### 2.3 Fulfillment options
User selects one:
- Delivery
- Branch pickup

Branch pickup:
- Show branches with available inventory.
- User selects branch.
- If selected branch goes out of stock, system auto-suggests nearest branch with stock.

### 2.4 Payment options (core supports all)
Available methods are CMS-configurable enable/disable flags:
- Cash on Delivery
- Card on Delivery (POS machine)
- Online Card (via payment provider adapter)

Branch pickup payment:
- Pay at branch
- Pay now (online card)

### 2.5 Coupon and loyalty redemption
- Redemption happens in checkout, not loyalty tab.
- User can choose ONE discount source per order:
  - Loyalty redemption OR coupon code
- No stacking in MVP.

Loyalty redemption UX:
- Presets: 25%, 50%, 100% of redeemable points.
- For each preset, show:
  - points consumed
  - JOD discount value
  - updated order total preview

All loyalty calculation rules are CMS/config-driven:
- points-to-currency conversion
- max redemption cap per order
- min cart threshold
- category exclusions

### 2.6 Account area
Account must include:
- Profile info
- Address book (add/edit delivery addresses)
- Orders list + order detail + status
- Tests history (physical branch tests)
- Loyalty tab:
  - current tier/level
  - current points
  - redeemable money value

Tests history item includes:
- test date
- result summary
- recommended products
- action to add recommended product to cart
- reorder if previously purchased
- associated QR code reference for pharmacist flow

## 3. Pharmacist Journey (Locked)
Access:
- Web-only pharmacist login
- Pharmacist opens dedicated dashboard

Dashboard baseline:
- test records list with:
  - customer name
  - test date
  - result summary
  - recommended products

QR flow:
1. Pharmacist scans customer QR.
2. System opens customer profile context:
  - identity summary
  - test history
  - prior recommendations
  - which recommended products were purchased
  - purchase frequency for recommended items

New test flow:
1. Fill mock test form (schema can evolve).
2. Live product search by name/category.
3. Attach recommendations.
4. Show summary review step.
5. Submit and publish instantly to customer profile.

Pharmacist permissions:
- No direct loyalty points editing.
- Test permissions are CMS toggles:
  - canCreateTest
  - canEditTest
  - canDeleteTest
  - canRecommendProducts

## 4. Admin Journey (Locked)
RBAC model:
- master-admin (full access)
- content-admin
- ops-admin
- loyalty-admin
- pharmacist-audit-admin (can merge with ops if needed)

Priority surfaces:
1. Campaigns + CMS content control (highest)
2. Orders/operations dashboard
3. Loyalty rules and tiers management
4. Pharmacist activity/audit panel

Admin user management approach:
- MVP: users/roles are seeded via backend/CMS config.
- Phase 2: admin UI for invite/assign/revoke.

## 5. Loyalty Rules (Locked)
- Points increase from purchases.
- Pharmacist has no manual loyalty control.
- Optional campaign rule in CMS:
  - `bonusPointsOnRecommendedPurchase`
  - multiplier/value/cap/time-window
- Max redemption cap per order is CMS-controlled.

## 6. Audit and Compliance (Locked)
Audit logs required from day 1 for:
- Admin actions
- Pharmacist actions

Minimum log record:
- actorId
- actorRole
- actionType
- targetType
- targetId
- before/after snapshot (when applicable)
- timestamp
- requestId/ip/device (when available)

Retention policy (MVP):
- 12 months

## 7. CMS/Config Flags (MVP Minimum)
### 7.1 Checkout and payment
- paymentMethods.cod.enabled
- paymentMethods.cardOnDelivery.enabled
- paymentMethods.onlineCard.enabled
- fulfillment.delivery.enabled
- fulfillment.branchPickup.enabled

### 7.2 Loyalty
- loyalty.redemption.enabled
- loyalty.redemption.maxOrderCoveragePercent
- loyalty.redemption.conversionRate
- loyalty.redemption.minCartAmount
- loyalty.redemption.excludedCategories
- loyalty.campaigns.bonusPointsOnRecommendedPurchase.enabled
- loyalty.campaigns.bonusPointsOnRecommendedPurchase.multiplier

### 7.3 Pharmacist permissions
- pharmacist.permissions.canCreateTest
- pharmacist.permissions.canEditTest
- pharmacist.permissions.canDeleteTest
- pharmacist.permissions.canRecommendProducts

### 7.4 Governance
- audit.retentionDays

## 8. Provider/Adapter Contract Additions (MVP)
To preserve swappable architecture, add/confirm contracts for:
- PaymentProvider:
  - listAvailableMethods(context)
  - createOnlinePaymentIntent(order)
  - confirmOnlinePayment(intent)
- Inventory/Branch Provider:
  - listBranchesWithStock(cart)
  - suggestNearestBranchWithStock(branchId, cart)
- LoyaltyProvider:
  - getBalance(userId)
  - previewRedemption(userId, order, percent)
  - applyRedemption(userId, order, percent)
  - calculateEarnedPoints(order, context)
- PharmacistProvider:
  - listTests(filters)
  - getCustomerTestProfile(customerId)
  - createTest(payload)
  - searchRecommendableProducts(query)
- AuditProvider:
  - append(record)
  - query(filters)

All provider calls must pass through registry and BFF routes.

## 9. MVP Acceptance Checklist (Functional)
### 9.1 Core commerce
- User can complete: Home -> Shop -> PDP -> Cart -> Checkout -> Place Order -> Confirmation.
- Search submit opens first-class results surface on web and Expo.
- Orders list/detail visible in account.

### 9.2 Auth
- Login/register/logout/session work on web + Expo.
- Protected routes enforce auth.

### 9.3 Checkout
- Delivery and branch pickup both work.
- Branch stock fallback suggestion works.
- Payment methods can be toggled from CMS/config.

### 9.4 Discounts
- Loyalty redemption works with 25/50/100 presets.
- Coupon works.
- Stacking blocked (single discount source rule).

### 9.5 Pharmacist
- QR customer lookup works.
- Test create flow works with summary step.
- Recommendation publication updates customer profile.

### 9.6 Admin and governance
- Role-based panel visibility works.
- Audit logs capture required actions/fields.
- 12-month retention policy configured.

## 10. Implementation Sequence (Recommended)
1. Finish core checkout data contracts (payment + fulfillment + branch stock).
2. Implement CMS/config toggles for payment/loyalty/pharmacist permissions.
3. Implement loyalty preview/apply pipeline and coupon exclusivity guard.
4. Implement pharmacist test flow + QR profile context + recommendation linkage.
5. Implement admin RBAC surface visibility + audit query panel.
6. Execute full acceptance checklist on web + Expo in LTR and RTL.

## 11. Deferred (Phase 2)
- Admin self-service user/role management UI.
- Advanced pharmacist test schema and analytics.
- Expanded loyalty campaign builder UX.
- Additional payment adapters and failover routing.
