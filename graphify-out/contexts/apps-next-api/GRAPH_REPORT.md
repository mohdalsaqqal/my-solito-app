# Graph Report - apps/next/app/api  (2026-04-12)

## Corpus Check
- Corpus is ~34,462 words - fits in a single context window. You may not need a graph.

## Summary
- 222 nodes · 318 edges · 26 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## God Nodes (most connected - your core abstractions)
1. `POST()` - 13 edges
2. `PATCH()` - 7 edges
3. `RateLimiter` - 6 edges
4. `readProfiles()` - 6 edges
5. `listReferralProfiles()` - 6 edges
6. `requireAuthSessionWithOptions()` - 6 edges
7. `normalizeSiteConfigState()` - 5 edges
8. `requireTrustedMutationRequest()` - 5 edges
9. `normalizeBranding()` - 4 edges
10. `buildCartHash()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `POST()` --calls--> `deriveFromProducts()`  [EXTRACTED]
  apps\next\app\api\reviews\route.ts → apps\next\app\api\admin\catalog\brands\sync\route.ts
- `POST()` --calls--> `derivePathsFromProducts()`  [EXTRACTED]
  apps\next\app\api\reviews\route.ts → apps\next\app\api\admin\catalog\categories\sync\route.ts
- `POST()` --calls--> `resolveLocale()`  [EXTRACTED]
  apps\next\app\api\reviews\route.ts → apps\next\app\api\admin\cms\site-config\logo-upload\route.ts
- `POST()` --calls--> `resolveExtension()`  [EXTRACTED]
  apps\next\app\api\reviews\route.ts → apps\next\app\api\admin\cms\site-config\logo-upload\route.ts
- `POST()` --calls--> `validatePromotionsPayload()`  [EXTRACTED]
  apps\next\app\api\reviews\route.ts → apps\next\app\api\admin\promotions\route.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.12
Nodes (21): DELETE(), deriveFromProducts(), derivePathsFromProducts(), findUser(), GET(), guard(), hasRole(), hasStatus() (+13 more)

### Community 1 - "Community 1"
Cohesion: 0.11
Nodes (0): 

### Community 2 - "Community 2"
Cohesion: 0.2
Nodes (11): hasAdminDomainPermission(), isAdminPanelRole(), hasTrustedFetchMetadata(), hasTrustedOriginContext(), readCookieHeader(), readCookieValue(), requireAdminAnyDomainSession(), requireAdminDomainSession() (+3 more)

### Community 3 - "Community 3"
Cohesion: 0.21
Nodes (10): buildAuthSessionCookieHeader(), isAuthRole(), parseAuthSessionCookie(), signSessionPayload(), buildCookieAttributes(), getAuthSessionSecret(), isAuthSessionConfigValid(), isReleaseLikeEnvironment() (+2 more)

### Community 4 - "Community 4"
Cohesion: 0.15
Nodes (4): buildPageConfigId(), createPageConfigStore(), createStoreInternals(), normalizePageConfigRecord()

### Community 5 - "Community 5"
Cohesion: 0.16
Nodes (4): createPageVersionStore(), createStoreInternals(), normalizePageVersionRecord(), pageVersionId()

### Community 6 - "Community 6"
Cohesion: 0.3
Nodes (13): buildInitialProfiles(), createReferralProfile(), getReferralProfileByCode(), getReferralProfileById(), getReferralProfileByIdentity(), getReferralProfileByUserId(), listReferralProfiles(), readProfiles() (+5 more)

### Community 7 - "Community 7"
Cohesion: 0.27
Nodes (5): fieldRegistryKeys(), parseAdminListQuery(), parseFields(), parseFilters(), validateRequestedFields()

### Community 8 - "Community 8"
Cohesion: 0.38
Nodes (8): initialState(), mergeSiteConfigState(), normalizeBranding(), normalizeLogoSize(), normalizeSiteConfigState(), normalizeText(), readSiteConfig(), writeSiteConfig()

### Community 9 - "Community 9"
Cohesion: 0.2
Nodes (1): RateLimiter

### Community 10 - "Community 10"
Cohesion: 0.31
Nodes (5): initialState(), readAdminControlsState(), readUserOverridesFile(), writeAdminControlsState(), writeUserOverridesFile()

### Community 11 - "Community 11"
Cohesion: 0.32
Nodes (4): initialState(), isSavedViewEntity(), readAdminSavedViewsState(), sanitizeSavedView()

### Community 12 - "Community 12"
Cohesion: 0.36
Nodes (4): buildCartHash(), normalizeCouponCode(), normalizeReferralCode(), round2()

### Community 13 - "Community 13"
Cohesion: 0.52
Nodes (6): buildInitialLedger(), createReferralLedgerEntry(), listReferralLedgerEntries(), listReferralLedgerEntriesByProfile(), readLedgerEntries(), writeLedgerEntries()

### Community 14 - "Community 14"
Cohesion: 0.53
Nodes (4): normalizeLocale(), parseCookie(), resolveLocaleFromInput(), resolveRequestLocale()

### Community 15 - "Community 15"
Cohesion: 0.7
Nodes (4): initialState(), readAdminCatalogColumnsState(), sanitizeColumns(), writeAdminCatalogColumnsState()

### Community 16 - "Community 16"
Cohesion: 0.5
Nodes (2): initialState(), readAdminCatalogState()

### Community 17 - "Community 17"
Cohesion: 0.67
Nodes (2): initialState(), readBannersState()

### Community 18 - "Community 18"
Cohesion: 0.83
Nodes (3): initialState(), readCacheSettings(), writeCacheSettings()

### Community 19 - "Community 19"
Cohesion: 0.67
Nodes (2): initialState(), readUGCState()

### Community 20 - "Community 20"
Cohesion: 0.67
Nodes (2): buildInitialProgram(), readReferralProgramSettings()

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

## Knowledge Gaps
- **Thin community `Community 21`** (2 nodes): `route.shape.test.ts`, `readSource()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (1 nodes): `provider-readiness.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (1 nodes): `layout-versioning.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (1 nodes): `page-block-editor.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (1 nodes): `release-persistence.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._