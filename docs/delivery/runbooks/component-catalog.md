# Shared Component Catalog

Purpose: give developers and designers a lightweight map of the shared UI/component surface until a full Storybook is introduced.

## Source Of Truth

Architecture and layer rules live in `AGENTS.md`.

Shared UI lives in:

- `packages/ui/reusables`: core controls and reusable primitives.
- `packages/ui/components`: product-facing shared components.
- `packages/app/screens`: shared web/native screens and flows.
- `packages/app/features/home/renderers`: CMS block renderers.

## Component Rules

- Use tokens from `@real/tokens` for colors, spacing, radius, typography, and sizing.
- Do not use hardcoded hex values in shared packages.
- Do not use `className` in `packages/app`.
- Do not import adapters or providers from `packages/ui`.
- Keep platform-specific behavior in approved boundaries such as `.native.tsx` files or responsive helpers.

## Homepage CMS Blocks

Current renderer pattern:

1. Block type is declared in `packages/app/lib/cms/blocks.ts`.
2. Renderer lives in `packages/app/features/home/renderers`.
3. UI component lives in `packages/ui/components`.
4. Dispatch happens in `packages/app/features/home/HomeBlocksRenderer.tsx`.
5. Seed/fallback data lives in `packages/adapters/mock/cms`.

## Expected Component Docs Before Client UI Review

For every new product-facing component, record:

- Purpose and user role.
- Source file path.
- Required data shape.
- Responsive behavior.
- Accessibility considerations.
- Verification command or visual review note.

## Storybook Status

Full Storybook is not installed yet. Until it is, this catalog plus guard checks are the documentation baseline.

Storybook should be added when UI polish becomes its own workstream, with stories for:

- Shared controls.
- Homepage CMS blocks.
- Product cards/rails.
- Cart and checkout sections.
- Account/order states.
