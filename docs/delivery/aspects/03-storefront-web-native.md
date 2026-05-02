# 03 Storefront Web & Native

Status: `[~]`

## Goal

Deliver browse, search, product detail, cart, checkout, order history, account, web SEO, and native app flows.

## Current State

- [x] Web functional smoke exists and passes.
- [x] Expo static/config/router smoke exists and passes.
- [x] Native push registration seam exists.
- [x] Web functional smoke covers account referral, loyalty wallet/history, account test detail, recommended-product add-to-cart, and referral+loyalty checkout.
- [x] Account tests expose explicit skin and hair consultation template identity.
- [x] Web functional smoke covers pharmacist customer search, QR resolve, customer profile/history, product search, hair consultation draft, and hair consultation submit.
- [x] Browser-click web smoke covers pharmacist customer search, open customer, create hair test, product recommendation, review, and submit.
- [~] Account referral, loyalty, and test screens exist; native/manual flow verification remains.
- [~] Pharmacist console surfaces exist on web; API/operator and browser-click web smoke pass, while native verification remains separate.
- [~] Physical-device native smoke remains.
- [~] Deep links remain unverified.
- [x] Expo typecheck passes and is promoted to the current delivery profile.

## Tasks

- [ ] Run and document physical-device smoke for home, search, product, cart, checkout, account, orders.
- [x] Include account tests, test detail, referral summary, loyalty wallet, and recommended-product add-to-cart in web storefront smoke.
- [x] Model explicit skin and hair consultation templates in account/pharmacist contracts and fixtures.
- [ ] Include account tests, test detail, referral summary, loyalty wallet, and recommended-product add-to-cart in native/manual smoke.
- [x] Verify pharmacist console API/operator flow for customer search, QR resolve, product search, draft, submit, and profile history update.
- [x] Verify pharmacist console browser-click web flow for customer search, open customer, create hair test, product recommendation, review, and submit.
- [ ] Verify pharmacist console native flow for customer search, QR resolve, draft, and submit.
- [ ] Verify deep links/universal links.
- [x] Clear `BLK-001` and promote Expo typecheck.
- [ ] Add Maestro smoke after manual native script is stable.

## Verification

```bash
yarn verify:functional-storefront
yarn verify:retention-consultation
yarn verify:pharmacist-browser
yarn verify:expo-functional
yarn --cwd apps/expo tsc --noEmit --incremental false
```

## Blockers

- Physical-device checks need device and app credentials.
