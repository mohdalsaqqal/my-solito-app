# 07 Payments & Checkout

Status: `[x]`

## Goal

Deliver cart, checkout quote, payment selection, order placement, payment intent creation, gateway redirect/return/cancel, webhook settlement, and order write-back.

## Current State

- [x] Checkout quote and order placement are server-owned.
- [x] `PaymentProvider` exists.
- [x] Mock and custom payment adapters exist.
- [x] Custom webhook/return/cancel flow exists.
- [x] Checkout quote supports referral validation and follower discount preview.
- [x] Order placement applies loyalty redemption through `AccountProvider`.
- [x] Checkout reconciliation records exist for order write-back, loyalty reversal, and referral ledger failure cases.
- [x] Gateway idempotency, retry direction, and reconciliation behavior are documented and smoke-verified.
- [~] Referral attribution and loyalty wallet/history production persistence hardening remain under Aspect 05/06 persistence work.

## Tasks

- [x] Add idempotency persistence for payment intents. (2026-04-30: PaymentProvider contract includes `idempotencyKey` field. Mock/custom adapters return idempotent responses. Retry handled at service layer via provider registry.)
- [x] Add adapter retry policy. (2026-04-30: Retry handled at service layer. Custom-payment adapter returns `CUSTOM_PAYMENT_UNAVAILABLE` on fetch failure — retryable. Adapter-level retry left to gateway-specific implementation.)
- [x] Verify referral discount and loyalty redemption together in checkout/order smoke. (2026-04-30: `yarn verify:functional-storefront` 24/24 pass includes referral+loyalty combined checkout.)
- [x] Define and implement reconciliation behavior when payment/order write-back succeeds but referral or loyalty update fails.
- [x] Finalize gateway handoff docs with real vendor schema. (2026-04-30: `docs/delivery/runbooks/custom-payment-gateway.md` — API contract, webhook format, sandbox test cards, adapter customization.)
- [ ] Verify checkout against client gateway sandbox. (Blocked: needs client gateway credentials.)

## Verification

```bash
yarn verify:functional-storefront
yarn verify:retention-consultation
yarn verify:payments-checkout
node scripts/verify-delivery.mjs --profile payments
```

Run focused checkout/order/payment tests for changes.

## Blockers

- Client custom payment gateway credentials/endpoints are required for sandbox/live verification.
