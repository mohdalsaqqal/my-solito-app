# UI Architecture

## Purpose
This document defines the shared UI system for the customer storefront and shared surfaces. It expands the root `AGENTS.md` rules with composition and extension guidance.

## Ownership
- `packages/ui` owns primitives and reusable components.
- `packages/app` composes those components into screens and commerce flows.
- Visual values come from `packages/tokens`.

## Token Rules
- Use tokens for spacing, typography, radius, color, border, elevation, and motion.
- Do not hardcode visual values in shared UI.
- If a needed value does not exist in tokens, add or revise the token first.

## Spacing Rhythm
- Preferred rhythm for commerce UI is the strict 8px family: `8, 16, 24, 32, 48, 64, 80, 96, 128`.
- Compact spacing is the default for discovery and conversion surfaces.
- Increase spacing only when readability, localization, or touch ergonomics require it.

## Typography Tiers
Use one of these tiers before inventing custom text treatment:
- `display`
- `headline`
- `sub-headline`
- `body`
- `caption`

Guidance:
- Utility surfaces should favor smaller tiers with strong weight and contrast rather than oversized headings.
- Dense surfaces should lean on `body`, `bodySm`, `meta`, and `caption`.

## Surface Posture
The storefront uses a flat-leaning marketplace posture:
- low shadow by default
- tonal separation before borders
- borders only for structure
- strong accent reserved for primary commerce action and critical state

Use raised treatment mainly for overlays, drawers, and modal layers, not standard catalog cards.

## Density Presets
The preferred composition model is preset-driven. Use consistent presets instead of page-level improvisation.

Recommended presets:
- `catalogDense`: compact card grid, tight filter bar, quiet surfaces
- `railCompact`: horizontally scrollable product rail with compact metadata
- `pdpSummary`: compact summary block with strong action hierarchy
- `cartMinimal`: low-noise line items and summary with one dominant CTA
- `checkoutUtility`: compact step layout with server-authoritative summary

Preset ownership belongs in tokens and shared components, not page-local style overrides.

## Component Composition Rules
- Pages compose blocks; they should not become styling laboratories.
- Reuse existing `packages/ui` primitives before adding new ones.
- Extend contracts before creating near-duplicate primitives.
- Prefer standard shells: `Card`, `Button`, `Badge`, `Input`, `Tabs`, `Sheet`, `Drawer`, `PageScaffold`, `Section`.

## Extension Decision Rules
Create a new primitive only when all of the following are true:
- the behavior is reusable across domains
- no existing primitive can be extended without distortion
- the contract can be expressed through tokens and states
- RTL and state handling are clear

Otherwise:
- extend the closest existing component
- or compose the UI at the screen/block level in `packages/app`

## Shared vs Platform-Specific UI
- Default to shared `.tsx`.
- Use `.native.tsx` for native-only behavioral differences.
- Use `.web.tsx` only when the web-specific requirement is real and unavoidable.
- Web-only route shells may use DOM primitives directly in `apps/next`.

## RTL Rules
- Prefer logical layout direction over side-specific positioning.
- Align chip rows, carousels, and icon affordances with document direction.
- Verify both English and Arabic presentation for new UI blocks.

## CMS Boundaries
- CMS can inject content payloads into approved shells.
- CMS does not define structural layout contracts.
- Marketing copy, hero slides, and promotional content are data.
- Card skeletons, rails, grids, drawers, and checkout structure remain code-owned.

## Visual Review Checklist
Before closing UI work, confirm:
- token usage is consistent
- density matches the preset
- CTA hierarchy is obvious
- loading, empty, error, disabled, and `out-of-stock` states exist when relevant
- the surface works in LTR and RTL
- the UI still feels compact and conversion-oriented
