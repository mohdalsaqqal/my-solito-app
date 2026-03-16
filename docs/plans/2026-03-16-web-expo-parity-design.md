# Web ↔ Expo UI/UX Parity — Design Document

> **Audit date:** 2026-03-16
> **Overall parity score:** ~7.9/10 — solid shared-component foundation; six specific gaps need fixing.

---

## Executive Summary

The monorepo's shared-layer architecture is working correctly. Both platforms use:
- The same screens from `packages/app/screens/`
- The same `Layout` from `packages/app/features/shell/`
- The same UI components from `packages/ui/`
- The same design tokens from `packages/tokens/`

Six concrete issues break the "same UI/UX on both platforms" goal.

---

## Issues & Fixes

### Issue 1 — Arabic encoding corruption (CRITICAL)
**File:** `apps/expo/app/index.tsx:442–447`
**Problem:** Hardcoded Arabic strings for the "deals" view are mojibake (`???? ??????`). The file was saved/copied with wrong encoding or mangled paste.
**Fix:** Replace with correct UTF-8 Arabic text — same copy used in the web `/sales` page and CMS defaults.

---

### Issue 2 — Font divergence: Poppins on web, system fonts on Expo (HIGH)
**File:** `apps/next/app/layout.tsx:12–32` loads Poppins, Cairo, Playfair via `next/font/google`.
**Problem:** Expo has no font loading. UI renders with iOS/Android system fonts instead of Poppins — the most visually prominent divergence.
**Fix:** Use `expo-font` (already bundled as a dependency of `expo`) to load Poppins and Cairo from Google Fonts at app boot in `apps/expo/app/index.tsx`. Show a `SplashScreen` guard until fonts are ready. Playfair Display is editorial/display only and can be deferred.

---

### Issue 3 — Shadow inconsistency: CSS strings on web, RN objects on Expo (HIGH)
**Files:** Multiple `Platform.OS === 'web'` branches throughout `packages/ui/components/`:
- `ProductCard.tsx` — 8+ branches
- `CartDrawer.tsx` — 2 hardcoded `rgba()` strings not in tokens
- `Button.tsx` — elevation branches

**Problem:** The shadow token system already has two correct token files:
- `packages/tokens/elevation.ts` — CSS multi-layer `boxShadow` strings (web)
- `packages/tokens/shadows.ts` — React Native shadow objects (native)

But `CartDrawer.tsx` uses raw hardcoded `rgba()` strings, bypassing both.
**Fix:** Add two hardcoded CartDrawer shadow values to `elevation.ts` as named tokens (`drawerPanel`, `drawerFooter`). No component logic changes needed for ProductCard/Button — they already use `elevation`/`shadows` tokens correctly.

---

### Issue 4 — Sticky panel fallback: web sticky, Expo inline scroll-away (MEDIUM)
**Files:**
- `packages/app/screens/CartScreen.tsx:262–263` — order summary panel
- `packages/app/screens/ProductScreen.tsx:708–709` — buy action panel
- `packages/app/screens/CheckoutScreen.tsx:785–786` — order summary panel

**Problem:** Web shows a sticky side/bottom panel while scrolling. On Expo, the panel scrolls away with content because `position: 'sticky'` is not supported in React Native.
**Fix:** Wrap the main scrollable content area on Expo in a `<ScrollView>` and render the action panel **outside** the scroll (below it), using flex layout to pin it to the bottom. This is the standard RN pattern and matches native app conventions. The `Platform.OS` branch stays — the fix is in what the native branch renders, not removing the branch.

---

### Issue 5 — AccountQrPreview: `.native.tsx` exists, `.tsx` web version incomplete (MEDIUM)
**Files:**
- `packages/app/screens/AccountQrPreview.native.tsx` — correct, generates QR via `qrcode` + `SvgXml`
- `packages/app/screens/AccountQrPreview.tsx` — exists but uses `<Image source={{ uri: qrImageDataUrl }}>` and expects a pre-rendered `qrImageDataUrl` prop which is never populated on web

**Problem:** The web version waits for a `qrImageDataUrl` that never arrives, showing "QR image is loading..." indefinitely. The `.native.tsx` version generates its own QR from `userQrCode` string correctly.
**Fix:** Update `AccountQrPreview.tsx` (web) to mirror the native approach — generate the QR inline using `qrcode` library (already installed) and render it as an `<img>` tag using the data URL.

---

### Issue 6 — Pharmacist/pharmasset routes: correctly web-only, but undocumented (LOW)
**Files:** `apps/next/app/pharmacist/`, `apps/next/app/pharmasset/`
**Status:** Per AGENTS.md §8, Expo must not expose admin/pharmacist routes. This is intentional.
**Fix:** Add a comment in AGENTS.md §8 noting these are intentionally absent from Expo. No code change needed.

---

## Parity Scorecard (Post-Fix Target)

| Dimension | Before | After |
|-----------|--------|-------|
| Colors / Spacing / Radius | 9/10 | 9/10 |
| Typography (fonts) | 6/10 | 9/10 |
| Shadows/Elevation | 6/10 | 8/10 |
| Sticky Layout | 7/10 | 8/10 |
| Feature completeness | 7/10 | 8/10 |
| Component sharing | 9/10 | 9/10 |
| RTL | 8/10 | 9/10 |
| **Overall** | **7.9/10** | **~8.9/10** |

---

## Out of Scope
- Admin routes on Expo (web-only by architecture, correct)
- Pharmacist specialist workflow on Expo (web-only by architecture, correct)
- Full sticky-to-pinned redesign of all three screens (structural work, separate task)
