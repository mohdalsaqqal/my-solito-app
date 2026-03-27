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

## Layout-As-Data Boundaries
- Layout-as-data is BFF-owned and emitted as normalized `page` payloads with explicit block versions.
- Shared UI in `packages/app` and `packages/ui` consumes only normalized page/block contracts, never raw admin persistence shapes.
- `storeId` is a first-class part of the page contract and defaults to `"default"` until true multi-store expansion is enabled.
- Approved surfaces today are homepage and search/discovery. These surfaces may render ordered `page.blocks` through the shared block registry.
- Search/discovery may use additive layout blocks above or around core result modules, but the results grid and query logic remain code-owned.
- PDP, cart, checkout, and account remain mostly code-owned until their contracts are intentionally approved and verified.

## Normalized Page Contract
- The BFF owns normalization from internal page config and release/version state into a strict shared page payload.
- The normalized page envelope must include `storeId`, `slug`, `pageType`, and ordered `blocks`.
- Every normalized block must include `id`, `type`, `version`, `position`, and `props`.
- Data-bearing blocks such as product-query, editorial-reference, or spotlight blocks must be resolved into render-ready payloads by the BFF before they reach shared UI.

## Page Ownership
- Internal ownership is `store -> page -> page blocks -> release/version`.
- Admin editing operates on page blocks and release snapshots, not raw UI component trees.
- Homepage header and footer remain code-owned shell structure even when homepage body blocks are data-driven.
- Search/discovery keeps its result mechanics code-owned while allowing additive promotional or editorial blocks around that core structure.

## Approved Block Surfaces
- Homepage is the proving ground for ordered shared block rendering.
- Search/discovery is the second approved surface and uses the same normalized page/block contract as homepage.
- Current approved block families are bounded to shared registry contracts such as hero, rails, banners, brand/editorial spotlight, and `editorial_hotspot`.
- New critical commerce surfaces must not become block-driven until their contracts, states, RTL behavior, and provider/BFF flow are explicitly reviewed.

## Current Non-Goals
- No runtime plugin engine or arbitrary builder runtime.
- No CMS-owned checkout, pricing, inventory, or account structure.
- No free-form mutation of critical commerce layouts through admin tooling.
- No assumption that every storefront route should become block-driven.

## Visual Review Checklist
Before closing UI work, confirm:
- token usage is consistent
- density matches the preset
- CTA hierarchy is obvious
- loading, empty, error, disabled, and `out-of-stock` states exist when relevant
- the surface works in LTR and RTL
- the UI still feels compact and conversion-oriented
