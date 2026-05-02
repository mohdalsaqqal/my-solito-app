# Shopify REST Adapter Scope

This runbook defines the minimum Shopify REST adapter scope for the commerce platform. It is intentionally limited to the provider contracts needed by the storefront and checkout path.

## Architecture

```
Storefront UI
-> Next.js server services
-> Provider registry
-> Shopify adapter
-> Shopify Admin REST API
```

The Shopify adapter must live under `packages/adapters/shopify/`. UI, shared screens, and server services must not call Shopify directly.

## Environment Contract

| Variable | Description |
|---|---|
| `USE_MOCK=false` | Required to route away from mock providers |
| `SHOPIFY_STORE_DOMAIN` | Shop domain, for example `client.myshopify.com` |
| `SHOPIFY_ADMIN_ACCESS_TOKEN` | Admin API access token |
| `SHOPIFY_ADMIN_API_VERSION` | Admin API version string configured per client |
| `SHOPIFY_WEBHOOK_SECRET` | Secret used to verify Shopify webhook signatures |

Do not store these values in code or shared packages.

## Provider Scope

| Provider | Required Methods | Shopify Responsibility |
|---|---|---|
| `ProductQueryProvider` | `list`, `get` | Products, variants, images, inventory, prices |
| `CategoryProvider` | `list`, `tree`, `getBySlug` | Collections as storefront categories |
| `BrandProvider` | `list`, `getBySlug` | Product vendor values normalized into brands |
| `OrderProvider` | `place`, `get`, `list`, `updateStatus` | Create merchant order, read customer orders, sync status |
| `SearchProvider` | Optional in v1 | Prefer Meilisearch for search; Shopify search can be fallback only |

Payment stays behind `PaymentProvider`. The Shopify adapter can store payment references on orders but must not own custom gateway redirects or webhook settlement.

## Product Mapping

| Shopify Field | Canonical Field | Notes |
|---|---|---|
| `product.id` | `sourceMeta.externalId` | Preserve Shopify ID for order write-back |
| `product.title` | `name` | |
| `product.body_html` | `description` | Sanitize/normalize in adapter |
| `product.vendor` | `brand` | Also feeds `BrandProvider` |
| `product.product_type` / collection | `category` | Client mapping required |
| `variant.id` | variant external ID | Required for order lines |
| `variant.price` | `price` | Use selected variant price |
| `variant.compare_at_price` | `compareAtPrice` | Only when greater than price |
| `variant.inventory_quantity` | `stock` | Inventory behavior depends on Shopify settings |
| `image.src` | `image` | First image default; gallery can be added later |

The adapter must preserve both product and variant external IDs. Order placement should use the Shopify variant ID when available.

## Category And Brand Mapping

- Shopify collections map to canonical categories.
- Collection handle maps to category slug.
- Parent/child category trees are not native Shopify REST behavior; if the client needs hierarchy, define it in CMS/tenant config.
- Product vendors map to brands.
- Brand slug is normalized from vendor name unless the client supplies a mapping table.

## Order Write-Back Scope

The Shopify `OrderProvider.place(input)` implementation must:

- Create one Shopify order per accepted platform order.
- Use platform order/quote identity as idempotency metadata.
- Use Shopify variant IDs for line items whenever possible.
- Store platform order ID, payment intent ID, referral metadata, and loyalty metadata as order note attributes or metafields.
- Return canonical `Order`.
- Treat duplicate retries as idempotent replay, not a new order.

Required line-item mapping:

- product canonical ID
- Shopify variant external ID
- quantity
- quoted unit price
- currency
- applied discounts, referral, and loyalty metadata when present

## Webhooks

The Shopify adapter should support these webhook events when order/status sync is enabled:

- order created/updated/cancelled
- fulfillment created/updated
- product updated/deleted
- inventory level updated

All webhooks must verify `SHOPIFY_WEBHOOK_SECRET` before mutating local state or search indexes.

## Pagination And Rate Limits

- Catalog reads must support cursor/page based pagination internally.
- Adapter calls must respect Shopify rate limits and retry only safe retryable failures.
- Bulk catalog sync should be a background/indexing task, not a storefront request path.

## Implementation Files

Planned files:

- `packages/adapters/shopify/client.ts`
- `packages/adapters/shopify/product-adapter.ts`
- `packages/adapters/shopify/category-adapter.ts`
- `packages/adapters/shopify/brand-adapter.ts`
- `packages/adapters/shopify/order-adapter.ts`
- `packages/adapters/shopify/index.ts`
- `packages/adapters/shopify/__tests__/shopify-data-mapping.test.ts`
- `scripts/smoke-shopify-connection.mjs`

## Verification Before Go-Live

```bash
node scripts/smoke-shopify-adapter-scope.mjs
node scripts/guard-checks.mjs
```

When the real adapter lands:

- [ ] Static smoke validates env vars, adapter topology, and provider method conformance.
- [ ] Live health smoke validates products, collections, vendor-derived brands, and one order write-back in a staging Shopify store.
- [ ] Retry the same order placement and verify no duplicate Shopify order is created.
- [ ] Verify product/variant IDs from catalog reads are accepted by order write-back.
- [ ] Verify webhooks reject invalid signatures.
