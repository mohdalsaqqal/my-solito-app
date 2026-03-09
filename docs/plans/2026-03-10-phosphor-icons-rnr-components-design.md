# Phosphor Icons + RNR Components Design

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace Lucide icons with Phosphor (`light` weight), and add four missing RNR-pattern components — Sheet, Skeleton, Tabs, Select — all without adding new native dependencies.

**Architecture:** Two independent tracks committed separately. Icon switch is a pure file swap in `packages/ui/components/`. RNR components are new files in the same directory using only already-installed deps (`moti`, `react-native` `Modal`, UniWind `className`).

**Tech Stack:** Phosphor Icons, Moti (already installed), React Native Modal, UniWind className, `@real/tokens`

---

## Track 1: Icon Switch

### Package changes

`packages/ui/package.json`:
- Add: `phosphor-react`, `phosphor-react-native`
- Remove: `lucide-react`, `lucide-react-native`

### Prop change

`IconProps.strokeWidth` → `IconProps.weight` (default `'light'`)

Phosphor weight type: `'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone'`

### Icon name mapping

| `IconName` | Lucide | Phosphor |
|---|---|---|
| `home` | `Home` | `House` |
| `categories` | `Grid2x2` | `SquaresFour` |
| `deals` | `Percent` | `Percent` |
| `account` | `User` | `User` |
| `more` | `Menu` | `List` |
| `wishlist` | `Heart` | `Heart` |
| `cart` | `ShoppingCart` | `ShoppingBag` |
| `search` | `Search` | `MagnifyingGlass` |
| `quickView` | `Eye` | `Eye` |
| `language` | `Globe` | `Globe` |
| `instagram` | `Instagram` | `InstagramLogo` |
| `facebook` | `Facebook` | `FacebookLogo` |
| `youtube` | `Youtube` | `YoutubeLogo` |
| `trending` | `TrendingUp` | `TrendUp` |
| `trendArrow` | `ArrowUpRight` | `ArrowUpRight` |
| `unknown` | `CircleHelp` | `Question` |

### Files changed
- `packages/ui/components/Icon.tsx` — rewrite with `phosphor-react`
- `packages/ui/components/Icon.native.tsx` — rewrite with `phosphor-react-native`
- `packages/ui/package.json` — swap deps

---

## Track 2: RNR Components

All files land in `packages/ui/components/`. All exported from `packages/ui/components/index.ts`.

### Sheet

**File:** `packages/ui/components/Sheet.tsx`

Bottom panel for mobile filters, cart drawers, quick-add.

- **Native:** React Native `Modal` (transparent) + `MotiView` slide-up from bottom + `MotiView` backdrop fade
- **Web:** absolute-positioned overlay + `className` CSS transition (`translate-y`)

```
<Sheet visible={bool} onClose={fn}>
  <Sheet.Content>
    <Sheet.Handle />          ← drag indicator pill
    {children}
  </Sheet.Content>
</Sheet>
```

Token usage: `colors.surface`, `colors.black`, `radius.lg`, `spacing.md`, `spacing.sm`

### Skeleton

**File:** `packages/ui/components/Skeleton.tsx`

Animated shimmer placeholder replacing static `<Box style={{ ...shimmer }}>` blocks.

- Uses `MotiView` with looping opacity: `1 → 0.4 → 1`, duration `1000ms`
- Props: `width`, `height`, `radius` (keyof radius tokens), `style`
- Also exports `Skeleton.Group` — wraps children, passes `delay` multiplier for stagger

```
<Skeleton width='100%' height={10} radius='xs' />
<Skeleton width='60%' height={13} radius='xs' />
```

Token usage: `colors.backgroundSecondary`, `radius.*`

### Tabs

**File:** `packages/ui/components/Tabs.tsx`

Horizontal tab bar with active indicator underline.

- Pure React Native — no extra deps
- Active indicator: 2px bottom border (`colors.brandPrimary`), animated with Moti
- Context-based: `Tabs` provides value/onChange, `Tabs.Trigger` reads it

```
<Tabs defaultValue='description'>
  <Tabs.List>
    <Tabs.Trigger value='description'>Description</Tabs.Trigger>
    <Tabs.Trigger value='reviews'>Reviews</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value='description'>...</Tabs.Content>
</Tabs>
```

Token usage: `colors.brandPrimary`, `colors.textPrimary`, `colors.textMuted`, `spacing.md`, `spacing.sm`, `typography.bodySm`

### Select

**File:** `packages/ui/components/Select.tsx`

Size/sort/quantity picker.

- **Web:** Styled native `<select>` element via `className` — keyboard accessible, no JS overhead
- **Native:** `Modal` (transparent) + scrollable option list, same Modal approach as Sheet

```
<Select
  value={val}
  onChange={setVal}
  options={[{ label: 'Small', value: 'sm' }]}
  placeholder='Select size'
/>
```

Token usage: `colors.surface`, `colors.border`, `colors.textPrimary`, `colors.textMuted`, `radius.md`, `spacing.md`, `spacing.sm`

---

## Constraints

- No raw hex colors — all token values
- No `className` in `packages/app` — these are `packages/ui` files only
- All style objects multi-line (guard check compliance)
- Run `yarn guard:checks` after each commit

## Commit plan

1. `ui: swap lucide icons for phosphor (light weight)`
2. `ui: add Sheet component (Modal + Moti slide-up)`
3. `ui: add Skeleton component (Moti opacity pulse shimmer)`
4. `ui: add Tabs component (context-based with active underline)`
5. `ui: add Select component (web: native select, native: modal picker)`
6. `ui: export Sheet, Skeleton, Tabs, Select from index`
