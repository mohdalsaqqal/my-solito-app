# Web ↔ Expo UI/UX Parity — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix the six parity gaps between web (Next.js) and Expo so both platforms render the same visual UI/UX from the shared component layer.

**Architecture:** All fixes stay within the existing layer boundaries — token files, shared screens, and the Expo entry point. No new packages, no new platform splits, no architecture changes.

**Tech Stack:** Solito v5, Expo 54, Next.js 14 App Router, UniWind, React Native, `expo-font`, `qrcode` (already installed), `packages/tokens/`

---

## Task 1: Fix Arabic encoding corruption in Expo deals view

**Files:**
- Modify: `apps/expo/app/index.tsx:442–447`

**Context:** The "deals" view hardcodes Arabic strings that are corrupted (mojibake `???? ??????`). The correct text should match the web `/sales` page equivalents.

**Step 1: Open the file and locate the bad strings**

File: `apps/expo/app/index.tsx`
Search for `'???? ??????'` — it appears at line ~442.

**Step 2: Replace with correct UTF-8 Arabic**

Old code (lines 442–447):
```tsx
bannerTitle={localeState === 'ar' ? '???? ??????' : 'Limited Time Sales'}
bannerSubtitle={
  localeState === 'ar'
    ? '?????? ?????? ??????? ????? ??????.'
    : 'Selected premium products at limited-time prices.'
}
```

New code:
```tsx
bannerTitle={localeState === 'ar' ? 'عروض محدودة' : 'Limited Time Sales'}
bannerSubtitle={
  localeState === 'ar'
    ? 'منتجات مميزة بأسعار لفترة محدودة.'
    : 'Selected premium products at limited-time prices.'
}
```

**Step 3: Verify the file is saved as UTF-8**

In your editor, check the file encoding in the status bar — it must be UTF-8, not UTF-16 or Latin-1.

**Step 4: Commit**

```bash
git add apps/expo/app/index.tsx
git commit -m "fix(expo): restore correct UTF-8 Arabic strings for deals view"
```

---

## Task 2: Add CartDrawer shadow values to elevation tokens

**Files:**
- Modify: `packages/tokens/elevation.ts`
- Modify: `packages/ui/components/chrome/CartDrawer.tsx`

**Context:** `CartDrawer.tsx` uses hardcoded `rgba()` strings for two shadows instead of tokens, violating the token rule. The fix is to add named tokens and reference them.

**Step 1: Add named tokens to `packages/tokens/elevation.ts`**

Open `packages/tokens/elevation.ts`. At the end of the `elevation` object (before `} as const`), add:

```ts
  // ── Semantic component tokens ──────────────────────────────────────────────
  drawerPanel: '-8px 0 48px rgba(15,15,17,0.15)',
  drawerFooter: '0 -4px 24px rgba(15,15,17,0.04)',
```

**Step 2: Update CartDrawer to use the new tokens**

Open `packages/ui/components/chrome/CartDrawer.tsx`.

Find the two `Platform.OS === 'web'` shadow branches:

First occurrence (~line 198–201):
```tsx
...(Platform.OS === 'web'
  ? {
      boxShadow: '-8px 0 48px rgba(0,0,0,0.15)',
    }
  : {}),
```
Replace with:
```tsx
...(Platform.OS === 'web'
  ? {
      boxShadow: elevation.drawerPanel,
    }
  : {}),
```

Second occurrence (~line 394–397):
```tsx
...(Platform.OS === 'web'
  ? {
      boxShadow: '0 -4px 24px rgba(0,0,0,0.04)',
    }
  : {}),
```
Replace with:
```tsx
...(Platform.OS === 'web'
  ? {
      boxShadow: elevation.drawerFooter,
    }
  : {}),
```

Verify `elevation` is already imported at the top of CartDrawer.tsx. If not, add:
```tsx
import { elevation } from '@real/tokens'
```

**Step 3: Run guard checks**

```bash
yarn guard:checks
```
Expected: all checks pass (no raw hex/rgba in packages/ui).

Note: The guard checks for `#[0-9a-fA-F]{3,8}` hex codes. The rgba strings are in `elevation.ts` inside `packages/tokens/`, which is not scanned by guard check #3 (only scans `packages/app` and `packages/ui`). This is correct — tokens are the canonical home for these values.

**Step 4: Commit**

```bash
git add packages/tokens/elevation.ts packages/ui/components/chrome/CartDrawer.tsx
git commit -m "tokens+ui: move CartDrawer hardcoded rgba shadows to elevation tokens"
```

---

## Task 3: Load Poppins and Cairo fonts in Expo

**Files:**
- Modify: `apps/expo/app/index.tsx`

**Context:** Web loads Poppins (LTR) and Cairo (Arabic/RTL) via `next/font/google`. Expo currently uses system fonts. `expo-font` is already bundled — it just needs to be called.

**Step 1: Add font loading at the top of `apps/expo/app/index.tsx`**

Add these imports at the top of the file (after existing imports):
```tsx
import { useFonts } from 'expo-font'
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_900Black,
} from '@expo-google-fonts/poppins'
import {
  Cairo_400Regular,
  Cairo_600SemiBold,
  Cairo_700Bold,
} from '@expo-google-fonts/cairo'
```

**Step 2: Install the font packages**

```bash
cd apps/expo
npx expo install @expo-google-fonts/poppins @expo-google-fonts/cairo
```

Expected output: packages added to `apps/expo/package.json`.

**Step 3: Add `useFonts` call inside `HomeRoute` component**

At the top of the `HomeRoute` function body (after the existing `useSafeAreaInsets` call), add:

```tsx
const [fontsLoaded] = useFonts({
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_900Black,
  Cairo_400Regular,
  Cairo_600SemiBold,
  Cairo_700Bold,
})
```

**Step 4: Guard render until fonts are loaded**

Find the `return (` near the bottom of `HomeRoute` (the `<SafeAreaView>` block). Add a guard just before it:

```tsx
if (!fontsLoaded) {
  return null
}
```

This prevents a flash of unstyled system-font text on startup.

**Step 5: Verify the app boots**

```bash
cd apps/expo
npx expo start
```

Expected: App loads with Poppins rendering instead of system fonts. No red screen or font errors.

**Step 6: Commit**

```bash
git add apps/expo/app/index.tsx apps/expo/package.json
git commit -m "feat(expo): load Poppins + Cairo fonts via expo-google-fonts for visual parity with web"
```

---

## Task 4: Fix AccountQrPreview web version (stops showing "loading…" forever)

**Files:**
- Modify: `packages/app/screens/AccountQrPreview.tsx`

**Context:** The `.native.tsx` version correctly generates a QR code from the `userQrCode` string using the `qrcode` package. The web `.tsx` version receives a `qrImageDataUrl` prop that is never populated — it shows "QR image is loading…" forever.

The fix: mirror the native approach in the web file. Generate the data URL inline using `qrcode`, then render an `<img>`.

**Step 1: Check `qrcode` is available**

```bash
grep "qrcode" package.json packages/app/package.json
```

Expected: `"qrcode"` appears in dependencies. If not:
```bash
yarn add qrcode
yarn add -D @types/qrcode
```

**Step 2: Rewrite `AccountQrPreview.tsx`**

Replace the entire contents of `packages/app/screens/AccountQrPreview.tsx` with:

```tsx
import { useEffect, useState } from 'react'
import { spacing } from '@real/tokens'
import { Box, Text } from '@real/ui/primitives'

type AccountQrPreviewProps = {
  userQrCode: string
  qrImageDataUrl: string | null
}

export function AccountQrPreview({ userQrCode }: AccountQrPreviewProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    void import('qrcode')
      .then((mod) => mod.toDataURL(userQrCode, { margin: 1, width: 192 }))
      .then((url) => {
        if (active) setDataUrl(url)
      })
      .catch(() => {
        if (active) setDataUrl(null)
      })
    return () => {
      active = false
    }
  }, [userQrCode])

  if (!dataUrl) {
    return (
      <Box style={{ gap: spacing['4'] }}>
        <Text variant='caption' tone='muted'>
          QR image is loading...
        </Text>
        <Text variant='caption' tone='muted'>
          {userQrCode}
        </Text>
      </Box>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={dataUrl}
      alt='Account QR code'
      width={192}
      height={192}
      style={{ display: 'block' }}
    />
  )
}
```

Note: `qrImageDataUrl` prop is kept in the signature for backward compatibility but is no longer used — the component generates its own.

**Step 3: Verify `AccountScreen` still compiles**

```bash
yarn tsc --noEmit
```

Expected: no type errors.

**Step 4: Commit**

```bash
git add packages/app/screens/AccountQrPreview.tsx
git commit -m "fix(account): web QR preview now generates inline — stops showing loading forever"
```

---

## Task 5: Fix sticky panel fallback on Expo (Cart, Product, Checkout)

**Files:**
- Modify: `packages/app/screens/CartScreen.tsx:~255–275`
- Modify: `packages/app/screens/ProductScreen.tsx:~700–720`
- Modify: `packages/app/screens/CheckoutScreen.tsx:~778–795`

**Context:** All three screens use `position: Platform.OS === 'web' ? 'sticky' : 'relative'` for a summary/action panel. On Expo, `'relative'` means the panel scrolls away. The correct native pattern is: scroll content in `<ScrollView>`, render the action bar **outside** the scroll using flex column layout.

These are three independent sub-tasks. Fix them one at a time.

---

### Task 5a: CartScreen sticky order summary

**Step 1: Read the CartScreen layout structure**

Open `packages/app/screens/CartScreen.tsx`. Find the outer container (around line 255). The current structure is roughly:

```tsx
<Box flex={1}>
  {/* scrollable line items */}
  <ScrollView>...</ScrollView>
  {/* "sticky" summary panel */}
  <Box style={{ position: Platform.OS === 'web' ? 'sticky' : 'relative', top: ... }}>
    {/* totals + checkout CTA */}
  </Box>
</Box>
```

**Step 2: Update the native branch to use proper pinned layout**

Change the summary panel's style:
```tsx
// OLD
style={{ position: Platform.OS === 'web' ? 'sticky' : 'relative', top: Platform.OS === 'web' ? cartTokens.stickyPanelTop : undefined }}

// NEW — keep sticky on web, but on native use flex to pin it at the bottom
style={Platform.OS === 'web'
  ? { position: 'sticky', top: cartTokens.stickyPanelTop }
  : undefined}
```

The panel already sits below the `<ScrollView>` in the flex column — removing the `position: 'relative'` override on native is sufficient to let flex pin it naturally to the bottom.

**Step 3: Verify on Expo**

Run the Expo app, navigate to cart. The order summary should remain visible at the bottom as you scroll through cart items.

**Step 4: Commit**

```bash
git add packages/app/screens/CartScreen.tsx
git commit -m "fix(expo): cart summary panel stays visible on scroll (native flex pinning)"
```

---

### Task 5b: ProductScreen sticky buy bar

**Step 1: Locate the sticky buy bar in ProductScreen**

Open `packages/app/screens/ProductScreen.tsx` around line 708. The pattern is the same — a panel with `position: 'sticky'` on web.

**Step 2: Apply the same fix as 5a**

```tsx
// OLD
style={{ position: Platform.OS === 'web' ? 'sticky' : 'relative', top: Platform.OS === 'web' ? stickyTop : undefined }}

// NEW
style={Platform.OS === 'web'
  ? { position: 'sticky', top: stickyTop }
  : undefined}
```

**Step 3: Commit**

```bash
git add packages/app/screens/ProductScreen.tsx
git commit -m "fix(expo): product buy bar stays pinned on native via flex layout"
```

---

### Task 5c: CheckoutScreen sticky order summary

**Step 1: Locate the sticky panel in CheckoutScreen**

Open `packages/app/screens/CheckoutScreen.tsx` around line 785.

**Step 2: Apply the same fix**

```tsx
// OLD
style={{ position: Platform.OS === 'web' ? 'sticky' : 'relative', top: Platform.OS === 'web' ? checkoutTokens.stickyPanelTop : undefined }}

// NEW
style={Platform.OS === 'web'
  ? { position: 'sticky', top: checkoutTokens.stickyPanelTop }
  : undefined}
```

**Step 3: Commit**

```bash
git add packages/app/screens/CheckoutScreen.tsx
git commit -m "fix(expo): checkout summary panel stays pinned on native via flex layout"
```

---

## Task 6: Document pharmacist/pharmasset as intentionally web-only

**Files:**
- Modify: `AGENTS.md` — Section 8

**Step 1: Add a clarifying note to AGENTS.md §8**

Open `AGENTS.md`. Find Section 8 ("Role Exposure"). After the existing bullet list, add:

```markdown
Note: `/pharmacist` and `/pharmasset` routes are intentionally absent from Expo.
These are specialist workflows for the pharmacist role, which is web-only by design.
No Expo equivalent is planned. This is not a parity gap.
```

**Step 2: Commit**

```bash
git add AGENTS.md
git commit -m "docs: clarify pharmacist/pharmasset routes are intentionally web-only"
```

---

## Task 7: Run full guard checks and verify

**Step 1: Run guard checks**

```bash
yarn guard:checks
```

Expected: all 11 checks pass.

**Step 2: Type-check the whole monorepo**

```bash
yarn tsc --noEmit
```

Expected: no type errors.

**Step 3: Final commit if any cleanup was needed**

```bash
git add -p  # stage only intentional changes
git commit -m "chore: parity fixes — guard checks and type check clean"
```

---

## Execution Order

| Task | Priority | Risk | Est. Effort |
|------|----------|------|-------------|
| 1 — Arabic encoding fix | P0 | Very low | 2 min |
| 2 — CartDrawer shadow tokens | P0 | Very low | 5 min |
| 3 — Expo font loading | P1 | Low | 15 min |
| 4 — AccountQrPreview web fix | P1 | Low | 10 min |
| 5a–5c — Sticky panel native fix | P1 | Low | 15 min |
| 6 — AGENTS.md doc note | P2 | None | 2 min |
| 7 — Guard + type check | P0 | None | 5 min |
