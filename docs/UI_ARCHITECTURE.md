# Real Cosmetics — UI Architecture Specification (Web‑First, Solito, UniWind)
**Purpose:** This document is the *visual and interaction contract* for Codex implementation.  
**Scope:** Customer Web (Next), Customer Mobile (Expo), Admin Web, CMS Web, Pharmacist Web (tablet).  
**Non‑Goals:** Backend entity modeling, ERP data model, business rule engines.  
**Sources of truth:** Uploaded reference screenshots (paths below) + this spec.

---

## 0) Reference Assets (Must Match)
> Use these images as the primary “pixel intent” reference. If something is unclear, **pause and ask**.

### 0.1 Global Screens
- **Homepage:** `sandbox:/mnt/data/Home-Page.jpeg`
- **Shop Page:** `sandbox:/mnt/data/Shop-Page.jpeg`
- **Checkout:** `sandbox:/mnt/data/checkout-page.jpeg`
- **Account:** `sandbox:/mnt/data/Account-page.jpeg`
- **Order Placed:** `sandbox:/mnt/data/order-placed.jpeg`

### 0.2 Navigation / Menus
- **Category menu:** `sandbox:/mnt/data/category-menu.png`
- **Luxury brands menu:** `sandbox:/mnt/data/laxury-brands-menu.png`
- **Sales menu:** `sandbox:/mnt/data/Sales-menu.png`

### 0.3 Cart States
- **Empty cart:** `sandbox:/mnt/data/Empty-cart.png`
- **Filled cart:** `sandbox:/mnt/data/filled-cart.png`

### 0.4 Product Card Hover States
- **Shop grid hover:** `sandbox:/mnt/data/shop-grid-product-hover.png`
- **Slider hover:** `sandbox:/mnt/data/slider-product-hover.png`

### 0.5 Product Page
- **Product page:** `sandbox:/mnt/data/product-page.png` *(if missing, confirm actual filename/path in repo assets)*

### 0.6 Account Tabs (Additional 4 images)
- Four images representing account sub‑tabs exist but were not explicitly listed; treat them as:
  - **Account > Orders tab**
  - **Account > Loyalty tab**
  - **Account > Diagnostics tab**
  - **Account > Profile tab**
> If filenames differ, add them to `/docs/assets/` and update this section.

---

## 1) Design Identity (Applies Everywhere)
### 1.1 Brand feel
- Luxury + editorial + minimal
- High whitespace
- Strict grid alignment
- No playful / bubbly UI
- No “SaaS dashboard template” look

### 1.2 Color system (Semantic)
- **Base:** white background, black text
- **Accent:** `#ff0000` used **ONLY** for:
  - Primary CTA buttons
  - Discount indicators/badges
  - Critical highlights (rare)
- **Neutrals:** borders/dividers, muted text, chip backgrounds
- **Forbidden:** gradients, multiple accents, neon palettes

### 1.3 Radius
- Radius maximum **4px**
- Prefer **0–2px** for most containers
- No 12px+ rounded cards

### 1.4 Shadows
- Minimal/subtle only
- Used primarily for:
  - Dropdown menus
  - Sheets/drawers
  - Modals
- Avoid “card grid” shadow-heavy aesthetic

### 1.5 Typography
- Editorial scale: clear hierarchy (brand/title/price/body)
- No excessive font weights or oversized captions
- Text should respect language (Arabic vs English) and **not break layout**:
  - Use clamping/ellipsis rules (see sections below)

---

## 2) Layout System (Global)
### 2.1 Container & page width
- **Web-first**: desktop layout defines structure; mobile adapts.
- Container:
  - Max width: **1440px**
  - Horizontal padding: **18px**
  - Centered content
- Background: white

### 2.2 Breakpoints (Semantic)
Use these conceptual breakpoints (exact numbers in tokens/config):
- **Mobile**: ≤ 640
- **Tablet**: 641–1024
- **Desktop**: ≥ 1025
- **Wide desktop**: ≥ 1440

### 2.3 Grid rules
#### Product grid
- Mobile: **2 columns**
- Tablet: **3 columns**
- Desktop: **4 columns**
- No masonry
- All cards equal height
- Product media ratio fixed **1:1**

#### Brand grid
- Desktop: up to **6 columns**
- Tablet: 3
- Mobile: 2

### 2.4 Interaction parity (Web vs Mobile)
- Web has hover states; mobile does not.
- Any hover-only feature must have a mobile equivalent:
  - hover “Add to cart” → mobile inline button or bottom action
  - hover “quick actions” → mobile visible icons or sheet

### 2.5 RTL & multilingual (Global)
- Must support **Arabic (RTL)** and **English (LTR)**.
- Use “start/end” alignment in layout. No hard-coded left/right.
- Dropdown placements, arrows, and chevrons must flip in RTL.
- All user-visible strings are localized.
- CMS-controlled text fields must be localized objects `{ en, ar }`.

---

## 3) Component Contracts (Cross‑Page Reuse)
> These components must be reused everywhere to ensure consistency.

### 3.1 Header (shared)
Rows:
1) **Top bar** (static, CMS controlled text/link)
2) **Main row**: logo, search, icons
3) **Nav row**: categories + hover menus (desktop)

Behavior:
- Sticky on desktop (as in screenshots)
- Mobile collapses nav into drawer

### 3.2 ProductCard (single source of truth)
Applies to:
- Shop grid
- Homepage rails
- Related products rails
- Brand campaign blocks rails

Hard rules:
- Media 1:1 fixed
- Reserved vertical space for title/price/rating to prevent layout shift
- Hover overlay MUST NOT change layout height
- Title clamped (2 lines max); consistent line-height

Hover (desktop) must match:
- `shop-grid-product-hover.png`
- `slider-product-hover.png`

Mobile behavior:
- No hover; show key actions persistently (see Shop/Product sections)

### 3.3 Buttons
- Primary button: red background, white text, ≤4px radius
- Secondary button: outline/neutral
- Button heights must meet touch target: **≥ 40px** (prefer 42–44)

### 3.4 Inputs
- Minimal borders
- No large rounded pill inputs
- Consistent height (≈ 36px desktop, ≥ 40px touch contexts)

### 3.5 Drawer / Sheet
Used for:
- Mobile navigation
- Mobile filters
- Cart drawer
- Quick views if needed

Must have:
- Focus trapping (web)
- Close affordance
- Smooth but subtle transitions

### 3.6 Toast / Notification
- Used for “Added to cart” after first add (see Cart behavior)
- Minimal, non-invasive

---

## 4) Navigation Menus (Desktop + Mobile)
### 4.1 Desktop nav behaviors
- **Categories menu:** click to open (not hover)
- **Luxury brands:** hover to open
- **Sales:** hover to open

Must visually match:
- `category-menu.png`
- `laxury-brands-menu.png`
- `Sales-menu.png`

Menu style:
- Flat dropdown panel
- Minimal separators
- Grid/columns layout as per screenshots
- No heavy shadows; subtle is fine
- No rounded “mega menu cards”

### 4.2 Mobile nav
- Hamburger opens drawer
- Drawer includes:
  - Categories
  - Luxury brands
  - Sales
  - Account entry
  - Locale switch (optional)
- Drawer is vertical, accordions allowed

---

## 5) Homepage (Customer) — Detailed Contract
**Reference:** `Home-Page.jpeg`, `slider-product-hover.png`

### 5.1 Fixed zone order (do not reorder)
1) Header (top bar + main row + nav row)
2) **Hero carousel** (4 tiles; 3 visible + 4th peek)
3) **Moving marquee strip** (infinite scroll)
4) **Value highlight split** (Loyalty + Diagnostics)
5) Product rail: Top sellers / Trending
6) **Campaign block**: Banner + Related slider *(atomic pair)*
7) Bundle block
8) Brand campaign blocks *(max 3)*: Banner + Related slider (atomic)
9) Brand grid
10) Newsletter signup

### 5.2 Hero carousel
Visual:
- 4 equal-height tiles
- 3 fully visible
- 4th peeking (≈ 25–35%)

Content per tile:
- Background image (shared between languages)
- Overlay text (localized): headline (max 1 line), subline (max 1 line)
- Single CTA button (localized)

Hard constraints:
- Overlay text clamped; never increases tile height
- CTA is primary red button
- Avoid multi-paragraph overlays
- No gradients; at most subtle uniform contrast overlay

Mobile:
- 1.5 tiles visible
- Same rules; swipe

### 5.3 Moving marquee strip (under hero)
- Infinite horizontal scroll
- Multiple items (localized)
- Low height; subtle background or border
- No images required

### 5.4 Value highlight split (Loyalty + Diagnostics)
- Desktop: 2-column split blocks
- Mobile: stacked
- Each: Title (1 line), Description (2 lines), CTA
- Professional tone; minimal visuals

### 5.5 Product rails
- Horizontal slider
- Uses ProductCard
- Hover matches `slider-product-hover.png`
- Title/subtitle localized

### 5.6 Campaign block (atomic)
Structure:
- Banner
- Immediately below: related product slider
Rule:
- Must not be separated or reordered.

### 5.7 Bundle block
- Similar to campaign block
- Bundles may use dedicated BundleCard but follow same spacing/radius rules

### 5.8 Brand campaign blocks (max 3)
- Brand banner + related slider
- Slider products must relate to banner

### 5.9 Newsletter
- Minimal input + primary CTA
- Localized copy

---

## 6) Shop Page (Customer) — Full Detail Contract
**References:** `Shop-Page.jpeg`, `shop-grid-product-hover.png`, menu images.

### 6.1 Desktop layout
Two-column:
- Left: persistent sidebar filters
- Right: product grid and sorting bar

Sidebar width:
- Target **260–300px**
Grid columns:
- Desktop **4**
- Tablet **3**
- Mobile **2**

### 6.2 Sorting bar (top of grid)
- Result count
- Sort dropdown
- Optional view toggle (grid only; no list view unless requested)

Minimal borders; no pill controls.

### 6.3 Sidebar filters (desktop)
- Persistent
- Accordion sections
- Minimal checkboxes/switches
- No heavy backgrounds or chips

Order:
1) Category
2) Brand
3) Price
4) Sale
5) Bundle

Category:
- Tree/group list
- Active state subtle but clear

Brand:
- Checkbox list
- Scrollable when long
- Optional search later

Price:
- Range slider OR min/max inputs
- Must work in mobile sheet too

Sale/Bundle:
- Toggle or checkbox

### 6.4 Mobile filters
- Filter button opens sheet/drawer
- Same sections; accordion
- Apply/Reset controls at bottom (sticky)

### 6.5 Product cards & hover
- Strict equal heights
- 1:1 media ratio
- No layout shift on hover
- Hover overlay matches `shop-grid-product-hover.png`:
  - Add to cart CTA
  - Wishlist icon
  - Optional quick view

Mobile:
- Add to cart action visible (no hover)
- Touch targets respected

Text clamp:
- Brand: 1 line
- Title: 2 lines
- Price: 1 line

### 6.6 Pagination
Preferred: **Load More** button.

### 6.7 Empty state
- “No products found” + “Clear filters” CTA
- Minimal styling

### 6.8 CMS involvement (shop)
CMS may control:
- Optional shop top banner (image + short localized text + CTA)
- Default sort option
CMS may NOT control:
- Grid columns
- Filter types
- Card structure
- Sidebar layout

---

## 7) Product Page (Customer) — Full Detail Contract
**Reference:** `product-page.png` *(confirm path)*

### 7.1 Desktop layout
- Gallery 55–60%
- Info panel 40–45%
- White background; minimal borders

### 7.2 Mobile layout (stacked)
1) Gallery
2) Brand + title
3) Rating
4) Price + discount
5) Loyalty preview
6) Variants
7) Stock + fulfillment
8) Qty + add to cart
9) Accordions
10) Related products

### 7.3 Gallery
Desktop:
- Main 1:1 image
- Thumbnails swap main
Mobile:
- Swipe with dots

### 7.4 Info order (fixed)
1 Brand
2 Title
3 Rating
4 Price
5 Loyalty preview
6 Variant selector
7 Stock indicator
8 Delivery/Pickup
9 Qty selector
10 Add to cart (primary red)
11 Wishlist (secondary)

### 7.5 Variant selector
Minimal bordered options; selected state border black.

### 7.6 Fulfillment
Delivery vs pickup; pickup shows availability.

### 7.7 Accordions
Description, Ingredients, How to use, Reviews.

### 7.8 Related products
Rail uses same ProductCard.

---

## 8) Cart (Customer) — Detailed Contract
**References:** `Empty-cart.png`, `filled-cart.png`

### 8.1 Add-to-cart behavior
- First add: open cart drawer
- Subsequent adds: toast only

### 8.2 Empty cart
Minimal, matches reference.

### 8.3 Filled cart
- Item rows: thumbnail, title, qty, price, remove
- Summary section
- Checkout CTA primary

---

## 9) Checkout (Customer) — Detailed Contract
**References:** `checkout-page.jpeg`, `order-placed.jpeg`

### 9.1 Desktop
Two-column:
- Left: forms
- Right: summary

### 9.2 Mobile
Stacked; summary collapsible.

### 9.3 Section order
1 Contact
2 Address / pickup
3 Delivery method
4 Payment
5 Loyalty redeem
6 Review
7 Place order

### 9.4 Order placed
Minimal confirmation; match reference.

---

## 10) Account (Customer) — Detailed Contract
**References:** `Account-page.jpeg` + 4 tab images

Tabs:
- Orders
- Loyalty
- Diagnostics
- Profile

Desktop: tabs visible (side/top). Mobile: top tabs or list→detail.

Diagnostics shows sessions + recommended products + purchased status only for recommended items.

---

## 11) Pharmacist Dashboard (Web Only) — Detailed Contract
*(No screenshot yet; must match global style)*
- Route `/pharmasset`
- Tablet optimized
- 3-panel layout: search/scan, form, recommendations + availability

---

## 12) Admin & CMS (Web Only) — Detailed Contract
*(No screenshot yet; must match global style)*
- Sidebar layout
- Same components/tokens
- Admin dashboard: sales day/month/year, orders, campaigns, loyalty
- CMS is structured forms (no page builder)

---

## 13) Performance & UX Gates
- No layout shift on hover
- Image placeholders fixed ratio
- Keyboard accessible sliders/menus
- Focus trap for overlays
- Touch targets ≥ 40px

---

## 14) Pause & Ask (Visual)
Stop and ask if:
- Missing reference for unclear section structure
- Need to change zone order, grid, card ratio, radius, accent usage
- Adding new UI pattern not specified here

---

# END OF UI ARCHITECTURE SPEC
