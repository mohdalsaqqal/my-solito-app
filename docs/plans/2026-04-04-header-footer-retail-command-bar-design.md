# Header/Footer Retail Command Bar Design

## Goal

Redesign the storefront shell around a high-conversion retail command pattern that gives users direct access to search, categories, brands, account utilities, and commerce actions without editorial clutter.

The redesign must:
- prioritize search and category discovery
- support equal-priority desktop and mobile experiences
- keep the shell neutral so campaign/product content remains primary
- use a consistent structure across desktop web, mobile web, and Expo
- keep the footer on desktop web only

## Audience

Mass-market beauty marketplace shoppers who need fast access to a broad catalog, active offers, loyalty, account tools, and pharmacist/test flows.

## Chosen Direction

Use a `Retail Command Bar` shell.

This means:
- dense, utility-first header structure
- direct category access through a large categories trigger and mega menu
- strong search dominance
- restrained but clear campaign/support messaging in the top utility bar
- reduced decorative treatment in the footer

## Desktop Header

### Top Utility Bar

Purpose:
- set reassurance and operational context without becoming a second navigation system

Content:
- delivery/reassurance content
- support or returns messaging
- one concise campaign slot
- selected delivery location
- language switcher

Behavior:
- compact height
- no ornamental effects
- visually secondary to the main command row

### Main Command Row

Purpose:
- primary shopping command center

Content:
- logo on the left
- dominant search bar
- large `Categories` button directly adjacent to the search bar
- utility cluster on the right:
  - selected delivery location
  - language dropdown
  - profile
  - wishlist
  - cart

Behavior:
- sticky
- high-contrast controls
- large hit targets
- clear active/focus states

### Desktop Mega Menu

Trigger:
- the `Categories` button

Structure:
- left rail: top-level categories
- center panel: subcategories and grouped direct-entry links
- right rail: brands associated with the active category

Rules:
- category-first information architecture
- no decorative noise
- avoid overstuffed promo content unless it materially improves discovery
- support direct access to deep category paths

### Bottom Merchandising Bar

Left/center entries:
- New Arrivals
- Best Selling
- Flash Offers
- Luxury

Right entries:
- Loyalty Points
- Test Results

Rules:
- this row is merchandising/support navigation, not the primary category system
- `Luxury` gets restrained gold styling
- row stays compact and scan-friendly

## Mobile Web / Expo Header

### Top Bar

Content:
- `Deliver to ...`

Purpose:
- preserve location context without occupying the main command row

### Main Row

Content:
- search-first layout
- categories launcher
- notifications

Behavior:
- sticky
- on scroll collapse into a search-only sticky bar

### Categories Surface

The categories icon opens a dedicated categories experience representing the same desktop mega-menu IA:
- category list
- subcategory list
- featured brands for the current category

Do not try to force desktop mega-menu layout into a small floating panel.

### Sticky Bottom Navigation

Persistent from first paint on mobile web and Expo:
- Home
- Categories
- Brands
- Cart
- Account

Each item uses an icon with a compact label underneath.

## Footer

Desktop web only.

### Trust Row

Show concise, operational trust points:
- delivery
- returns
- secure payment
- authenticity
- support

### Main Footer Grid

Suggested columns:
- Shop
- Help
- Account
- About
- compact newsletter block

### Bottom Legal Row

Include:
- copyright
- payment badges
- optional language/country control if needed

### Remove

- decorative Instagram gallery
- oversized editorial branding treatment
- ornamental dark luxury styling

## Visual Direction

- commercial neutral shell
- sans-serif
- compact spacing
- strong search prominence
- dark neutral general CTAs
- red reserved for purchase intent
- gold reserved narrowly for luxury labeling
- desktop and mobile should feel like the same system, not separate brands

## Implementation Scope

Primary files:
- `packages/app/features/shell/Header.tsx`
- `packages/app/features/shell/Footer.tsx`
- `packages/app/features/shell/Layout.tsx`

Likely supporting shared UI work:
- `packages/ui/components/chrome/*`
- possible new shell-specific shared components for mega-menu and mobile categories surface

## Verification

- visual review with Playwright against the running app
- `yarn guard:checks`
- `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false`
