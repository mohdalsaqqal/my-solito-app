# Feature Extension Blueprint

This document defines how to add and remove optional features without breaking core commerce.

## 1. Core vs Extension Boundary

Core (always-on):
- `shop`, `product`, `cart`, `checkout`, `orders`, `account` base
- shared shell/navigation/content plumbing

Extension (optional/toggleable):
- `pharmacist`
- `loyalty`
- `reviews`
- future modules (recommendation, diagnostics, etc.)

Dependency rule:
- Extension may import core.
- Core must never import extension.

Reason:
- You can disable/remove extensions safely.
- Core remains stable and deployable independently.

## 2. Canonical Flow

`UI -> apiClient -> BFF -> provider registry -> adapters`

Never bypass this chain.

## 3. Extension Package Structure

Use this shape for every extension:

```txt
packages/app/modules/<feature>/
  components/
  screens/
  hooks/
  index.ts

packages/providers/contracts/
  <Feature>Provider.ts

packages/adapters/
  mock/<feature>.ts
  <backend>-*/<feature>.ts

apps/next/app/api/<feature>/
  route.ts
  [id]/route.ts (if needed)
```

Extension UI registration:

```txt
packages/app/platform/extensions/slots.ts
```

## 4. Add New Extension (Step-by-Step)

1. Define provider contract in `packages/providers/contracts/<Feature>Provider.ts`.
2. Add mock adapter in `packages/adapters/mock`.
3. Wire provider selection in `packages/providers/registry.ts`.
4. Add BFF routes in `apps/next/app/api/<feature>/*`.
5. Build module UI in `packages/app/modules/<feature>/*`.
6. Register module through extension slots.
7. Add feature flag (`USE_<FEATURE>`) and document in `.env.example`.
8. Validate required states (`loading`, `empty`, `error`, `disabled`, plus `out-of-stock` if relevant).
9. Run `yarn guard:checks`.
10. Validate LTR + RTL behavior.

## 5. Disable/Remove Extension Safely

1. Turn feature flag off.
2. Remove slot registration.
3. Keep provider contract unless intentionally retired.
4. Keep BFF routes returning controlled `404/forbidden` when disabled.
5. Verify core routes still pass.

## 6. BFF Response Standard

All extension endpoints must return:

```ts
{ success: true, data: T }
{ success: false, error: { code: string; message: string } }
```

## 7. Pharmacist Extension Reference

Recommended provider split:
- `PharmacistProvider` (consultation/recommendation actions)
- `CustomerProfileProvider` (customer lookup/profile context)
- `InventoryProvider` (availability checks)
- `ProductProvider` + `OrderProvider` (read-only usage from core)
- `LoyaltyProvider` (read-only for pharmacist role, no manual adjustments)

Role/security:
- Route scope: web only
- enforce pharmacist role in middleware/BFF
- no admin/customer leakage

## 8. Definition of Done for Any Extension

An extension is considered complete only when:
- Contract, adapter, registry, BFF route, and module UI are implemented.
- Feature can be turned off without core code edits.
- Guard checks pass.
- LTR/RTL and responsive validations are done.
- Error/loading/empty/disabled states are covered.

