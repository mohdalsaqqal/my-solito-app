# Graph Report - .  (2026-04-12)

## Corpus Check
- 778 files · ~1,115,749 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1799 nodes · 2850 edges · 123 communities detected
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 15 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## God Nodes (most connected - your core abstractions)
1. `handleSave()` - 13 edges
2. `POST()` - 13 edges
3. `load()` - 9 edges
4. `handleDelete()` - 9 edges
5. `buildSearchPayload()` - 9 edges
6. `MockHttpClient` - 9 edges
7. `async()` - 8 edges
8. `collectPayload()` - 8 edges
9. `MockHttpClient` - 8 edges
10. `HttpClient` - 8 edges

## Surprising Connections (you probably didn't know these)
- `handleSave()` --calls--> `safeParseJson()`  [EXTRACTED]
  apps\next\app\admin\marketing\promotions\page.tsx → apps\next\app\admin\marketing\cms\menus\page.tsx
- `handleSync()` --calls--> `load()`  [EXTRACTED]
  apps\next\app\admin\catalog\brands\page.tsx → apps\next\app\admin\operations\translations\page.tsx
- `removeQuery()` --calls--> `load()`  [EXTRACTED]
  apps\next\app\admin\catalog\queries\page.tsx → apps\next\app\admin\operations\translations\page.tsx
- `load()` --calls--> `evaluatePublishability()`  [EXTRACTED]
  apps\next\app\admin\operations\translations\page.tsx → apps\next\app\admin\marketing\cms\releases\page.tsx
- `confirmCreateRelease()` --calls--> `load()`  [EXTRACTED]
  apps\next\app\admin\marketing\cms\releases\page.tsx → apps\next\app\admin\operations\translations\page.tsx

## Communities

### Community 0 - "Account & Auth Pages"
Cohesion: 0.02
Nodes (26): extractHost(), resolveDevBaseUrl(), localizeCopy(), mapCampaign(), resolveMarketingCampaign(), getValidationError(), handlePlaceOrder(), NetworksClient (+18 more)

### Community 1 - "Page Islands & Cart UI"
Cohesion: 0.02
Nodes (63): addItem(), createEmptyItem(), addBanner(), addItem(), async(), buildDefaultPayload(), buildReward(), clearMessages() (+55 more)

### Community 2 - "UI Component Library"
Cohesion: 0.02
Nodes (4): Card(), resolveCardSurfaceStyle(), ToggleGroupItem(), useToggleGroupContext()

### Community 3 - "Service Layer (Account, Orders)"
Cohesion: 0.02
Nodes (76): createEmptyAccountTestDetailPageData(), getAccountTestDetailPageInitialData(), toErrorMessage(), initialState(), readBannersState(), initialState(), readCacheSettings(), writeCacheSettings() (+68 more)

### Community 4 - "Expo App & Storage API"
Cohesion: 0.04
Nodes (28): handleCreateBrand(), handleDeleteBrand(), loadBrands(), handleCreateCategory(), handleDeleteCategory(), loadCategories(), handleToggleStatus(), loadCustomers() (+20 more)

### Community 5 - "Odoo Adapter & Brand Mapping"
Cohesion: 0.03
Nodes (24): applyFilters(), applySort(), buildLoyaltyWallet(), buildSeedPromotions(), buildTierProgress(), changeLocale(), ensureLoyaltyState(), initI18n() (+16 more)

### Community 6 - "Auth Session & Cookies"
Cohesion: 0.05
Nodes (38): buildAuthSessionCookieHeader(), decryptSessionPayload(), deriveEncryptionKey(), encryptSessionPayload(), isAuthRole(), parseAuthSessionCookie(), parseLegacySignedSessionCookie(), signSessionPayload() (+30 more)

### Community 7 - "Admin Permissions & Shell"
Cohesion: 0.03
Nodes (5): buildRateLimitKey(), getClientIp(), hashFingerprint(), MemoryRateLimitStore, RateLimiter

### Community 8 - "CMS Block Registry"
Cohesion: 0.05
Nodes (10): HeroBlockComponent(), HeroCarouselBlockComponent(), mapHeroItems(), extractHomeBlocks(), hasPublishedBlocks(), buildLayoutProfile(), resolveCardHeight(), resolveCardWidth() (+2 more)

### Community 9 - "Admin Entity List & Pagination"
Cohesion: 0.04
Nodes (29): applyView(), resetPagination(), toggleColumn(), formatDateTime(), JobNoticePanel(), async(), hydrateForm(), loadInventory() (+21 more)

### Community 10 - "Account & Test Detail Services"
Cohesion: 0.06
Nodes (41): getAccountPageInitialData(), toErrorMessage(), createApiClient(), normalizeBaseUrl(), buildReferralPricing(), createCheckoutQuote(), readSession(), toSafeItems() (+33 more)

### Community 11 - "Admin Site Config Store"
Cohesion: 0.07
Nodes (16): initialState(), mergeSiteConfigState(), normalizeBranding(), normalizeLogoSize(), normalizeSiteConfigState(), normalizeText(), readSiteConfig(), writeSiteConfig() (+8 more)

### Community 12 - "Locale & Page Schema"
Cohesion: 0.09
Nodes (26): createHomePagePayload(), createPagePayload(), collectReleaseQueryUsages(), getBlockQueryReference(), getProductQueryResolverInput(), isBlank(), validateBlockQueryReference(), isBlank() (+18 more)

### Community 13 - "Admin Controls Store & Audit"
Cohesion: 0.09
Nodes (23): initialState(), readAdminControlsState(), readUserOverridesFile(), writeAdminControlsState(), writeUserOverridesFile(), collectItemIds(), createAdminMenu(), getAdminMenu() (+15 more)

### Community 14 - "Account Screen (Mobile)"
Cohesion: 0.09
Nodes (14): handleSaveAddress(), resetAddressForm(), formatDate(), formatNumber(), formatPercentage(), formatPrice(), resolveIntlLocale(), localizePath() (+6 more)

### Community 15 - "Legacy Home Screen"
Cohesion: 0.12
Nodes (17): deriveBrand(), deriveProductName(), toHomeProductItem(), appendUniqueBadge(), buildBadgesFromHomeItem(), buildBadgesFromProduct(), buildCompareAtBlock(), buildDiscountBadge() (+9 more)

### Community 16 - "Nav Header & Menus"
Cohesion: 0.11
Nodes (12): emitMenuAnalytics(), handleAccountPress(), handleBrandPress(), handleCommitSearch(), handleFeaturedSlotPress(), handleMegaLinkPress(), handleMegaSectionPress(), handleSelectSuggestion() (+4 more)

### Community 17 - "Editorial & Figma Home Data"
Cohesion: 0.1
Nodes (6): buildHeroPanelGradientFromRgb(), buildOfferBannerGradientFromRgb(), clampChannel(), hashImageUrlToRgb(), mixRgb(), rgbWithAlpha()

### Community 18 - "ECT Inspector & Dev Tools"
Cohesion: 0.17
Nodes (16): collectPayload(), compactText(), copyText(), createSelector(), escapeHtml(), findDebugSource(), findReactFiber(), getComponentChain() (+8 more)

### Community 19 - "Order Placement Service"
Cohesion: 0.17
Nodes (10): isSameAddress(), normalizeAddressValue(), persistPlacedOrder(), placeOrder(), readSession(), readStoredOrders(), buildCartHash(), normalizeCouponCode() (+2 more)

### Community 20 - "Module Group 20"
Cohesion: 0.2
Nodes (8): OdooClient, main(), migrateAdminControls(), migrateEducationBanners(), migrateSiteConfig(), migrateTickerItems(), migrateTickerSettings(), migrateUGCItems()

### Community 21 - "Module Group 21"
Cohesion: 0.16
Nodes (6): emitNativeScrollOffset(), normalizeOffsetY(), HeaderSlot(), usePageScaffold(), resolveTone(), Section()

### Community 22 - "Module Group 22"
Cohesion: 0.21
Nodes (10): buildInput(), getRecommendationSelectionKey(), handleCreateDraft(), handleCustomerSearch(), handleStartQrScan(), handleSubmit(), normalizeProductId(), resolveRecommendationId() (+2 more)

### Community 23 - "Module Group 23"
Cohesion: 0.35
Nodes (11): attachResolvedShellMenus(), normalizeSlug(), resolveBrandRail(), resolveColumn(), resolveFeaturedSlot(), resolveItemHref(), resolveLink(), resolveMegaSection() (+3 more)

### Community 24 - "Module Group 24"
Cohesion: 0.18
Nodes (2): handleNetworksWebhookInline(), MockNetworksClient

### Community 25 - "Module Group 25"
Cohesion: 0.26
Nodes (8): applyReward(), calculatePromotionTotals(), isEligible(), isPromotionActive(), matchCondition(), normalizeCouponCode(), pickHighestPriorityPromotion(), round2()

### Community 26 - "Module Group 26"
Cohesion: 0.24
Nodes (2): createTestAdapters(), MockHttpClient

### Community 27 - "Module Group 27"
Cohesion: 0.31
Nodes (3): HttpClient, isHttpError(), sleep()

### Community 28 - "Module Group 28"
Cohesion: 0.22
Nodes (1): MockHttpClient

### Community 29 - "Module Group 29"
Cohesion: 0.42
Nodes (6): isRtlLocale(), normalizeLanguageTag(), resolveDirection(), resolveLocale(), resolveLocaleAndDirectionFromAcceptLanguage(), resolveLocaleFromAcceptLanguage()

### Community 30 - "Module Group 30"
Cohesion: 0.22
Nodes (9): Awesome Strapi, Strapi Application, Strapi CLI, Strapi Cloud, Strapi Community Discord, Strapi Official Documentation, Strapi Community Forum, Strapi GitHub Repository (+1 more)

### Community 31 - "Module Group 31"
Cohesion: 0.25
Nodes (0): 

### Community 32 - "Module Group 32"
Cohesion: 0.43
Nodes (6): getAdminCacheAudit(), purgeCdn(), readAuditEntries(), runAdminCacheAction(), validateAction(), writeAuditEntries()

### Community 33 - "Module Group 33"
Cohesion: 0.32
Nodes (3): cloneChild(), composeRefs(), mergeProps()

### Community 34 - "Module Group 34"
Cohesion: 0.29
Nodes (7): Neauthy Skin Care Cream Jar Product Photo, Neauthy Serum Dropper Bottle Product Photo, Neauthy Skin Care Cream Held by Model, Amber Glass Dropper Bottle on Wooden Stand, Skincare Cleanser Tube by Bathroom Sink, Lure Illumination Mask Tube Held by Model, Neauthy Skin Care Cream Held by Model Duplicate

### Community 35 - "Module Group 35"
Cohesion: 0.67
Nodes (5): loadAsyncStorage(), pushRecentlyViewedProductId(), readRaw(), readRecentlyViewedProductIds(), writeRaw()

### Community 36 - "Module Group 36"
Cohesion: 0.5
Nodes (2): initialState(), readAdminCatalogState()

### Community 37 - "Module Group 37"
Cohesion: 0.7
Nodes (4): pushRecentlyViewedProductId(), readRaw(), readRecentlyViewedProductIds(), writeRaw()

### Community 38 - "Module Group 38"
Cohesion: 0.4
Nodes (0): 

### Community 39 - "Module Group 39"
Cohesion: 0.4
Nodes (5): Design Constraint: Not Exported from Package Index, Design Constraint: No RTL Support, Design Constraint: No Token Compliance, Production Components, UI Reference Folder

### Community 40 - "Module Group 40"
Cohesion: 0.5
Nodes (0): 

### Community 41 - "Module Group 41"
Cohesion: 0.5
Nodes (0): 

### Community 42 - "Module Group 42"
Cohesion: 0.5
Nodes (0): 

### Community 43 - "Module Group 43"
Cohesion: 0.5
Nodes (4): Labello Chamomile Lip Balm Hero Banner, Schwarzkopf Mad About Curls Shampoo Hero Banner, Curology Skincare Set Product Photo, Green Tea Farm Scenic Landscape Hero Banner

### Community 44 - "Module Group 44"
Cohesion: 1.0
Nodes (2): Divider(), resolveInset()

### Community 45 - "Module Group 45"
Cohesion: 0.67
Nodes (0): 

### Community 46 - "Module Group 46"
Cohesion: 0.67
Nodes (3): Real Cosmetics Brand Logo Placeholder SVG, Real Cosmetics Endless Beauty Wordmark Logo, Vercel Wordmark SVG Logo

### Community 47 - "Module Group 47"
Cohesion: 0.67
Nodes (3): Playa Hair Snug No More Dry Shampoo CMS Block, Face Facts Ceramide Hydrating Cleanser CMS Block Duplicate, Face Facts Ceramide Hydrating Cleanser CMS Block

### Community 48 - "Module Group 48"
Cohesion: 1.0
Nodes (0): 

### Community 49 - "Module Group 49"
Cohesion: 1.0
Nodes (0): 

### Community 50 - "Module Group 50"
Cohesion: 1.0
Nodes (0): 

### Community 51 - "Module Group 51"
Cohesion: 1.0
Nodes (0): 

### Community 52 - "Module Group 52"
Cohesion: 1.0
Nodes (0): 

### Community 53 - "Module Group 53"
Cohesion: 1.0
Nodes (0): 

### Community 54 - "Module Group 54"
Cohesion: 1.0
Nodes (0): 

### Community 55 - "Module Group 55"
Cohesion: 1.0
Nodes (0): 

### Community 56 - "Module Group 56"
Cohesion: 1.0
Nodes (0): 

### Community 57 - "Module Group 57"
Cohesion: 1.0
Nodes (0): 

### Community 58 - "Module Group 58"
Cohesion: 1.0
Nodes (0): 

### Community 59 - "Module Group 59"
Cohesion: 1.0
Nodes (0): 

### Community 60 - "Module Group 60"
Cohesion: 1.0
Nodes (0): 

### Community 61 - "Module Group 61"
Cohesion: 1.0
Nodes (2): Real Cosmetics Admin AI Studio App, Gemini API

### Community 62 - "Module Group 62"
Cohesion: 1.0
Nodes (2): Female Portrait Photo for Instagram Grid, Female Portrait Hero Tile for Member Section

### Community 63 - "Module Group 63"
Cohesion: 1.0
Nodes (0): 

### Community 64 - "Module Group 64"
Cohesion: 1.0
Nodes (0): 

### Community 65 - "Module Group 65"
Cohesion: 1.0
Nodes (0): 

### Community 66 - "Module Group 66"
Cohesion: 1.0
Nodes (0): 

### Community 67 - "Module Group 67"
Cohesion: 1.0
Nodes (0): 

### Community 68 - "Module Group 68"
Cohesion: 1.0
Nodes (0): 

### Community 69 - "Module Group 69"
Cohesion: 1.0
Nodes (0): 

### Community 70 - "Module Group 70"
Cohesion: 1.0
Nodes (0): 

### Community 71 - "Module Group 71"
Cohesion: 1.0
Nodes (0): 

### Community 72 - "Module Group 72"
Cohesion: 1.0
Nodes (0): 

### Community 73 - "Module Group 73"
Cohesion: 1.0
Nodes (0): 

### Community 74 - "Module Group 74"
Cohesion: 1.0
Nodes (0): 

### Community 75 - "Module Group 75"
Cohesion: 1.0
Nodes (0): 

### Community 76 - "Module Group 76"
Cohesion: 1.0
Nodes (0): 

### Community 77 - "Module Group 77"
Cohesion: 1.0
Nodes (0): 

### Community 78 - "Module Group 78"
Cohesion: 1.0
Nodes (0): 

### Community 79 - "Module Group 79"
Cohesion: 1.0
Nodes (0): 

### Community 80 - "Module Group 80"
Cohesion: 1.0
Nodes (0): 

### Community 81 - "Module Group 81"
Cohesion: 1.0
Nodes (0): 

### Community 82 - "Module Group 82"
Cohesion: 1.0
Nodes (0): 

### Community 83 - "Module Group 83"
Cohesion: 1.0
Nodes (0): 

### Community 84 - "Module Group 84"
Cohesion: 1.0
Nodes (0): 

### Community 85 - "Module Group 85"
Cohesion: 1.0
Nodes (0): 

### Community 86 - "Module Group 86"
Cohesion: 1.0
Nodes (0): 

### Community 87 - "Module Group 87"
Cohesion: 1.0
Nodes (0): 

### Community 88 - "Module Group 88"
Cohesion: 1.0
Nodes (0): 

### Community 89 - "Module Group 89"
Cohesion: 1.0
Nodes (0): 

### Community 90 - "Module Group 90"
Cohesion: 1.0
Nodes (0): 

### Community 91 - "Module Group 91"
Cohesion: 1.0
Nodes (0): 

### Community 92 - "Module Group 92"
Cohesion: 1.0
Nodes (0): 

### Community 93 - "Module Group 93"
Cohesion: 1.0
Nodes (0): 

### Community 94 - "Module Group 94"
Cohesion: 1.0
Nodes (0): 

### Community 95 - "Module Group 95"
Cohesion: 1.0
Nodes (0): 

### Community 96 - "Module Group 96"
Cohesion: 1.0
Nodes (0): 

### Community 97 - "Module Group 97"
Cohesion: 1.0
Nodes (0): 

### Community 98 - "Module Group 98"
Cohesion: 1.0
Nodes (0): 

### Community 99 - "Module Group 99"
Cohesion: 1.0
Nodes (0): 

### Community 100 - "Module Group 100"
Cohesion: 1.0
Nodes (0): 

### Community 101 - "Module Group 101"
Cohesion: 1.0
Nodes (0): 

### Community 102 - "Module Group 102"
Cohesion: 1.0
Nodes (0): 

### Community 103 - "Module Group 103"
Cohesion: 1.0
Nodes (0): 

### Community 104 - "Module Group 104"
Cohesion: 1.0
Nodes (0): 

### Community 105 - "Module Group 105"
Cohesion: 1.0
Nodes (0): 

### Community 106 - "Module Group 106"
Cohesion: 1.0
Nodes (0): 

### Community 107 - "Module Group 107"
Cohesion: 1.0
Nodes (0): 

### Community 108 - "Module Group 108"
Cohesion: 1.0
Nodes (0): 

### Community 109 - "Module Group 109"
Cohesion: 1.0
Nodes (0): 

### Community 110 - "Module Group 110"
Cohesion: 1.0
Nodes (0): 

### Community 111 - "Module Group 111"
Cohesion: 1.0
Nodes (0): 

### Community 112 - "Module Group 112"
Cohesion: 1.0
Nodes (0): 

### Community 113 - "Module Group 113"
Cohesion: 1.0
Nodes (0): 

### Community 114 - "Module Group 114"
Cohesion: 1.0
Nodes (0): 

### Community 115 - "Module Group 115"
Cohesion: 1.0
Nodes (0): 

### Community 116 - "Module Group 116"
Cohesion: 1.0
Nodes (0): 

### Community 117 - "Module Group 117"
Cohesion: 1.0
Nodes (0): 

### Community 118 - "Module Group 118"
Cohesion: 1.0
Nodes (0): 

### Community 119 - "Module Group 119"
Cohesion: 1.0
Nodes (0): 

### Community 120 - "Module Group 120"
Cohesion: 1.0
Nodes (0): 

### Community 121 - "Module Group 121"
Cohesion: 1.0
Nodes (0): 

### Community 122 - "Module Group 122"
Cohesion: 1.0
Nodes (1): Strapi CMS Favicon Icon

## Knowledge Gaps
- **29 isolated node(s):** `Strapi CLI`, `Strapi Cloud`, `Strapi Official Documentation`, `Strapi GitHub Repository`, `Strapi Community Discord` (+24 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Module Group 48`** (2 nodes): `metro.config.js`, `escapeForMetroPath()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 49`** (2 nodes): `route.shape.test.ts`, `readSource()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 50`** (2 nodes): `database.ts`, `config()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 51`** (2 nodes): `plugins.ts`, `config()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 52`** (2 nodes): `networks-security.test.ts`, `createClient()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 53`** (2 nodes): `storefrontCommercePhase4.test.ts`, `readScreen()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 54`** (2 nodes): `Grid.tsx`, `Grid()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 55`** (2 nodes): `primitiveContractCleanup.test.ts`, `readUiFile()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 56`** (2 nodes): `storefrontSurfacePhase3.test.ts`, `readComponent()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 57`** (2 nodes): `FooterLegalRow.tsx`, `FooterLegalRow()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 58`** (2 nodes): `storefrontChromeSurfaceShift.test.ts`, `readChromeFile()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 59`** (2 nodes): `useFontFamily.ts`, `useFontFamily()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 60`** (2 nodes): `accessibility.spec.ts`, `gotoHome()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 61`** (2 nodes): `Real Cosmetics Admin AI Studio App`, `Gemini API`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 62`** (2 nodes): `Female Portrait Photo for Instagram Grid`, `Female Portrait Hero Tile for Member Section`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 63`** (1 nodes): `aspect-ratio.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 64`** (1 nodes): `collapsible.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 65`** (1 nodes): `app-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 66`** (1 nodes): `babel.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 67`** (1 nodes): `tailwind.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 68`** (1 nodes): `uniwind-types.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 69`** (1 nodes): `index.maintenance.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 70`** (1 nodes): `next-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 71`** (1 nodes): `layout.locale-provider.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 72`** (1 nodes): `loading.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 73`** (1 nodes): `page.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 74`** (1 nodes): `layout-versioning.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 75`** (1 nodes): `page-block-editor.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 76`** (1 nodes): `release-persistence.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 77`** (1 nodes): `ClientHomeFeatures.maintenance.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 78`** (1 nodes): `ect-inspector-loader.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 79`** (1 nodes): `qrcode.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 80`** (1 nodes): `middlewares.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 81`** (1 nodes): `vite.config.example.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 82`** (1 nodes): `components.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 83`** (1 nodes): `contentTypes.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 84`** (1 nodes): `products.search.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 85`** (1 nodes): `seed.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 86`** (1 nodes): `rnw-overrides.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 87`** (1 nodes): `detail-screen.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 88`** (1 nodes): `query-references.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 89`** (1 nodes): `release-publish-readiness.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 90`** (1 nodes): `i18next.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 91`** (1 nodes): `AccountQrPreview.native.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 92`** (1 nodes): `authLoginScreenContract.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 93`** (1 nodes): `HomeScreen.block-renderer.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 94`** (1 nodes): `SearchResultsScreen.block-renderer.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 95`** (1 nodes): `HomeV2Sections.block-renderer.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 96`** (1 nodes): `CheckoutStepper.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 97`** (1 nodes): `HeroSlideCard.reference-layout.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 98`** (1 nodes): `Icon.native.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 99`** (1 nodes): `RevealOnScroll.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 100`** (1 nodes): `Sheet.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 101`** (1 nodes): `Spinner.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 102`** (1 nodes): `StarRating.native.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 103`** (1 nodes): `Toast.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 104`** (1 nodes): `HomeHeroRail.hydration.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 105`** (1 nodes): `announcementTicker.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 106`** (1 nodes): `bestItemsMonthRail.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 107`** (1 nodes): `brandSpotlightSection.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 108`** (1 nodes): `categoryRail.abovefold.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 109`** (1 nodes): `CountdownTimer.hydration.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 110`** (1 nodes): `editorialHotspotSection.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 111`** (1 nodes): `offerBannerImageTint.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 112`** (1 nodes): `railAutoplayCmsControls.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 113`** (1 nodes): `sephoraReferenceHomeSurfaceShift.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 114`** (1 nodes): `topBrandsGrid.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 115`** (1 nodes): `theme.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 116`** (1 nodes): `vite.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 117`** (1 nodes): `browse.spec.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 118`** (1 nodes): `cart.spec.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 119`** (1 nodes): `checkout.spec.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 120`** (1 nodes): `homepage.spec.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 121`** (1 nodes): `i18n.spec.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module Group 122`** (1 nodes): `Strapi CMS Favicon Icon`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `OdooClient` connect `Module Group 20` to `Account & Auth Pages`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **What connects `Strapi CLI`, `Strapi Cloud`, `Strapi Official Documentation` to the rest of the system?**
  _29 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Account & Auth Pages` be split into smaller, more focused modules?**
  _Cohesion score 0.02 - nodes in this community are weakly interconnected._
- **Should `Page Islands & Cart UI` be split into smaller, more focused modules?**
  _Cohesion score 0.02 - nodes in this community are weakly interconnected._
- **Should `UI Component Library` be split into smaller, more focused modules?**
  _Cohesion score 0.02 - nodes in this community are weakly interconnected._
- **Should `Service Layer (Account, Orders)` be split into smaller, more focused modules?**
  _Cohesion score 0.02 - nodes in this community are weakly interconnected._
- **Should `Expo App & Storage API` be split into smaller, more focused modules?**
  _Cohesion score 0.04 - nodes in this community are weakly interconnected._