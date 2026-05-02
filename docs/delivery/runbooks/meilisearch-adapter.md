# Meilisearch Search Adapter Runbook

This runbook defines how the storefront search provider connects to Meilisearch.

## Architecture

```
Search UI
-> Next.js search service
-> SearchProvider
-> Meilisearch adapter
-> Meilisearch products index
```

The adapter lives under `packages/adapters/meilisearch/` and is selected by the provider registry only when `USE_MEILISEARCH=true` and `MEILISEARCH_HOST` are configured.

## Environment Contract

| Variable | Description |
|---|---|
| `USE_MEILISEARCH` | Set to `true` to route `SearchProvider` through Meilisearch |
| `MEILISEARCH_HOST` | Meilisearch host URL |
| `MEILISEARCH_API_KEY` | Search API key |
| `MEILISEARCH_PRODUCTS_INDEX` | Products index name; supports `{tenantId}` and `{storeId}` placeholders |

## Document Contract

The products index must include enough fields to build search results and suggestions.

| Field | Required | Notes |
|---|---|---|
| `id` | Yes | Canonical product or variant ID used for product detail links |
| `name` or `title` | Yes | Display label |
| `description` | No | Used for product result text |
| `price` | Yes | Search result price |
| `currency` | Yes | Defaults only for local fallback; production should index it |
| `image`, `imageUrl`, or `image_url` | Recommended | Search/product card image |
| `brand`, `brandName`, or `brand_name` | Recommended | Used for brand suggestions and popular brands |
| `compareAtPrice` or `compare_at_price` | No | Used for strike-through/discount display |
| `discountLabel` or `discount_label` | No | Optional display label |
| `href` | No | Defaults to `/product/:id` |
| `category`, `categoryName`, or `category_name` | Recommended | Used for category facets |
| `stock` | Recommended | Used for in-stock filtering |
| `reviews` | No | Used for bestseller sorting |
| `createdAt` | No | Used for newest sorting |

## Provider Behavior

- `SearchProvider.search` posts to `/indexes/:index/search`.
- The adapter returns canonical products, product suggestions, brand suggestions, trending searches, and popular brands.
- Search requests include facet fields, optional filters, and optional sort criteria.
- `SearchProvider.health` calls `/health`, reads `/indexes/:index/settings`, and reports the resolved index name, filterable attributes, sortable attributes, and typo-tolerance status.
- Search errors fail closed with provider error codes; the Next.js search service already handles provider failures without calling catalog discovery directly.

## Indexing Pipeline

The indexing pipeline is `scripts/sync-meilisearch-products.ts`.

Required indexing path:

1. Read canonical product/category/brand data through providers or a server-owned sync job.
2. Normalize product/variant documents to the document contract above.
3. Write documents to the configured Meilisearch index.
4. Configure searchable/filterable/sortable attributes in Meilisearch.
5. Reindex on product, price, inventory, brand, category, and image changes.

Do not index directly from shared UI or shared screens.

Local dry-run:

```bash
yarn node node_modules/tsx/dist/cli.mjs scripts/sync-meilisearch-products.ts --dry-run
```

Live sync requires `MEILISEARCH_HOST` and optional `MEILISEARCH_API_KEY`:

```bash
USE_MEILISEARCH=true MEILISEARCH_HOST=https://search.example.com MEILISEARCH_PRODUCTS_INDEX=products_{tenantId} yarn node node_modules/tsx/dist/cli.mjs scripts/sync-meilisearch-products.ts
```

The script writes these settings before uploading documents:

```json
{
  "searchableAttributes": ["name", "description", "brand", "category"],
  "filterableAttributes": ["brand", "category", "price", "stock"],
  "sortableAttributes": ["price", "reviews", "createdAt"],
  "typoTolerance": { "enabled": true }
}
```

## Facets, Filters, And Sort

Supported query params:

| Param | Example | Provider field |
|---|---|---|
| `brand` | `brand=Real Beauty` or repeated/comma-separated | `filters.brands` |
| `category` | `category=Serum` | `filters.categories` |
| `minPrice` | `minPrice=10` | `filters.minPrice` |
| `maxPrice` | `maxPrice=50` | `filters.maxPrice` |
| `inStock` | `inStock=true` | `filters.inStock` |
| `sort` | `price_asc`, `price_desc`, `newest`, `bestseller`, `relevance` | `sort` |

## Verification

```bash
yarn verify:meilisearch-adapter
yarn verify:search-discovery
node scripts/guard-checks.mjs
```

Live verification when Meilisearch is provisioned:

- [ ] `USE_MEILISEARCH=true`
- [ ] `MEILISEARCH_HOST`, `MEILISEARCH_API_KEY`, and `MEILISEARCH_PRODUCTS_INDEX` configured.
- [ ] Search health returns indexed=true.
- [ ] Product search returns expected products.
- [ ] Brand suggestions render from indexed brand fields.
- [ ] Facets/filter/sort configuration is validated against the live provisioned index.
