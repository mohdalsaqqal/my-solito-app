# Header Scroll UX Design

**Domain:** 🎨 UI / UX / Frontend
**Date:** 2026-03-19
**Status:** Approved

---

## Goal

Improve header behavior across web desktop, web mobile, and Expo native — fixing the broken desktop scroll collapse and adding smart hide/reveal + full-screen search overlay on mobile/Expo.

---

## Scope

| Platform | Change |
|---|---|
| Web desktop | Fix scroll collapse (promo bar + nav row) — design is correct, implementation is broken |
| Web mobile | Smart hide on scroll down → sticky mini search bar → full header reveals only when `scrollY === 0` → full-screen search overlay on tap → smooth transitions |
| Expo native | Identical smart hide/reveal behavior as web mobile, driven by `ScrollView.onScroll` |

---

## Section 1: Scroll State Machine

### Core logic

A single `isAtTop: boolean` replaces the existing `isPinned` + `hasScrolled` dual-state.

- `isAtTop = true` → full header visible
- `isAtTop = false` → header hidden (mobile/Expo), promo + nav row collapsed (desktop)

**Reveal trigger:** `scrollY === 0` only. Not scroll-up direction — only reaching the exact top.

### Web implementation

`window.scroll` listener, rAF-throttled:

```ts
const scrollY = window.scrollY ?? 0
setIsAtTop(scrollY === 0)
```

Lazy `useState` initializer reads `scrollY` synchronously on first render to avoid hydration flash:

```ts
const [isAtTop, setIsAtTop] = useState(() => {
  if (typeof window === 'undefined') return true
  return window.scrollY === 0
})
```

### Expo implementation

`ScrollView` `onScroll` prop with `scrollEventThrottle={16}`:

```ts
onScroll={(e) => {
  setIsAtTop(e.nativeEvent.contentOffset.y === 0)
}}
```

---

## Section 2: Web Mobile Behavior

### Hide on scroll down

Header container animates out:
```css
transform: translateY(-100%);
transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
```

### Mini sticky search bar

- `position: fixed`, `top: 0`, full width
- Fades in when header hidden: `opacity 0→1` + `translateY(-8px→0)`, `300ms`
- Contains only a search field touchable
- Tapping opens `SearchOverlay`
- RTL-safe using logical properties

### Reveal at top

When `scrollY === 0`:
- Full header slides back in: `translateY(-100%→0)`, `300ms`
- Mini bar fades out: `opacity 1→0`, `300ms`

### Full-screen search overlay

Triggered by tapping search field (header or mini bar).

- `position: fixed`, full screen, `background: colors.surface`
- Enter: `translateY(-100%→0)`, `300ms cubic-bezier(0.16, 1, 0.3, 1)`
- Exit: `translateY(0→-100%)`, `300ms`
- Contains: auto-focused search input at top + suggestions list below
- Reuses existing `useHeaderSearch` hook (state passed in as props)
- Dismiss: X button, Escape key
- RTL-safe

---

## Section 3: Web Desktop Fix

### Bugs fixed

**Bug 1 — Hydration flash at non-zero scroll:**
`useState(true)` replaced with lazy initializer reading `window.scrollY` synchronously. Eliminates promo bar flash on hydration when page is pre-scrolled.

**Bug 2 — Dead `lastScrollY` variable:**
`lastScrollY` was declared and assigned but never used in any condition. Removed. Scroll check simplifies to `scrollY === 0`.

**Simplification:**
`isPinned` and `hasScrolled` unified into single `isAtTop`. Desktop uses it for:
- Promo bar: `maxHeight: isAtTop ? topBarHeight : 0`
- Nav row: `maxHeight: isAtTop ? navRowHeight : 0`
- Shadow: `boxShadow: isAtTop ? 'none' : scrollShadow`

---

## Section 4: Expo Behavior

Identical UX to web mobile:
- Header hides on scroll (driven by `ScrollView.onScroll`)
- Mini search bar appears when hidden
- Full header reveals only at `contentOffset.y === 0`
- Full-screen search overlay on search tap

Animation uses `moti` `<MotiView>` per AGENTS.md §20.1 (cross-platform motion layer).

---

## Section 5: Component & File Structure

### New files

**`packages/app/features/shell/useHeaderScroll.ts`**
- Shared hook, exports `isAtTop: boolean`
- Web: `window.scroll` listener with lazy init
- Expo: returns `{ isAtTop, onScroll }` — caller wires `onScroll` to `ScrollView`

**`packages/ui/components/chrome/MiniSearchBar.tsx`**
- Sticky mini bar for mobile web when header hidden
- Props: `onPress: () => void`, `placeholder: string`, `dir: Direction`
- Token-compliant, RTL-safe
- No business logic — pure presentational

**`packages/ui/components/chrome/SearchOverlay.tsx`**
- Full-screen search overlay, mobile web + Expo
- Props: all from `useHeaderSearch` (query, setQuery, suggestions, etc.) + `open`, `onClose`, `dir`
- `moti` `AnimatePresence` + `MotiView` for enter/exit
- RTL-safe

### Modified files

- `packages/app/features/shell/Header.tsx` — wire `useHeaderScroll`, replace dual state with `isAtTop`, add mobile hide transform + `MiniSearchBar` + `SearchOverlay`
- `packages/ui/components/chrome/index.ts` — export `MiniSearchBar`, `SearchOverlay`

### Platform file strategy

No `.web.tsx` files introduced. Platform differences handled via existing `isWeb` / `Platform.OS` guards in `Header.tsx`.

---

## Constraints (from AGENTS.md)

- All values from tokens — no hardcoded colors, spacing, radii
- `moti` for cross-platform animation (P0 §20.1)
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)` (P1 §24.1)
- Duration: 300ms micro-interactions (P1 §24.2)
- RTL-compatible — logical start/end, mirrored icons, carousel direction (P0 §17)
- No `className` in `packages/app` (P0 §9)
- UniWind/className only in `packages/ui` (P0 §4.1)
- `yarn guard:checks` must pass before merge (P0 §21)
