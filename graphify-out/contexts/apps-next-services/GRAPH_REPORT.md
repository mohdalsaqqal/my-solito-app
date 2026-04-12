# Graph Report - apps/next/server/services  (2026-04-12)

## Corpus Check
- Corpus is ~15,576 words - fits in a single context window. You may not need a graph.

## Summary
- 173 nodes · 261 edges · 14 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## God Nodes (most connected - your core abstractions)
1. `buildSearchPayload()` - 9 edges
2. `validateMenuPayload()` - 6 edges
3. `textForLocale()` - 6 edges
4. `resolveItemHref()` - 6 edges
5. `runAdminCacheAction()` - 5 edges
6. `normalizeMenuInput()` - 5 edges
7. `resolveMegaSection()` - 5 edges
8. `validateMegaConfig()` - 4 edges
9. `updateAdminMenu()` - 4 edges
10. `loadAllQueryUsages()` - 4 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Communities

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (5): buildReferralPricing(), createCheckoutQuote(), readSession(), toSafeItems(), ServiceError

### Community 1 - "Community 1"
Cohesion: 0.2
Nodes (12): collectItemIds(), createAdminMenu(), getAdminMenu(), normalizeMenuInput(), normalizeMenuItems(), trimOrUndefined(), updateAdminMenu(), validateBrandRail() (+4 more)

### Community 2 - "Community 2"
Cohesion: 0.15
Nodes (10): getAccountPageInitialData(), toErrorMessage(), getCheckoutSuccessPageInitialData(), toErrorMessage(), getOrderDetailPageInitialData(), toErrorMessage(), listProducts(), listProductsForRequest() (+2 more)

### Community 3 - "Community 3"
Cohesion: 0.15
Nodes (8): createEmptyAccountTestDetailPageData(), getAccountTestDetailPageInitialData(), toErrorMessage(), getCartPageInitialData(), toErrorMessage(), dropLog(), getCachedHomeCmsResponseData(), getHomeCmsResponseData()

### Community 4 - "Community 4"
Cohesion: 0.28
Nodes (12): buildBrandSuggestions(), buildPopularBrands(), buildProductSuggestions(), buildSearchPageBlocks(), buildSearchPayload(), buildTrending(), extractBrand(), getCachedSearchDiscovery() (+4 more)

### Community 5 - "Community 5"
Cohesion: 0.2
Nodes (8): getCategoriesPageInitialData(), toErrorMessage(), getCachedPublicProductData(), getProductPageInitialData(), toErrorMessage(), getCachedPublicCatalogCollections(), getPublicCatalogCollections(), getPublicCatalogCollectionsCore()

### Community 6 - "Community 6"
Cohesion: 0.35
Nodes (11): attachResolvedShellMenus(), normalizeSlug(), resolveBrandRail(), resolveColumn(), resolveFeaturedSlot(), resolveItemHref(), resolveLink(), resolveMegaSection() (+3 more)

### Community 7 - "Community 7"
Cohesion: 0.22
Nodes (4): getHomePageInitialData(), toErrorMessage(), extractHomeBlocks(), hasPublishedBlocks()

### Community 8 - "Community 8"
Cohesion: 0.33
Nodes (6): createAdminProductQuery(), deleteAdminProductQuery(), getAdminProductQuery(), listAdminProductQueries(), loadAllQueryUsages(), normalizeTitle()

### Community 9 - "Community 9"
Cohesion: 0.33
Nodes (6): isSameAddress(), normalizeAddressValue(), persistPlacedOrder(), placeOrder(), readSession(), readStoredOrders()

### Community 10 - "Community 10"
Cohesion: 0.43
Nodes (6): getAdminCacheAudit(), purgeCdn(), readAuditEntries(), runAdminCacheAction(), validateAction(), writeAuditEntries()

### Community 11 - "Community 11"
Cohesion: 0.5
Nodes (2): getAccessibleOrder(), isOwnOrder()

### Community 12 - "Community 12"
Cohesion: 0.67
Nodes (2): getCheckoutPageInitialData(), toErrorMessage()

### Community 13 - "Community 13"
Cohesion: 0.67
Nodes (0): 

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._