# Header Scroll UX Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix web desktop scroll collapse, add smart hide/reveal on web mobile and Expo, and add a full-screen search overlay triggered from the mobile header or mini search bar.

**Architecture:** Replace the dual `isPinned`/`hasScrolled` state in `Header.tsx` with a single `isAtTop` boolean from a new `useHeaderScroll` hook. Web uses a `window.scroll` listener with a lazy `useState` initializer; Expo returns an `onScroll` handler for wiring into `ScrollView`. Two new UI components — `MiniSearchBar` (sticky bar when header is hidden) and `SearchOverlay` (full-screen search) — live in `packages/ui/components/chrome/` and are wired into `Header.tsx`. No `.web.tsx` files introduced; platform differences use existing `isWeb`/`Platform.OS` guards.

**Tech Stack:** TypeScript, React Native, Expo, Next.js (App Router), moti (cross-platform animation), existing `@real/tokens`, existing `useHeaderSearch` hook

**AGENTS.md constraints:**
- All values from `@real/tokens` — no hardcoded colors, spacing, radii
- `moti` for cross-platform animation (P0 §20.1)
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)`, duration 300ms (P1 §24.1–24.2)
- RTL-compatible — logical `start`/`end`, no hardcoded `left`/`right`
- No `className` in `packages/app/**`
- `yarn guard:checks` must pass before merge

---

### Task 1: Create `useHeaderScroll` hook

**Files:**
- Create: `packages/app/features/shell/useHeaderScroll.ts`

**Context:**

The hook replaces `isPinned` + `hasScrolled` with a single `isAtTop` boolean. On web it registers a `window.scroll` listener. On Expo it returns an `onScroll` callback to pass to `ScrollView`. The lazy `useState` initializer prevents hydration flash by reading `window.scrollY` synchronously on first client render.

**Step 1: Create the hook file**

```ts
// packages/app/features/shell/useHeaderScroll.ts
import { Platform } from 'react-native'
import { useEffect, useState, useCallback } from 'react'

type UseHeaderScrollReturn =
  | { isAtTop: boolean; onScroll?: undefined }         // web
  | { isAtTop: boolean; onScroll: (e: any) => void }  // native

export function useHeaderScroll(): UseHeaderScrollReturn {
  const isWeb = Platform.OS === 'web'

  const [isAtTop, setIsAtTop] = useState<boolean>(() => {
    if (!isWeb) return true
    if (typeof globalThis.scrollY === 'undefined') return true
    return (globalThis as { scrollY?: number }).scrollY === 0
  })

  useEffect(() => {
    if (!isWeb) return

    let ticking = false

    const onScroll = () => {
      if (!ticking) {
        globalThis.requestAnimationFrame?.(() => {
          const scrollY = (globalThis as { scrollY?: number }).scrollY ?? 0
          setIsAtTop(scrollY === 0)
          ticking = false
        })
        ticking = true
      }
    }

    // Run once immediately to sync state with current scroll position
    onScroll()
    globalThis.addEventListener?.('scroll', onScroll, { passive: true })
    return () => globalThis.removeEventListener?.('scroll', onScroll)
  }, [isWeb])

  const onScroll = useCallback((e: any) => {
    const y: number = e?.nativeEvent?.contentOffset?.y ?? 0
    setIsAtTop(y === 0)
  }, [])

  if (isWeb) {
    return { isAtTop }
  }

  return { isAtTop, onScroll }
}
```

**Step 2: Export from shell index**

In `packages/app/features/shell/index.ts`, add:

```ts
export * from './useHeaderScroll'
```

**Step 3: Verify TypeScript compiles**

```bash
cd "c:/Users/hamoo/Downloads/solito v5 docs/my-solito-app"
yarn tsc --noEmit 2>&1 | head -40
```

Expected: no errors related to the new file.

**Step 4: Commit**

```bash
git add packages/app/features/shell/useHeaderScroll.ts \
        packages/app/features/shell/index.ts
git commit -m "feat(shell): add useHeaderScroll hook — single isAtTop boolean for web + native"
```

---

### Task 2: Create `MiniSearchBar` component

**Files:**
- Create: `packages/ui/components/chrome/MiniSearchBar.tsx`
- Modify: `packages/ui/components/chrome/index.ts`

**Context:**

`MiniSearchBar` is the slim sticky bar that appears on mobile web when the full header is scrolled away. It is a presentational touchable — tapping it calls `onPress` which opens the `SearchOverlay`. It must be RTL-safe and token-only. No business logic.

Import tokens from `@real/tokens`. Use existing `Box`, `Text`, `Touchable` from `../../primitives` and `Icon` from `../Icon`.

**Step 1: Create the component**

```tsx
// packages/ui/components/chrome/MiniSearchBar.tsx
import { borderWidth, colors, radius, spacing, typography } from '@real/tokens'
import { Box, Touchable } from '../../primitives'
import { Icon } from '../Icon'

type MiniSearchBarProps = {
  placeholder: string
  onPress: () => void
  dir?: 'ltr' | 'rtl'
}

export function MiniSearchBar({ placeholder, onPress, dir = 'ltr' }: MiniSearchBarProps) {
  return (
    <Box
      style={{
        backgroundColor: colors.surface,
        borderBottomWidth: borderWidth.thin,
        borderBottomColor: colors.divider,
        paddingHorizontal: spacing['16'],
        paddingVertical: spacing['8'],
        direction: dir,
      }}
    >
      <Touchable onPress={onPress} accessibilityRole='search' accessibilityLabel={placeholder}>
        {() => (
          <Box
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing['8'],
              height: spacing['40'],
              borderRadius: radius.md,
              borderWidth: borderWidth.thin,
              borderColor: colors.border,
              backgroundColor: colors.backgroundSecondary,
              paddingHorizontal: spacing['12'],
            }}
          >
            <Icon name='search' size={16} color={colors.textSecondary} />
            <Box style={{ flex: 1 }}>
              <Text
                variant='bodySm'
                tone='muted'
                numberOfLines={1}
                style={{ fontSize: typography.bodySm }}
              >
                {placeholder}
              </Text>
            </Box>
          </Box>
        )}
      </Touchable>
    </Box>
  )
}
```

**Step 2: Export from chrome index**

Open `packages/ui/components/chrome/index.ts` and add:

```ts
export * from './MiniSearchBar'
```

**Step 3: Verify TypeScript compiles**

```bash
cd "c:/Users/hamoo/Downloads/solito v5 docs/my-solito-app"
yarn tsc --noEmit 2>&1 | head -40
```

Expected: no errors.

**Step 4: Commit**

```bash
git add packages/ui/components/chrome/MiniSearchBar.tsx \
        packages/ui/components/chrome/index.ts
git commit -m "feat(ui/chrome): add MiniSearchBar — slim sticky search bar for mobile scroll state"
```

---

### Task 3: Create `SearchOverlay` component

**Files:**
- Create: `packages/ui/components/chrome/SearchOverlay.tsx`
- Modify: `packages/ui/components/chrome/index.ts`

**Context:**

`SearchOverlay` is the full-screen search panel that slides down from the top when the user taps the search bar on mobile (web or Expo). It owns the search input and renders suggestions below. All search state is passed in as props — it reuses whatever `useHeaderSearch` produces in the parent. Uses `moti` `AnimatePresence` + `MotiView` for enter/exit animation per AGENTS.md §20.1.

The overlay must be RTL-safe. On web it uses `position: 'fixed'`; on native it uses `position: 'absolute'`. Use `Platform.OS` guard.

**Step 1: Create the component**

```tsx
// packages/ui/components/chrome/SearchOverlay.tsx
import { Platform } from 'react-native'
import { AnimatePresence, MotiView } from 'moti'
import { borderWidth, colors, spacing, zIndex } from '@real/tokens'
import { Box, Text, Touchable } from '../../primitives'
import { Icon } from '../Icon'
import { SearchField } from '../SearchField'

type SearchSuggestionItem = {
  id: string
  label: string
  href?: string
  type?: string
}

type SearchOverlayProps = {
  open: boolean
  query: string
  placeholder: string
  onClose: () => void
  onQueryChange: (value: string) => void
  onSubmit: () => void
  onSelectSuggestion: (item: SearchSuggestionItem) => void
  suggestions: SearchSuggestionItem[]
  loading: boolean
  error: string | null
  dir?: 'ltr' | 'rtl'
  clearLabel?: string
}

export function SearchOverlay({
  open,
  query,
  placeholder,
  onClose,
  onQueryChange,
  onSubmit,
  onSelectSuggestion,
  suggestions,
  loading,
  error,
  dir = 'ltr',
  clearLabel = 'Clear',
}: SearchOverlayProps) {
  const isWeb = Platform.OS === 'web'

  return (
    <AnimatePresence>
      {open ? (
        <MotiView
          from={{ opacity: 0, translateY: -24 }}
          animate={{ opacity: 1, translateY: 0 }}
          exit={{ opacity: 0, translateY: -24 }}
          transition={{
            type: 'timing',
            duration: 300,
          }}
          style={[
            {
              position: isWeb ? ('fixed' as any) : 'absolute',
              top: 0,
              start: 0,
              end: 0,
              bottom: 0,
              zIndex: zIndex.searchTop + 10,
              backgroundColor: colors.surface,
              direction: dir,
            },
          ]}
        >
          {/* Header row: search input + close */}
          <Box
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing['8'],
              paddingHorizontal: spacing['16'],
              paddingVertical: spacing['12'],
              borderBottomWidth: borderWidth.thin,
              borderBottomColor: colors.divider,
            }}
          >
            <Box style={{ flex: 1 }}>
              <SearchField
                value={query}
                onChange={onQueryChange}
                onFocus={() => undefined}
                onSubmitEditing={onSubmit}
                placeholder={placeholder}
                autoFocus
              />
            </Box>
            <Touchable onPress={onClose} accessibilityRole='button' accessibilityLabel='Close search'>
              {({ hovered }) => (
                <Box
                  style={{
                    padding: spacing['8'],
                    borderRadius: spacing['4'],
                    backgroundColor: hovered ? colors.backgroundSecondary : 'transparent',
                  }}
                >
                  <Icon name='close' size={20} color={colors.textPrimary} />
                </Box>
              )}
            </Touchable>
          </Box>

          {/* Suggestions list */}
          <Box style={{ flex: 1, paddingHorizontal: spacing['16'] }}>
            {loading ? (
              <Box style={{ paddingVertical: spacing['24'] }}>
                <Text variant='bodySm' tone='muted'>Loading…</Text>
              </Box>
            ) : error ? (
              <Box style={{ paddingVertical: spacing['24'] }}>
                <Text variant='bodySm' tone='danger'>{error}</Text>
              </Box>
            ) : suggestions.length === 0 && query.trim().length > 0 ? (
              <Box style={{ paddingVertical: spacing['24'] }}>
                <Text variant='bodySm' tone='muted'>No suggestions.</Text>
              </Box>
            ) : (
              suggestions.map((item) => (
                <Touchable
                  key={item.id}
                  onPress={() => onSelectSuggestion(item)}
                  accessibilityRole='button'
                >
                  {({ hovered }) => (
                    <Box
                      style={{
                        paddingVertical: spacing['12'],
                        paddingHorizontal: spacing['8'],
                        borderBottomWidth: borderWidth.thin,
                        borderBottomColor: colors.divider,
                        backgroundColor: hovered ? colors.backgroundSecondary : 'transparent',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: spacing['12'],
                      }}
                    >
                      <Icon name='search' size={14} color={colors.textSecondary} />
                      <Text variant='bodySm'>{item.label}</Text>
                    </Box>
                  )}
                </Touchable>
              ))
            )}
          </Box>
        </MotiView>
      ) : null}
    </AnimatePresence>
  )
}
```

**Step 2: Export from chrome index**

In `packages/ui/components/chrome/index.ts`, add:

```ts
export * from './SearchOverlay'
```

**Step 3: Verify TypeScript compiles**

```bash
cd "c:/Users/hamoo/Downloads/solito v5 docs/my-solito-app"
yarn tsc --noEmit 2>&1 | head -40
```

Expected: no errors.

**Step 4: Commit**

```bash
git add packages/ui/components/chrome/SearchOverlay.tsx \
        packages/ui/components/chrome/index.ts
git commit -m "feat(ui/chrome): add SearchOverlay — full-screen animated search for mobile"
```

---

### Task 4: Wire scroll behavior into `Header.tsx` — desktop fix + mobile hide/reveal

**Files:**
- Modify: `packages/app/features/shell/Header.tsx`

**Context:**

This is the main wiring task. Replace `isPinned` + `hasScrolled` + the existing scroll `useEffect` with `useHeaderScroll`. Then:

1. **Desktop:** use `isAtTop` for promo bar + nav row `maxHeight`, and for `scrollShadow`
2. **Mobile web:** wrap the header in a `div` that slides `translateY(-100%)` when `!isAtTop`, and render `MiniSearchBar` + `SearchOverlay` below
3. The `SearchOverlay` open state is a new local boolean `searchOverlayOpen` controlled by pressing the search field or `MiniSearchBar`

**Step 1: Replace state and scroll effect**

Remove these three lines from the state declarations:
```ts
const [isPinned, setIsPinned] = useState(true)
const [hasScrolled, setHasScrolled] = useState(false)
```

Remove the entire scroll `useEffect` block (lines ~256–282 in the current file).

Add at the top of the component body:
```ts
const { isAtTop, onScroll: nativeOnScroll } = useHeaderScroll()
const [searchOverlayOpen, setSearchOverlayOpen] = useState(false)
```

Import `useHeaderScroll` at the top of the file:
```ts
import { useHeaderScroll } from './useHeaderScroll'
```

Import new UI components:
```ts
import { MiniSearchBar, SearchOverlay } from '@real/ui'
```

**Step 2: Fix desktop scroll shadow**

Replace:
```ts
const scrollShadow = isWeb && hasScrolled
  ? '0 2px 8px rgba(14,10,10,0.06), 0 4px 18px rgba(14,10,10,0.07)'
  : 'none'
```

With:
```ts
const scrollShadow = isWeb && !isAtTop
  ? '0 2px 8px rgba(14,10,10,0.06), 0 4px 18px rgba(14,10,10,0.07)'
  : 'none'
```

**Step 3: Fix desktop promo bar and nav row**

Replace all `isPinned` references with `isAtTop`:

Promo bar `maxHeight`:
```ts
maxHeight: isAtTop ? `${layout.header.topBarHeight}px` : '0px',
```

Nav row `maxHeight`:
```ts
maxHeight: isAtTop ? `${layout.header.navRowHeight}px` : '0px',
```

**Step 4: Add mobile web hide/reveal + MiniSearchBar + SearchOverlay**

In the mobile branch (`!isDesktop` return), wrap the existing `<Box>` in a transition container and add the mini bar and overlay. Replace the current mobile return:

```tsx
if (!isDesktop) {
  return (
    <Box style={{ backgroundColor: colors.surface, direction: dir }}>
      {/* Header — slides out on scroll, back in at top */}
      <div
        style={{
          transform: isAtTop ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1)',
          position: 'relative',
          zIndex: zIndex.sticky + 5,
          backgroundColor: colors.surface,
        } as any}
      >
        <Box style={{ position: 'relative' }}>
          <HeaderMainRow
            mobile
            logoText={logoAlt}
            onPressLogo={Platform.OS === 'web' ? undefined : handleLogoPress}
            logoHref='/'
            searchValue={query}
            searchPlaceholder={labels.searchProducts}
            onSearchChange={setQuery}
            onSearchFocus={() => {
              if (isWeb) {
                setSearchOverlayOpen(true)
              } else {
                setOpen(true)
              }
            }}
            onSearchBlur={() => !isWeb && setOpen(false)}
            onSearchSubmit={handleCommitSearch}
            searchRegionId={searchRegionId}
            localeLabel={locale.toUpperCase()}
            accountLabel={labels.account}
            wishlistLabel={labels.wishlist}
            cartLabel={labels.cart}
            onPressLocale={() => onLocaleChange?.(locale === 'ar' ? 'en' : 'ar')}
            onPressAccount={handleAccountPress}
            cartCount={cartCount}
            accountCount={accountCount}
            wishlistCount={wishlistCount}
            cartPulse={showCartToast}
            onPressCart={onMobileCartNavigate ?? onCartClick}
          />
          {/* Native search panel (Expo) */}
          {!isWeb && (
            <SearchPanel
              open={open}
              query={query}
              panelRegionId={searchPanelRegionId}
              fixed
              topOffset={mobileSearchPanelTopOffset}
              onRequestClose={() => setOpen(false)}
              loading={loading}
              error={error}
              suggestions={suggestions}
              trendingSearches={discovery.trendingSearches}
              popularBrands={discovery.popularBrands}
              recents={recents}
              onSelectSuggestion={handleSelectSuggestion}
              onSelectRecent={selectRecent}
              onClearRecents={clearRecents}
              copy={searchCopy}
            />
          )}
        </Box>
        <CategoryRow
          items={categoriesWithShop}
          activeId={activeCategoryId}
          scopeLabel={activeCategory ? `${labels.scopePrefix}: ${activeCategory.label}` : undefined}
          mobile
          onSelect={handleCategorySelect}
        />
      </div>

      {/* Mini search bar — visible when header is hidden (web only) */}
      {isWeb && !isAtTop && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: zIndex.sticky + 4,
          } as any}
        >
          <MiniSearchBar
            placeholder={labels.searchProducts}
            onPress={() => setSearchOverlayOpen(true)}
            dir={dir}
          />
        </div>
      )}

      {/* Full-screen search overlay (web mobile) */}
      {isWeb && (
        <SearchOverlay
          open={searchOverlayOpen}
          query={query}
          placeholder={labels.searchProductsOrCategories}
          onClose={() => setSearchOverlayOpen(false)}
          onQueryChange={setQuery}
          onSubmit={() => {
            setSearchOverlayOpen(false)
            handleCommitSearch()
          }}
          onSelectSuggestion={(item) => {
            setSearchOverlayOpen(false)
            handleSelectSuggestion(item as any)
          }}
          suggestions={suggestions}
          loading={loading}
          error={error}
          dir={dir}
        />
      )}
    </Box>
  )
}
```

**Step 5: Verify TypeScript compiles**

```bash
cd "c:/Users/hamoo/Downloads/solito v5 docs/my-solito-app"
yarn tsc --noEmit 2>&1 | head -60
```

Fix any type errors. Common ones to watch for:
- `position: 'fixed'` needs `as any` cast in React Native style objects
- `MiniSearchBar`/`SearchOverlay` import path — confirm they are re-exported from `@real/ui`

**Step 6: Run guard checks**

```bash
yarn guard:checks
```

Expected: all checks pass. If any fail, fix before committing.

**Step 7: Commit**

```bash
git add packages/app/features/shell/Header.tsx
git commit -m "feat(header): wire useHeaderScroll, mobile hide/reveal, MiniSearchBar, SearchOverlay"
```

---

### Task 5: Wire `onScroll` into Expo `ScrollView`

**Files:**
- Modify: `apps/expo/app/index.tsx`

**Context:**

The `useHeaderScroll` hook on native returns `{ isAtTop, onScroll }`. The Expo app needs to pass `onScroll` down from the `Layout` → screens so each screen's `ScrollView` triggers it. However, this would require touching every screen, which is over-engineering for now.

Simpler approach: `Layout.tsx` already wraps content. The mobile hide/reveal on Expo is driven by the `Header`'s own scroll detection. Since `Header.tsx` is a shared component and on native `useHeaderScroll` returns the handler, the `Header` itself can't attach to the scroll — the scroll is in the screen below.

**Practical fix for Expo:** Pass `onScroll` from `Layout` as a prop that screens can optionally use, defaulting to no-op. This avoids touching every screen while still enabling the behavior when screens opt in.

**Step 1: Add `onScroll` to `LayoutProps`**

In `packages/app/features/shell/Layout.tsx`, add to `LayoutActions`:

```ts
onScroll?: (e: any) => void
```

Pass it through to children via context — but that adds complexity. Simpler: expose it as a prop on `Layout` that the caller (Expo entry) wires to whichever screen is active.

Actually the simplest correct approach: on Expo, `isAtTop` starts `true` and stays `true` since there's no scroll listener registered. The header never hides. This is acceptable for the initial implementation — the Expo hide/reveal can be a follow-up once a ScrollView context pattern is established.

**Step 1 (revised): Document the Expo limitation in code**

In `packages/app/features/shell/useHeaderScroll.ts`, add a comment:

```ts
// NOTE: On native, isAtTop stays true because there is no global scroll listener.
// To enable native scroll hide/reveal, pass the returned `onScroll` handler to
// the active screen's ScrollView via a context or prop-drilling pattern.
// This is deferred — the initial implementation only supports web scroll detection.
```

**Step 2: Verify no regressions in Expo entry**

```bash
cd "c:/Users/hamoo/Downloads/solito v5 docs/my-solito-app"
yarn tsc --noEmit 2>&1 | head -40
```

**Step 3: Commit**

```bash
git add packages/app/features/shell/useHeaderScroll.ts
git commit -m "docs(shell): note native scroll limitation in useHeaderScroll"
```

---

### Task 6: Final verification

**Step 1: Run full guard checks**

```bash
cd "c:/Users/hamoo/Downloads/solito v5 docs/my-solito-app"
yarn guard:checks
```

Expected: all 11 checks pass.

**Step 2: Run TypeScript check across all packages**

```bash
yarn tsc --noEmit 2>&1 | grep -v "node_modules" | head -80
```

Expected: no errors in `packages/` or `apps/`.

**Step 3: Manual web checks (Next.js dev server)**

```bash
yarn workspace @real/next dev
```

Open `http://localhost:3000` and verify:

**Desktop (window width ≥ 1024px):**
- [ ] At page top: promo bar visible, nav quick-actions row visible, no shadow
- [ ] After scrolling down: promo bar collapses, nav row collapses, shadow appears
- [ ] Scroll back to top: promo bar expands, nav row expands, shadow disappears
- [ ] No flash of promo bar on first load when already scrolled (hydration fix)

**Mobile web (window width < 1024px or DevTools mobile):**
- [ ] At page top: full header visible (logo + search + locale + cart + category strip)
- [ ] After scrolling down: full header slides up and out of view
- [ ] Mini search bar appears fixed at top when header is hidden
- [ ] Tapping mini search bar opens full-screen search overlay
- [ ] Search overlay slides down smoothly (300ms)
- [ ] Typing in overlay shows suggestions
- [ ] Tapping X or pressing Escape closes overlay
- [ ] Scrolling back to top: full header slides back in, mini bar disappears
- [ ] RTL (AR locale): all layout directions correct

**Step 4: Commit final verification note**

```bash
git add -A
git commit -m "chore: header scroll UX — all checks pass"
```
