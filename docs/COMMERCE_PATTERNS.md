# Commerce Patterns

## Purpose
This document defines the canonical composition contracts for the core commerce surfaces in the customer experience. These are reusable patterns, not one-off page ideas.

## Shared Rules
- Follow the canonical data chain: `UI -> apiClient -> BFF -> provider registry -> adapters`.
- Reuse shared UI contracts before inventing a new surface.
- Include `loading`, `empty`, `error`, and `disabled` states in every new component.
- Add `out-of-stock` when the surface represents a purchasable product.
- Keep layout compact and action hierarchy clear.

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
