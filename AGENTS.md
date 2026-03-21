# AGENTS VERSION
- Version: `v2.0`
- Last updated: `2026-03-21`
- This file is the product-specific operating handbook for this premium commerce platform.

## Platform Operating Model
- This repository builds a web-first premium commerce platform.
- `apps/next` owns the web app and the BFF.
- `apps/expo` owns the customer mobile app only.
- `packages/ui` owns shared primitives and reusable UI components.
- `packages/app` owns shared screens, commerce flows, and feature logic.
- `packages/providers` owns contracts and registry-based provider selection.
- `packages/adapters` owns external system implementations.
- CMS controls mutable marketing content, not core layout structure.
- Modules extend core through explicit slots, not embedded special-case logic.
- Canonical runtime flow is `UI -> apiClient -> BFF -> provider registry -> adapters`.

## Rule Priorities
- `P0` Blocker: must pass before merge.
- `P1` Preferred: enforce unless explicitly deferred.
- If `P0` and `P1` conflict, `P0` wins.

## Use This File
- `AGENTS.md` is the executable contract. Keep it short enough to apply during active work.
- Companion docs hold deeper UI and composition guidance:
  - `docs/UI_ARCHITECTURE.md`
  - `docs/COMMERCE_PATTERNS.md`
  - `docs/UI_COMPONENT_INVENTORY.md`
- `.codex/` owns task routing and prompt workflow. `AGENTS.md` remains the source of truth for repo rules.

## Common Commands
- Route non-trivial tasks through `.codex/router.js`:
  - `node .codex/router.js "<task>"`
- Run repo guards before claiming completion:
  - `yarn guard:checks`
- If guard execution fails because of shell or line-ending issues, run the normalized fallback:
  - `tmp=scripts/.guard-checks.tmp.sh && tr -d '\r' < scripts/guard-checks.sh > "$tmp" && bash "$tmp"; status=$?; rm -f "$tmp"; exit $status`

## AI Execution Rules (`P0`)
### Required Response Header
Before implementation responses, include:
- `Skills: <comma-separated selected skills>`

### Workflow Integration
- For non-trivial work, consult `.codex/router.js` before implementation.
- Use the router output to confirm task classification, scoped folders, guard expectations, and pause triggers.
- Do not let workflow tooling override architecture or repository rules in this file.

### Working Discipline
- Prefer repo-local docs and code over memory.
- Prefer enforceable rules over vague preference.
- Do not silently change architecture, dependency direction, or platform boundaries.

## Architecture Contract (`P0`)
### Non-Negotiables
- Tokens over hardcoded values.
- Adapters over direct external calls.
- Modules over embedded feature logic.
- Slots over hardcoded module insertion.
- Config and CMS over code for mutable business rules.

### Canonical Data Flow
Required flow:

`UI -> apiClient -> BFF -> provider registry -> adapters`

Rules:
- Do not bypass the BFF from customer UI.
- Do not import adapters into UI, shared commerce logic, or BFF routes.
- Do not insert a storefront framework layer between UI and the BFF chain without approval.

### Monorepo Shape
```txt
apps/
  next/                 # web app + BFF
  expo/                 # customer mobile app

packages/
  app/                  # shared screens, features, commerce logic
  ui/                   # shared primitives and reusable components
  tokens/               # design tokens
  providers/            # contracts + registry
  adapters/             # infrastructure implementations
```

Required aliases:
- `@real/app`
- `@real/ui`
- `@real/tokens`
- `@real/providers`
- `@real/adapters`

### Layer Boundaries
#### `packages/ui`
- Primitives and reusable components only.
- UniWind styling is allowed here.
- No provider imports.
- No adapter imports.
- No business-specific data fetching.

#### `packages/app`
- Shared commerce screens, flows, modules, and app-side logic.
- May import from `@real/providers`.
- Must not import from `@real/adapters`.
- Must not call ERP, payment, or auth systems directly.
- `className` is forbidden here.
- `process.env` is forbidden here.

#### `packages/providers`
- Contracts and provider selection only.
- Use `ProviderResult<T>` and matching helpers.
- No UI code.

#### `packages/adapters`
- Infrastructure implementations only.
- Must fully implement provider contracts.
- Must never leak raw infrastructure errors upward.

### Provider Registry Pattern
Core and BFF code must import from the registry, not concrete adapters.

```ts
import { mockProductAdapter } from '@real/adapters/mock/product'

const useMock = process.env.USE_MOCK !== 'false'

export const productProvider = useMock
  ? mockProductAdapter
  : mockProductAdapter
```

### BFF Contract
BFF code lives under `apps/next/app/api/*`.

Routes must:
- import providers, not adapters
- normalize responses
- return the public envelope only

Public envelope:
```ts
{ success: true, data: T }
{ success: false, error: { code: string; message: string } }
```

Correct pattern:
```ts
import { matchProviderResult } from '@real/providers/contracts'
import { productProvider } from '@real/providers'
import { fail, ok } from '../_lib/response'

export async function GET() {
  const result = await productProvider.list()

  return matchProviderResult(result, {
    ok: (data) => ok(data),
    fail: (error) => fail(error.code, error.message, 500),
  })
}
```

### Extension Slots
Use explicit slot registration. No runtime plugin engine. No dynamic scanning.

Canonical slot path:
`packages/app/platform/extensions/slots.ts`

Correct pattern:
```ts
import { ComponentType } from 'react'

export type CheckoutExtension = ComponentType
export const checkoutExtensions: CheckoutExtension[] = []
```

### Role Exposure
- `customer`: web + Expo
- `pharmacist`: web only
- `admin`: web only

Rules:
- Expo must not expose admin or pharmacist routes.
- `/pharmacist` and `/pharmasset` are intentionally web-only.

### Environment Contract
Naming:
- `NEXT_PUBLIC_*`: web client-safe
- `EXPO_PUBLIC_*`: mobile client-safe
- `*_SECRET`: server-only
- `*_URL`: endpoint
- `USE_*`: feature toggle

Required env vars:
- `USE_MOCK`
- `ODOO_URL`
- `ODOO_SECRET`
- `PAYMENT_GATEWAY_URL`
- `PAYMENT_GATEWAY_SECRET`
- `NEXT_PUBLIC_API_BASE_URL`
- `EXPO_PUBLIC_API_BASE_URL`

Rules:
- No hardcoded secrets or service URLs.
- All env vars must appear in `.env.example`.
- `process.env` is forbidden in `packages/ui` and `packages/app`.

### File Placement
- reusable UI primitives and components -> `packages/ui`
- shared commerce logic and screens -> `packages/app`
- provider contracts -> `packages/providers/contracts`
- adapter implementations -> `packages/adapters`
- human-readable architecture and composition docs -> `docs/`
- workflow and router files -> `.codex/`

## Commerce UI Contracts (`P0`)
### Core Principle
Core commerce surfaces are fixed contracts, not ad-hoc layouts. Reuse the canonical pattern before inventing a new one.

### Required Component States
Every new UI component must define:
- `loading`
- `empty`
- `error`
- `disabled`

Add `out-of-stock` when the component represents purchasable product state.

### Canonical Surface Contracts
These patterns are mandatory for composition. Full detail lives in `docs/COMMERCE_PATTERNS.md`.

- `ProductCard`: media -> badges/meta -> title -> price -> stock/urgency -> primary CTA
- `PLP / Shop Grid`: scaffold -> filters/sort -> grid -> pagination or load-more
- `PDP`: gallery -> summary -> variant/quantity/actions -> details -> related modules
- `Cart Drawer / Cart Page`: line items -> edits -> discounts -> totals -> checkout CTA
- `Checkout`: contact -> fulfillment -> payment -> order summary -> place order
- `Account Dashboard`: shell -> overview -> modular sections

### CMS and Config Ownership
CMS controls content for:
- hero slides
- promotional banners
- campaign messaging
- loyalty marketing blocks
- newsletter copy
- brand spotlight content

Rules:
- CMS controls content, not layout structure.
- Core layout remains code-owned.
- Mutable business policies belong in config or CMS, not component code.

## UI System Rules
### Tokens and Styling (`P0`)
- All color, spacing, type, radius, border, and motion values must come from tokens.
- Never hardcode visual values in shared components.
- Tokens are the single source of truth for visual primitives.
- UniWind is allowed only in `packages/ui/**`.
- Unsupported shared/native pseudo-classes remain forbidden: `visited:`, `before:`, `after:`.

### Platform Files (`P0`)
- Default shared file: `.ts` or `.tsx`
- Prefer `.native.tsx` for native differences
- Use `.web.tsx` only when unavoidable

Pause before adding `.web.tsx`.

### RTL (`P0`)
- All new UI must work in both LTR and RTL.
- Use logical start/end alignment and spacing.
- Avoid hardcoded `left/right`.
- Mirror directional icons where needed.
- Check new UI in both LTR and RTL before claiming completion.

### Solito v5 (`P0` / `P1`)
Core:
- URL is the source of truth for navigation.
- Use `solito/navigation` for App Router paths.
- If a Pages Router area exists, keep `solito/router` isolated there.
- Do not use deprecated `viewProps` or `textProps`.

Guidance:
- Prefer Next DOM primitives in web-only shells and routes.
- Use RN primitives mainly for shared cross-platform surfaces.
- Split web-heavy shared components only when necessary.

### Motion (`P0` / `P1`)
Core:
- If shared animation must work on web and native, use `moti`.
- Do not add `import 'react-native-reanimated'` side-effect imports in Next entry or layout files.
- Motion must not hide loading, error, or interaction feedback.

Guidance:
- Motion should be subtle, fast, and purposeful.
- Prefer opacity and small transforms over dramatic movement.
- Use tokenized timing and easing where possible.

### Design Direction (`P1`)
This storefront favors a compact, flat-leaning, high-density marketplace posture:
- compact spacing rhythm
- low-shadow surfaces
- card-first composition
- one clear primary commerce action per block
- expressive hierarchy without bloated chrome

Expanded rules live in `docs/UI_ARCHITECTURE.md`.

## Pause Triggers (`P0`)
Stop and ask before:
- creating a new top-level folder
- changing provider interfaces
- changing dependency direction
- introducing `.web.tsx`
- adding a runtime plugin system
- adding a new external integration
- introducing a new layout region not covered by current UI patterns
- using colors or spacing not represented by tokens
- making RTL behavior guesses you cannot verify

## Verification (`P0`)
### Guard Checks
Agents must run `yarn guard:checks` for every non-trivial change.

If the command fails because of shell, runtime, or line-ending issues, use the normalized fallback command listed earlier in this file.

Canonical guard expectations:
- no direct adapter imports in UI or shared app layers
- no provider imports in `packages/ui`
- no raw hex colors in shared packages
- no adapter imports in BFF routes
- no deprecated Solito props
- no `solito/router` usage in App Router paths
- no unsupported pseudo-classes in shared/native surfaces
- no `className` in `packages/app`
- no `process.env` in shared packages
- no forbidden `__tests__` folders in `packages/app` or `packages/ui`
- no reanimated side-effect import in Next entries and layouts

### Definition of Done
Before merge:
- `P0` rules remain satisfied
- guard checks pass
- affected UI is checked in LTR and RTL
- changed components cover required states
- customer UI still follows the canonical commerce chain and contracts

## References
- `docs/UI_ARCHITECTURE.md`
- `docs/COMMERCE_PATTERNS.md`
- `docs/UI_COMPONENT_INVENTORY.md`
- `docs/plans/2026-03-21-agents-md-rebuild-design.md`
