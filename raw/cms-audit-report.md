# CMS & Admin Audit Report

> **Date:** 2026-04-09
> **Scope:** Custom CMS system in `apps/next/`, `packages/app/lib/cms/`, and admin UI
> **Strapi status:** Scaffolded but unused — can be deleted

---

## Executive Summary

Your custom CMS is a **layout-as-data system** with 20 block types, a release/publish workflow, query-based product resolution, and a full admin UI. It's functional and well-architected in places (Zod schemas, discriminated unions, layout engine), but has significant gaps in security, performance, maintainability, and UX quality.

**Overall Health: ⚠️ Fair** — works but needs hardening before production.

---

## Issue Summary by Severity

| Severity | Count | Top Concern |
|---|---|---|
| 🔴 P0 (Critical) | 2 | No auth middleware, no CMS caching |
| 🟠 P1 (High) | 12 | 3923-line monolith, XSS risks, no URL validation, sequential enrichment |
| 🟡 P2 (Medium) | 18 | Code duplication, no i18n, weak loading states, source-code-only tests |
| 🟢 P3 (Low) | 10 | Dead code, encoding bugs, inconsistent patterns |

---

## 🔴 P0 — Critical Issues

### P0-1: No Server-Side Auth Guard on `/admin/**`

**Every admin page is reachable by unauthenticated users.** The admin relies on client-side session detection in `AdminShell` — there's no `middleware.ts` or server component auth protecting the routes.

**Affected:** All 9 admin pages
**Risk:** Admin UI exposed to anyone with the URL. API calls would fail, but navigation, layout, and internal structure are visible.
**Fix:** Add Next.js middleware redirecting unauthenticated requests away from `/admin/**`.

### P0-2: Zero Caching on CMS Data Path

`getHomeCmsResponseData()` (~350 lines) hits **all providers and all FS stores on every single request** — no in-memory cache, no `Cache-Control`, no Next.js `'use cache'`.

**Affected:** Every SSR page load
**Impact:** 5+ sequential provider calls per request, multiple `fs.readFile` calls, no reuse between requests
**Fix:** Add `'use cache'` with `cacheTag` on the CMS service, implement in-memory LRU cache for FS stores.

---

## 🟠 P1 — High Severity

### P1-1: 3,923-Line Monolith (`blocks/page.tsx`)

A single file handling hero, carousel, flash sale, brand spotlight, offer banners, education banner, newsletter CTA, top brands, UGC gallery, personalized rail, editorial hotspot — all with drag-and-drop, image upload/crop, query linking, product search, and preview.

**Fix:** Extract into sub-components: `BlockSidebar`, `BlockEditors/{HeroEditor, FlashSaleEditor, ...}`, `ImageUploadZone`, `QuerySelector`, `ProductSearch`, `PreviewPanel`.

### P1-2: XSS Risk — No Input Sanitization

Text fields (`messageEn`, `titleEn`, `legalEn`, `caption`, `sourceHandle`) are stored raw with no sanitization. If rendered unsanitized on the frontend, this is an XSS vector.

**Affected:** banners, site-config, ugc, brand-spotlights, offer-banners
**Fix:** Add sanitization at the API route layer (strip tags/encode entities) or at render time.

### P1-3: No URL Validation on href/bannerHref

All `href` fields accept any string — `javascript:alert(1)`, `data:text/html,...`, or `not-a-url` would pass both Zod schema and API validation.

**Affected:** brand-spotlights, offer-banners, blocks schema
**Fix:** Add `z.string().url().or(z.string().startsWith('/'))` to Zod schemas and API route validation.

### P1-4: MIME Type Trust in Upload Endpoints

`file.type` from FormData is client-controlled and trusted. A malicious file could have `.jpg` extension with executable content inside.

**Affected:** `blocks/upload`, `offer-banners/upload`, `site-config/logo-upload`
**Fix:** Use `sharp` or `file-type` to verify magic bytes, re-encode images on upload.

### P1-5: No Schema Validation on Most PUT/POST Bodies

TypeScript types are stripped at runtime. Most endpoints accept `Record<string, unknown>` or raw body with no Zod validation.

**Affected:** banners, menus, offer-banners, ugc, site-config
**Fix:** Add Zod schema validation at route level before writing to storage.

### P1-6: Sequential Product Enrichment

In `home-cms.service.ts`, product enrichment is awaited one-by-one in a `for` loop:

```typescript
for (const block of blocks) {
  const enriched = await enrichProducts(block)  // sequential!
}
```

With 5 product-dependent blocks, this is 5+ sequential provider waterfalls.

**Fix:** `Promise.allSettled(blocks.map(enrichProducts))` — parallelize independent enrichments.

### P1-7: God Function — `home-cms.service.ts` (~350 lines)

Handles: release resolution, block parsing, product enrichment, localization, site config merging, banner injection, menu attachment. Single point of failure — if `cmsProvider.getHome()` throws, entire homepage fails.

**Fix:** Split into focused services: `ReleaseResolver`, `BlockParser`, `ProductEnricher`, `ConfigMerger`.

### P1-8: All-or-Nothing CMS Error Handling

If `cmsProvider.getHome()` throws, the entire homepage fails — even though admin controls, site config, and banners were already fetched successfully. `Promise.allSettled` is used at the higher level but not within the CMS service itself.

**Fix:** Use `Promise.allSettled` within the service and fall back to partial data.

### P1-9: No Zod Schema Validation at Route Level (Admin Endpoints)

Admin routes rely on TypeScript types only. Malformed data passes straight to FS storage.

**Fix:** Import Zod schemas from `packages/app/lib/cms/blocks.ts` and validate at route entry point.

### P1-10: No Concurrency Control on FS Storage

All admin routes use JSON file read-modify-write with no locks. Two simultaneous PUT requests = race condition (lost updates).

**Affected:** All admin CMS routes
**Fix:** Add file locks or move to a proper database (Prisma).

### P1-11: 200 Instead of 201 for Resource Creation

POST endpoints creating resources return 200 OK instead of 201 Created.

**Affected:** brand-spotlights, offer-banners, all upload endpoints
**Fix:** Return 201 with `Location` header.

### P1-12: No Audit Trail for UGC Changes

Brand spotlights, offer banners, and toggles all have audit entries. UGC has none.

**Fix:** Add `pushAudit()` calls to UGC route.

---

## 🟡 P2 — Medium Severity

### P2-1: Code Duplication Across Routes

`normalizeLocalized`, `toRecord`, `moveToIndex`, `guard` patterns are copy-pasted across brand-spotlights and offer-banners routes.

**Fix:** Extract to `apps/next/server/services/_lib/cms-utils.ts`.

### P2-2: Inconsistent Data Fetching in Admin Pages

| Page | Method |
|---|---|
| banners | `fetch('/api/...')` |
| blocks | `apiClient.admin.*` |
| menus | `apiClient.admin.*` |
| site-config | `fetch('/api/...')` |
| ugc | `fetch('/api/...')` |

**Fix:** Standardize on `apiClient` or create a shared `useCmsData()` hook.

### P2-3: No i18n Consistency

Only `menus/page.tsx` uses `useTranslation('admin')`. All other pages hardcode English strings. `ugc.copy.ts` has UTF-8 encoding bugs (`Savingâ€¦` instead of `Saving…`).

**Fix:** Adopt `useTranslation('admin')` everywhere, fix encoding.

### P2-4: Weak Loading States Everywhere

Every page shows plain "Loading..." text — no spinner, skeleton, or progress indicator.

**Fix:** Create `<LoadingSkeleton />` component in admin shared UI.

### P2-5: No Error Recovery

All pages show error messages but none offer a retry button.

**Fix:** Add retry button with `apiClient` retry logic.

### P2-6: Four Admin Pages Missing from Sidebar

Banners, Site Config, UGC Gallery, and Menus are not in the admin sidebar navigation. Only accessible via marketing sub-nav or direct URL.

**Fix:** Add to `AdminShell` sidebar nav.

### P2-7: Tests Are Source-Code Assertions, Not Runtime Tests

`query-references.test.ts` and `release-publish-readiness.test.ts` read `.ts` files as text and use regex. They verify strings exist in source, not that functions work correctly.

**Fix:** Write actual unit tests with mock inputs/outputs.

### P2-8: Only 15 of 20 Block Types Have Mock Data

`flash_sale`, `brand_spotlight`, `education_banner`, `top_brands`, `ugc_gallery`, `personalized_rail`, `editorial_hotspot`, `pdp_offer_cluster`, `cart_upsell_rail` have no mock page block data.

**Fix:** Add mock data for all block types in `packages/adapters/mock/cms/index.ts`.

### P2-9: Publish Readiness Only Checks 3 Block Types

Required field validation manually checks only `hero`, `promo_strip`, `product_slider`. The other 17 block types get generic `BLOCK_INVALID_PAYLOAD` errors.

**Fix:** Add required field checks for all block types or delegate entirely to Zod.

### P2-10: Menus Page Is JSON-Only Editing

Users must manually write valid JSON for menu items and mega config. No visual builder. Major UX failure for a marketing admin.

**Fix:** Build a visual menu builder with drag-and-drop item management.

### P2-11: Full CMS Fetch on Every Admin Request

`cmsProvider.getHome()` is called on every admin CMS request (even simple toggles) just to verify toggle existence.

**Fix:** Cache the toggle ID list separately.

### P2-12: `editorial_hotspot` Hard-Drop on Empty Products

Misconfigured product IDs cause the entire block to silently disappear. No fallback rendering, no error state.

**Fix:** Render placeholder block with warning state.

### P2-13: No Rate Limiting on Public Endpoint

`GET /api/cms/home` is unauthenticated and unthrottled. Vulnerable to DoS.

**Fix:** Add rate limiting (e.g., `@upstash/ratelimit` or simple in-memory counter).

### P2-14: POST Used Instead of PATCH for Toggle

`POST /api/admin/cms/toggles/[id]` toggles a boolean — semantically a PATCH operation.

**Fix:** Change to PATCH.

### P2-15: No Validation on `query.limit` and `query.sortBy`

Accepted directly from user input without bounds or allowed-value checks.

**Fix:** Validate `limit` is 1-100, `sortBy` is enum.

### P2-16: All Mock Blocks Use `locale: 'en'`

No Arabic-locale mock blocks. RTL rendering path is untested.

**Fix:** Add AR mock blocks.

### P2-17: Type/Schema Misalignment for `brand_promo` and `product_slider`

TypeScript types include `products?: Product[]` but Zod schemas strip them via `.strict()`. Types suggest data flows from CMS; reality is products are resolved server-side.

**Fix:** Remove `products` from types or use `.passthrough()` in schema.

### P2-18: `as QueryBoundBlockType` Cast Is Unsafe

Should use exhaustiveness check instead of type assertion.

**Fix:** Add `const _exhaustive: never = block` after switch.

---

## 🟢 P3 — Low Severity

### P3-1: Hardcoded Hex Colors in Status Banners

`banners/page.tsx` uses `#f0fdf4`, `#bbf7d0`, `#15803d` instead of token references.

### P3-2: Dead Code in `cms/home/route.ts`

`const routeContext = { storeId, request }; void routeContext` — created then immediately voided.

### P3-3: Drag-and-Drop Has No Keyboard Accessibility

`GripVertical` icon for reordering but no arrow key handlers, no `aria-grabbed`.

### P3-4: Toggle Switches Use `<div onClick>` Instead of `<input type="checkbox">`

Not keyboard accessible. Screen readers cannot determine state.

### P3-5: UTF-8 Encoding Bug in `ugc.copy.ts`

`'Savingâ€¦'` instead of `'Saving…'`

### P3-6: Fake Internal URL Pattern

`http://internal.local` is synthetic — used to create Request objects for service calls. Fragile.

### P3-7: Inconsistent Localization

Some blocks use `localizeString()` helper, others do manual `locale === 'ar' ? xAr : xEn` ternary.

### P3-8: `AnyBlock` Is Redundant Alias

`export type AnyBlock = HomeBlock` adds no value.

### P3-9: No Duplicate Query Slug Detection

`collectReleaseQueryUsages` collects usages but doesn't flag duplicates within a release.

### P3-10: Form Inputs Lack Label Associations

Many admin form inputs use visual labels only, no `<label htmlFor>` or `aria-label`.

---

## Architecture Assessment

| Dimension | Rating | Notes |
|---|---|---|
| **Data Model** | ✅ Strong | Zod schemas, discriminated unions, 20 block types all covered |
| **Layout Engine** | ✅ Strong | Pure functions, desktop fusion of promo+hero, clean |
| **Type Safety** | ⚠️ Fair | Types/schemas misaligned on 2 block types, unsafe casts |
| **Security** | ❌ Poor | No auth middleware, XSS risks, MIME trust, no URL validation |
| **Performance** | ❌ Poor | Zero CMS caching, sequential enrichment, uncached FS reads |
| **Error Handling** | ⚠️ Fair | Graceful per-block failure, but all-or-nothing CMS provider |
| **Testing** | ❌ Poor | Source-code regex assertions, no runtime behavior tests |
| **Admin UX** | ⚠️ Fair | Functional but raw — JSON-only menus, no visual builders |
| **i18n** | ❌ Poor | Mostly hardcoded English, one broken encoding |
| **Maintainability** | ❌ Poor | 3,923-line monolith, extensive duplication |
| **Mock Data** | ⚠️ Fair | Realistic but covers only 15/20 block types, EN only |

---

## Recommended Priority Order

### Immediate (This Week)
1. **Add Next.js middleware for admin auth** — P0-1
2. **Add CMS caching layer** — P0-2
3. **Parallelize product enrichment** — P1-6
4. **Add URL validation to Zod schemas** — P1-3

### Short Term (Next Sprint)
5. **Split blocks/page.tsx into sub-components** — P1-1
6. **Add input sanitization** — P1-2
7. **Add Zod validation at route level** — P1-5, P1-9
8. **Standardize admin data fetching** — P2-2
9. **Add i18n to all admin pages** — P2-3
10. **Add loading skeletons and error recovery** — P2-4, P2-5

### Medium Term
11. **Replace FS storage with Prisma models** — P1-10
12. **Write real unit tests** — P2-7
13. **Build visual menu builder** — P2-10
14. **Add mock data for all block types + AR locale** — P2-8, P2-16
15. **Split home-cms.service.ts** — P1-7
16. **Add rate limiting** — P2-13

---

## Strapi Recommendation

**Keep your custom CMS for homepage blocks.** It's well-suited for layout-as-data. The Strapi scaffold can be deleted — unless you want it for **product catalog management** (15,000 products), which your current admin doesn't cover. But that's a separate decision from the homepage CMS.

---

*Audit complete. 42 issues found across 4 severity levels.*
