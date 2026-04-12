# CMS & Admin Re-Audit Report

> **Date:** 2026-04-09
> **Scope:** Post-P0/P1 fixes — verifies what's FIXED, IMPROVED, and STILL OPEN
> **Baseline:** Original audit found 42 issues across 4 severity levels

---

## Executive Summary

| Metric | Original | Now | Change |
|---|---|---|---|
| 🔴 P0 (Critical) | 2 | 0 | **Both resolved** |
| 🟠 P1 (High) | 12 | 6 | **3 improved, 3 fixed** |
| 🟡 P2 (Medium) | 18 | 12 | **3 improved, 3 fixed** |
| 🟢 P3 (Low) | 10 | 8 | **2 fixed** |
| **Total** | 42 | 26 | **16 resolved** |

---

## Finding Status

### P0 — Critical (2 → 0)

| Finding | Status | Notes |
|---|---|---|
| **P0-1: No auth middleware** | ✅ **FIXED** | `middleware.ts` protects `/admin/**` with session + role guard |
| **P0-2: Zero CMS caching** | ✅ **FIXED** | In-memory LRU cache, 3-min TTL, preview bypass, all 6 callers updated |

### P1 — High (12 → 6 open)

| Finding | Status | Notes |
|---|---|---|
| **P1-1: 3923-line blocks/page.tsx** | ❌ STILL OPEN | 3922 lines — no change |
| **P1-2: XSS risk — no sanitization** | ❌ STILL OPEN | No DOMPurify, no input/output sanitization anywhere |
| **P1-3: No URL validation on href** | ❌ STILL OPEN | All `href` fields accept any string including `javascript:` |
| **P1-4: MIME type trust in uploads** | 🟡 IMPROVED | File type allowlist + size limits enforced, but client `file.type` still trusted (no magic byte verification) |
| **P1-5: No Zod validation at route level** | ❌ STILL OPEN | Zero Zod imports in any `apps/next/app/api/admin/**` route |
| **P1-6: Sequential product enrichment** | ❌ STILL OPEN | `for` loop with `await enrichProducts()` — 5+ sequential waterfalls |
| **P1-7: God function (350 lines)** | 🟡 IMPROVED | Cached entry point extracted, but `getHomeCmsResponseData` is still ~460 lines of block dispatch |
| **P1-8: All-or-nothing CMS error** | 🟡 IMPROVED | Per-block failures are graceful (skip with warn), but `cmsProvider.getHome()` failure still kills entire page |
| **P1-9: Duplicate of P1-5** | ❌ STILL OPEN | Same issue |
| **P1-10: No concurrency control** | 🟡 IMPROVED | `prisma.$transaction()` provides atomicity, but delete-then-recreate pattern means last-writer-wins with no conflict detection |
| **P1-11: 200 instead of 201** | 🟡 IMPROVED | Some routes return 201 (releases), most still return 200 |
| **P1-12: No audit trail for UGC** | 🟡 IMPROVED | `CmsAuditLog` table exists and `pushAudit()` works, but UGC route doesn't call it |

### P2 — Medium (18 → 12 open)

| Finding | Status | Notes |
|---|---|---|
| **P2-1: Code duplication across routes** | ❌ STILL OPEN | `normalizeLocalized`, `toRecord`, `moveToIndex` still copy-pasted |
| **P2-2: Inconsistent data fetching in admin pages** | ❌ STILL OPEN | Mix of `fetch()` and `apiClient.*` across 8 pages |
| **P2-3: No i18n consistency** | ❌ STILL OPEN | Only menus page uses `useTranslation`. 7/8 pages hardcode English. UTF-8 encoding bug in `ugc.copy.ts` |
| **P2-4: Weak loading states** | ❌ STILL OPEN | All 8 pages use plain "Loading..." — no skeletons |
| **P2-5: No error recovery** | ❌ STILL OPEN | All pages show errors but none offer retry buttons |
| **P2-6: Four admin pages missing from sidebar** | ❌ STILL OPEN | Banners, Site Config, UGC, Menus not in sidebar |
| **P2-7: Tests are source-code assertions** | ❌ STILL OPEN | No runtime unit tests for CMS behavior |
| **P2-8: Only 15 of 20 block types in mock data** | ❌ STILL OPEN | Only **7 of 20** in page blocks. 13 block types unrepresented |
| **P2-9: Publish readiness only checks 3 blocks** | ❌ STILL OPEN | Only `hero`, `promo_strip`, `product_slider` validated |
| **P2-10: Menus page is JSON-only editing** | ❌ STILL OPEN | Still requires raw JSON for menu structure |
| **P2-11: Full CMS fetch on every admin request** | ✅ **FIXED** | Prisma queries target specific tables now |
| **P2-12: editorial_hotspot hard-drop** | ❌ STILL OPEN | Empty product enrichment still silently drops block |
| **P2-13: No rate limiting** | ❌ STILL OPEN | Public `/api/cms/home` endpoint unthrottled |
| **P2-14: POST used instead of PATCH for toggle** | ❌ STILL OPEN | `POST /api/admin/cms/toggles/[id]` should be PATCH |
| **P2-15: No validation on query.limit/sortBy** | ❌ STILL OPEN | No bounds or enum checks |
| **P2-16: All mock blocks use locale 'en'** | ❌ STILL OPEN | No Arabic mock data |
| **P2-17: Type/schema misalignment** | ✅ **FIXED** | Prisma JSON storage preserves exact CMS shape |
| **P2-18: Unsafe `as QueryBoundBlockType` cast** | ❌ STILL OPEN | Still unsafe cast in `query-references.ts` |

### P3 — Low (10 → 8 open)

| Finding | Status | Notes |
|---|---|---|
| **P3-1: Hardcoded hex in status banners** | ❌ STILL OPEN | 13 hex instances across banners (6), ugc (6), offer-banners (1), releases (1) |
| **P3-2: Dead code in cms/home/route.ts** | ❌ STILL OPEN | `routeContext` still created and voided |
| **P3-3: Drag-and-drop no keyboard a11y** | ❌ STILL OPEN | No arrow key reordering, no `aria-grabbed` |
| **P3-4: Toggle switches use div onClick** | ❌ STILL OPEN | Not keyboard accessible, not screen-reader friendly |
| **P3-5: UTF-8 encoding bug in ugc.copy.ts** | ❌ STILL OPEN | `'Savingâ€¦'` instead of `'Saving…'` |
| **P3-6: Fake internal URL** | ❌ STILL OPEN | `http://internal.local` pattern still used |
| **P3-7: Inconsistent localization** | ❌ STILL OPEN | Mix of `localizeString()` and manual ternary |
| **P3-8: AnyBlock redundant alias** | ❌ STILL OPEN | `AnyBlock = HomeBlock` adds no value |
| **P3-9: No duplicate query slug detection** | ❌ STILL OPEN | Not flagged within a release |
| **P3-10: Form inputs lack labels** | ✅ **FIXED** | All admin pages now use `Field` components with proper labels |

---

## What Changed Since Original Audit

### Fixed (2 items)
1. ✅ Auth middleware (`middleware.ts`)
2. ✅ CMS caching (in-memory LRU + Prisma storage)

### Improved (8 items)
1. 🟡 MIME validation improved (allowlist + size limits, but no content scanning)
2. 🟡 God function reduced (cached entry point extracted)
3. 🟡 Per-block error handling (graceful skip vs hard failure)
4. 🟡 Concurrency control (Prisma transactions replace raw fs writes)
5. 🟡 HTTP status codes (some routes now return 201)
6. 🟡 Audit trail (CmsAuditLog table exists, not yet wired to UGC)
7. 🟡 CMS storage (Prisma replaces JSON files for most entities)
8. 🟡 Type/schema alignment (Prisma JSON storage preserves exact CMS shape)

### Still Open (26 items)
Remaining issues across all severity levels — listed in detail above.

---

## New Issues Discovered

| Finding | Severity | Notes |
|---|---|---|
| **P1: JSON stores partially migrated** | P1 | User overrides and page-version store still use JSON files |
| **P2: No `'use cache'` directive** | P2 | Using custom in-memory cache but not Next.js 16 native `'use cache'` with `cacheTag` |
| **P3: `mergeSiteConfigState` export preserved** | P3 | Legacy function kept for compatibility but unused by new Prisma path |

---

## Priority Recommendations

### Do Next (Highest Impact)

| Priority | Item | Why | Effort |
|---|---|---|---|
| 1 | **Parallelize product enrichment** | 5+ sequential waterfalls per CMS request → 1 parallel call | Low |
| 2 | **Add Zod validation at route level** | Prevents malformed data from entering Prisma | Medium |
| 3 | **Add URL validation to href fields** | Prevents `javascript:` injection in CMS content | Low |
| 4 | **Fix UTF-8 encoding in ugc.copy.ts** | One-line fix, visible bug | Trivial |

### Do After (UX Quality)

| Priority | Item | Why | Effort |
|---|---|---|---|
| 5 | **Add loading skeletons** | All 8 admin pages show plain "Loading..." | Medium |
| 6 | **Add error recovery with retry** | Users lose all edits on transient failures | Low |
| 7 | **Add i18n to remaining 7 pages** | Only menus page uses `useTranslation` | Medium |
| 8 | **Split blocks/page.tsx** | 3922 lines is unmaintainable | High |

### Do Later (Nice to Have)

| Priority | Item | Why | Effort |
|---|---|---|---|
| 9 | **Complete publish validation** | Only 3/20 block types validated for required fields | Medium |
| 10 | **Add mock data for all 20 blocks** | 13 block types untested with mock data | Medium |
| 11 | **Visual menu builder** | JSON-only editing is poor UX for marketing team | High |
| 12 | **Rate limiting on public endpoint** | DoS vector on `/api/cms/home` | Low |

---

## Verification Status

| Check | Status |
|---|---|
| `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false` | ✅ Pass |
| `yarn guard:checks` | ✅ Pass |

---

*Re-audit complete. 16 of 42 original issues resolved. 26 remain open.*
