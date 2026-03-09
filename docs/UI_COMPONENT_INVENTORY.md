# `@real/ui` Component Inventory (Priority Build Order)

Purpose: define what exists, what is missing, and what to build first for premium ecommerce UX.

## 1) Current Components (Already in `packages/ui/components`)

- `Box`
- `Text`
- `Container`
- `Grid`
- `Button`
- `Input`
- `Card`
- `Drawer`
- `Badge`
- `Divider`
- `MetricCard`
- `NavChip`
- `SectionHeading`

## 2) Gaps vs Premium Commerce Requirements

These are missing for a production-grade premium storefront:

- Search components: `SearchInput`, `SearchSuggestionList`, `SearchEmptyState`
- Product card system: `ProductCard`, `ProductPrice`, `ProductBadge`, `ProductActions`
- Media: `ResponsiveImage`, `ImageRatioBox`, `Carousel`, `ThumbnailStrip`
- State components: `Skeleton`, `EmptyState`, `InlineError`, `Toast`
- Form UX: `FormField`, `Select`, `RadioGroup`, `Checkbox`, `QuantityStepper`
- Filters/sort: `FilterPanel`, `FilterChip`, `SortSelect`, `AppliedFilterBar`
- Commerce blocks: `CartLineItem`, `OrderSummary`, `PromoCodeField`, `StockIndicator`
- Navigation shell blocks: `HeaderSearch`, `IconButton`, `MenuPanel`, `BottomTabBar`

## 3) Priority Plan

## P0 (Build First: Core Purchase Flow)

- `ProductCard`
- `Skeleton`
- `EmptyState`
- `InlineError`
- `QuantityStepper`
- `CartLineItem`
- `OrderSummary`
- `StockIndicator`
- `FilterChip`
- `SortSelect`

Exit criteria:
- Home, Shop, PDP, Cart, Checkout can render complete `loading/empty/error/success` states.
- No direct ad-hoc UI patterns outside shared components.

## P1 (Build Next: Conversion and Discoverability)

- `SearchInput`
- `SearchSuggestionList`
- `SearchEmptyState`
- `FilterPanel`
- `AppliedFilterBar`
- `PromoCodeField`
- `Carousel`
- `ThumbnailStrip`
- `Toast`

Exit criteria:
- Search, filtering, PDP media, and promo code interactions are consistent across web/mobile.

## P2 (Build Last: Polish and Role-Specific Surfaces)

- `HeaderSearch`
- `MenuPanel`
- `BottomTabBar`
- `FormField`
- `Select`
- `RadioGroup`
- `Checkbox`
- `IconButton`

Exit criteria:
- Admin/pharmacist/customer navigation and forms use one shared component contract.

## 4) Mandatory Component Contract Rules

- Every new component must support token-only visuals (no hardcoded visual values).
- Every interactive component must define disabled/loading/focus states.
- Every commerce-facing component must support RTL.
- Web hover behavior must have a native touch equivalent.
- Components accept content via props; no hardcoded marketing copy.

## 5) Mapping to Screens (`@real/app`)

- `HomeScreen`: needs `ProductCard`, `Skeleton`, `EmptyState`, `InlineError`, `Carousel`
- `ShopScreen`: needs `ProductCard`, `FilterPanel`, `FilterChip`, `SortSelect`, `AppliedFilterBar`
- `ProductScreen`: needs `StockIndicator`, `QuantityStepper`, `Carousel`, `ThumbnailStrip`
- `CheckoutScreen`: needs `CartLineItem`, `OrderSummary`, `PromoCodeField`, form components
- `Account/Admin/Pharmacist`: need common form/state components and shell/nav components

## 6) Definition of Done for `@real/ui`

- Component exported from `packages/ui/index.ts`
- Types included and props documented in code comments
- LTR + RTL verified
- Web + native behavior verified
- Used by at least one shared screen in `@real/app`
