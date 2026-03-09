# Delivery Execution Checklist

## Phase A: Must Before Beta

### 1) Shop page production pass
- Route: `apps/next/app/shop/page.tsx`
- Screen logic: `packages/app/screens/ShopScreen.tsx`
- Catalog UI: `packages/ui/components/shop/ShopCatalogView.tsx`
- Product tile: `packages/ui/components/ProductCard.tsx`
- API: `apps/next/app/api/products/route.ts`
- API: `apps/next/app/api/search/route.ts`
- Done criteria:
  - `loading`, `empty`, `error`, `disabled`, `out-of-stock` states are visible and stable.
  - LTR and RTL behavior validated.

### 2) PDP conversion core
- Route: `apps/next/app/product/[id]/page.tsx`
- Screen: `packages/app/screens/ProductScreen.tsx`
- API: `apps/next/app/api/products/[id]/route.ts`
- Shared config: `packages/app/features/product/config.ts`
- Done criteria:
  - Media gallery complete.
  - Variant/shade selection complete.
  - Stock status clear.
  - Sticky Add to Cart behavior complete.

### 3) Cart + drawer hardening
- Route: `apps/next/app/cart/page.tsx`
- Screen: `packages/app/screens/CartScreen.tsx`
- Drawer UI: `packages/ui/components/chrome/CartDrawer.tsx`
- APIs:
  - `apps/next/app/api/cart/route.ts`
  - `apps/next/app/api/cart/add/route.ts`
  - `apps/next/app/api/cart/remove/route.ts`
  - `apps/next/app/api/cart/set-quantity/route.ts`
- Done criteria:
  - Optimistic quantity/remove interactions.
  - Clear loading/empty/error states.
  - Keyboard/focus flow works on web.

### 4) Checkout MVP
- Route: `apps/next/app/checkout/page.tsx`
- Screen: `packages/app/screens/CheckoutScreen.tsx`
- Shell behavior: `packages/app/features/shell/Layout.tsx`
- Done criteria:
  - Minimal checkout header mode.
  - Real validation.
  - Clean, low-noise checkout UX.

### 5) Header/search final behavior
- Header orchestrator: `packages/app/features/shell/Header.tsx`
- Search state: `packages/app/features/shell/useHeaderSearch.ts`
- Main row: `packages/ui/components/chrome/HeaderMainRow.tsx`
- Categories: `packages/ui/components/chrome/CategoryRow.tsx`
- Search panel: `packages/ui/components/chrome/SearchPanel.tsx`
- Done criteria:
  - Click-outside close works.
  - Layering is correct.
  - Scroll behavior is stable.
  - Trending/recent/product states complete.

### 6) CMS-driven mutable home content
- CMS API: `apps/next/app/api/cms/home/route.ts`
- Home V2 route: `apps/next/app/home-v2/page.tsx`
- Home screen: `packages/app/screens/HomeV2Screen.tsx`
- Sections: `packages/ui/components/home-v2/*`
- Done criteria:
  - Titles/subtitles/CTA text/links/visibility come from CMS.
  - Layout remains code-owned.

### 7) Role exposure + guards
- Routes:
  - `apps/next/app/admin/page.tsx`
  - `apps/next/app/pharmasset/page.tsx`
  - `apps/next/app/account/page.tsx`
- Middleware/proxy: `apps/next/proxy.ts`
- Done criteria:
  - Customer/admin/pharmacist access boundaries enforced.

### 8) Stability/performance baseline
- Global styles: `apps/next/app/globals.css`
- Image-heavy components:
  - `packages/ui/components/ProductCard.tsx`
  - `packages/ui/components/home-v2/HeroCampaignSlider.tsx`
  - `packages/ui/components/home-v2/BundlePromotionsRail.tsx`
- Done criteria:
  - No layout shift.
  - Proper image sizing.
  - Smooth rail interactions.

## Phase B: v1.1

### 1) Complete the Set block
- UI block: `packages/ui/components/home-v2/CompleteSetBlock.tsx`
- Placement: `packages/app/screens/HomeV2Screen.tsx`
- Data source: CMS + products API through BFF.
- Done criteria:
  - Works from CMS-managed product references.

### 2) Search merchandising tuning
- API behavior: `apps/next/app/api/search/route.ts`
- UI composition:
  - `packages/app/features/shell/useHeaderSearch.ts`
  - `packages/ui/components/chrome/SearchPanel.tsx`
- Done criteria:
  - Better ranking.
  - Better grouping for trending/brands/products.

### 3) Review/cross-sell polish on PDP
- Screen: `packages/app/screens/ProductScreen.tsx`
- Done criteria:
  - Richer decision support without visual clutter.

## Phase C: Defer

### 1) Loyalty full system
- Module target: `packages/app/modules/loyalty/*` (or current features path until migrated)
- Slot integration: `packages/app/platform/extensions/slots.ts` (create/use if missing)
- Done criteria:
  - Tiers, expiry, multipliers, history, barcode redemption.

### 2) Pharmacist workflow full implementation
- Route: `apps/next/app/pharmasset/page.tsx`
- Screen: `packages/app/screens/PharmacistScreen.tsx`
- Done criteria:
  - Diagnostics + recommendations + purchase follow-through.

### 3) ERP live adapter rollout
- Contracts: `packages/providers/contracts/*`
- Registry: `packages/providers/registry.ts`
- Adapters: `packages/adapters/erp-*/*`
- Done criteria:
  - Swap from mock to ERP adapter without core rewrites.
