# AGENTS VERSION
- Version: `v1.4`
- Last updated: `2026-03-07`
- This file is the execution policy for architecture, UI/UX, and delivery discipline.

## Rule Priorities
- `P0` Blocker: must pass before merge.
- `P1` Preferred: enforce unless explicitly deferred.
- Conflict rule: if `P0` and `P1` conflict, `P0` wins.

## A) Task Domain Classification & Skill Stack (`P0`)
Before execution of any task:
1. Classify the task into exactly one domain:
   - `🏗 Architecture / Core Logic`
   - `💰 Pricing / Payments`
   - `🐛 Debugging / Failure`
   - `🎨 UI / UX / Frontend`
   - `📱 Expo / Native`
   - `🚀 Workflow / Scaling`
2. Activate the corresponding skill stack for that domain.
3. Print selected skills in the response header before implementation.
4. If no domain can be identified, stop and request clarification. Do not proceed.

### A.1 Domain-to-Skill Mapping (`P0`)
- `🏗 Architecture / Core Logic`:
  - `brainstorming` (for any creative/feature design)
  - `writing-plans`
  - `verification-before-completion`
- `💰 Pricing / Payments`:
  - `brainstorming`
  - `writing-plans`
  - `stripe-best-practices`
  - `verification-before-completion`
- `🐛 Debugging / Failure`:
  - `systematic-debugging`
  - `verification-before-completion`
- `🎨 UI / UX / Frontend`:
  - `brainstorming`
  - `frontend-design`
  - `ui-ux-pro-max`
  - `ui-visual-validator`
  - `web-design-guidelines`
  - `verification-before-completion`
- `📱 Expo / Native`:
  - `brainstorming`
  - `building-native-ui`
  - `native-data-fetching`
  - `expo-api-routes`
  - `expo-deployment`
  - `verification-before-completion`
- `🚀 Workflow / Scaling`:
  - `writing-plans`
  - `executing-plans`
  - `dispatching-parallel-agents`
  - `subagent-driven-development`
  - `using-git-worktrees`
  - `verification-before-completion`

### A.2 Required Header Format (`P0`)
Before implementation responses, include:
- `Domain: <one of the six domains>`
- `Skills: <comma-separated selected skills>`

## 0) System Purpose
We are building a web-first premium commerce platform with:
- Next.js web + BFF
- Expo customer app
- RTL support (EN/AR)
- CMS-driven content with localized fields
- Replaceable backend integrations
- Extension-based features

Primary goals:
- Core stability
- Replaceable adapters
- Isolated modules
- Clean dependency direction

## AI Workflow Integration (P0)

This repository includes an AI workflow system located in `.codex/`.

For non-trivial tasks (feature implementation, architecture changes, UI
composition, debugging), AI agents SHOULD consult the `.codex/router.js`
workflow system to determine the correct workflow and prompt template.

The router system selects:

- task classification
- prompt template
- scope hints
- guard requirements
- pause-trigger enforcement

AGENTS.md remains the source of truth for architecture rules.
The `.codex` system manages task routing and execution workflow.

## 1) Foundational Non-Negotiables (`P0`)
- Tokens over hardcoded values.
- Adapters over direct external calls.
- Modules over embedded feature logic.
- Slots over hardcoded module injection points.
- Config/CMS over code for mutable business rules.

### 1.1 Token Rules
- All color, spacing, font, and radius values must come from tokens.
- Never hardcode visual values in components.
- Brand swap should be token-file swap, not component rewrite.

### 1.2 Adapter Rules
- Never call ERP/payment/auth directly from UI, hooks, core commerce, or BFF routes.
- External calls go through provider contracts and adapter implementations.
- New backend integration should require new adapter + registry selection, not core rewrites.

### 1.3 Module Rules
- Loyalty, pharmacist workflows, diagnostics, and admin logic are modules.
- Core commerce must not embed module logic.
- Modules can be disabled without core edits.

### 1.4 Slot Rules
- Module UI injection points must be explicit slots.
- Empty slots render nothing and must not break layout.

### 1.5 Config Rules
- Loyalty points, tier thresholds, multipliers, and similar mutable business policies come from config/CMS.

## 2) Canonical Data Architecture (`P0`)
Required flow:

`UI -> apiClient -> BFF -> provider registry -> adapters`

Rules:
- Do not change this chain without explicit approval.
- No storefront framework layer in between.
- No UI-to-provider or UI-to-adapter bypasses.

## 3) Monorepo Structure (`P0`)
```txt
apps/
  next/                 # Web app + BFF (API routes)
  expo/                 # Mobile app (customer)

packages/
  app/                  # Shared screens + features + core commerce
  ui/                   # Shared primitives/components (UniWind)
  tokens/               # Design tokens

  providers/
    contracts/          # Interfaces + result contracts
    registry.ts         # Adapter selection

  adapters/
    erp-*/
    payment-*/
    auth-*/
    mock/
```

Aliases required:
- `@real/app`
- `@real/ui`
- `@real/tokens`
- `@real/providers`
- `@real/adapters`

## 4) Layer Responsibilities (`P0`)
### 4.1 UI (`@real/ui`)
- Primitives/components only.
- UniWind styling allowed.
- No business logic.
- No provider/adapters imports.

### 4.2 Core commerce (`packages/app`)
- Domain areas: shop, product, cart, checkout, orders, account base.
- Current implementation paths:
```txt
packages/app/screens
packages/app/features
packages/app/lib
```
- May import from `@real/providers`.
- Must not import from `@real/adapters`.
- Must not call ERP directly.

### 4.3 Modules
- Target structure:
```txt
packages/app/modules/{module}
```
- Current module code may exist under:
```txt
packages/app/features/{module}
```
- Modules may depend on core.
- Core must never depend on modules.
- Modules inject via extension slots.

### 4.4 Providers (`@real/providers/contracts`)
- Contracts only, no implementation logic.
- Use `ProviderResult<T>` envelope.

Example:
```ts
import { ProviderResult } from './types'

export type Product = {
  id: string
  name: string
  price: number
  currency: string
}

export interface ProductProvider {
  list(): Promise<ProviderResult<Product[]>>
  get(id: string): Promise<ProviderResult<Product>>
}
```

### 4.5 Adapters (`@real/adapters/*`)
- Implement provider contracts fully.
- Talk to ERP/payment/auth.
- Never imported directly by UI/core/BFF routes.

## 5) Provider Registry Pattern (`P0`)
Located at:
```txt
packages/providers/registry.ts
```

Example:
```ts
import { mockProductAdapter } from '@real/adapters/mock/product'
// import { odooProductAdapter } from '@real/adapters/erp-odoo/product'

const useMock = process.env.USE_MOCK !== 'false'

export const productProvider = useMock
  ? mockProductAdapter
  : mockProductAdapter // replace with odooProductAdapter when available
```

Core imports providers from registry only.

## 6) BFF Rules (`P0`)
BFF lives in:
```txt
apps/next/app/api/*
```

Routes must:
- Import providers (registry), not adapters.
- Never call ERP directly.
- Normalize all responses.

Public response envelope (mandatory):
```ts
{ success: true, data: T }
{ success: false, error: { code: string; message: string } }
```

Example:
```ts
import { matchProviderResult } from '@real/providers/contracts'
import { productProvider } from '@real/providers'
import { fail, ok } from '../_lib/response'

export async function GET() {
  try {
    const result = await productProvider.list()
    return matchProviderResult(result, {
      ok: (data) => ok(data),
      fail: (error) => fail(error.code, error.message, 500),
    })
  } catch (cause) {
    return fail('PRODUCT_LIST_UNEXPECTED', 'Unexpected error while fetching products.', 500, {
      scope: 'GET /api/products',
      cause,
    })
  }
}
```

Expo must call BFF endpoints only.

## 7) Extension Slot Pattern (`P0`)
Slots path:
```txt
packages/app/platform/extensions/slots.ts
```
If missing, create exactly at this path.

Example:
```ts
import { ComponentType } from 'react'

export type CheckoutExtension = ComponentType
export const checkoutExtensions: CheckoutExtension[] = []
```

Registration:
```ts
import { checkoutExtensions } from '../platform/extensions/slots'
import { LoyaltyRedeemPanel } from './LoyaltyRedeemPanel'

checkoutExtensions.push(LoyaltyRedeemPanel)
```

Render:
```tsx
{checkoutExtensions.map((Ext, i) => (
  <Ext key={i} />
))}
```

No runtime plugin engine. No dynamic scanning.

## 8) Role Exposure (`P0`)
Roles:
- customer: web + expo
- pharmacist: web only (`/pharmasset`)
- admin: web only (`/admin`)

Middleware path:
```txt
apps/next/proxy.ts
```

Expo must not expose admin/pharmacist routes.

Note: `/pharmacist` and `/pharmasset` routes are intentionally absent from Expo.
These are specialist workflows for the pharmacist role, which is web-only by design.
No Expo equivalent is planned. This is not a parity gap.

## 9) Styling Enforcement (`P0`)
- UniWind allowed only in `packages/ui/**`.
- `className` forbidden in `packages/app/**`.
- Tokens are single source of truth.

Component state policy:
- Every new UI component must define: `loading`, `empty`, `error`, `disabled`.
- Add `out-of-stock` when component represents purchasable product state.

Type/spacing policy:
- Spacing and type scale must come from tokens only.
- No hardcoded spacing values, font sizes, line heights, font weights, colors, radius values.

## 10) Platform File Rules (`P0`)
- Default shared file: `.ts/.tsx` (web-first).
- Prefer `.native.tsx` for native differences.
- Use `.web.tsx` only when unavoidable.

Pause policy:
- Pause before creating `.web.tsx`.
- For `.native.tsx`, pause only when necessity is unclear.

## 11) Environment Rules (`P0`)
Naming:
- `NEXT_PUBLIC_*` web client-safe
- `EXPO_PUBLIC_*` mobile client-safe
- `*_SECRET` server-only
- `*_URL` endpoint
- `USE_*` feature toggles

Required env vars:
- `USE_MOCK`
- `ODOO_URL`
- `ODOO_SECRET`
- `PAYMENT_GATEWAY_URL`
- `PAYMENT_GATEWAY_SECRET`
- `NEXT_PUBLIC_API_BASE_URL`
- `EXPO_PUBLIC_API_BASE_URL`

Rules:
- No hardcoded URLs/secrets.
- All env vars must exist in `.env.example`.
- `process.env` forbidden in `packages/app` and `packages/ui`.

## 12) Adapter Error Contract (`P0`)
Adapters must not throw raw infrastructure errors.

Return shape:
```ts
{
  ok: false,
  error: {
    code: string,
    message: string
  }
}
```

BFF normalizes to public `{ success, data/error }` envelope.

## 13) Test Placement (`P0`)
Tests are colocated with source by default.

Example:
```txt
ProductScreen.tsx
ProductScreen.test.tsx
```

Adapter tests:
```txt
packages/adapters/{adapter}/__tests__/
```

Forbidden:
- `__tests__` in `packages/app`
- `__tests__` in `packages/ui`
- root-level generic tests folder

## 14) UI Ambiguity Rule (`P0`)
Pause and ask when:
- Component pattern is not in `packages/ui`
- Spacing/color need values not covered by tokens
- A new layout region is introduced

UI must follow:
```txt
docs/UI_ARCHITECTURE.md
```

## 15) Pause Triggers (`P0`)
Stop and request guidance for:
- New top-level folder
- Provider interface changes
- Introducing `.web.tsx`
- Runtime plugin systems
- Cross-module dependency changes
- New external integration
- Dependency direction changes

No silent architecture changes.

## 16) Architectural Principle (`P0`)
Core should not need changes when:
- ERP changes
- Payment gateway changes
- Loyalty logic changes
- Feature module is removed

Adapters absorb infrastructure changes.
Modules absorb feature changes.

## 17) RTL Enforcement (`P0`)
All UI must be RTL-compatible.

Rules:
- Use logical start/end spacing.
- Avoid hardcoded `left/right` and side-specific spacing values.
- Mirror directional icons where needed.
- Carousel direction must follow document direction.

Implementation:
- Next root layout sets `dir` from locale.
- Expo uses `I18nManager` when Arabic is active.

Validation:
- Every new UI block must be checked in both LTR and RTL.
- If RTL behavior is uncertain, pause and ask.

## 18) CMS-Driven UI Rules (`P0`)
CMS controls content for:
- hero slides
- promotional banners
- section visibility
- campaign messaging
- loyalty marketing blocks
- newsletter copy
- brand spotlight content

Rules:
- CMS controls content, not layout structure.
- Core layout is code-owned.
- Marketing-driven UI must support CMS injection.

Example:
```tsx
<HomeHero slides={cms.hero} />
```

Forbidden:
- Hardcoded hero/marketing copy in component code.

## 19) Solito v5 Rules (`P0`/`P1`)
Core (`P0`):
- URL is source of truth for navigation.
- Web and native do not directly share navigation state.
- Use `solito/navigation` for App Router paths.
- If using Pages Router area, use `solito/router` only there; do not mix APIs in same feature path.
- Do not use deprecated `viewProps`/`textProps`.

Web-first guidance (`P1`):
- Prefer Next.js DOM primitives in web-only routes/layouts/shells.
- Use RN primitives mainly for shared cross-platform components.
- Do not force RN Web for purely web-only UI blocks.

Migration guidance (`P1`):
- If a shared component becomes web-heavy, split into shared base + minimal platform override.
- Default to shared `.tsx` with optional `.native.tsx` fallback.
- `.web.tsx` only when unavoidable.

## 20) UniWind Rules (`P0`/`P1`)
Core (`P0`):
- UniWind is styling baseline for shared UI.
- Use platform selectors (`ios:`, `android:`, `web:`) where appropriate.
- Avoid unsupported native pseudo-class patterns (`visited:`, `before:`, `after:` in shared/native surfaces).

Implementation guidance (`P1`):
- Prefer `className` utilities first.
- Use `withUniwind` only for third-party components lacking `className`.
- Use `useCSSVariable` sparingly.
- Keep static theming in `global.css` via `@theme` / `@variant`.
- Use `updateCSSVariables` only for true runtime theme updates.

### 20.1 Motion Rules (Moti) (`P0`/`P1`)
Core (`P0`):
- If animation must work across web + native shared components, use `moti` as the default motion layer.
- Do not add `import 'react-native-reanimated'` side-effect imports in Next.js app entry/layout files.
- Do not add motion that hides loading, error, or interaction feedback.

Implementation guidance (`P1`):
- Use subtle, meaningful motion only (state transitions, mount/unmount, focus shifts).
- Prefer `AnimatePresence` + `exit` patterns for mount/unmount transitions.
- Keep motion durations/easing consistent and tokenized where possible.
- Avoid platform branching for animation APIs unless strictly required.
- Motion should not reduce readability or perceived performance in RTL/LTR layouts.

## 21) Guard Scans (`P0`)
Run command:
```sh
yarn guard:checks
```

Canonical checks:
```sh
# 1) No direct adapter imports in UI/app layers (except BFF routes)
rg -n "from '@real/adapters" packages/app packages/ui apps/expo apps/next/app --glob '!apps/next/app/api/**' && exit 1

# 2) No provider imports in packages/ui
rg -n "from '@real/providers" packages/ui && exit 1

# 3) No raw hex colors in shared packages
rg -n "#[0-9a-fA-F]{3,8}" packages/app packages/ui && exit 1

# 4) No direct adapter imports in BFF routes
rg -n "from '@real/adapters" apps/next/app/api && exit 1

# 5) No deprecated Solito props
rg -n "viewProps=|textProps=" packages apps && exit 1

# 6) No solito/router usage in App Router paths
rg -n "from ['\\\"]solito/router['\\\"]" apps/next/app packages/app && exit 1

# 7) No unsupported pseudo-classes in shared/native code
rg -n "visited:|before:|after:" packages/app packages/ui apps/expo && exit 1

# 8) No className in packages/app
rg -n "className=" packages/app && exit 1

# 9) No process.env in shared packages
rg -n "process.env" packages/app packages/ui && exit 1

# 10) No forbidden tests folders
rg -n "__tests__" packages/app packages/ui && exit 1

# 11) No reanimated side-effect import in Next app entries/layouts
rg -n "import ['\\\"]react-native-reanimated['\\\"]" apps/next --glob 'app/**' --glob 'pages/**' --glob 'src/**' && exit 1
```

False-positive policy:
1. Keep the guard category.
2. Narrow the regex scope or add precise excludes.
3. Document rationale in AGENTS.md or CI config notes.

## 22) Merge Definition of Done (`P0`)
Before merge:
- `P0` rules remain satisfied.
- `yarn guard:checks` passes.
- Affected UI blocks validated in LTR and RTL.
- New/changed components cover required states (`loading`, `empty`, `error`, `disabled`, and `out-of-stock` when relevant).


## 23) Premium Visual Codex (`P1`)
Priority rule:
- This section is `P1` guidance for premium commerce presentation.
- If any item here conflicts with existing `P0` rules, existing `P0` rules win.

### 23.1 Whitespace Discipline
- Start with generous spacing and reduce only when needed for content density.
- Use tokenized spacing only.
- Prefer an 8px rhythm for layout spacing (`8, 16, 24, 32, 48, 64, 80, 96, 128`) through token mappings.
- Avoid odd or ad-hoc spacing values in component code.

### 23.2 Color System Governance
- Define color tokens in HSL (or HSL-equivalent token functions) by default to keep tone control predictable.
- Avoid introducing new HEX color definitions in token authoring unless required by an external integration format.
- Neutral surfaces/text should be slightly hue-tinted (not dead neutral gray) while preserving accessibility.
- High-saturation accents are reserved for primary actions, urgency, or interaction feedback.
- Avoid hardcoded color values in UI component code.

### 23.3 Typography Authority
- All text must map to a defined tier: `display`, `headline`, `sub-headline`, `body`, `caption`.
- Prefer contrast and weight hierarchy over oversized typography.
- Headline tracking may be slightly tightened; editorial all-caps sub-labels may use slightly open tracking.
- As type size increases, line-height ratio should decrease to preserve premium visual density.
- Do not use low-contrast gray text on colored backgrounds.

### 23.4 Elevation & Separation
- Prefer depth (tokenized shadows) and tonal separation over decorative borders.
- Shadow recipes should follow a single top-down light model and include:
  - a subtle rim definition
  - a soft ambient lift
- Borders remain utilitarian and minimal.

### 23.5 Interaction Presence
- Keep secondary actions reveal-on-demand where appropriate (hover/focus/expanded states).
- Use progressive disclosure (drawers/accordions/sheets) for technical or secondary information.
- Preserve clean primary surfaces; avoid persistent visual noise.
- Keep interaction motion subtle, tokenized, and performance-safe.

### 23.6 Product Imagery & Density Taper
- Product cards should be image-dominant (target at least ~70% visual area for media in catalog cards).
- Maintain consistent product-image framing and card rhythm across rails.
- Prefer editorial/low-density presentation higher on the page, and higher-density utility near conversion sections.

## 24) Motion Manifesto (`P1`)
Priority rule:
- This section is `P1` guidance.
- Existing `P0` architecture, data, and accessibility rules always win.

### 24.1 Motion Physics
- Motion should feel calm, premium, and intentional ("silent concierge"), never flashy.
- Default easing for premium motion:
  - `cubic-bezier(0.16, 1, 0.3, 1)`
- No instant state changes for interactive elements.
- Avoid `linear` and `ease-in-out` for UI motion in shared components.

### 24.2 Duration Standards
- Micro interactions (hover/focus/reveal): `300ms`
- Hover scale/transform refinements: `400ms`
- Section reveal/scroll entrance: `600ms`
- Child stagger for narrative lists/rails: `20ms`

### 24.3 Interaction Patterns
- Reveal-on-demand for secondary actions (`Quick view`, `Add to cart`, etc.).
- Use ghost-to-solid reveal for secondary overlays where appropriate.
- Product hover should combine:
  - subtle image scale to `1.02`
  - shadow intensification via tokenized elevation/shadows
- Preserve keyboard/focus accessibility behavior while applying hover patterns.

### 24.4 Scroll & Section Entrance
- New section entrances should use subtle Y-lift + fade with premium easing and `600ms` duration.
- Prefer staggered entrances for repeated child elements.
- Do not use motion that masks loading/error/disabled states.

### 24.5 Visual Prohibitions
- No decorative motion that competes with core shopping actions.
- No mixed shadow directions; keep one top-down light model.
- Avoid decorative border-based emphasis when depth/tonal separation can communicate hierarchy.

## 25) Sovereign UI Composition Rules (`P1`)
Priority rule:
- This section is `P1` guidance.
- Existing `P0` rules always win when conflicts appear.

### 25.1 Linear Spacing Constitution
- Use tokenized spacing only.
- Prefer strict 8px rhythm values: `8, 16, 24, 32, 48, 64, 80, 96, 128`.
- Do not introduce ad-hoc odd spacing values.
- When a layout needs more room, move to the next approved spacing step.
- Default to generous whitespace (especially vertical rhythm) for premium presentation.

### 25.2 Contextual Typography Law
- Every text element should map to one tier: `display`, `headline`, `sub-headline`, `body`, `caption`.
- Prefer hierarchy via weight/contrast before increasing font size.
- Headline tracking may be tightened for premium lock-up.
- Editorial all-caps sub-headers may use open tracking.
- Use proportional line-height scaling: larger tiers use tighter line-height ratios than body/caption tiers.
- Avoid low-contrast gray text on colored backgrounds.

### 25.3 Radius & Architectural Finish
- Default to sharp/minimal radius (`2px–4px` equivalent token values).
- Large rounded or pill-like radius must be explicitly justified by UX need.
- Inner element radius should not exceed its container radius unless intentionally directional (e.g., badges/chips with explicit product requirement).

### 25.4 Shadow & Depth Physics
- Prefer depth and tonal hierarchy over decorative borders.
- Elevation should follow two-part logic (rim definition + ambient lift).
- Keep one global top-down light model across components.
- Interactive hover/focus states should primarily communicate via lift/elevation, not color-only changes.

### 25.5 Interaction Sovereignty
- Use `cubic-bezier(0.16, 1, 0.3, 1)` for premium transitions.
- Secondary metadata/actions should be reveal-on-demand.
- Magnetic pointer affordance is allowed only for key web CTAs and only when performance/accessibility remain intact.

## 26) Canonical Commerce UI Patterns (`P0`)
Purpose:
- Define mandatory composition patterns for core commerce surfaces.
- Prevent ad-hoc layout invention and primitive duplication.

Pattern rules (all patterns):
- Use existing `@real/ui` primitives before creating new ones.
- Include required states: `loading`, `empty`, `error`, `disabled`, plus `out-of-stock` when product purchase is involved.
- Keep data flow in canonical chain: `UI -> apiClient -> BFF -> provider registry -> adapters`.
- No hardcoded layout invention when a canonical pattern exists.

### 26.1 ProductCard
- Structure: media (fixed ratio) -> badges/meta -> title -> price -> stock/availability -> primary action.
- Required states: loading skeleton, empty fallback, error fallback, disabled action, out-of-stock.
- Composition rules: do not embed API calls; do not duplicate price/stock logic outside shared composition.
- Reuse expectation: same card contract across rails, PLP, related, campaign blocks.

### 26.2 PLP / Shop Grid
- Structure: page scaffold -> filter/sort controls -> product grid -> pagination/infinite trigger.
- Required states: loading grid, empty result state, error retry state.
- Composition rules: filtering/sorting must route through provider-backed APIs, not local ad-hoc data mutations.
- Reuse expectation: reuse ProductCard and shared filter primitives.

### 26.3 PDP / Product Page
- Structure: gallery/media -> summary (title/price/availability) -> variant/quantity/actions -> details tabs/sections -> related modules.
- Required states: loading content, unavailable product, error fetch state.
- Composition rules: keep purchasable actions and stock states explicit; no duplicated cart mutation logic.
- Reuse expectation: reuse shared quantity, price, stock and action primitives.

### 26.4 Cart Drawer / Cart Page
- Structure: line items list -> editable quantities -> applied discounts/promotions -> totals -> checkout CTA.
- Required states: loading cart, empty cart, error with recovery, disabled checkout.
- Composition rules: totals and promotion math must come from pricing flow, not UI recomputation.
- Reuse expectation: same line-item and summary primitives across drawer/page.

### 26.5 Checkout Layout
- Structure: contact -> fulfillment -> payment -> order summary -> place order action.
- Required states: loading quote, invalid quote, explicit checkout errors, disabled submit while invalid.
- Composition rules: quote validation is mandatory before place order; do not bypass server pricing authority.
- Reuse expectation: shared form/state primitives and order summary components.

### 26.6 Account Dashboard
- Structure: account shell -> overview KPIs -> orders/tests/addresses/wishlist sections.
- Required states: loading section skeletons, empty section states, recoverable fetch errors.
- Composition rules: section composition is modular; no monolithic page-specific primitives.
- Reuse expectation: shared cards, tables, state components across account/admin where applicable.

Reference:
- Detailed human and AI composition guidance lives in `docs/COMMERCE_PATTERNS.md`.

## 27) Component Registry Guidance (`P0`)
- Before adding a new primitive/component, check `packages/ui` and `docs/UI_COMPONENT_INVENTORY.md`.
- Prefer extending existing component contracts over creating near-duplicate primitives.
- New primitives must include required states and token/RTL compliance.
- If a registry document exists, reference it; do not duplicate full registry inventories in AGENTS.

## 28) Domain Ownership Guidance (Future-State) (`P1`)
Guidance only (non-breaking, no forced refactor in this phase):
- `catalog`: product/category/brand/query surfaces
- `commerce`: cart/checkout/orders/pricing
- `customer`: account/auth/profile/addresses/tests/wishlist
- `marketing`: cms blocks/promotions/campaign content
- `operations`: admin ops/audit/cache/i18n operations

Rules:
- Treat as evolutionary ownership guidance for future organization inside `packages/app`.
- Do not perform destructive folder migrations without explicit approval.

## 29) AI Task Workflow (`P0`)
Expected flow for non-trivial AI execution:
1. Classify domain and print required Domain/Skills header.
2. Select workflow/prompt mode.
3. Plan before implementation when task is non-trivial.
4. Implement minimal scoped changes aligned to architecture.
5. Run verification, including `yarn guard:checks`.
6. Review against architecture, RTL, token, and state requirements.
7. Stop and request guidance on any pause trigger.

## 30) AI File Placement Rules (`P0`)
- Reusable UI primitives/components -> `packages/ui`
- Feature/domain logic and shared commerce logic -> `packages/app`
- Provider contracts -> `packages/providers/contracts`
- Adapter implementations -> `packages/adapters`
- Human-readable architecture/composition docs -> `docs/`
- Codex workflow/router/prompt files -> `.codex/`

Do not place workflow orchestration files in core runtime packages.
