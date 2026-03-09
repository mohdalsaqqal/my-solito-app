# Universal E-Commerce Skill
## Solito v5 · Uniwind · React Native Reusables

A comprehensive Claude Code skill for building universal e-commerce apps — **one codebase, web + mobile** — with shared designs, logic, and components.

## Install

```bash
# From your superpowers skills directory
npx skills add ./universal-ecommerce-skill

# Or manually
cp -r universal-ecommerce-skill ~/.claude/skills/universal-ecommerce
```

## What's Included

```
universal-ecommerce/
├── SKILL.md                          # Core philosophy, patterns, rules
├── README.md                         # This file
├── tokens/
│   └── global.css                    # Full e-commerce design token system
│                                     # (OKLCH colors, typography, spacing,
│                                     #  platform fonts, light/dark themes)
├── components/
│   ├── ProductCard.tsx               # Universal product card (web+native)
│   └── CartDrawer.tsx                # Sheet-based cart with upsells
├── screens/
│   ├── ProductDetailScreen.tsx       # Full PDP: gallery, variants, tabs, sticky CTA
│   └── CategoryScreen.tsx            # Category page: FlatList + filter Sheet
└── examples/
    └── monorepo-structure.md         # Complete setup guide + compatibility matrix
```

## Stack

| Layer | Tech | Why |
|-------|------|-----|
| Navigation | **Solito v5** | Web-first; `Link` = `next/link` on web, RN impl on native. No RNWeb dependency |
| Styling | **Uniwind** (Tailwind v4) | `className` on ALL RN components, platform selectors (`ios:`, `web:`), OKLCH themes |
| Components | **React Native Reusables** | shadcn/ui philosophy for native — copy-paste, you own it |
| Primitives | **@rn-primitives** | Universal Radix UI (Radix on web, custom impls on native) |
| State | **Zustand** | Lightweight cart/wishlist, persisted with AsyncStorage |

## Key Features of This Skill

### 1. True universality
Components are written once and run correctly on iOS, Android, and web — using Uniwind's platform selectors instead of branching logic.

### 2. Solito v5 compliant
- `Link` / `TextLink` / `SolitoImage` used correctly (no `viewProps`, no array styles, no `StyleSheet.create`)
- `TextLink` always wrapped to restore default font styles (required in v5)
- `createParam` for type-safe screen params
- All Solito APIs re-exported from a single `packages/ui/navigation` barrel

### 3. Inwwind best practices
- OKLCH color tokens for perceptually uniform colors
- Semantic tokens (`bg-background`, `text-foreground`, etc.) — never hardcoded colors
- `@source` directives configured for monorepo
- Platform fonts via `@media ios/android/web` in `@theme`
- `data-[state=*]:` selectors for prop-driven states

### 4. RNR patterns
- All components accessed via CLI → moved to `packages/ui/components/`
- `Sheet` for mobile filter/cart/quick-add (bottom sheet)
- `Dialog` for confirmation modals
- `Tabs` for PDP description/reviews/shipping
- `Select` for size/sort pickers
- `Progress` for cart free-shipping meter
- `Skeleton` for every loading state

### 5. E-commerce specific
- Sticky add-to-cart on native, sidebar on web
- Size selector sheet (opens when ATC pressed without size)
- Color swatch selector with accessibility
- Active filter pills with removal
- Shipping progress bar
- Express checkout (Apple Pay / Google Pay) native-only
- Sale price display with savings calculation
- Skeleton screens matching exact loaded layouts
- FlatList with `numColumns`, `getItemLayout`, `React.memo`

## Usage

Claude Code will automatically use this skill when you ask for:

```
"Create a product card for my Solito + Uniwind app"
"Build a PDP screen with image gallery and variant selection"
"Make a cart drawer with a free shipping progress bar"
"Create a category page with filters"
"Set up my global.css for Uniwind in a Solito monorepo"
"Add dark mode support to my universal app"
"Build a filter sheet for mobile"
```

## Compatibility

Tested with: Solito 5 · Next.js 16 · Expo SDK 54 · React Native 0.81+ · React 19 · Uniwind 1.3+ · Tailwind 4

## License

MIT
