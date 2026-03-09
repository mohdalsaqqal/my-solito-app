# Delivery Execution Tasks

## Phase A (Beta Critical)

### A1. Shop Page Stability
- Scope files:
  - `apps/next/app/shop/page.tsx`
  - `packages/app/screens/ShopScreen.tsx`
  - `packages/ui/components/shop/ShopCatalogView.tsx`
  - `packages/ui/components/ProductCard.tsx`
  - `apps/next/app/api/products/route.ts`
  - `apps/next/app/api/search/route.ts`
- Acceptance:
  - Product grid supports `loading`, `empty`, `error`, `disabled`, `out-of-stock`.
  - Filters/chips are functional and reversible.
  - LTR/RTL behavior is correct.
- Validate:
  - `yarn guard:checks`
  - Manual check web: `/shop` in EN + AR.

### A2. PDP Conversion Core
- Scope files:
  - `apps/next/app/product/[id]/page.tsx`
  - `packages/app/screens/ProductScreen.tsx`
  - `apps/next/app/api/products/[id]/route.ts`
  - `packages/app/features/product/config.ts`
- Acceptance:
  - Media area works with fallback.
  - Variant/shade selection updates state correctly.
  - Stock status is explicit.
  - Sticky Add to Cart behavior is implemented.
- Validate:
  - `yarn guard:checks`
  - Manual check web: `/product/[id]` EN + AR.

### A3. Cart + Drawer Hardening
- Scope files:
  - `apps/next/app/cart/page.tsx`
  - `packages/app/screens/CartScreen.tsx`
  - `packages/ui/components/chrome/CartDrawer.tsx`
  - `apps/next/app/api/cart/route.ts`
  - `apps/next/app/api/cart/add/route.ts`
  - `apps/next/app/api/cart/remove/route.ts`
  - `apps/next/app/api/cart/set-quantity/route.ts`
- Acceptance:
  - Optimistic qty/remove.
  - Loading, empty, error states.
  - Keyboard/focus flow on web drawer.
- Validate:
  - `yarn guard:checks`
  - Manual add/remove/set-qty via UI.

### A4. Checkout MVP
- Scope files:
  - `apps/next/app/checkout/page.tsx`
  - `packages/app/screens/CheckoutScreen.tsx`
  - `packages/app/features/shell/Layout.tsx`
- Acceptance:
  - Minimal checkout shell.
  - Form validation + error messages.
  - Distraction-minimized layout.
- Validate:
  - `yarn guard:checks`
  - Manual submit tests for valid/invalid checkout forms.

### A5. Header/Search Final Behavior
- Scope files:
  - `packages/app/features/shell/Header.tsx`
  - `packages/app/features/shell/useHeaderSearch.ts`
  - `packages/ui/components/chrome/HeaderMainRow.tsx`
  - `packages/ui/components/chrome/CategoryRow.tsx`
  - `packages/ui/components/chrome/SearchPanel.tsx`
- Acceptance:
  - Click-outside closes panel.
  - Correct z-order/layering.
  - Scrollable panel behavior.
  - Trending/recent/products states complete.
- Validate:
  - `yarn guard:checks`
  - Manual interaction tests desktop/mobile widths.

### A6. CMS-Driven Home Content
- Scope files:
  - `apps/next/app/api/cms/home/route.ts`
  - `apps/next/app/home-v2/page.tsx`
  - `packages/app/screens/HomeV2Screen.tsx`
  - `packages/ui/components/home-v2/*`
- Acceptance:
  - Rails and campaign copy/links/visibility configurable from CMS payload.
  - Layout remains code-owned.
- Validate:
  - `yarn guard:checks`
  - Manual payload swap test in CMS route.

### A7. Role Boundary Enforcement
- Scope files:
  - `apps/next/app/admin/page.tsx`
  - `apps/next/app/pharmasset/page.tsx`
  - `apps/next/app/account/page.tsx`
  - `apps/next/proxy.ts`
- Acceptance:
  - Customer/admin/pharmacist access boundaries enforced.
- Validate:
  - `yarn guard:checks`
  - Manual route access tests by role.

### A8. Performance Baseline
- Scope files:
  - `apps/next/app/globals.css`
  - `packages/ui/components/ProductCard.tsx`
  - `packages/ui/components/home-v2/HeroCampaignSlider.tsx`
  - `packages/ui/components/home-v2/BundlePromotionsRail.tsx`
- Acceptance:
  - No major layout shift.
  - Stable image dimensions.
  - Smooth rail interactions.
- Validate:
  - `yarn guard:checks`
  - Manual Lighthouse/DevTools pass for CLS and interaction smoothness.

## Phase B (v1.1)

### B1. Complete the Set
- `packages/ui/components/home-v2/CompleteSetBlock.tsx`
- `packages/app/screens/HomeV2Screen.tsx`

### B2. Search Merchandising Tuning
- `apps/next/app/api/search/route.ts`
- `packages/app/features/shell/useHeaderSearch.ts`
- `packages/ui/components/chrome/SearchPanel.tsx`

### B3. PDP Review/Cross-sell Polish
- `packages/app/screens/ProductScreen.tsx`

## Phase C (Deferred)

### C1. Loyalty Full System
- `packages/app/modules/loyalty/*`
- `packages/app/platform/extensions/slots.ts`

### C2. Pharmacist Full Workflow
- `apps/next/app/pharmasset/page.tsx`
- `packages/app/screens/PharmacistScreen.tsx`

### C3. ERP Live Adapter Rollout
- `packages/providers/contracts/*`
- `packages/providers/registry.ts`
- `packages/adapters/erp-*/*`
