# Layout Scaffold Design (Stepwise Full Migration)
Date: 2026-03-01

## Goal
Move page width/gutter/vertical rhythm ownership out of screens and into shared UI layout primitives.

## Decision
Adopt a stepwise full migration:
1. Add layout tokens + shared layout primitives.
2. Migrate core commerce screens first.
3. Migrate remaining account/admin/pharmacist/auth screens in waves.
4. Freeze after each wave with type/build verification.

## Architecture
- Tokens: `packages/tokens/layout.ts`
- Shared layout primitives:
  - `packages/ui/layout/PageScaffold.tsx`
  - `packages/ui/layout/Section.tsx`
  - `packages/ui/layout/Container.tsx` (exported as `LayoutContainer`)
- Public exports:
  - `packages/ui/layout/index.ts`
  - `packages/ui/index.ts`

## Contract
Screens should prefer:
- `<PageScaffold variant='...' density='...' scroll='auto'>`
- `<PageScaffold.Body>`
- `<Section y='...' tone='...' bleed='...'>`

Screens should not own root max-width and root page paddings.

## Initial Migration Scope
Wave 1:
- Home screen
- Cart screen
- Checkout screen

## Validation
- `yarn run tsc --noEmit`
- `apps/next yarn build`
