---
name: universal-ecommerce
description: >
  Build production-grade universal e-commerce apps with Solito v5 + Uniwind + React Native Reusables (RNR).
  Use when building: product pages, product cards, cart, checkout, category/filter pages, search,
  auth screens, order tracking, wishlists, account dashboards — for BOTH web (Next.js) and mobile (Expo)
  from a single shared codebase. Also use when asked to style, scaffold, or design any screen or
  component in a Solito monorepo using Taiwind/Uniwind classes and RNR primitives. Do NOT use for
  non-Solito projects, pure web-only apps, or native-only apps.
license: MIT
---

# Universal E-Commerce Skill
## Solito v5 + Uniwind + React Native Reusables

You are building a **universal app**: one codebase, pixel-perfect on web (Next.js 16) and native (Expo SDK 54+).
The stack is web-first, Tailwind-powered, and accessible by default.

---

## Stack at a Glance

| Layer | Technology | Key fact |
|-------|-----------|----------|
| Navigation | Solito v5 | Web-first; `Link` = `next/link` on web, RN impl on native |
| Styling | Uniwind (Tailwind v4) | `className` prop on ALL RN components; dark/light/platform variants |
| Components | React Native Reusables (RNR) | shadcn/ui philosophy — copy-paste, you own the code |
| Primitives | `@rn-primitives` | Universal Radix UI; web = Radix, native = RN |
| Runtime | Expo SDK 54+ / Next.js 16 | React 19, Turbopack, New Architecture |

---

## Monorepo Structure

```
apps/
  expo/               # Expo native app
    app/              # Expo Router screens (file-based)
    global.css        # Uniwind entry + @source directives
    metro.config.js   # withUniwindConfig outermost wrapper
  next/               # Next.js 16 web app
    app/              # App Router pages
    next.config.js    # transpilePackages for RN libs

packages/
  app/                # ALL shared screens, components, logic
    components/       # Shared UI: product card, cart, etc.
    features/         # Feature modules (product, cart, checkout...)
    navigation/       # Solito navigation helpers
    store/            # Zustand / Jotai state
    hooks/            # Shared custom hooks
    lib/              # API clients, utils
    types/            # TypeScript types
  ui/                 # Design system (RNR components + tokens)
    components/       # Button, Dialog, Sheet, Badge, etc.
    global.css        # Shared CSS variables & theme tokens
```

---

## Styling Rules — Uniwind

### Core syntax
```tsx
// ✅ Correct — className on any RN component
import { View, Text, Pressable } from 'react-native'

<View className="flex-1 bg-background px-4 py-6">
  <Text className="text-foreground text-xl font-bold">Hello</Text>
</View>
```

### Platform selectors (always prefer over Platform.select)
```tsx
// web:  → web-only styles
// native: → iOS + Android
// ios:  → iOS only
// android: → Android only
<View className="native:pt-12 web:pt-4 px-4" />
<Text className="ios:font-[SF-Pro-Text] android:font-[Roboto] web:font-[Inter]" />
```

### Dark mode
```tsx
<View className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
  <Text className="text-zinc-900 dark:text-zinc-50">Adapts automatically</Text>
</View>
```

### Data selectors (prop-driven state — no extra state vars)
```tsx
<Pressable
  data-selected={isActive}
  className="px-4 py-2 rounded-lg data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground"
/>
```

### light-dark() in CSS (theme-aware without className)
```css
.adaptive-badge {
  background-color: light-dark(#f0fdf4, #14532d);
  color: light-dark(#166534, #86efac);
}
```

### Monorepo @source (REQUIRED in expo/global.css)
```css
@import 'tailwindcss';
@import 'uniwind';

/* Include all packages that use className */
@source '../../packages/app';
@source '../../packages/ui';
```

### metro.config.js (withUniwindConfig MUST be outermost)
```js
const { withUniwindConfig } = require('uniwind/metro')
const { withNativeWind } = require('nativewind/metro') // if needed

module.exports = withUniwindConfig(
  withExpoConfig(config),
  { cssEntryFile: './global.css', dtsFile: './uniwind-types.d.ts' }
)
```

---

## Navigation Rules — Solito v5

### Always re-export Solito from your design system
```tsx
// packages/ui/navigation/link.tsx
export { Link } from 'solito/link'
export { TextLink } from 'solito/link'
export { useRouter } from 'solito/navigation'
export { useSearchParams } from 'solito/navigation'
```

### Link usage (v5: className works on web, style object on native)
```tsx
import { Link } from '~/ui/navigation/link'

// Web: renders next/link directly (className works fully)
// Native: RN implementation (style as object only, no arrays)
<Link
  href="/product/[slug]"
  className="text-primary underline"          // web
  style={{ textDecorationLine: 'underline' }} // native fallback
>
  View Product
</Link>
```

### TextLink (v5: fully unstyled — you must add font styles)
```tsx
import { TextLink } from 'solito/link'

// Always wrap in your design system to apply base styles
export function AppTextLink(props) {
  return (
    <TextLink
      {...props}
      className={`text-primary font-medium ${props.className ?? ''}`}
    />
  )
}
```

### useRouter for programmatic navigation
```tsx
import { useRouter } from 'solito/navigation'

const router = useRouter()
router.push('/product/nike-air-max')
router.replace('/checkout')
router.back()
```

### Screen params (shared type-safe params)
```tsx
// packages/app/features/product/params.ts
import { createParam } from 'solito'
const { useParam } = createParam<{ slug: string }>()
export { useParam }

// In your screen:
const [slug] = useParam('slug')
```

---

## React Native Reusables (RNR) — Component Patterns

RNR philosophy: **copy the source into your project** (`packages/ui/components/`).
You own it. Customize freely. Use Uniwind `className` for all styling.

### CLI to add components
```bash
npx @react-native-reusables/cli@latest add button
npx @react-native-reusables/cli@latest add dialog
npx @react-native-reusables/cli@latest add sheet
npx @react-native-reusables/cli@latest add badge
npx @react-native-reusables/cli@latest add accordion
npx @react-native-reusables/cli@latest add select
npx @react-native-reusables/cli@latest add tabs
npx @react-native-reusables/cli@latest add progress
npx @react-native-reusables/cli@latest add toast
```

### Available components (full list)
Accordion · AlertDialog · AspectRatio · Avatar · Badge · Button · Card ·
Checkbox · Collapsible · ContextMenu · Dialog · DropdownMenu · HoverCard ·
Input · Label · Popover · Progress · RadioGroup · Select · Separator ·
Sheet · Skeleton · Slider · Switch · Table · Tabs · Textarea · Toast ·
Toggle · ToggleGroup · Tooltip

### Button patterns
```tsx
import { Button } from '~/ui/components/button'

// Variants: default | destructive | outline | secondary | ghost | link
// Sizes: default | sm | lg | icon

<Button variant="default" size="lg" onPress={handleAddToCart}>
  <Text>Add to Cart</Text>
</Button>

<Button variant="outline" size="sm" onPress={handleWishlist}>
  <Text>Save</Text>
</Button>
```

### Sheet (bottom sheet / modal drawer — key for mobile e-commerce)
```tsx
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '~/ui/components/sheet'

// Use Sheet for: filters, cart drawer, size selector, quick add
<Sheet>
  <SheetTrigger asChild>
    <Button variant="outline"><Text>Filters</Text></Button>
  </SheetTrigger>
  <SheetContent side="bottom" className="rounded-t-2xl">
    <SheetHeader>
      <SheetTitle className="text-foreground">Filter Products</SheetTitle>
    </SheetHeader>
    {/* Filter content */}
  </SheetContent>
</Sheet>
```

### Dialog (confirmation, alerts)
```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '~/ui/components/dialog'

<Dialog>
  <DialogContent className="bg-card rounded-2xl">
    <DialogHeader>
      <DialogTitle className="text-foreground">Remove from cart?</DialogTitle>
      <DialogDescription className="text-muted-foreground">
        This item will be removed from your cart.
      </DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>
```

### Tabs (product detail, account sections)
```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '~/ui/components/tabs'

<Tabs defaultValue="description">
  <TabsList className="bg-muted rounded-xl">
    <TabsTrigger value="description" className="data-[state=active]:bg-background rounded-lg">
      <Text>Description</Text>
    </TabsTrigger>
    <TabsTrigger value="reviews">
      <Text>Reviews</Text>
    </TabsTrigger>
    <TabsTrigger value="shipping">
      <Text>Shipping</Text>
    </TabsTrigger>
  </TabsList>
  <TabsContent value="description">...</TabsContent>
</Tabs>
```

### Select (size picker, sort, quantity)
```tsx
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '~/ui/components/select'

<Select onValueChange={(val) => setSize(val)}>
  <SelectTrigger className="border border-border rounded-xl bg-background">
    <SelectValue placeholder="Select size" className="text-foreground" />
  </SelectTrigger>
  <SelectContent className="bg-card rounded-xl">
    {sizes.map(size => (
      <SelectItem key={size} value={size} label={size}>
        <Text className="text-foreground">{size}</Text>
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

### Badge (product labels)
```tsx
import { Badge } from '~/ui/components/badge'

// Variants: default | secondary | destructive | outline
<Badge variant="destructive"><Text>Sale</Text></Badge>
<Badge variant="secondary"><Text>New</Text></Badge>
<Badge className="bg-amber-100 dark:bg-amber-900">
  <Text className="text-amber-700 dark:text-amber-300">Best Seller</Text>
</Badge>
```

### Progress (cart progress, order steps)
```tsx
import { Progress } from '~/ui/components/progress'

<Progress value={68} className="h-2 bg-muted" indicatorClassName="bg-primary" />
```

### Skeleton (loading states — always implement these)
```tsx
import { Skeleton } from '~/ui/components/skeleton'

// Match the exact layout of your loaded content
<View className="gap-3">
  <Skeleton className="h-[280px] w-full rounded-2xl" />
  <Skeleton className="h-5 w-2/3 rounded-md" />
  <Skeleton className="h-4 w-1/3 rounded-md" />
</View>
```

---

## Design System Tokens (global.css)

See `tokens/global.css` for the complete e-commerce token system.
Key semantic tokens to always use (never hardcode colors):

| Token | Use case |
|-------|----------|
| `bg-background` | Page/screen background |
| `bg-card` | Card surfaces |
| `bg-muted` | Subtle backgrounds, skeletons |
| `text-foreground` | Primary text |
| `text-muted-foreground` | Secondary/hint text |
| `border-border` | All borders |
| `bg-primary` | CTAs, add-to-cart button |
| `text-primary-foreground` | Text on primary buttons |
| `bg-destructive` | Sale prices, error states |
| `bg-accent` | Hover states, highlights |

---

## E-Commerce Screen Patterns

### Product Card (universal)
See `components/ProductCard.tsx` — works on web grid and native FlatList.
Key rules:
- `SolitoImage` for images (next/image on web, expo-image on native)
- `Link` wrapping the entire card for navigation
- Wishlist button with `aria-label` and `aria-pressed`
- Quick-add: Sheet on mobile, hover overlay on web (`web:opacity-0 web:group-hover:opacity-100`)
- Always handle: loading skeleton, sold-out state, no-image fallback

### Product Detail Page (PDP)
See `screens/ProductDetailScreen.tsx`.
Structure:
1. `ScrollView` with `contentContainerClassName="pb-24"` (space for sticky CTA)
2. Image gallery → `SolitoImage` with `contentFit="cover"`
3. Breadcrumb → web only via `web:flex hidden`
4. Title · Rating · Price group
5. Variant selectors → `Select` or `ToggleGroup`
6. Quantity picker
7. **Sticky add-to-cart bar** (native: fixed bottom, web: sidebar or below fold)
8. Tabs: Description / Specs / Reviews / Shipping
9. Related products `FlatList` / grid

### Cart
See `screens/CartScreen.tsx`.
- Native: `FlatList` for cart items, sticky footer
- Web: 2-col layout (items | summary)
- Free shipping progress: `Progress` component
- Cross-sells: horizontal `FlatList` / grid row
- Express checkout buttons ABOVE form inputs

### Category / Filter Page
See `screens/CategoryScreen.tsx`.
- Native: filter trigger → Sheet from bottom
- Web: filter sidebar (lg:block) + Sheet for mobile
- Active filters as `Badge` pills with × remove
- Sort via `Select`
- `FlatList` with `numColumns={2}` on native, CSS grid on web

### Checkout
See `screens/CheckoutScreen.tsx`.
- Guest checkout FIRST (don't force account creation)
- Steps: Contact → Shipping → Payment
- Express pay (Apple Pay / Google Pay) at top, native-only via `ios:flex android:flex web:hidden`
- Order summary always visible: web sidebar, native collapsible `Accordion`

---

## Accessibility Non-Negotiables

Every interactive element MUST have:
```tsx
// Icon-only buttons
<Pressable accessibilityLabel="Add to wishlist" accessibilityRole="button" accessibilityState={{ checked: isWishlisted }}>

// Images
<SolitoImage alt="Nike Air Max in Black, front view" />

// Form inputs
<Label nativeID="email-label">Email</Label>
<TextInput accessibilityLabelledBy="email-label" />

// Dynamic updates (cart count)
<View accessibilityLiveRegion="polite">
  <Text>{cartCount} items in cart</Text>
</View>
```

---

## Performance Rules

1. **FlatList for ALL lists** — never `ScrollView` + `map` for products
2. **`getItemLayout`** on product lists when item height is fixed
3. **`React.memo`** on `ProductCard` (re-renders kill scroll performance)
4. **`SolitoImage`** always — handles `priority`, `sizes`, lazy loading
5. **Skeleton screens** always — no blank states, no spinners alone
6. **Optimistic UI** for cart actions — don't wait for API to update count
7. **`useCallback`** on `renderItem` in FlatList
8. **Zustand** for cart/wishlist state (lightweight, no boilerplate)

```tsx
// ✅ Correct FlatList pattern for products
<FlatList
  data={products}
  keyExtractor={(item) => item.id}
  numColumns={2}
  columnWrapperClassName="gap-3"
  contentContainerClassName="gap-3 px-4 pb-24"
  renderItem={({ item }) => <ProductCard product={item} />}
  getItemLayout={(_, index) => ({ length: CARD_HEIGHT, offset: CARD_HEIGHT * index, index })}
  ListEmptyComponent={<ProductGridSkeleton />}
/>
```

---

## File Naming Conventions

```
packages/app/features/product/
  ProductDetailScreen.tsx     ← shared screen (used by both expo + next)
  ProductDetailScreen.native.tsx ← native-only overrides (rare)
  components/
    ProductCard.tsx
    ProductCard.native.tsx    ← only if significantly different
  hooks/
    useProduct.ts
  store/
    productStore.ts
```

**Web-first files**: The default file (no extension) = web. `.native.tsx` = native override.
This is the Solito v5 way — flips the old `.web.tsx` convention.

---

## Common Mistakes to Avoid

| ❌ Wrong | ✅ Right |
|----------|---------|
| `StyleSheet.create` on Solito components | Plain style objects `style={{ color: 'red' }}` |
| `viewProps={{ style: ... }}` on Link | `style={{ ... }}` directly on Link |
| `textProps` on TextLink | Props directly on TextLink |
| Array styles `style={[a, b]}` on Solito | Merged object `style={{ ...a, ...b }}` |
| `Platform.select()` for styling | `native:` / `ios:` / `web:` Uniwind selectors |
| npm installing RNR | Copy-paste via CLI or manually |
| Hardcoded colors `#ffffff` | Semantic tokens `bg-background` |
| `ScrollView` + products map | `FlatList` with `renderItem` |
| Blank loading state | `Skeleton` components matching layout |
| Missing `accessibilityLabel` on icon buttons | Always add `accessibilityLabel` |

---

## Files in This Skill

| File | Description |
|------|-------------|
| `SKILL.md` | This file |
| `tokens/global.css` | Complete e-commerce design token system |
| `tokens/global.css.web.css` | Web-only overrides (hover, focus-ring, etc.) |
| `components/ProductCard.tsx` | Universal product card |
| `components/ProductGrid.tsx` | FlatList/grid wrapper |
| `components/CartItem.tsx` | Cart item row |
| `components/CartDrawer.tsx` | Sheet-based cart drawer |
| `components/FilterSheet.tsx` | Bottom sheet filters |
| `components/StarRating.tsx` | Accessible star rating |
| `screens/ProductDetailScreen.tsx` | Full PDP screen |
| `screens/CategoryScreen.tsx` | Category + filter screen |
| `screens/CartScreen.tsx` | Cart screen |
| `screens/CheckoutScreen.tsx` | Checkout flow |
| `patterns/navigation.tsx` | Solito navigation patterns |
| `patterns/theming.tsx` | Uniwind theme patterns |
| `examples/monorepo-structure.md` | Complete monorepo setup guide |
