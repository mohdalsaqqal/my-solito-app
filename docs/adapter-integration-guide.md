# Adapter Integration Guide — Plug & Play

> How to connect any external system (ERP, payment gateway, CMS, auth provider) to this codebase.

---

## Architecture Overview

```
UI (Server + Client Components)
  → apps/next/server/services
    → packages/providers (contracts)
      → packages/adapters (external integrations)
```

The **provider contract** is the interface. The **adapter** is the implementation. The **registry** picks which implementation to use based on environment variables.

```
┌─────────────────────────────────────────────────┐
│  Your Service (product-page.service.ts)          │
│    ↓                                             │
│    productProvider.get(id)    ← Provider contract │
│    ↓                                             │
│  packages/providers/registry.ts                  │
│    ↓                                             │
│    USE_MOCK=false → odooProductAdapter           │
│    USE_MOCK=true  → mockProductAdapter           │
│    ↓                                             │
│  packages/adapters/odoo-erp/   or  mock/         │
└─────────────────────────────────────────────────┘
```

**Key principle:** Services never know which adapter is active. They call the provider contract. Swap adapters without touching services.

---

## Directory Structure

```
packages/adapters/
├── _shared/
│   └── http-client.ts          # Shared HTTP client (retry, timeout, auth)
├── mock/
│   ├── product/                # Mock data adapters (development default)
│   ├── order/
│   ├── auth/
│   └── ...
├── odoo-erp/                   # Example: Odoo ERP integration
│   ├── client.ts               # HTTP client for Odoo REST API
│   ├── product-adapter.ts      # ProductProvider implementation
│   ├── category-adapter.ts     # CategoryProvider implementation
│   ├── brand-adapter.ts        # BrandProvider implementation
│   └── index.ts                # Factory function
├── payment-networks/           # Example: Networks payment gateway
│   ├── client.ts               # HTTP client for Networks API
│   ├── order-adapter.ts        # OrderProvider (payment methods)
│   ├── webhook-handler.ts      # Incoming webhook processor
│   └── index.ts                # Factory function
└── index.ts                    # Barrel export (all adapters)
```

---

## How to Add a New Adapter

### Step 1: Identify the Provider Contract

Look at `packages/providers/contracts/` for the interface you need to implement.

```typescript
// Example: ProductProvider
export interface ProductProvider {
  list(filters?: ProductFilter): Promise<ProviderResult<Product[]>>
  get(id: string): Promise<ProviderResult<Product>>
}
```

### Step 2: Create the Adapter Directory

```
packages/adapters/my-new-system/
├── client.ts               # HTTP/gRPC/SDK client
├── product-adapter.ts      # ProductProvider implementation
├── order-adapter.ts        # OrderProvider implementation (if needed)
└── index.ts                # Factory function
```

### Step 3: Create the Client

Use the shared HTTP client or the system's native SDK.

```typescript
// packages/adapters/my-new-system/client.ts
import { HttpClient, HttpClientConfig } from '../_shared/http-client'

export type MySystemConfig = {
  baseUrl: string
  apiKey: string
}

export class MySystemClient extends HttpClient {
  constructor(config: MySystemConfig) {
    super({
      baseUrl: config.baseUrl,
      auth: { type: 'api-key', header: 'X-API-Key', value: config.apiKey },
    })
  }

  async getProducts(params?: { limit?: number }) {
    return this.get<MySystemProduct[]>('/api/products', { /* query params */ })
  }

  async getProduct(id: string) {
    return this.get<MySystemProduct>(`/api/products/${id}`)
  }
}

// Raw data types from the external system
export type MySystemProduct = {
  id: number
  title: string
  sale_price: number
  // ... whatever the external API returns
}
```

### Step 4: Implement the Provider Adapter

Map the external system's data format → your provider contract.

```typescript
// packages/adapters/my-new-system/product-adapter.ts
import { Product, ProductProvider, ProductFilter } from '@real/providers/contracts'
import { ProviderResult } from '@real/providers/contracts/types'
import { MySystemClient, MySystemProduct } from './client'
import { buildCanonicalMetadata } from '../mock/_shared/canonical-mapper'

function toCanonicalProduct(raw: MySystemProduct): Product {
  const row: Record<string, unknown> = {
    id: String(raw.id),
    name: raw.title,
    price: raw.sale_price,
    external_product_id: String(raw.id),
  }

  const metadata = buildCanonicalMetadata({
    row,
    canonicalKeys: ['id', 'name', 'price'] as const,
    system: 'my-new-system',
    table: 'products',
    schemaVersion: '2026-04-05',
    externalIdField: 'external_product_id',
  })

  return {
    id: String(raw.id),
    name: raw.title,
    price: raw.sale_price,
    currency: 'USD',
    inStock: true,
    requiresVariantSelection: false,
    ...metadata,
  }
}

export function createMySystemProductAdapter(client: MySystemClient): ProductProvider {
  return {
    async list(filters?: ProductFilter) {
      try {
        const products = await client.getProducts({ limit: filters?.limit })
        return { ok: true, data: products.map(toCanonicalProduct) }
      } catch (err) {
        return {
          ok: false,
          error: {
            code: 'MY_SYSTEM_PRODUCT_LIST_FAILED',
            message: err instanceof Error ? err.message : 'Failed to fetch products',
          },
        }
      }
    },

    async get(id: string) {
      try {
        const product = await client.getProduct(id)
        return { ok: true, data: toCanonicalProduct(product) }
      } catch (err) {
        if (err && typeof err === 'object' && 'statusCode' in err && (err as { statusCode?: number }).statusCode === 404) {
          return { ok: false, error: { code: 'PRODUCT_NOT_FOUND', message: 'Product not found.' } }
        }
        return {
          ok: false,
          error: {
            code: 'MY_SYSTEM_PRODUCT_GET_FAILED',
            message: err instanceof Error ? err.message : 'Failed to fetch product',
          },
        }
      }
    },
  }
}
```

### Step 5: Create the Factory

```typescript
// packages/adapters/my-new-system/index.ts
import { ProductProvider, CategoryProvider } from '@real/providers/contracts'
import { MySystemClient } from './client'
import { createMySystemProductAdapter } from './product-adapter'
// import { createMySystemCategoryAdapter } from './category-adapter'

export type MySystemAdapters = {
  productProvider: ProductProvider
  categoryProvider: CategoryProvider
}

export function createMySystemAdapters(): MySystemAdapters | null {
  const baseUrl = process.env.MY_SYSTEM_BASE_URL
  const apiKey = process.env.MY_SYSTEM_API_KEY

  if (!baseUrl || !apiKey) {
    return null  // Caller falls back to mock
  }

  const client = new MySystemClient({ baseUrl, apiKey })

  return {
    productProvider: createMySystemProductAdapter(client),
    // categoryProvider: createMySystemCategoryAdapter(client),
  }
}
```

### Step 6: Export from Barrel

```typescript
// packages/adapters/index.ts
export * from './mock'
export * from './translation-crowdin'
export * from './odoo-erp'
export * from './payment-networks'
export * from './my-new-system'     // ← Add this
```

### Step 7: Wire to Registry

```typescript
// packages/providers/registry.ts
import { createMySystemAdapters } from '@real/adapters/my-new-system'

const useMySystem = process.env.USE_MY_SYSTEM === 'true'
const mySystemAdapters = createMySystemAdapters()

export const productProvider = useMySystem
  ? (mySystemAdapters?.productProvider ?? mockProductAdapter)
  : mockProductAdapter
```

### Step 8: Document Environment Variables

Append to `.env.example`:

```bash
# ─── My New System Integration ───────────────────────────────────────────
# Set USE_MY_SYSTEM=true to use real adapters instead of mock data
MY_SYSTEM_BASE_URL=https://api.mysystem.example.com
MY_SYSTEM_API_KEY=your_api_key
```

---

## Payment Gateway Adapter Pattern

Payment gateways have an extra requirement: **webhook handling**.

### Current Payment Boundary

Checkout now uses a dedicated `PaymentProvider` contract for payment intents. `OrderProvider` still owns merchant order write-back; `PaymentProvider` owns payment authorization/capture state. This keeps Odoo/custom ERP order creation separate from COD, card-on-delivery, online card, and future regional gateways.

Services call:

```typescript
paymentProvider.createIntent(input, context)
```

The active adapter is selected in `packages/providers/registry.ts`.

### Built-In Custom Gateway Adapter

`packages/adapters/custom-payment` is a generic REST adapter for client-specific gateways. It lets the platform stay on mock payment now and switch to a real custom gateway by env only.

Configure:

```bash
USE_CUSTOM_PAYMENT=false
CUSTOM_PAYMENT_BASE_URL=https://payments.example.com
CUSTOM_PAYMENT_API_KEY=your_custom_payment_api_key
CUSTOM_PAYMENT_WEBHOOK_SECRET=your_custom_payment_webhook_secret
CUSTOM_PAYMENT_PROVIDER_NAME=client_gateway
```

Expected gateway endpoint:

- `POST /payments/intents`

Request body includes:

- `tenantId`
- `storeId`
- `orderId`
- `customerUserId`
- `method`
- `amount`
- `currency`
- `returnUrl`
- `cancelUrl`

Accepted response fields:

- `id` or `sessionId`
- `status`: `pending`, `requires_action`, `authorized`, `captured`, `failed`, `cancelled`, `paid`, or `succeeded`
- `paymentUrl` or `payment_url`
- `clientToken` or `client_token`
- `expiresAt` or `expires_at`
- `settlementId` or `settlement_id`

Local/default functional mode uses the mock payment adapter. Real gateway connection should only require implementing the gateway endpoint above and setting env vars.

Webhook endpoint exposed by this app:

- `POST /api/payments/custom/webhook`

Webhook signature:

- Header: `x-custom-payment-signature` (also accepts `x-payment-signature` or `x-signature`)
- Value: hex HMAC-SHA256 of the raw request body using `CUSTOM_PAYMENT_WEBHOOK_SECRET`
- Optional prefix accepted: `sha256=...`

Webhook payload fields accepted:

- `orderId` or `order_id`
- `intentId`, `intent_id`, `id`, `sessionId`, or `session_id`
- `status` (`paid`/`succeeded` normalize to captured; `authorized`, `failed`, and `cancelled` are preserved)
- `amount`
- `currency`
- `settlementId`, `settlement_id`, or `reference`
- `capturedAt` or `captured_at`

Payment return/cancel URLs sent to the gateway during intent creation:

- `returnUrl`: `/api/payments/custom/return?orderId=...`
- `cancelUrl`: `/api/payments/custom/cancel?orderId=...`

The webhook service records settlement through `OrderProvider.confirmPaymentSettlement(...)` when the active order provider supports it.

### Structure

```
packages/adapters/payment-mygateway/
├── client.ts               # Gateway HTTP client
├── order-adapter.ts        # OrderProvider with payment methods
├── webhook-handler.ts      # Processes incoming webhooks
└── index.ts                # Factory
```

### Key Contract Methods

```typescript
// OrderProvider payment methods
export interface OrderProvider {
  // ... list, get, updateStatus, place

  initiatePayment?(input: PaymentInitiationInput): Promise<ProviderResult<PaymentInitiationResult>>
  confirmPaymentSettlement?(orderId: string, settlement: PaymentSettlementRecord): Promise<ProviderResult<Order>>
}
```

### Webhook Route

Create a route handler at `apps/next/app/api/payments/mygateway/webhook/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createMyGatewayAdapters } from '@real/adapters/payment-mygateway'
import { mockOrderAdapter } from '@real/adapters'

export async function POST(request: NextRequest) {
  const adapters = createMyGatewayAdapters(mockOrderAdapter)
  if (!adapters) {
    return NextResponse.json({ error: 'Payment gateway not configured' }, { status: 503 })
  }

  const rawBody = await request.text()
  const signature = request.headers.get('x-gateway-signature') ?? ''
  const payload = JSON.parse(rawBody)

  const result = await adapters.webhookHandler(
    adapters.client, rawBody, signature, payload, mockOrderAdapter
  )

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 422 })
  }

  return NextResponse.json({ received: true, orderId: result.data.orderId })
}
```

---

## Adding a New Provider Contract

If the external system needs a provider contract that doesn't exist yet:

### Step 1: Define the Contract

```typescript
// packages/providers/contracts/InventoryProvider.ts
import { ProviderResult } from './types'

export type InventoryItem = {
  productId: string
  warehouseId: string
  available: number
  reserved: number
  reorderPoint: number
}

export interface InventoryProvider {
  getByProduct(productId: string): Promise<ProviderResult<InventoryItem[]>>
  adjust(productId: string, warehouseId: string, delta: number): Promise<ProviderResult<InventoryItem>>
}
```

### Step 2: Add to Registry

```typescript
// packages/providers/registry.ts
export const inventoryProvider: InventoryProvider = useMock
  ? mockInventoryAdapter
  : (mySystemAdapters?.inventoryProvider ?? mockInventoryAdapter)
```

### Step 3: Implement in Adapter

```typescript
// packages/adapters/my-new-system/inventory-adapter.ts
import { InventoryProvider, InventoryItem } from '@real/providers/contracts'
import { MySystemClient } from './client'

export function createMySystemInventoryAdapter(client: MySystemClient): InventoryProvider {
  return {
    async getByProduct(productId: string) {
      // ... call external system, map to InventoryItem
    },
    async adjust(productId: string, warehouseId: string, delta: number) {
      // ... call external system
    },
  }
}
```

---

## Environment Variable Switching

### Current Switches

| Variable | Effect | Default |
|----------|--------|---------|
| `USE_MOCK=false` | Use Odoo ERP adapters instead of mock | `true` (mock) |
| `USE_NETWORKS=false` | Use Networks payment instead of mock | `true` (mock) |
| `USE_CUSTOM_PAYMENT=false` | Use generic custom payment intents instead of mock payment | `true` (mock) |
| `USE_TRANSLATION_MOCK=true` | Use mock translation instead of Crowdin API | `false` (Crowdin) |
| `STRICT_PROVIDER_READINESS=true` | Fail fast when release-ready provider domains remain mock-backed in staging/production | `false` |
| `REQUIRE_PRODUCTION_AUTH=true` | Require explicit `BETTER_AUTH_SECRET` in release-like environments | `true` |
| `AUTH_COOKIE_SECURE=true` | Force `Secure` auth cookies (recommended for all non-local deployments) | `true` |

### Better Auth Operator Notes

- `BETTER_AUTH_SECRET` is required in staging/production and should be at least 32 characters of high-entropy random data
- `AUTH_SESSION_SECRET` remains relevant for legacy cutover compatibility only; do not rely on it as the production Better Auth secret
- Set `BETTER_AUTH_URL` to the canonical app origin and `BETTER_AUTH_TRUSTED_ORIGINS` when multiple trusted origins are expected

### Pattern for New Switches

```typescript
// packages/providers/registry.ts
const useExternal = process.env.USE_EXTERNAL === 'true'
const externalAdapters = createExternalAdapters()

export const someProvider = useExternal
  ? (externalAdapters?.someProvider ?? mockSomeAdapter)
  : mockSomeAdapter
```

**Why the nullish fallback (`?? mockXxxAdapter`)?** If the factory returns `null` (missing env vars), we gracefully fall back to mock instead of crashing.

---

## Canonical Metadata Mapping

Every adapter should use `buildCanonicalMetadata` for consistent source tracking:

```typescript
import { buildCanonicalMetadata } from '../mock/_shared/canonical-mapper'

function toCanonical(raw: ExternalData): Product {
  const row: Record<string, unknown> = {
    id: String(raw.id),
    name: raw.name,
    price: raw.price,
    external_product_id: String(raw.id),  // Maps to sourceMeta.externalId
  }

  const metadata = buildCanonicalMetadata({
    row,
    canonicalKeys: ['id', 'name', 'price'] as const,
    system: 'my-new-system',    // Identifies the source
    table: 'products',           // Source table name
    schemaVersion: '2026-04-05', // Track schema changes
    externalIdField: 'external_product_id',
  })

  return { id: String(raw.id), name: raw.name, price: raw.price, ...metadata }
}
```

This ensures every item carries:
- `sourceMeta.system` — which system it came from
- `sourceMeta.table` — the source table/collection
- `sourceMeta.externalId` — the original system's ID
- `sourceMeta.syncedAt` — when it was last synced
- `sourceMeta.mappedColumns` — which columns were mapped
- `attributes` — non-canonical fields preserved for reference

---

## Testing

### Functionality Tests

Mock the HTTP client and verify the adapter returns correct `ProviderResult` shapes.

```typescript
// packages/adapters/my-new-system/__tests__/functionality.test.ts
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

describe('MySystem Product Adapter', () => {
  it('returns ok:true with mapped products', async () => {
    // Mock client → call adapter → assert result.ok && result.data.length > 0
  })

  it('returns error for 404', async () => {
    // Mock client throws 404 → assert result.ok === false && result.error.code === 'PRODUCT_NOT_FOUND'
  })
})
```

### Security Tests

For payment adapters:

```typescript
describe('Webhook Signature Verification', () => {
  it('passes with valid HMAC-SHA256 signature', () => { /* ... */ })
  it('fails with invalid signature', () => { /* ... */ })
  it('fails with tampered body', () => { /* ... */ })
  it('uses timing-safe comparison', () => { /* ... */ })
})
```

### Run Tests

```bash
npx tsx --test "packages/adapters/**/__tests__/*.test.ts"
```

---

## Checklist for New Adapters

- [ ] Create `packages/adapters/my-system/` directory
- [ ] Create `client.ts` with HTTP client + external data types
- [ ] Implement provider adapter(s) with proper error handling
- [ ] Use `buildCanonicalMetadata` for all mapped data
- [ ] Create `index.ts` factory that returns `null` when env vars are missing
- [ ] Export from `packages/adapters/index.ts`
- [ ] Wire to `packages/providers/registry.ts` with env-based switching
- [ ] Add env vars to `.env.example`
- [ ] Write functionality tests
- [ ] Write security tests (for payment adapters)
- [ ] Create webhook route handler (for payment adapters)

---

## Existing Adapters Reference

### Odoo ERP

| Provider | Contract | Adapter |
|----------|----------|---------|
| Products | `ProductProvider` | `odoo-erp/product-adapter.ts` |
| Categories | `CategoryProvider` | `odoo-erp/category-adapter.ts` |
| Brands | `BrandProvider` | `odoo-erp/brand-adapter.ts` |

**Env vars:** `ODOO_BASE_URL`, `ODOO_DB`, `ODOO_API_KEY`

**External endpoints expected:**
- `GET /api/products` — list products
- `GET /api/products/:id` — get product
- `GET /api/categories` — list categories
- `GET /api/brands` — list brands

### Networks Payment Gateway

| Provider | Contract | Adapter |
|----------|----------|---------|
| Orders (payment) | `OrderProvider` | `payment-networks/order-adapter.ts` |
| Webhooks | `handleNetworksWebhook()` | `payment-networks/webhook-handler.ts` |

**Env vars:** `NETWORKS_BASE_URL`, `NETWORKS_API_KEY`, `NETWORKS_WEBHOOK_SECRET`, `NETWORKS_MERCHANT_ID`

**External endpoints expected:**
- `POST /v1/payments/initiate` — create payment intent
- `POST /v1/payments/{id}/capture` — capture/confirm payment
- `GET /v1/payments/{id}/status` — check payment status
- Webhook → `POST /api/payments/networks/webhook` (our route)

---

## Error Code Convention

Adapter error codes follow the pattern: `{SOURCE}_{OPERATION}_{STATUS}`

```
ODOO_PRODUCT_LIST_FAILED
ODOO_PRODUCT_GET_FAILED
PRODUCT_NOT_FOUND             ← Standard provider error (no source prefix)
NETWORKS_INITIATE_FAILED
NETWORKS_SETTLEMENT_FAILED
WEBHOOK_INVALID_SIGNATURE
WEBHOOK_ORDER_UPDATE_FAILED
```

Standard provider errors (defined in contracts) should use the canonical codes:
- `PRODUCT_NOT_FOUND`
- `ORDER_NOT_FOUND`
- `CATEGORY_NOT_FOUND`
- `BRAND_NOT_FOUND`
- `ORDER_STATUS_INVALID_TRANSITION`

Source-specific errors use the prefix pattern.
