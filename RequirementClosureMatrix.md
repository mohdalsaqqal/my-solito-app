# Requirement Closure Matrix

This matrix aligns project requirements to current implementation, status, and remaining actions.

Status legend:
- `Done`
- `Partial`
- `Missing`

## R1. Premium UI identity (clean, confident, structured, red accent)
- Status: `Partial`
- Current files:
  - `packages/ui/components/ProductCard.tsx`
  - `packages/ui/components/chrome/HeaderMainRow.tsx`
  - `packages/ui/components/chrome/CategoryRow.tsx`
  - `packages/ui/components/chrome/SearchPanel.tsx`
  - `packages/app/screens/HomeV2Screen.tsx`
  - `apps/next/app/globals.css`
- Remaining tasks:
  - Run final visual parity pass across desktop/mobile and LTR/RTL.
  - Normalize spacing/radius/contrast edge cases in remaining screens (`account`, `admin`, `pharmasset`).

## R2. UI stable with dynamic data (loading/empty/error/disabled/out-of-stock)
- Status: `Partial`
- Current files:
  - `packages/ui/components/ProductCard.tsx`
  - `packages/ui/components/HorizontalRailState.tsx`
  - `packages/app/screens/ShopScreen.tsx`
  - `packages/ui/components/shop/ShopCatalogView.tsx`
  - `packages/app/screens/CartScreen.tsx`
  - `packages/app/screens/CheckoutScreen.tsx`
- Remaining tasks:
  - Add explicit `disabled` behavior where missing in non-shop/product flows.
  - Verify all rails/components render all required states under API failure conditions.

## R3. Core commerce features (listing, PDP, cart, checkout, account, orders)
- Status: `Partial`
- Current files:
  - Listing: `apps/next/app/shop/page.tsx`, `packages/app/screens/ShopScreen.tsx`
  - PDP: `apps/next/app/product/[id]/page.tsx`, `packages/app/screens/ProductScreen.tsx`
  - Cart: `apps/next/app/cart/page.tsx`, `packages/app/screens/CartScreen.tsx`, `packages/ui/components/chrome/CartDrawer.tsx`
  - Checkout: `apps/next/app/checkout/page.tsx`, `packages/app/screens/CheckoutScreen.tsx`
  - Account: `apps/next/app/account/page.tsx`, `packages/app/screens/AccountScreen.tsx`
- Remaining tasks:
  - Implement full order lifecycle (order creation, confirmation, history details, statuses).
  - Complete account order-history experience end-to-end.

## R4. Global smart header
- Status: `Partial`
- Current files:
  - `packages/app/features/shell/Header.tsx`
  - `packages/app/features/shell/useHeaderSearch.ts`
  - `packages/ui/components/chrome/SearchPanel.tsx`
  - `packages/ui/components/chrome/CategoryRow.tsx`
- Remaining tasks:
  - Finalize search UX polish (all interaction edges and accessibility on web/mobile).
  - Ensure all mutable menu/search merchandising content is fully CMS-driven.

## R5. Shop efficiency (desktop 4-col, mobile 2-col, filter UX)
- Status: `Partial`
- Current files:
  - `packages/app/screens/ShopScreen.tsx`
  - `packages/ui/components/shop/ShopCatalogView.tsx`
- Remaining tasks:
  - Validate screenshot parity for strict responsive layout targets in LTR/RTL.
  - Ensure filter behavior parity across desktop sidebar and mobile sheet.

## R6. PDP conversion quality
- Status: `Partial`
- Current files:
  - `packages/app/screens/ProductScreen.tsx`
  - `apps/next/app/product/[id]/page.tsx`
  - `apps/next/app/api/reviews/route.ts`
  - `packages/providers/contracts/ReviewProvider.ts`
  - `packages/adapters/mock/review/index.ts`
- Remaining tasks:
  - Replace CMS-based cross-sell mapping with analytics-driven co-purchase ranking when order-line analytics is available.

## R7. Cart + checkout cleanliness
- Status: `Partial`
- Current files:
  - `packages/ui/components/chrome/CartDrawer.tsx`
  - `packages/app/screens/CartScreen.tsx`
  - `packages/app/screens/CheckoutScreen.tsx`
  - `apps/next/app/checkout/page.tsx`
  - `apps/next/app/checkout/success/page.tsx`
  - `apps/next/app/api/orders/place/route.ts`
- Remaining tasks:
  - Move order creation from temporary BFF composition to provider contract (`OrderProvider.create/place`) for persistent order lifecycle.
  - Add richer success/receipt UX details (delivery window, payment summary, invoice actions).

## R8. Loyalty system
- Status: `Missing`
- Current files:
  - Placeholder architecture only, no complete module path implemented yet.
- Remaining tasks:
  - Implement module under `packages/app/modules/loyalty/*`.
  - Add points/tier/history/expiry/redemption flows and CMS-configured rules.

## R9. Pharmacist tool
- Status: `Missing/Partial`
- Current files:
  - `apps/next/app/pharmasset/page.tsx`
  - `packages/app/screens/PharmacistScreen.tsx`
- Remaining tasks:
  - Implement QR scan flow, diagnostics, recommendations, and purchase follow-through.
  - Enforce role behavior and disabled-module behavior.

## R10. CMS controls mutable content
- Status: `Done` (active storefront surfaces)
- Current files:
  - `apps/next/app/api/cms/home/route.ts`
  - `packages/adapters/mock/cms/index.ts`
  - `packages/app/screens/HomeV2Screen.tsx`
  - `packages/app/features/shell/Header.tsx`
  - `packages/ui/components/chrome/SearchPanel.tsx`
  - `packages/app/screens/ShopScreen.tsx`
  - `packages/ui/components/shop/ShopCatalogView.tsx`
  - `apps/next/app/shop/page.tsx`
- Remaining tasks:
  - Keep legacy/secondary routes aligned if they remain user-facing (e.g. `HomeScreen` path).
  - Preserve schema parity between provider contracts and app types when adding new CMS fields.

## R11. Canonical architecture flow
- Status: `Done`
- Current files:
  - `packages/app/lib/api-client.ts`
  - `apps/next/app/api/*`
  - `packages/providers/registry.ts`
  - `packages/providers/contracts/*`
  - `packages/adapters/*`
- Remaining tasks:
  - Keep guard checks in CI and preserve dependency direction.

## R12. Mobile-first behavior
- Status: `Partial`
- Current files:
  - `packages/app/features/shell/Layout.tsx`
  - `packages/app/features/shell/Header.tsx`
  - `packages/ui/components/shop/ShopCatalogView.tsx`
  - `packages/app/screens/ProductScreen.tsx`
  - `packages/app/screens/CheckoutScreen.tsx`
- Remaining tasks:
  - Validate touch targets and bottom-sheet interactions on device (after latest search/check-out mobile parity pass).
  - Capture final visual verification for mobile search modal, shop filters, and checkout sticky CTA.

## R13. Performance requirements
- Status: `Partial`
- Current files:
  - `packages/ui/components/home-v2/HeroCampaignSlider.tsx`
  - `packages/ui/components/HeroSlideCard.tsx`
  - `packages/ui/components/ProductCard.tsx`
- Remaining tasks:
  - Run CLS/LCP audits and optimize image loading strategy route-by-route.
  - Add measured performance budget checks for homepage/shop/product.

## R14. Security and role protection
- Status: `Partial`
- Current files:
  - `apps/next/proxy.ts`
  - `apps/next/app/api/*`
- Remaining tasks:
  - Complete API-level authorization checks where needed.
  - Add explicit protected behavior tests for role boundaries.

## R15. Future-proofing (adapters/modules/multi-tenant readiness)
- Status: `Partial` (foundation aligned)
- Current files:
  - `packages/providers/contracts/*`
  - `packages/providers/registry.ts`
  - `packages/adapters/*`
- Remaining tasks:
  - Expand from mock-only adapter wiring to first real ERP/payment adapters.
  - Formalize module slot registration for loyalty/pharmacist extensions.

## Closure Order Recommendation
1. Orders + checkout completion (`R3`, `R7`)
2. CMS completion sweep (`R10`)
3. Search/shop/PDP final UX hardening (`R4`, `R5`, `R6`, `R12`)
4. Loyalty and pharmacist modules (`R8`, `R9`)
5. Performance/security final audit (`R13`, `R14`)

---

## Ecommerce Core Baseline Comparison (Web + Expo)

This section compares a standard ecommerce baseline to what is currently implemented.

Status legend:
- `Done`
- `Partial`
- `Missing`

### B1. Core surfaces and routes
- Baseline: `Home`, `Categories`, `Shop/PLP`, `Search Results`, `PDP`, `Cart`, `Checkout`, `Account`, `Orders`, `Auth`.
- Web status: `Done`
- Expo status: `Partial`
- Evidence:
  - Web routes:
    - `apps/next/app/page.tsx`
    - `apps/next/app/home-v2/page.tsx`
    - `apps/next/app/shop/page.tsx`
    - `apps/next/app/product/[id]/page.tsx`
    - `apps/next/app/cart/page.tsx`
    - `apps/next/app/checkout/page.tsx`
    - `apps/next/app/account/page.tsx`
    - `apps/next/app/search/page.tsx`
    - `apps/next/app/orders/page.tsx`
    - `apps/next/app/orders/[id]/page.tsx`
    - `apps/next/app/auth/login/page.tsx`
    - `apps/next/app/auth/register/page.tsx`
    - `apps/next/app/auth/forgot-password/page.tsx`
    - `apps/next/app/auth/reset-password/page.tsx`
    - `apps/next/app/sales/page.tsx`
  - Expo entry:
    - `apps/expo/app/index.tsx`
    - `type ExpoView = 'home' | 'categories' | 'deals' | 'account' | 'product' | 'checkout' | 'auth-*' | 'search' | 'orders' | 'order-detail'`
- Gaps:
  - Expo still uses a lightweight view-switch model rather than dedicated route files per surface.

### B2. Navigation model
- Baseline: web header + category nav, mobile bottom nav + drawer menu.
- Web status: `Done`
- Expo status: `Partial`
- Evidence:
  - Shared shell:
    - `packages/app/features/shell/Header.tsx`
    - `packages/app/features/shell/Layout.tsx`
    - `packages/app/features/shell/defaults.ts`
  - Expo drawer hook-up:
    - `apps/expo/app/index.tsx` (`moreOpen`, `Drawer`, `onBottomNavChange`)
- Gaps:
  - Mobile drawer content is minimal; needs full secondary nav tree (brands/help/orders/legal/etc) from CMS/config.

### B3. Search experience
- Baseline: input, suggestions, trending, popular brands, recents, close behavior, results handoff.
- Web status: `Done`
- Expo status: `Done`
- Evidence:
  - Search logic:
    - `packages/app/features/shell/useHeaderSearch.ts`
    - `packages/app/features/shell/Header.tsx` (commit handoff)
  - Search UI:
    - `packages/ui/components/chrome/SearchPanel.tsx`
    - `packages/ui/components/chrome/HeaderMainRow.tsx`
    - `packages/app/screens/SearchResultsScreen.tsx`
  - BFF search:
    - `apps/next/app/api/search/route.ts`
  - Surfaces:
    - `apps/next/app/search/page.tsx`
    - `apps/expo/app/index.tsx` (`view === 'search'`)
- Gaps:
  - Search results are first-class, but filters/sort controls for results are not yet exposed on the dedicated search surface.

### B4. PLP/catalog and filters
- Baseline: desktop 4-column + sticky filters, mobile 2-column + bottom-sheet filters/sort.
- Web status: `Partial`
- Expo status: `Partial`
- Evidence:
  - PLP screen:
    - `packages/app/screens/ShopScreen.tsx`
  - Catalog UI:
    - `packages/ui/components/shop/ShopCatalogView.tsx`
- Gaps:
  - Final parity pass required for strict responsive behavior and filter/sort parity across web/mobile.

### B5. PDP conversion baseline
- Baseline: media gallery, variants/options, sticky add-to-cart, stock states, reviews, cross-sell.
- Web status: `Partial`
- Expo status: `Partial`
- Evidence:
  - PDP:
    - `packages/app/screens/ProductScreen.tsx`
    - `apps/next/app/product/[id]/page.tsx`
  - Reviews API:
    - `apps/next/app/api/reviews/route.ts`
- Gaps:
  - Variant/option depth and final conversion polish remain partial.

### B6. Cart and checkout baseline
- Baseline: cart drawer + cart page, qty/remove feedback, checkout flow, success state.
- Web status: `Done`
- Expo status: `Partial`
- Evidence:
  - Cart UI:
    - `packages/ui/components/chrome/CartDrawer.tsx`
    - `packages/app/screens/CartScreen.tsx`
  - Checkout:
    - `packages/app/screens/CheckoutScreen.tsx`
    - `apps/next/app/checkout/page.tsx`
    - `apps/next/app/checkout/success/page.tsx`
  - Orders place API:
    - `apps/next/app/api/orders/place/route.ts`
- Gaps:
  - Expo cart is currently represented through checkout flow; dedicated cart surface parity can be improved.

### B7. Account and orders baseline
- Baseline: account hub + order history + order detail/status.
- Web status: `Done`
- Expo status: `Done`
- Evidence:
  - Account:
    - `packages/app/screens/AccountScreen.tsx`
    - `apps/next/app/account/page.tsx`
    - `apps/expo/app/index.tsx`
  - Orders UI:
    - `packages/app/screens/OrdersScreen.tsx`
    - `packages/app/screens/OrderDetailScreen.tsx`
    - `apps/next/app/orders/page.tsx`
    - `apps/next/app/orders/[id]/page.tsx`
  - Orders API:
    - `apps/next/app/api/orders/route.ts`
    - `apps/next/app/api/orders/[id]/route.ts`
- Gaps:
  - Extend provider/order contracts with line-item level detail for richer order detail surfaces.

### B8. Auth baseline
- Baseline: login/register/logout/password reset and protected user flows.
- Web status: `Partial`
- Expo status: `Partial`
- Evidence:
  - Provider contract + mock adapter:
    - `packages/providers/contracts/AuthProvider.ts`
    - `packages/adapters/mock/auth/index.ts`
  - BFF auth routes:
    - `apps/next/app/api/auth/session/route.ts`
    - `apps/next/app/api/auth/login/route.ts`
    - `apps/next/app/api/auth/register/route.ts`
    - `apps/next/app/api/auth/logout/route.ts`
    - `apps/next/app/api/auth/request-reset/route.ts`
    - `apps/next/app/api/auth/reset-password/route.ts`
  - Auth session cookie hardening + proxy guard:
    - `apps/next/app/api/_lib/auth-session.ts`
    - `apps/next/proxy.ts`
  - Auth API tests:
    - `apps/next/app/api/auth/route.test.ts`
  - Shared auth screens:
    - `packages/app/screens/AuthLoginScreen.tsx`
    - `packages/app/screens/AuthRegisterScreen.tsx`
    - `packages/app/screens/AuthForgotPasswordScreen.tsx`
    - `packages/app/screens/AuthResetPasswordScreen.tsx`
  - Web auth routes:
    - `apps/next/app/auth/login/page.tsx`
    - `apps/next/app/auth/register/page.tsx`
    - `apps/next/app/auth/forgot-password/page.tsx`
    - `apps/next/app/auth/reset-password/page.tsx`
  - Expo auth integration:
    - `apps/expo/app/index.tsx`
- Gaps:
  - Replace current signed-cookie + mock persistence with real provider-backed token/session verification.
  - Expand Expo route guards for all protected destinations after final guest-checkout policy is confirmed.
  - Run API tests in a Linux-compatible dependency setup (current WSL workspace has `esbuild` platform mismatch).

### B9. Shared architecture compliance
- Baseline: `UI -> apiClient -> BFF -> provider registry -> adapters`.
- Web status: `Done`
- Expo status: `Done`
- Evidence:
  - Shared client:
    - `packages/app/lib/api-client.ts`
  - BFF routes:
    - `apps/next/app/api/*`
  - Provider registry/contracts:
    - `packages/providers/registry.ts`
    - `packages/providers/contracts/*`
  - Adapter implementations:
    - `packages/adapters/*`

### B10. Tokenized styling + RTL baseline
- Baseline: token-driven design system and RTL-safe behavior across surfaces.
- Web status: `Partial`
- Expo status: `Partial`
- Evidence:
  - Tokens:
    - `packages/tokens/*`
  - Shared UI:
    - `packages/ui/*`
  - RTL in expo shell:
    - `apps/expo/app/index.tsx` (`I18nManager`)
- Gaps:
  - Final component-by-component parity pass required on all remaining surfaces.

## Baseline Closure Priority (Execution Order)
1. Add dedicated search results surface (`B3`) and hook search commit to it.
2. Finalize PLP/mobile filter parity (`B4`) and Expo cart parity (`B6`).
3. Complete auth hardening (`B8`) with real provider-backed session verification.
4. Complete RTL + visual parity pass (`B10`) on web and Expo.
5. Enrich order detail contracts for full line-item timeline UX (`B7` enhancement).
