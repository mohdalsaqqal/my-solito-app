# 08 Search & Discovery

Status: `[x]`

## Goal

Deliver full-text search, facets, filters, sorting, typo tolerance, indexing, and listing UI through `SearchProvider`.

## Current State

- [x] Search service delegates to `SearchProvider`.
- [x] Mock search adapter exists.
- [x] Meilisearch adapter implemented — `packages/adapters/meilisearch/`. Verification: `yarn verify:meilisearch-adapter`.
- [x] Facets, filters, sort, typo tolerance, provider health, and indexing dry-run are locally verified.
- [~] Live Meilisearch deployment verification remains external.

## Tasks

- [x] Add Meilisearch adapter.
- [x] Add indexing pipeline from catalog provider.
- [x] Add facet/filter/sort health checks.
- [x] Add search smoke covering common queries.

## Verification

```bash
node scripts/guard-checks.mjs
yarn verify:search-discovery
node scripts/verify-delivery.mjs --profile search
```

Focused search service tests and Meilisearch adapter tests are included in `yarn verify:search-discovery`.

## Blockers

- Live Meilisearch deployment details not selected.
