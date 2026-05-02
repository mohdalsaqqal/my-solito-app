# Custom Payment Gateway Runbook

Use this runbook to connect a real payment gateway through `packages/adapters/custom-payment/`. The adapter is a scaffold that normalizes gateway responses into the platform `PaymentProvider` contract. Implement the gateway-specific HTTP calls and field mappings to go live.

## Architecture

```
Checkout/Order service → PaymentProvider contract → custom-payment adapter → Gateway HTTP API
Webhook endpoint ← POST /api/payments/custom/webhook ← Gateway settlement events
```

The adapter implements `PaymentProvider` from `packages/providers/contracts/PaymentProvider.ts`. Services never call the gateway directly.

## Required Environment Variables

| Variable | Example | Notes |
|---|---|---|
| `USE_CUSTOM_PAYMENT` | `true` | Must be `true` to route through this adapter |
| `CUSTOM_PAYMENT_BASE_URL` | `https://payments.client-gateway.com` | Gateway base URL (no trailing slash) |
| `CUSTOM_PAYMENT_API_KEY` | `sk_live_...` | Gateway API key (sent as `Authorization: Bearer`) |
| `CUSTOM_PAYMENT_WEBHOOK_SECRET` | `whsec_...` | HMAC-SHA256 secret for webhook verification |
| `CUSTOM_PAYMENT_PROVIDER_NAME` | `client_gateway` | Provider identifier in intents and settlements |

Webhook route to give the gateway: `https://store.client.com/api/payments/custom/webhook`

## Gateway API Contract

The adapter expects these endpoints from the gateway. Adapt URL paths and field names in the adapter if the real gateway differs.

### POST /payments/intents — Create Payment Intent

**Request** (adapter sends):

```json
{
  "tenantId": "tenant_001",
  "storeId": "store_001",
  "orderId": "ord_abc123",
  "customerUserId": "usr_xyz",
  "method": "online-card",
  "amount": 29900,
  "currency": "SAR",
  "returnUrl": "https://store.client.com/checkout/return?order=ord_abc123",
  "cancelUrl": "https://store.client.com/checkout?cancelled=true"
}
```

Headers: `Authorization: Bearer <apiKey>`, `Idempotency-Key: <idempotencyKey>`, `Content-Type: application/json`

**Response** (gateway returns):

```json
{
  "id": "pi_789",
  "status": "requires_action",
  "paymentUrl": "https://payments.client-gateway.com/pay/pi_789",
  "clientToken": "tok_abc",
  "expiresAt": "2026-05-01T00:00:00Z"
}
```

The adapter normalizes these field names (snake_case and camelCase both accepted):

| Gateway Field (any accepted) | Canonical Field | Notes |
|---|---|---|
| `id`, `sessionId` | `intent.id` | Falls back to idempotency key if both missing |
| `status` | `intent.status` | Normalized via `normalizeIntentStatus()` |
| `paymentUrl`, `payment_url` | `intent.paymentUrl` | Hosted payment page URL |
| `clientToken`, `client_token` | `intent.clientToken` | SDK client token |
| `expiresAt`, `expires_at` | `intent.expiresAt` | ISO 8601 timestamp |
| `settlementId`, `settlement_id` | `settlement.settlementId` | Falls back to intent ID |

### Status Normalization

Gateway status strings are normalized to `PaymentProviderIntentStatus`:

| Gateway Status | Canonical Status |
|---|---|
| `requires_payment`, `requires_redirect` | `requires_action` |
| `paid`, `succeeded` | `captured` |
| `not_required`, `pending`, `authorized`, `captured`, `failed`, `cancelled` | Passed through as-is |
| Unknown | `pending` |

## Webhook Integration

### Endpoint

`POST /api/payments/custom/webhook`

### Signature Verification

The adapter checks one of these headers (checked in order):
1. `X-Custom-Payment-Signature`
2. `X-Payment-Signature`
3. `X-Signature`

The signature must be an HMAC-SHA256 hex digest of the raw request body, keyed with `CUSTOM_PAYMENT_WEBHOOK_SECRET`. The adapter strips `sha256=` prefix if present and uses constant-time comparison.

### Webhook Payload

Gateway sends:

```json
{
  "event": "payment.captured",
  "orderId": "ord_abc123",
  "intentId": "pi_789",
  "status": "captured",
  "amount": 29900,
  "currency": "SAR",
  "settlementId": "set_456",
  "capturedAt": "2026-04-30T14:30:00Z",
  "reference": "txn_ref_001"
}
```

The adapter normalizes these field names (snake_case and camelCase both accepted):

| Gateway Field (any accepted) | Canonical Field | Notes |
|---|---|---|
| `event`, `type`, `status` | Settlement status | Normalized via `normalizeIntentStatus()` |
| `orderId`, `order_id` | Webhook result `orderId` | Platform order ID |
| `intentId`, `intent_id`, `id`, `sessionId`, `session_id` | Webhook result `intentId` | Payment intent ID |
| `settlementId`, `settlement_id`, `reference` | `settlement.settlementId` | Falls back to intent ID |
| `amount` | `settlement.amount` | Defaults to 0 if missing |
| `currency` | `settlement.currency` | Defaults to `USD` if missing |
| `capturedAt`, `captured_at` | `settlement.capturedAt` | Only set when status is `captured` |

### Webhook Response

The adapter returns `PaymentProviderWebhookResult`:

```ts
{
  orderId: "ord_abc123",
  intentId: "pi_789",
  settlement: {
    settlementId: "set_456",
    provider: "payment_gateway",
    status: "captured",
    amount: 29900,
    currency: "SAR",
    capturedAt: "2026-04-30T14:30:00Z",
    rawReference: "payment.captured"
  }
}
```

## Adapter Customization Points

The adapter at `packages/adapters/custom-payment/index.ts` is a working scaffold. For a real gateway, these are the expected customization points:

### 1. Intent Creation URL

Line 149: `new URL('/payments/intents', config.baseUrl)`

Change the path if the gateway uses a different endpoint (e.g., `/v1/checkout/sessions`).

### 2. Request Body Shape

Lines 156-166: The adapter sends a flat JSON body. Add or rename fields to match the gateway's expected schema (e.g., nested `metadata`, `line_items`, `customer` object).

### 3. Authentication Header

Line 153: `Authorization: Bearer ${config.apiKey}`

Change if the gateway uses a different auth scheme (e.g., `X-API-Key`, Basic auth, signed JWT).

### 4. Response Field Mapping

Lines 180-200: Map the gateway's actual response fields to `PaymentProviderIntent`. The adapter already normalizes snake_case/camelCase variants. Add new field names the real gateway returns.

### 5. Webhook Signature Header

Lines 240-242: Change the header names checked for the signature to match the gateway's actual webhook signature header.

### 6. Webhook Payload Normalization

`normalizeWebhookPayload()` (lines 116-141): Adjust field names and fallback logic to match the gateway's actual webhook payload shape.

## Dev / Test Mode

When `USE_CUSTOM_PAYMENT=true` but `CUSTOM_PAYMENT_BASE_URL` is unset or points to localhost:
- `createCustomPaymentAdapterFromEnv()` returns `null`
- System falls back to mock payment (COD-like responses)
- Webhook endpoint returns 400 for unverifiable payloads

For local testing with a gateway sandbox, set all env vars and point `CUSTOM_PAYMENT_BASE_URL` at the sandbox endpoint.

## Sandbox Testing

### Test Cards

When the gateway provides a sandbox environment, use these standard test card patterns. Adjust to the gateway's specific test card set.

| Scenario | Card Number | Expiry | CVV | Expected Result |
|---|---|---|---|---|
| Successful payment | `4242 4242 4242 4242` | Any future | Any 3-digit | `captured` |
| Requires 3D Secure | `4000 0025 0000 3155` | Any future | Any 3-digit | `requires_action` (redirect to 3DS) |
| Declined — insufficient funds | `4000 0000 0000 9995` | Any future | Any 3-digit | `failed` |
| Declined — stolen card | `4000 0000 0000 0259` | Any future | Any 3-digit | `failed` |
| Declined — invalid CVV | `4000 0000 0000 0127` | Any future | Any 3-digit | `failed` |

For region-specific gateways (e.g., MADA in Saudi Arabia), confirm test card BINs with the gateway provider.

### Webhook Events

Expected webhook event types from the gateway. Map these to settlement status:

| Gateway Event | Settlement Status | Notes |
|---|---|---|
| `payment.authorized` | `authorized` | Funds held, not yet captured |
| `payment.captured` | `captured` | Funds settled |
| `payment.failed` | `failed` | Payment attempt failed |
| `payment.cancelled` | `failed` | Payment cancelled/voided |
| `payment.refunded` | `failed` | Fully or partially refunded |
| `payment.disputed` | `failed` | Chargeback or dispute filed |

### Sandbox Verification

- [ ] Gateway sandbox URL is reachable from staging.
- [ ] Sandbox API key can create a payment intent.
- [ ] Hosted payment page loads with sandbox credentials.
- [ ] Successful test card → `payment.captured` webhook received.
- [ ] Failed test card → `payment.failed` webhook received.
- [ ] 3D Secure test card → redirect flow works, webhook received after auth.
- [ ] Webhook signature verification passes with sandbox secret.
- [ ] Webhook signature verification rejects tampered payloads.

## Checkout Reconciliation

Payment, order write-back, referral, and loyalty changes can cross more than one external system. The platform must not silently lose state when a later step fails.

Current behavior:

- Payment intent creation happens before merchant order write-back.
- Loyalty redemption/earning is applied before merchant order write-back.
- Referral attribution is recorded after merchant order write-back.
- If merchant order write-back fails after payment intent creation, the order service records an `order_write_back_failed` reconciliation item.
- If loyalty history entries were created before order write-back failed, the order service records a `loyalty_reversal_required` reconciliation item.
- If referral ledger creation fails after the order is placed, checkout still returns the placed order and records a `referral_ledger_failed` reconciliation item.

Reconciliation records are written by `apps/next/server/services/checkout/checkout-reconciliation.service.ts`. In production, these records should move to tenant-scoped PostgreSQL and feed an operator view or retry job.

Operator actions before go-live:

- [ ] Review `order_write_back_failed` records and confirm payment/order state with the gateway and merchant backend.
- [ ] Review `loyalty_reversal_required` records and either reverse points or attach them to the recovered order.
- [ ] Review `referral_ledger_failed` records and replay referral attribution once the ledger store is available.
- [ ] Add alerts for new reconciliation records in production.

## Production Verification

- [ ] `CUSTOM_PAYMENT_BASE_URL` points to production gateway.
- [ ] `CUSTOM_PAYMENT_API_KEY` is a live key (not test/sandbox).
- [ ] `CUSTOM_PAYMENT_WEBHOOK_SECRET` matches the gateway's webhook secret.
- [ ] Gateway is configured to send webhooks to `https://store.client.com/api/payments/custom/webhook`.
- [ ] Gateway can reach the webhook URL (not blocked by firewall/VPC).
- [ ] `USE_CUSTOM_PAYMENT=true` in production env.
- [ ] `USE_MOCK=false` in production env.
- [ ] Create a 1-unit test order in staging and verify the intent appears in gateway dashboard.
- [ ] Simulate a capture/settlement webhook and verify order status updates.
- [ ] Verify idempotency: retry the same intent creation and confirm no duplicate charge.
- [ ] Verify webhook signature verification rejects payloads signed with wrong secret.

## Related Documents

- `packages/providers/contracts/PaymentProvider.ts` — canonical provider contract
- `packages/adapters/custom-payment/index.ts` — adapter implementation
- `packages/adapters/custom-payment/index.test.ts` — adapter tests
- `docs/delivery/CLIENT_HANDOFF_PACK.md` — full handoff pack (env vars, Odoo, payment, referral/loyalty/pharmacist)
- `docs/delivery/PRODUCTION_BLOCKERS.md` — non-UI production blockers
