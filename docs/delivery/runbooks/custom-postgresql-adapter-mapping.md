# Custom PostgreSQL Adapter Mapping

This runbook defines how to connect a merchant-owned PostgreSQL catalog/order database while keeping the platform architecture intact.

## Architecture

```
Storefront UI
-> Next.js server services
-> Provider registry
-> Custom PostgreSQL adapter
-> Merchant PostgreSQL database or read replica
```

The adapter must live under `packages/adapters/postgresql/`. UI, shared screens, and server services must not import database clients or run merchant SQL directly.

## Environment Contract

| Variable | Description |
|---|---|
| `USE_MOCK=false` | Required to route away from mock providers |
| `MERCHANT_POSTGRES_URL` | Merchant database connection string or read/write proxy URL |
| `MERCHANT_POSTGRES_SCHEMA` | Optional schema name, default agreed per client |
| `MERCHANT_POSTGRES_SSL` | Whether SSL is required |
| `MERCHANT_POSTGRES_READONLY` | `true` for catalog-only integrations |

Secrets must come from the deployment secret manager, not code.

## Provider Scope

| Provider | Required Methods | PostgreSQL Responsibility |
|---|---|---|
| `ProductQueryProvider` | `list`, `get` | Product/variant/price/inventory reads |
| `CategoryProvider` | `list`, `tree`, `getBySlug` | Category reads and hierarchy |
| `BrandProvider` | `list`, `getBySlug` | Brand reads |
| `OrderProvider` | `place`, `get`, `list`, `updateStatus` | Required only when merchant DB accepts order writes |
| `SearchProvider` | Optional | Prefer Meilisearch; database search is fallback only |

If the merchant database is read-only, order write-back must use a separate order API adapter or stay disabled until a write path exists.

## Canonical Product Mapping

| Merchant Column | Canonical Field | Requirement |
|---|---|---|
| product primary key | `id`, `sourceMeta.externalId` | Stable, never reused |
| product name | `name` | Required |
| description | `description` | Optional but recommended |
| brand key/name | `brand` | Required for brand filters |
| category key/name | `category` | Required for category filters |
| SKU | `vendor_sku` or source metadata | Required for support/order lookup |
| barcode | `erp_line_code` or source metadata | Optional |
| variant key | variant external ID | Required when variants exist |
| price | `price` | Required, quoted currency |
| compare price | `compareAtPrice` | Optional |
| currency | `currency` | Required; default must be explicit |
| inventory quantity | `stock` | Required for checkout availability |
| image URL | `image` | Required for storefront card quality |
| active/sellable flag | storefront eligibility | Non-sellable records must be hidden or marked unavailable |

## Category Mapping

- Category IDs must be stable.
- Slugs must be unique per tenant.
- Parent category ID is optional but required when hierarchy exists.
- Inactive categories must not appear in customer navigation.

## Brand Mapping

- Brand IDs/slugs must be stable.
- Brand names should support localized labels when available.
- Inactive brands must not appear in customer filters.

## Order Write-Back Mapping

If the merchant database accepts order writes, `OrderProvider.place(input)` must write through a transaction.

Required order tables or equivalent:

- order header: platform order ID, idempotency key, customer reference, totals, currency, fulfillment, status, timestamps
- order lines: product external ID, variant external ID if present, SKU, quantity, quoted unit price, currency
- payment metadata: payment method, payment intent/reference, settlement status
- referral metadata: code, profile ID, reward values when applied
- loyalty metadata: points spent, points earned, discount value when applied

Idempotency rule:

- Unique key on `tenantId + idempotencyKey`.
- Retry with the same idempotency key must return the existing order.
- Partial failed transactions must rollback completely.

## Query Safety

- Use parameterized SQL or a typed query builder. No string-concatenated SQL.
- Scope every production query by tenant when the platform database is shared-ready.
- Apply conservative limits on catalog reads.
- Do not join customer PII into public catalog reads.
- Prefer a read replica for catalog browsing when the merchant allows it.

## Implementation Files

Planned files:

- `packages/adapters/postgresql/client.ts`
- `packages/adapters/postgresql/product-adapter.ts`
- `packages/adapters/postgresql/category-adapter.ts`
- `packages/adapters/postgresql/brand-adapter.ts`
- `packages/adapters/postgresql/order-adapter.ts`
- `packages/adapters/postgresql/index.ts`
- `packages/adapters/postgresql/__tests__/postgresql-data-mapping.test.ts`
- `scripts/smoke-postgresql-connection.mjs`

## Verification Before Go-Live

```bash
node scripts/smoke-postgresql-adapter-mapping.mjs
node scripts/guard-checks.mjs
```

When the real adapter lands:

- [ ] Static smoke validates env vars, adapter topology, and provider method conformance.
- [ ] Live health smoke validates product, category, brand, inventory, and price reads.
- [ ] Order write-back smoke creates one staging order through `OrderProvider.place`.
- [ ] Retry the same order placement and verify no duplicate order rows.
- [ ] Confirm all catalog queries are bounded and parameterized.
- [ ] Confirm read-only merchant databases do not expose order write paths.
