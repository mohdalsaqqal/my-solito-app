# Phase Documentation

## Phase 1 - Foundation (Structure + Design System)

### 1.1 Folder Restructure (Architecture Lock)

1. Created architecture packages and files:
- `packages/ui/`
- `packages/tokens/`
- `packages/providers/contracts/`
- `packages/providers/registry.ts`
- `packages/adapters/mock/`

2. Added required path aliases in root and Next TS configs:
- `@real/app`
- `@real/ui`
- `@real/tokens`
- `@real/providers`
- `@real/adapters`

3. Updated workspace package names:
- `packages/app/package.json` -> `@real/app`
- `packages/ui/package.json` -> `@real/ui`
- `packages/tokens/package.json` -> `@real/tokens`
- `packages/providers/package.json` -> `@real/providers`
- `packages/adapters/package.json` -> `@real/adapters`

4. Updated app dependencies to use shared package alias:
- `apps/next/package.json` uses `@real/app`
- `apps/expo/package.json` uses `@real/app`

5. Removed old provider implementation files from `packages/app/provider/*` (legacy provider structure files deleted).

6. Added `.env.example` with required variables:
- `USE_MOCK`
- `ODOO_URL`
- `ODOO_SECRET`
- `PAYMENT_GATEWAY_URL`
- `PAYMENT_GATEWAY_SECRET`
- `NEXT_PUBLIC_API_BASE_URL`
- `EXPO_PUBLIC_API_BASE_URL`

### 1.2 Design System Setup (UniWind + Tokens)

1. Configured UniWind/NativeWind baseline:
- `tailwind.config.js`
- `apps/expo/tailwind.config.js`
- `apps/expo/global.css`
- `apps/expo/babel.config.js`
- `apps/expo/metro.config.js`
- `apps/next/app/globals.css` (Tailwind directives added)

2. Created token system in `packages/tokens`:
- `colors.ts`
- `spacing.ts`
- `radius.ts` (4 levels: sm/md/lg/xl)
- `shadows.ts`
- `typography.ts`
- `index.ts`

3. Built required primitives in `packages/ui`:
- `Box`
- `Text`
- `Container`
- `Grid`
- `Button`
- `Input`
- `Card`
- `Drawer`

4. Enforcement checks:
- No `className=` usage in `packages/app`
- No `process.env` usage in `packages/app` and `packages/ui`

### 1.3 RTL Infrastructure

1. Next root layout now sets direction from locale:
- `apps/next/app/layout.tsx` sets `dir` to `rtl` for Arabic locales, else `ltr`.

2. Expo now initializes RTL behavior with `I18nManager`:
- `apps/expo/app/index.tsx` detects locale and applies `allowRTL` / `forceRTL`.

3. Directional style constraints in new UI code:
- Removed left/right directional style usage in new primitives (`Drawer` uses logical start/end radii).

### 1.4 Baseline Shared Screen

1. Created shared screen:
- `packages/app/screens/HomeScreen.tsx`

2. Exposed for Next:
- `apps/next/app/page.tsx` -> `@real/app/screens/HomeScreen`

3. Exposed for Expo:
- `apps/expo/app/index.tsx`
- `apps/expo/App.tsx` routes to `./app/index`

4. Package export updated:
- `packages/app/index.ts` exports `HomeScreen`.

### Verification

1. Web build verification:
- Ran `yarn --cwd apps/next build` successfully.

2. Expo runtime/export verification:
- Ran `yarn --cwd apps/expo exec expo export --platform all` successfully (iOS + Android bundles generated).

3. Additional fix during verification:
- Added `userInterfaceStyle: "automatic"` in `apps/expo/app.json` to remove Expo warning.

### Notes

1. A `nativewind-env.d.ts` file was auto-created by NativeWind in `apps/expo/` during Metro config load.
2. Legacy route `apps/next/app/users/[userId]/page.tsx` was updated from `solito/navigation` to `next/navigation` to unblock Next build.

## Phase 2 - Provider Layer + BFF Boundary

### 2.1 Provider Contracts

1. Standardized provider result type to internal `ok` shape:
- `packages/providers/contracts/types.ts`

2. Created dedicated interface files:
- `packages/providers/contracts/ProductProvider.ts`
- `packages/providers/contracts/CartProvider.ts`
- `packages/providers/contracts/OrderProvider.ts`
- `packages/providers/contracts/AuthProvider.ts`
- `packages/providers/contracts/CMSProvider.ts`

3. Updated contracts barrel:
- `packages/providers/contracts/index.ts`

4. Removed old contract file:
- `packages/providers/contracts/product.ts`

### 2.2 Mock Adapters

1. Replaced old single file adapter with folder-based mock adapters:
- `packages/adapters/mock/product/index.ts` (fully functional)
- `packages/adapters/mock/cart/index.ts` (stub-valid)
- `packages/adapters/mock/order/index.ts` (stub-valid)
- `packages/adapters/mock/auth/index.ts` (stub-valid)
- `packages/adapters/mock/cms/index.ts` (stub-valid)

2. Added mock barrels:
- `packages/adapters/mock/index.ts`
- `packages/adapters/index.ts` updated to export from mock barrel.

3. Removed old adapter file:
- `packages/adapters/mock/product.ts`

### 2.3 Provider Registry and Export Path

1. Registry now maps all providers through mock adapters:
- `packages/providers/registry.ts`
  - `productProvider`
  - `cartProvider`
  - `orderProvider`
  - `authProvider`
  - `cmsProvider`

2. `USE_MOCK` switch shape preserved in registry.

3. Provider import path remains stable:
- `@real/providers` via `packages/providers/index.ts`.

### 2.4 BFF Skeleton and Response Normalization

1. Added BFF response helper:
- `apps/next/app/api/_lib/response.ts`
  - `ok(data, status?)`
  - `fail(code, message, status?)`
  - Uses `Response.json(...)`.

2. Added Phase 2 routes:
- `apps/next/app/api/products/route.ts` (GET)
- `apps/next/app/api/products/[id]/route.ts` (GET)
- `apps/next/app/api/cart/add/route.ts` (POST)
- `apps/next/app/api/cms/home/route.ts` (GET)

3. Product routes are functional; cart/cms are valid stubs.

### 2.5 API Client Factory and App-local Ownership

1. Added shared typed API layer in `packages/app/lib`:
- `packages/app/lib/types.ts`
- `packages/app/lib/endpoints.ts`
- `packages/app/lib/api-client.ts` with `createApiClient({ baseUrl })`.

2. Added app-local client instances (app-shell owned):
- `apps/next/app/apiClient.ts`
- `apps/expo/app/apiClient.ts`

3. No `process.env` usage added to `packages/app`.

### 2.6 Props-injected HomeScreen Data Flow

1. Refactored shared screen to presentational API:
- `packages/app/screens/HomeScreen.tsx`
  - Props: `products`, `loading`, `error`, `onReload`
  - No direct provider/adapter/fetch usage.

2. Next route now owns loading and injects props:
- `apps/next/app/page.tsx`

3. Expo wrapper now owns loading and injects props:
- `apps/expo/app/index.tsx`

### 2.7 Expo Base URL Note

1. `.env.example` remains:
- `NEXT_PUBLIC_API_BASE_URL=http://localhost:3000`
- `EXPO_PUBLIC_API_BASE_URL=http://localhost:3000`

2. Runtime note:
- For Expo on a physical device, `localhost` points to the device itself.
- Use LAN IP instead (example: `http://192.168.x.x:3000`).

### 2.8 Optional Upgrades Implemented

1. Added runtime error logging hook in BFF normalization:
- `apps/next/app/api/_lib/response.ts`
  - `fail(...)` now supports meta and logs structured error payload when cause is provided.

2. Added ProviderResult exhaustiveness helper:
- `packages/providers/contracts/types.ts`
  - `matchProviderResult(result, { ok, fail })`

3. Updated BFF routes to use result matcher and unexpected-error catch paths:
- `apps/next/app/api/products/route.ts`
- `apps/next/app/api/products/[id]/route.ts`
- `apps/next/app/api/cart/add/route.ts`
- `apps/next/app/api/cms/home/route.ts`

4. Added products route integration test (supertest):
- `apps/next/app/api/products/route.test.ts`
- `apps/next/package.json`:
  - script `test:api`
  - dev deps `supertest`, `@types/supertest`, `tsx`

## Shell Architecture Implementation (Header/Footer Spec)

### Header/Footer Files Added

Created `packages/app/features/shell/`:
- `Layout.tsx`
- `Header.tsx`
- `TopBar.tsx`
- `MainHeader.tsx`
- `NavigationRow.tsx`
- `MobileDrawer.tsx`
- `CartDrawer.tsx`
- `Footer.tsx`
- `Newsletter.tsx`
- `FooterColumns.tsx`
- `types.ts`
- `index.ts`

Updated export:
- `packages/app/index.ts` now exports shell feature barrel.

### Behavior and Rule Compliance

1. Pure UI only:
- No provider imports
- No adapter imports
- No apiClient usage
- All components accept props only

2. RTL safety:
- Uses logical start/end styles (no left/right hardcoding)
- Mobile drawer slides from logical start side

3. Header contract:
- Optional `TopBar` (hidden when empty)
- `MainHeader` with desktop/mobile layout differences
- `NavigationRow` desktop-only
- Sticky behavior on web only
- Cart drawer web-only and state controlled locally in header layer

4. Footer contract:
- Newsletter block
- Link columns (desktop grid / mobile stacked)
- Optional brand logos section
- Bottom social links with interaction red

5. Styling discipline:
- Token-based spacing/colors/layout
- Red used on interaction states
- No className usage in `packages/app`

### Token Update

Updated `packages/tokens/layout.ts`:
- Added `layout.header.topBarHeight`
- Added `layout.header.mainRowHeight`
- Added `layout.header.navRowHeight`

## Visual Enhancement Pass (Using `pics/` References)

### Style Direction Applied

1. Applied the visual language from:
- `pics/Home-Page.jpeg`
- `pics/Shop-Page.jpeg`
- `pics/category-menu.png`

2. Updated shell and home presentation toward:
- luxury minimal spacing
- neutral surfaces and subtle dividers
- red reserved for interaction
- teal/green product-stage backgrounds for featured items

### Files Updated

1. Token refinement:
- `packages/tokens/colors.ts`
  - tuned neutral text/border/divider palette
  - added `brandTeal`, `brandMint`, `brandGreen`

2. Header/Navigation visual polish:
- `packages/app/features/shell/TopBar.tsx`
- `packages/app/features/shell/MainHeader.tsx`
- `packages/app/features/shell/NavigationRow.tsx`

3. Footer visual polish:
- `packages/app/features/shell/Newsletter.tsx`
- `packages/app/features/shell/FooterColumns.tsx`
- `packages/app/features/shell/Footer.tsx`

4. Shared home screen visual polish:
- `packages/app/screens/HomeScreen.tsx`
  - hero-like intro card
  - featured product card rail with stronger visual staging

5. Web typography baseline:
- `apps/next/app/globals.css`
  - changed body stack to a cleaner editorial/sans pairing

6. Expo shell behavior alignment:
- `apps/expo/app/index.tsx`
  - `showFooter={false}` for native-first mobile shell behavior

### Validation Results

1. Boundary and style guards:
- PASS `rg -n "@real/adapters" packages/app apps/next/app/api`
- PASS `rg -n "@real/providers" packages/app/screens`
- PASS `rg -n "fetch\(" packages/app/screens`
- PASS `rg -n "process.env" packages/app packages/ui`
- PASS `rg -n "className=" packages/app`

2. Build checks:
- PASS `yarn --cwd apps/next build`
- PASS `yarn --cwd apps/expo exec expo export --platform ios`

## Header Refinement (Luxury Minimal + Icon Actions)

### Requested Update Implemented

1. Header navigation simplified to exactly three centered anchors:
- Main Categories
- Luxury Brands
- Flash Deals

2. Extra navigation noise removed from desktop row.

3. Header actions are icon-only (wishlist/account/cart) with badge notifications.

4. Visual style kept minimal and luxury:
- subtle borders
- neutral text
- red used for interaction/badges

### Files Updated

- `packages/app/features/shell/MainHeader.tsx`
- `packages/app/features/shell/NavigationRow.tsx`
- `packages/app/features/shell/Header.tsx`
- `packages/app/features/shell/Layout.tsx`
- `packages/app/features/shell/defaults.ts`
- `apps/next/app/page.tsx`
- `apps/expo/app/index.tsx`

### Verification Results

1. PASS `rg -n "className=" packages/app`
2. PASS `rg -n "process.env" packages/app packages/ui`
3. PASS `yarn --cwd apps/next build`
4. PASS `yarn --cwd apps/expo exec expo export --platform ios`

## Premium Pass - Header/Footer + Typography Upgrade

### Scope

Focused pass completed for:
- icon system refinement
- spacing/typography tuning
- interaction state quality
- responsive behavior polish

### Typography Token Upgrade

1. Extended `packages/tokens/typography.ts` with semantic roles and finer granularity:
- `bodySm`, `bodyMd`, `bodyLg`
- `hero`
- `nav`, `label`, `meta`, `footer`

2. Upgraded `packages/ui/components/Text.tsx`:
- new variants: `subtitle`, `nav`, `label`, `meta`, `footer`
- variant-specific default line-height multipliers
- variant-specific default letter spacing for nav/label/meta
- variant-specific default font weight mapping

### Header Premium Updates

1. Rebuilt icon system in `packages/app/features/shell/MainHeader.tsx`:
- removed glyph/emoji icon usage
- added vector-like icon shapes for wishlist/account/cart using RN views
- icon hover background chip + pressed opacity
- badge rendering preserved and visually tightened

2. Refined mobile menu affordance:
- replaced text glyph menu with 3-line icon construction

3. Refined brand treatment and spacing:
- uppercase brand mark with tighter tracking
- balanced row spacing and icon group density
- search input height tuned desktop/mobile

4. Navigation row interactions upgraded in `packages/app/features/shell/NavigationRow.tsx`:
- semantic `nav` typography variant
- hover underline accent per item
- subtle pressed feedback
- centered premium alignment retained

5. Top bar typography/interaction tuning in `packages/app/features/shell/TopBar.tsx`:
- semantic label text role
- cleaner hover/pressed state behavior

### Footer Premium Updates

1. Upgraded `packages/app/features/shell/FooterColumns.tsx`:
- desktop uses semantic `label`/`footer` roles
- mobile converted to clean accordion behavior (expand/collapse)
- improved disclosure affordance and state

2. Upgraded `packages/app/features/shell/Footer.tsx`:
- footer meta and social links now use semantic text roles
- pressed feedback added to social interactions

3. Upgraded `packages/app/features/shell/Newsletter.tsx`:
- tighter title/subtitle rhythm
- semantic footer copy role
- spacing refinements for premium balance

### Verification Results

1. Guard scans:
- PASS `rg -n "className=" packages/app`
- PASS `rg -n "process.env" packages/app packages/ui`
- PASS `rg -n "@real/adapters" packages/app apps/next/app/api`
- PASS `rg -n "@real/providers" packages/app/screens`
- PASS `rg -n "fetch\(" packages/app/screens`

2. Build/export:
- PASS `yarn --cwd apps/next build`
- PASS `yarn --cwd apps/expo exec expo export --platform ios`

## Header Best-Practice Compliance Pass

### Implemented Against Requested Principles

1. Accessibility + focus visibility:
- Added visible focus states to key header/drawer actions (icons and nav items).
- Added semantic accessibility labels/roles to interactive header/menu controls.

2. Tap target compliance:
- Increased utility icon hit area to 40x40.
- Added 40px minimum touch rows in mobile drawer links.

3. State clarity:
- Added explicit active nav state for desktop primary nav items.
- Kept hover and pressed differentiation with clear visual hierarchy.
- Input now has a visible focused border state.

4. Responsive refinement:
- Preserved desktop full nav and mobile simplified row + drawer/search.
- Maintained sticky web behavior with top promo bar collapse on downward scroll.

5. RTL-safe implementation:
- Continued logical properties usage (start/end, topStart/topEnd radius).
- No forbidden directional left/right spacing properties introduced.

### Files Updated

- `packages/ui/components/Input.tsx`
- `packages/app/features/shell/MainHeader.tsx`
- `packages/app/features/shell/NavigationRow.tsx`
- `packages/app/features/shell/MobileDrawer.tsx`

### Verification Results

- PASS `rg -n "className=" packages/app`
- PASS `rg -n "process.env" packages/app packages/ui`
- PASS `rg -n "marginLeft|marginRight|paddingLeft|paddingRight|\\bleft\\b|\\bright\\b" packages/app/features/shell packages/ui/components`
- PASS `yarn --cwd apps/next build`
- PASS `yarn --cwd apps/expo exec expo export --platform ios`

## Icon Pack Update - Option 2 (Lucide)

### What was implemented

1. Applied your request to use option 2 (Lucide) in header actions.
2. Implemented web-safe Lucide usage in `MainHeader`:
- web: uses `lucide-react` icons (`Heart`, `User`, `ShoppingBag`, `Menu`)
- native: keeps fallback icon rendering for Expo compatibility

### Why this architecture

- `lucide-react-native` caused Next.js Turbopack build failures via `react-native-svg` Fabric imports.
- The final approach preserves both platforms and keeps UI behavior consistent.

### Files changed

- `packages/app/features/shell/MainHeader.tsx`
- `packages/ui/package.json`
- `packages/app/package.json`

### Validation

- PASS `yarn --cwd apps/next build`
- PASS `yarn --cwd apps/expo exec expo export --platform ios`
- PASS `rg -n "className=" packages/app`
