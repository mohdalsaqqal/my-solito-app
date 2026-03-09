# 💎 UI_EXECUTION_STRATEGY.md
## Real Cosmetics — Luxury Commercial Marketplace

---

# 1. Core Positioning

Real Cosmetics is a **premium, revenue-driven cosmetics marketplace**.

The platform must:

- Look luxurious
- Sell aggressively
- Feel structured
- Avoid visual chaos
- Maintain consistent sharp identity
- Be visually consistent across Web and Mobile (Solito architecture)

This is NOT a brand showcase website.  
This is a commerce engine.

Homepage markets.  
Shop makes money.

---

# 2. Visual Identity System

## Typography

Primary Font: **Cairo**

Supports English + Arabic (RTL compatible).

Font hierarchy:

- Hero Headline → Bold (700)
- Section Titles → SemiBold (600)
- Product Name → Medium (500)
- Price → Bold (700)
- Old Price → Light gray + strikethrough
- Secondary text → Gray

No serif mixing.
No decorative fonts.
No inconsistent sizing.

---

## Shape Language

Sharp and structured identity.

- Hero → 0px radius
- Commercial blocks → 0px radius
- Product cards → 2px max radius
- Buttons → 2px max radius
- Images → 0px radius
- Modals → 2px max

No soft rounded UI.
Consistency is mandatory.

---

## Color Usage

Primary palette:

- White background
- Black / charcoal text
- Gray secondary text
- Red (#FF0000) for conversion triggers ONLY

Red may be used for:

- CTA buttons
- Discount badges
- Flash sale accents
- Countdown indicators

Red must NOT dominate backgrounds.
Luxury = restraint.

---

# 3. Homepage Architecture

Homepage structure (top to bottom):

1️⃣ Hero (single campaign, clean, controlled)

2️⃣ Four Commercial Blocks (2x2 grid)
   - Flash Deals
   - Bundle & Save
   - New Arrivals
   - Top Brand Campaign

3️⃣ Flash Deals Rail

4️⃣ Bundle Section

5️⃣ Trending Products

6️⃣ Top Brand Blocks (2–3 max)

7️⃣ Category Grid

8️⃣ Clearance (optional)

Homepage drives urgency and merchandising.
It must not feel cluttered.

---

# 4. Product Card System

Single core ProductCard component with variants.

## Universal Rules

- 1:1 image ratio
- Subtle bottom gradient (20–30% opacity)
- Discount badge INSIDE image (top-right)
- Wishlist icon (top-left)
- Price area below image
- Old price light gray
- Format: "SAVE XX%"
- Sharp edges (2px max)
- Hover: subtle shadow only

---

## Variants

### variant="shop"
- Compact add-to-cart
- Medium spacing
- Used in Shop grid

### variant="slider"
- Full-width add-to-cart
- Slightly more spacing
- Used in homepage rails

Structure must remain identical.
Only spacing and CTA style change.

---

# 5. Shop Page Architecture

Single unified template:

/shop


Filtered using query parameters:

?category=
?subcategory=
?brand=
?sale=
?bundle=
?page=
&limit=


No separate layouts per category or brand.

---

## Desktop Layout

- Always-visible sidebar (~300px)
- 3–4 column responsive grid
- Default 24 products per page
- Pagination (SEO safe)
- Limit selector (16 / 24 / 32)

---

## Sidebar Behavior

Expanded by default:
- Category
- Brand
- Price

Collapsed:
- Discount
- Bundle
- Skin type
- Trending

Mobile:
Sidebar becomes full-screen filter drawer.

---

# 6. Product Page

Must include:

- Image gallery
- Brand
- Title
- Rating
- Price + old price
- Discount indicator
- Sticky add-to-cart (Web + Mobile)
- Wishlist
- Reviews section
- Related products

Sticky add-to-cart is mandatory.

---

# 7. Navigation Strategy

Top navigation includes:

- Categories (mega menu)
- Brands (mega menu)
- Sales (mega menu)
- New
- Bundles

Categories:
- Two levels max
- Deeper levels handled via filters

Brands:
- Act as Shop filters
- Editorial brand pages optional later

---

# 8. Commercial Logic Rules

- Flash sales appear high on homepage
- Bundles must be visually distinct
- Trending must feel social-proof driven
- Discount visibility must be immediate
- Product density must feel like a real store
- Avoid oversized empty white sections

---

# 9. Mobile Consistency Rule

Web and Mobile App must:

- Share identical layout proportions
- Share identical card structure
- Share identical spacing rhythm
- Share identical badge placement

Interaction differences are allowed.
Structural differences are not.

---

# 10. UI Implementation Order (When UI Phase Begins)

When entering UI implementation phase:

1. Finalize ProductCard
2. Build Shop layout
3. Implement Sidebar filters
4. Implement Pagination + Limit selector
5. Build Product page
6. Assemble Homepage

Homepage must not be built before Shop is stable.

---

# 11. Non-Negotiable Rules

- No random design improvisation
- No additional radius values
- No arbitrary colors
- No hardcoded spacing
- All components must use tokens
- All components must use primitives
- Features must not contain styling logic

This document defines visual direction.
Implementation must follow architectural rules in AGENTS.md.