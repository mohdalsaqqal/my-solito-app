# Referral, Loyalty, And Pharmacist Tests Delivery Gate

Use this runbook for the retention and assisted-consultation slice: referrals, loyalty wallet/redemption, customer hair/skin tests, and pharmacist console flows.

## Current Scope

- Referral program settings, influencer/customer profiles, validation, apply/attribution, and account referral summary.
- Loyalty wallet, tier progress, barcode, redemption options, loyalty history, and order redemption/earn calculation.
- Customer test history and test detail with recommended products.
- Pharmacist account/console for customer search, QR resolve, product search, consultation draft, and consultation submit.

## Acceptance Criteria

Referral:

- [ ] Store managers can configure referral program settings.
- [ ] Store managers can create/update referral profiles and regenerate codes.
- [ ] Customers can view their referral summary from account.
- [ ] Customers can validate/apply an eligible referral code.
- [ ] Checkout quote includes the follower discount preview.
- [ ] Order placement records pending referral attribution.
- [ ] Production persistence and tenant scoping are defined before release.

Loyalty:

- [ ] Customers can view loyalty tier, points, redeemable value, expiry, barcode, and history.
- [ ] Checkout shows available redemption options from the account provider.
- [ ] Order placement applies selected redemption and updates wallet/history through the account provider.
- [ ] Loyalty earning/spending rules are sourced from CMS/service configuration, not shared UI.
- [ ] Production persistence, expiry jobs, rollback, and fraud controls are defined before release.

Hair/Skin Tests And Pharmacist:

- [ ] Customers can view hair/skin test history from account.
- [ ] Customers can open a test detail page with pharmacist summary, metrics, and recommended products.
- [ ] Customers can add recommended in-stock products to cart.
- [ ] Pharmacist/admin users can search customers and resolve QR codes.
- [ ] Pharmacist/admin users can create a consultation draft and submit a completed consultation.
- [x] Web/API operator smoke verifies pharmacist search, QR resolve, product search, hair consultation draft, submit, and updated customer history.
- [x] Web browser-click smoke verifies customer search, open customer, create hair test, product recommendation, review, submit, and updated customer history.
- [x] Hair test and skin test templates are explicitly modeled, not only generic test titles, before client handoff.
- [ ] Production persistence and audit trail are defined before release.

## Verification

Focused verification:

```bash
yarn verify:retention-consultation
```

Related functional verification:

```bash
yarn verify:functional-storefront
yarn verify:pharmacist-browser
yarn verify:expo-functional
```

## Current Caveat

The focused gate verifies existing service/API contracts. The web functional smoke also verifies the current pharmacist operator API flow, and `yarn verify:pharmacist-browser` verifies the clickable web pharmacist workflow. These gates do not yet prove production persistence, tenant scoping, expiry jobs, audit logging, native device UX, or client-specific questionnaire content beyond the current hair/skin template identity.
