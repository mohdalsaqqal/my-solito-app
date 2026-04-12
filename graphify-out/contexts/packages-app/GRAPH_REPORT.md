# Graph Report - packages/app  (2026-04-12)

## Corpus Check
- 98 files · ~57,326 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 329 nodes · 483 edges · 33 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## God Nodes (most connected - your core abstractions)
1. `trackMenuEvent()` - 6 edges
2. `buildProductCardModel()` - 6 edges
3. `buildProductCardModelFromHomeItem()` - 6 edges
4. `buildProductCardModelFromSearchSuggestion()` - 6 edges
5. `inferFormattedTitle()` - 6 edges
6. `buildBadgesFromProduct()` - 5 edges
7. `buildBadgesFromHomeItem()` - 5 edges
8. `buildPriceBlock()` - 5 edges
9. `buildCompareAtBlock()` - 5 edges
10. `buildHomeProductItem()` - 5 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Communities

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (3): localizeCopy(), mapCampaign(), resolveMarketingCampaign()

### Community 1 - "Community 1"
Cohesion: 0.09
Nodes (2): mapHeroItems(), renderHeroBlock()

### Community 2 - "Community 2"
Cohesion: 0.11
Nodes (12): emitMenuAnalytics(), handleAccountPress(), handleBrandPress(), handleCommitSearch(), handleFeaturedSlotPress(), handleMegaLinkPress(), handleMegaSectionPress(), handleSelectSuggestion() (+4 more)

### Community 3 - "Community 3"
Cohesion: 0.1
Nodes (7): deriveBrand(), deriveProductName(), toHomeProductItem(), handlePopState(), parseQueryState(), serializeQueryState(), writeQueryState()

### Community 4 - "Community 4"
Cohesion: 0.13
Nodes (7): formatDate(), formatNumber(), formatPercentage(), formatPrice(), resolveIntlLocale(), changeLocale(), initI18n()

### Community 5 - "Community 5"
Cohesion: 0.16
Nodes (10): createHomePagePayload(), createPagePayload(), collectReleaseQueryUsages(), getBlockQueryReference(), getProductQueryResolverInput(), isBlank(), validateBlockQueryReference(), isBlank() (+2 more)

### Community 6 - "Community 6"
Cohesion: 0.13
Nodes (4): handleSaveAddress(), resetAddressForm(), createApiClient(), normalizeBaseUrl()

### Community 7 - "Community 7"
Cohesion: 0.29
Nodes (14): appendUniqueBadge(), buildBadgesFromHomeItem(), buildBadgesFromProduct(), buildCompareAtBlock(), buildDiscountBadge(), buildPriceBlock(), buildProductCardModel(), buildProductCardModelFromHomeItem() (+6 more)

### Community 8 - "Community 8"
Cohesion: 0.15
Nodes (3): HeroBlockComponent(), HeroCarouselBlockComponent(), mapHeroItems()

### Community 9 - "Community 9"
Cohesion: 0.24
Nodes (12): buildReferralAccountSummary(), buildReferralAnalyticsSummary(), buildReferralRewardSummary(), isReferralProfileVisible(), normalizeMinimumOrderAmount(), normalizeReferralApplyRequest(), normalizeReferralCode(), normalizeReferralProgramSettings() (+4 more)

### Community 10 - "Community 10"
Cohesion: 0.21
Nodes (10): buildInput(), getRecommendationSelectionKey(), handleCreateDraft(), handleCustomerSearch(), handleStartQrScan(), handleSubmit(), normalizeProductId(), resolveRecommendationId() (+2 more)

### Community 11 - "Community 11"
Cohesion: 0.24
Nodes (6): isRtlLocale(), normalizeLanguageTag(), resolveDirection(), resolveLocale(), resolveLocaleAndDirectionFromAcceptLanguage(), resolveLocaleFromAcceptLanguage()

### Community 12 - "Community 12"
Cohesion: 0.26
Nodes (8): applyReward(), calculatePromotionTotals(), isEligible(), isPromotionActive(), matchCondition(), normalizeCouponCode(), pickHighestPriorityPromotion(), round2()

### Community 13 - "Community 13"
Cohesion: 0.38
Nodes (9): buildHomeProductItem(), extractTailSubtitle(), formatBrand(), formatCurrency(), inferFormattedTitle(), inferPricePerUnitLabel(), inferProductAttributes(), stripBrandPrefix() (+1 more)

### Community 14 - "Community 14"
Cohesion: 0.31
Nodes (7): localizePath(), normalizeLocale(), notify(), readLocaleFromCookie(), readWindowLocation(), resolveInitialLocale(), setCurrentLocale()

### Community 15 - "Community 15"
Cohesion: 0.67
Nodes (5): loadAsyncStorage(), pushRecentlyViewedProductId(), readRaw(), readRecentlyViewedProductIds(), writeRaw()

### Community 16 - "Community 16"
Cohesion: 0.7
Nodes (4): pushRecentlyViewedProductId(), readRaw(), readRecentlyViewedProductIds(), writeRaw()

### Community 17 - "Community 17"
Cohesion: 0.4
Nodes (0): 

### Community 18 - "Community 18"
Cohesion: 0.5
Nodes (2): getValidationError(), handlePlaceOrder()

### Community 19 - "Community 19"
Cohesion: 0.67
Nodes (0): 

### Community 20 - "Community 20"
Cohesion: 1.0
Nodes (0): 

### Community 21 - "Community 21"
Cohesion: 1.0
Nodes (0): 

### Community 22 - "Community 22"
Cohesion: 1.0
Nodes (0): 

### Community 23 - "Community 23"
Cohesion: 1.0
Nodes (0): 

### Community 24 - "Community 24"
Cohesion: 1.0
Nodes (0): 

### Community 25 - "Community 25"
Cohesion: 1.0
Nodes (0): 

### Community 26 - "Community 26"
Cohesion: 1.0
Nodes (0): 

### Community 27 - "Community 27"
Cohesion: 1.0
Nodes (0): 

### Community 28 - "Community 28"
Cohesion: 1.0
Nodes (0): 

### Community 29 - "Community 29"
Cohesion: 1.0
Nodes (0): 

### Community 30 - "Community 30"
Cohesion: 1.0
Nodes (0): 

### Community 31 - "Community 31"
Cohesion: 1.0
Nodes (0): 

### Community 32 - "Community 32"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **Thin community `Community 20`** (2 nodes): `AuthRegisterScreen.tsx`, `AuthRegisterScreen()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (2 nodes): `storefrontCommercePhase4.test.ts`, `readScreen()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (1 nodes): `rnw-overrides.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (1 nodes): `detail-screen.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (1 nodes): `query-references.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (1 nodes): `release-publish-readiness.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (1 nodes): `i18next.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (1 nodes): `AccountQrPreview.native.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (1 nodes): `authLoginScreenContract.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (1 nodes): `CheckoutSuccessScreen.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (1 nodes): `HomeScreen.block-renderer.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (1 nodes): `SearchResultsScreen.block-renderer.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (1 nodes): `HomeV2Sections.block-renderer.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._
- **Should `Community 6` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._