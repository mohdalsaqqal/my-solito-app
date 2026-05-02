# Odoo ERP Connection Runbook

Use this runbook to connect the commerce platform to a real Odoo ERP instance for products, categories, and brands. When this runbook is complete, only the client's real Odoo credentials and endpoints should remain as external dependencies.

## Architecture

```
Storefront UI → Next.js server services → Provider registry → Odoo adapter → Odoo REST API
```

- `USE_MOCK=false` switches product, category, and brand providers from mock data to Odoo.
- `packages/adapters/odoo-erp/` implements `ProductProvider`, `CategoryProvider`, and `BrandProvider`.
- The Odoo client (`client.ts`) calls a custom REST controller on the Odoo instance.
- Services never know which adapter is active — they call the provider contract.

## Required Environment Variables

| Variable | Example | Description |
|---|---|---|
| `USE_MOCK` | `false` | Must be `false` to route through Odoo adapters |
| `ODOO_BASE_URL` | `https://erp.client.example.com` | Odoo instance base URL (no trailing slash) |
| `ODOO_DB` | `client_production_db` | Odoo database name |
| `ODOO_API_KEY` | `a1b2c3d4-...` | Odoo API key or session token |
| `STRICT_PROVIDER_READINESS` | `true` | Fails at startup if Odoo adapters are unavailable in release-like envs |

## Expected Odoo REST API Contract

The adapter expects these custom REST endpoints on the Odoo instance. All requests include `?db=<ODOO_DB>` as a query parameter. Authentication is via `X-API-Key` header.

### GET /api/products

Query parameters (all optional):

| Parameter | Type | Example |
|---|---|---|
| `brand` | string[] | `?brand=maybelline&brand=loreal` |
| `category` | string[] | `?category=perfumes` |
| `ids` | string[] | `?ids=101&ids=102` |
| `on_sale` | boolean | `?on_sale=true` |
| `sort` | string | `?sort=newest` (one of: `newest`, `bestseller`, `price_asc`, `price_desc`) |
| `limit` | number | `?limit=20` |
| `db` | string | `?db=<ODOO_DB>` (added automatically) |

Response: `OdooProduct[]`

```json
[
  {
    "id": 101,
    "name": "Rose Night Cream",
    "description": "Deep hydration night cream with rose extract",
    "list_price": 120.00,
    "standard_price": 150.00,
    "currency_id": { "name": "SAR", "symbol": "﷼" },
    "image_url": "https://cdn.client.com/products/rose-night-cream.jpg",
    "rating_avg": 4.5,
    "rating_count": 28,
    "is_new": true,
    "is_limited": false,
    "qty_available": 45,
    "brand_name": "Real Cosmetics",
    "category_name": "Skincare",
    "category_slug": "skincare",
    "brand_slug": "real-cosmetics",
    "default_code": "RC-NC-001",
    "barcode": "6281234567890",
    "sale_ok": true,
    "type": "product",
    "create_date": "2025-01-15T08:30:00Z"
  }
]
```

### GET /api/products/:id

Response: `OdooProduct` (single object, same shape as above)

Returns 404 if the product does not exist.

### GET /api/categories

Response: `OdooCategory[]`

```json
[
  {
    "id": 1,
    "name": "Skincare",
    "name_ar": "العناية بالبشرة",
    "slug": "skincare",
    "parent_id": null,
    "parent_slug": null,
    "image_url": "https://cdn.client.com/categories/skincare.jpg",
    "active": true,
    "sequence": 1,
    "children": [
      {
        "id": 2,
        "name": "Face Creams",
        "name_ar": "كريمات الوجه",
        "slug": "face-creams",
        "parent_id": 1,
        "parent_slug": "skincare",
        "image_url": null,
        "active": true,
        "sequence": 1
      }
    ]
  }
]
```

Fields `parent_id` and `children` are optional. Categories without `parent_id` become root nodes in the category tree.

### GET /api/brands

Response: `OdooBrand[]`

```json
[
  {
    "id": 10,
    "name": "Real Cosmetics",
    "name_ar": "مستحضرات التجميل الحقيقية",
    "slug": "real-cosmetics",
    "logo_url": "https://cdn.client.com/brands/real-cosmetics.png",
    "description": "Premium skincare and cosmetics",
    "description_ar": "منتجات متميزة للعناية بالبشرة ومستحضرات التجميل",
    "active": true
  }
]
```

## Data Mapping Reference

### Product (OdooProduct → canonical Product)

| Odoo Field | Canonical Field | Notes |
|---|---|---|
| `id` | `id` (string) | Always converted to string |
| `name` | `name` | |
| `description` | `description` | |
| `list_price` | `price` | |
| `standard_price` | `compareAtPrice` | Only set when `standard_price > list_price` |
| `currency_id.name` | `currency` | Defaults to `USD` if missing |
| `image_url` | `image` | |
| `rating_avg` | `rating` | |
| `rating_count` | `reviews` | |
| `is_new` | `isNew` | |
| `is_limited` | `isLimited` | |
| `qty_available` | `stock` | |
| `brand_name` | `brand` | |
| `category_name` | `category` | |
| `default_code` | `vendor_sku` | Internal reference / SKU |
| `barcode` | `erp_line_code` | |
| `id` | `sourceMeta.externalId` | For audit trail |
| — | `sourceMeta` | Auto-generated canonical metadata (system: `odoo-erp`, table: `product.product`) |

### Category (OdooCategory → canonical Category)

| Odoo Field | Canonical Field | Notes |
|---|---|---|
| `id` | `id` (string) | |
| `name` / `name_ar` | `name` (LocalizedString) | `name_ar` falls back to `name` |
| `slug` | `slug` | |
| `parent_id` | `parentId` | |
| `image_url` | `image` | |
| `active` | `isActive` | |
| `sequence` | `sortOrder` | |

Category tree is built client-side from the flat list using `parentId` linking.

### Brand (OdooBrand → canonical Brand)

| Odoo Field | Canonical Field | Notes |
|---|---|---|
| `id` | `id` (string) | |
| `name` / `name_ar` | `name` (LocalizedString) | |
| `slug` | `slug` | |
| `logo_url` | `logo` | |
| `description` / `description_ar` | `description` (LocalizedString) | Falls back to empty string |
| `active` | `isActive` | |

## Connection Verification

### Step 1: Static smoke (no Odoo required)

```bash
node scripts/smoke-odoo-connection.mjs
```

Validates:
- Env vars are configured
- Adapter factory returns non-null adapters
- Adapters conform to provider contract methods
- All expected methods exist (`list`, `get`, `tree`, `getBySlug`)

### Step 2: Health check (requires Odoo)

```bash
node scripts/smoke-odoo-connection.mjs --health
```

Adds live API call validation:
- `GET /api/products` returns an array
- `GET /api/products/:id` returns a single product with required fields
- `GET /api/categories` returns an array
- `GET /api/brands` returns an array

### Step 3: Full smoke (requires Odoo)

```bash
node scripts/smoke-odoo-connection.mjs --full
```

Runs health checks plus adapter contract execution:
- `productProvider.list()` → returns `{ ok: true, data: [...] }`
- `productProvider.get(id)` → returns `{ ok: true, data: {...} }`
- `categoryProvider.list()` → returns `{ ok: true, data: [...] }`
- `categoryProvider.tree()` → returns tree structure
- `categoryProvider.getBySlug(slug)` → returns matching category
- `brandProvider.list()` → returns `{ ok: true, data: [...] }`
- `brandProvider.getBySlug(slug)` → returns matching brand
- Every returned entity has `sourceMeta.system === 'odoo-erp'`

### Step 4: Functional smoke (web storefront)

```bash
yarn verify:functional-storefront
```

After setting `USE_MOCK=false` and configuring Odoo env vars, the web functional smoke exercises product listing, product detail, search, and category navigation through the live Odoo adapters.

## Production Switch Checklist

- [ ] Confirm `ODOO_BASE_URL`, `ODOO_DB`, and `ODOO_API_KEY` are set in production environment.
- [ ] Confirm `USE_MOCK=false` in production.
- [ ] Confirm `STRICT_PROVIDER_READINESS=true` so the app fails fast if Odoo is unavailable.
- [ ] Run `node scripts/smoke-odoo-connection.mjs --health` from production or a jump host that can reach the Odoo instance.
- [ ] Verify that `GET /api/products` returns the expected production catalog.
- [ ] Verify that `GET /api/categories` returns the expected category tree.
- [ ] Verify that `GET /api/brands` returns the expected brand list.
- [ ] Run `yarn verify:functional-storefront` and confirm the storefront renders production Odoo data.
- [ ] Confirm Arabic names (`name_ar`) are present on categories and brands for bilingual support.
- [ ] Confirm product images are reachable via the CDN or image URLs returned by Odoo.
- [ ] Confirm stock quantities (`qty_available`) are accurate and update in near-real-time.
- [ ] Verify that inactive categories/brands (`active: false`) are excluded from storefront display.
- [ ] Verify that non-sellable products (`sale_ok: false` or `type: 'service'`) are handled appropriately.

## Troubleshooting

### Adapter returns null at startup

`createOdooAdapters()` returns `null` when any of `ODOO_BASE_URL`, `ODOO_DB`, or `ODOO_API_KEY` is missing. Check all three env vars are set.

### `GET /api/products` returns 401 or 403

The `X-API-Key` header value does not match what Odoo expects. Verify `ODOO_API_KEY`.

### `GET /api/products` returns 404

The Odoo instance may not have the custom REST controller installed. The adapter expects endpoints at `/api/products`, `/api/categories`, and `/api/brands`. Confirm the Odoo module is installed and the routes are registered.

### Products show incorrect prices or missing currency

The adapter reads `currency_id.name`. If the Odoo REST controller does not include `currency_id`, the adapter defaults to `USD`. Ensure the controller includes the currency relation.

### Category tree is flat or broken

The adapter builds the tree from `parent_id` links. If `parent_id` values do not match valid category `id` values, those categories become root nodes. Verify the Odoo data is consistent.

### Images are broken on the storefront

The adapter passes `image_url` through unchanged. Verify the URLs returned by Odoo are publicly accessible or routed through the CDN configured in the storefront.

### Performance / timeouts

The adapter fetches all categories and brands in a single call each. For large catalogs with thousands of categories, verify the Odoo REST controller supports pagination or returns results within acceptable time. The product list endpoint supports `limit` for pagination.

## Order Write-Back Expectations

The Odoo adapter currently covers catalog read paths: products, categories, and brands. Order write-back is intentionally a separate adapter concern so checkout can switch from mock/local persistence to the merchant ERP without changing UI or server service code.

### Ownership

- Order placement must go through `OrderProvider.place(input)`.
- Server services must call the provider registry, never Odoo directly.
- `packages/adapters/odoo-erp/` may add an `OdooOrderAdapter`, or a merchant-specific package may implement `OrderProvider` if the client has custom Odoo workflows.
- Payment initiation and settlement remain behind `PaymentProvider`; the order adapter records payment references but must not own gateway redirects or webhook verification.

### Required `OrderProvider.place` Behavior

The production order adapter must:

- Create or reuse one merchant backend order for one platform order placement attempt.
- Return the canonical `Order` shape from `packages/providers/contracts/OrderProvider.ts`.
- Preserve the platform order/payment IDs in Odoo custom fields or order notes for audit and support.
- Treat `PlaceOrderInput.pricingQuoteId` plus the platform order/cart identity as the idempotency key. If the same request is retried, return the existing merchant order instead of creating a duplicate sales order.
- Fail closed when required Odoo fields are missing. Do not create a partial order silently.

### Required Outbound Order Fields

| Platform Field | Odoo / Merchant Backend Expectation | Notes |
|---|---|---|
| `pricingQuoteId` | `x_platform_idempotency_key` or equivalent | Required for retry safety |
| `customerUserId` / checkout contact | Customer reference, name, phone, email if available | Guest checkout should still send contact details |
| `order.id` | `x_platform_order_id` | Stable support/audit reference |
| `order.items[].productId` | Product external ID / Odoo product ID | Prefer `sourceMeta.externalId`; fallback mapping must be agreed before go-live |
| `order.items[].quantity` | Sales order line quantity | Must be positive integer |
| `order.items[].unitPrice` | Sales order line unit price | Must use the quoted price, not a fresh ERP lookup at write time |
| `order.pricing.subtotal` | Untaxed subtotal or custom summary field | Match merchant tax/discount rules during adapter implementation |
| `order.pricing.discount` | Discount total / promotion metadata | Include referral/loyalty metadata when applied |
| `order.pricing.delivery` | Delivery/shipping charge | Required even when zero |
| `order.total` / `order.currency` | Sales order total and currency | Must match the accepted checkout quote |
| `fulfillment.mode` | Delivery, branch pickup, or merchant-specific fulfillment method | Map before go-live |
| `fulfillment.address` | Shipping address fields | Required for delivery orders |
| `paymentMethod` | Odoo payment term / payment method metadata | COD, card-on-delivery, online-card, pay-at-branch |
| `paymentSettlement` / `paymentAction` | Payment attempt/reference fields | Store gateway reference, redirect status, and settlement state where available |

### Status Mapping

The exact Odoo state names can vary by client, but the adapter must document and test the agreed mapping before go-live.

| Platform Status | Merchant Backend State | Notes |
|---|---|---|
| `placed` | Draft quotation, confirmed sale order, or custom pending state | Choose based on merchant operations; must be explicit |
| `shipped` | Delivery order dispatched / shipped | Triggered by merchant backend sync or admin status update |
| `delivered` | Delivery done / completed | Should trigger customer notification |
| `cancelled` | Cancelled quotation/order | Must preserve cancellation reason when available |

Payment settlement is separate from order status. For example, an online-card order can be `placed` while settlement is `pending`, then move to `captured` through the payment webhook.

### Failure Behavior

The adapter must classify failures clearly:

- `ORDER_WRITE_BACK_VALIDATION_FAILED`: missing customer, line item, mapping, address, or pricing data. Not retryable until data is fixed.
- `ORDER_WRITE_BACK_UPSTREAM_UNAVAILABLE`: Odoo/network timeout or 5xx. Retryable.
- `ORDER_WRITE_BACK_AUTH_FAILED`: invalid Odoo credentials or permission issue. Not retryable without configuration change.
- `ORDER_WRITE_BACK_IDEMPOTENT_REPLAY`: retry detected and existing merchant order returned successfully.

Checkout must not present an order as confirmed unless `OrderProvider.place` returns `{ ok: true }`. If the payment intent succeeds but order write-back fails, the payment/order reconciliation runbook must be followed before go-live with the real gateway.

### Live Verification When Client Odoo Is Ready

Before production switch:

- [ ] Confirm the client exposes or accepts the required order fields above.
- [ ] Confirm product ID mapping from storefront product IDs to Odoo product IDs.
- [ ] Confirm fulfillment and payment method mapping.
- [ ] Create one COD order in staging and verify it appears in Odoo once.
- [ ] Retry the exact same placement request and verify no duplicate Odoo order is created.
- [ ] Cancel/update the order and verify status sync behavior.
- [ ] Confirm support staff can search Odoo by platform order ID and payment reference.
