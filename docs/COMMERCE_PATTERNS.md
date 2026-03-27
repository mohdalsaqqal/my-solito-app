# Commerce Patterns

## Purpose
This document defines the canonical composition contracts for the core commerce surfaces in the customer experience. These are reusable patterns, not one-off page ideas.

## Shared Rules
- Follow the canonical data chain: `UI -> apiClient -> BFF -> provider registry -> adapters`.
- Reuse shared UI contracts before inventing a new surface.
- Include `loading`, `empty`, `error`, and `disabled` states in every new component.
- Add `out-of-stock` when the surface represents a purchasable product.
- Keep layout compact and action hierarchy clear.

## Layout-As-Data Scope
- Layout-as-data is approved only for bounded storefront surfaces with code-owned contracts and BFF-normalized payloads.
- Every normalized page payload must include `storeId`, `slug`, `pageType`, and ordered `blocks` with explicit `version`.
- Shared commerce surfaces consume normalized contracts only. Raw CMS/admin persistence models must stop at the BFF.
- Approved block-driven surfaces today are homepage and search/discovery. Search may add ordered promotional or editorial blocks around code-owned results.
- Search, PLP, PDP, cart, checkout, and account query/purchase flows remain server-authoritative and must not be replaced by free-form admin layouts.

## Release And Preview Rules
- Draft editing works against internal page-block persistence, then publishes release/version snapshots for rendering.
- Preview and published payloads must preserve `storeId` so the same normalized contract works for default-store and future multi-store expansion.
- Shared UI should never branch on admin persistence models or release storage details; it should branch only on normalized page/block contracts.
- Contract evolution must happen through explicit block `version` updates, not silent prop-shape drift.

## Store Context Contract
- `storeId` is first-class in page payloads and defaults to `"default"` when no explicit store context is present.
- Store context must flow through preview, published page payloads, and internal admin editing APIs before true multi-store behavior is introduced.
- Block contracts may vary by store over time, but shared renderers still consume the same normalized page envelope.

## ProductCard
Structure:
- media
- badges and meta
- title
- price
- stock or urgency
- primary CTA

Rules:
- Do not fetch inside the card.
- Do not duplicate pricing or stock logic in multiple variants.
- Variants may change emphasis, not the base contract.

States:
- loading skeleton
- empty fallback
- error fallback
- disabled CTA
- out-of-stock CTA and stock treatment

## PLP / Shop Grid
Structure:
- page scaffold
- filter and sort controls
- active filter chips
- product grid
- pagination or load-more trigger

Rules:
- Filters and sorting must route through provider-backed APIs.
- Product listing should reuse the same card contract as rails and related items.
- Dense catalog is the default preset for discovery surfaces.
- Additive layout blocks may appear above or around the grid only when the BFF resolves them into approved block contracts.
- Search/discovery block rendering must not replace the server-authoritative results set, query params, sorting, or pagination logic.

States:
- loading grid
- empty results
- recoverable error with retry

## PDP / Product Page
Structure:
- media gallery
- product summary
- variants and quantity
- action group
- details sections or tabs
- related or upsell modules

Rules:
- Stock and purchase state must be explicit.
- Do not bypass server-authoritative pricing.
- Summary density should stay compact even when the page has rich content below.

States:
- loading content
- unavailable product
- error fetch state
- out-of-stock purchase state

## Cart Drawer / Cart Page
Structure:
- line items
- quantity edits
- discount or promo region
- totals
- checkout CTA

Rules:
- Totals come from pricing flow, not UI recomputation.
- The drawer and page should share the same line-item contract where possible.
- Non-primary controls stay visually quiet.

States:
- loading cart
- empty cart
- error with recovery
- disabled checkout CTA

## Checkout
Structure:
- contact
- fulfillment
- payment
- order summary
- place order action

Rules:
- Quote validation is mandatory before submission.
- Order summary remains compact and legible.
- Do not hide errors behind motion or optimistic assumptions.
- Checkout structure is not an approved layout-as-data surface.

States:
- loading quote
- invalid quote
- explicit checkout error
- disabled submit while invalid

## Account Dashboard
Structure:
- account shell
- overview
- modular sections such as orders, addresses, tests, wishlist, profile

Rules:
- Avoid monolithic page-specific primitives.
- Reuse shared cards, sections, and state handling.
- Keep sections modular so features can evolve independently.
- Account shell structure is not an approved layout-as-data surface.

States:
- loading section skeletons
- empty section states
- recoverable fetch errors

## Preset Guidance
Use these composition presets as defaults:
- `catalogDense` for PLP and search
- `railCompact` for homepage and related rails
- `pdpSummary` for PDP top section
- `cartMinimal` for cart drawer and cart page
- `checkoutUtility` for checkout

The preset may change density and emphasis, but it must not change the canonical contract.

## Explicit Non-Goals
- Do not turn PDP, cart, checkout, or account into arbitrary page builders.
- Do not move pricing, inventory, checkout validation, or account truth into CMS-like content blocks.
- Do not introduce a runtime plugin engine to discover or render storefront blocks.
- Do not treat raw CMS/admin records as render contracts in `packages/app` or `packages/ui`.
