# CMS Menus And Mega Menu System Spec

## Goal

Introduce a CMS-managed menu system for the commerce shell so editors can create menus, assign them to locations, and control navigation plus merchandising content without changing layout code.

## Core Principle

Menu data is CMS-controlled. Layout, interaction, accessibility, and responsive behavior remain code-controlled.

## Phase 1 Scope

- `header_primary`
- `header_mega_categories`
- admin CMS menu CRUD
- provider contracts and mock persistence
- server-side validation and normalization scaffolding

## Menu Model

Every menu is assigned to a location and a display style.

- location:
  - `header_primary`
  - `header_mega_categories`
- display style:
  - `default`
  - `mega_category`

Every menu item can reference one source:

- `category`
- `query`
- `brand`
- `custom_link`

## Mega Menu Model

For `header_mega_categories`:

- level 1: left rail main items
- level 2: middle-column subcategories
- level 3: leaf links under each subcategory
- right rail: brand merchandising for the active level 1 item

Any menu item, including level 1, may be category-backed or query-backed.

Examples:

- `Skincare` -> `category`
- `Luxury` -> `query`
- `Trending` -> `query`
- `Under 20 JOD` -> `query`

## Merchandising Extensions

The menu is not navigation-only. It must support merchandising.

### Brand Rail

Brand rail source modes:

- `static`
- `query`
- `campaign_override`

### Featured Slot

Each eligible menu item may include:

- `banner`
- `product`
- `campaign`

This creates a commercial surface inside the mega menu instead of a pure sitemap.

## Validation Rules

Depth is capped at 3 and must be enforced in two places:

- CMS validation
- server resolver validation

Additional rules:

- `mega_category` menus cannot exceed depth 3
- brand rail is allowed only on level 1 items
- featured slot is allowed only on level 1 or level 2 items
- `custom_link` requires `href`
- all non-link source types require a valid `sourceId`

## Analytics Hooks

Menus affect discovery and revenue, so analytics is part of the contract.

Required tracking:

- menu item impression tracking
- menu item click tracking
- featured slot impression tracking
- featured slot click tracking
- brand rail impression tracking
- brand rail click tracking

Analytics must be emitted through code-owned hooks, not CMS-authored script fields.

## Admin UX

Add a CMS `Menus` area with:

- menu list
- create menu flow
- edit menu flow
- location assignment
- item tree editing
- source selection
- brand rail configuration
- featured slot configuration
- validation errors before save

## Non-Goals For Phase 1

- footer and mobile menu locations
- scheduling and publishing windows
- A/B variants
- final header integration and full frontend rendering
