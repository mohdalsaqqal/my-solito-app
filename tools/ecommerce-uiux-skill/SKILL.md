---
name: ecommerce-uiux
description: >
  Design and build production-grade e-commerce UI/UX components and pages.
  Use when the user asks to create: product pages, product cards, shopping carts,
  checkout flows, category/collection pages, search/filter UIs, navigation menus,
  promotional banners, wishlists, reviews/ratings, order tracking, account dashboards,
  or any component for an online store. Also triggers for e-commerce-specific UX
  improvements, conversion rate optimization suggestions, or mobile commerce (mCommerce)
  design. Do NOT use for purely backend e-commerce logic, payment gateway integration
  code, or general frontend work unrelated to shopping experiences.
license: MIT
---

# E-Commerce UI/UX Skill

You are designing and building world-class e-commerce interfaces. Your goal is not
just "functional" — it's **conversion-optimized, brand-expressive, and delightful**.

## Before You Write a Single Line of Code

Ask yourself (or the user):

1. **Brand Tier**: Budget/mass-market, mid-market, premium, or luxury? This changes EVERYTHING.
2. **Product Type**: Physical goods, digital, subscriptions, marketplace, or B2B?
3. **Primary Device**: Mobile-first? Desktop-dominant? Which matters most?
4. **Conversion Goal**: Add-to-cart, sign-up, checkout completion, upsell?

Pick a direction and execute it with conviction.

---

## E-Commerce Design Principles

### 1. Trust Signals Are Non-Negotiable
Every e-commerce UI must communicate trust. Include at minimum:
- Security badges / SSL indicators near checkout CTAs
- Real review counts with star ratings (not fake-looking)
- Clear return/refund policy snippets near purchase actions
- Stock indicators ("Only 3 left!") for urgency — but never fake it

### 2. The Product is the Hero
- Product images need generous space — never cramp them
- Zoom / multi-angle affordances for physical goods
- Video support consideration in the image gallery
- Clear, readable pricing with original price + discount visible

### 3. Friction = Lost Revenue
Minimize clicks to purchase. Design for:
- Guest checkout prominence
- Persistent cart (visible item count at all times)
- Autofill-friendly form fields
- One-click upsells, not intrusive modals

### 4. Mobile-First Commerce
Over 60% of e-commerce traffic is mobile. Always:
- Use touch-friendly tap targets (min 44×44px)
- Sticky add-to-cart bar on product pages (mobile)
- Bottom-sheet filters instead of sidebar (mobile)
- Thumb-zone optimized primary actions

### 5. Performance Perception
Skeleton screens > blank states. Lazy-load product images.
Optimistic UI updates for cart actions (don't wait for API).

---

## Component Patterns

### Product Card
**Must include:**
- Image with hover secondary image swap (desktop)
- Quick-add button appearing on hover/long-press
- Wishlist toggle (heart icon, accessible)
- Price with sale price handling
- Star rating + review count
- Badge system: "New", "Sale", "Best Seller", "Low Stock"

**Optional but high-value:**
- Color swatch switcher (inline)
- Countdown timer for flash sales

```html
<!-- Minimal semantic structure reference -->
<article class="product-card" aria-label="Product name">
  <a href="/product/slug" class="product-card__image-link">
    <img src="primary.jpg" data-hover="secondary.jpg" alt="Product name" loading="lazy">
    <span class="badge badge--sale">-20%</span>
  </a>
  <div class="product-card__body">
    <h3 class="product-card__title">Product Name</h3>
    <div class="product-card__rating" aria-label="4.5 out of 5 stars, 128 reviews">...</div>
    <div class="product-card__pricing">
      <span class="price--sale">$79.99</span>
      <s class="price--original">$99.99</s>
    </div>
  </div>
  <div class="product-card__actions">
    <button class="btn-quick-add" aria-label="Quick add to cart">Add to Cart</button>
    <button class="btn-wishlist" aria-label="Add to wishlist" aria-pressed="false">♡</button>
  </div>
</article>
```

### Product Detail Page (PDP) Layout
Structure (top to bottom, desktop left-right split):
1. Breadcrumb navigation
2. [LEFT] Image gallery with thumbnail strip + zoom
3. [RIGHT] Brand name → Product title → Rating → Price → Variant selectors → Quantity → Add to Cart (sticky on mobile) → Trust badges → Short description → Accordions: Description / Specs / Shipping / Reviews

### Shopping Cart
- Always show cart summary: subtotal, savings, estimated shipping
- "Continue Shopping" should never be the primary CTA
- Cross-sells should be relevant (bought-together, not random)
- Empty cart state needs a clear CTA back to shop + featured products

### Checkout Flow
Single-page or stepped — both valid. If stepped:
- Step 1: Contact/Account
- Step 2: Shipping
- Step 3: Payment
- Show order summary persistently on right (desktop) or collapsed on top (mobile)
- Express checkout (Apple Pay, Google Pay, PayPal) ABOVE the form, not below

### Category / Collection Page
- Filter + Sort are primary actions — make them accessible
- Grid vs List toggle
- Active filter display with easy removal (pill tags)
- Product count visible ("Showing 24 of 148 products")
- Infinite scroll OR pagination — not both. Pagination preferred for SEO.

### Search Experience
- Instant search results (debounced, ~300ms)
- Show product thumbnail + price in dropdown
- Recent searches + trending searches when empty
- No results state with suggestions and featured products

---

## Aesthetic Directions for E-Commerce

Choose one and commit fully:

**Luxury / Editorial**
- Massive whitespace, serif display fonts (Playfair Display, Cormorant)
- Black/cream/gold palette, ultra-refined micro-interactions
- Images bleed to edges, minimal UI chrome
- Example brands: Net-a-Porter, Chanel, Bottega Veneta

**Modern DTC (Direct-to-Consumer)**
- Clean but warm, sans-serif (not Inter — try Satoshi, Cabinet Grotesk, Switzer)
- Strong brand color as accent, off-white backgrounds
- Playful but trustworthy, personality in microcopy
- Example brands: Allbirds, Casper, Glossier

**Marketplace / Mass Retail**
- Dense information, clarity over beauty
- High contrast, clear hierarchy, scannable
- Functional over decorative
- Example brands: Amazon, Walmart, Target

**Streetwear / Hype**
- Bold typography, high contrast, limited drops UI
- Countdown timers, "Sold Out" as a status symbol
- Dark themes common, neon accents
- Example brands: Supreme, Kith, Palace

**Artisan / Handmade**
- Warm textures (linen, paper, wood tones)
- Humanist fonts, slightly irregular layouts
- Story-forward, product photography feels candid
- Example brands: Etsy sellers, Uncommon Goods

---

## Accessibility Requirements (Non-Negotiable)

- All interactive elements keyboard-navigable
- Focus indicators visible and styled (not just browser default)
- Color contrast minimum 4.5:1 for text
- `aria-label` on icon-only buttons (wishlist, close, etc.)
- `role="status"` on cart count updates
- Form fields have visible labels (not just placeholders)
- Error messages are descriptive and associated via `aria-describedby`

---

## Microcopy That Converts

Bad → Good:
- "Add to Cart" → "Add to Cart" (this one's correct, keep it)
- "Submit" → "Place Order" or "Complete Purchase"
- "Error" → "Your card was declined — please try a different payment method"
- "Out of Stock" → "Sold Out — Notify me when available"
- "Discount Code" → "Have a promo code? Apply it at checkout"

Keep microcopy: clear, action-oriented, and human.

---

## Animation & Interaction Guidelines

- Cart add: item flies to cart icon (subtle arc animation) OR cart count bumps with a spring
- Image gallery: smooth cross-fade or slide, NO jarring cuts
- Filter/sort: results should fade/slide in, not hard-reload
- Quick-add: button transforms to "Added ✓" for 1.5s then resets
- Loading: skeleton screens matching the layout exactly

---

## Files in This Skill Package

| File | Purpose |
|------|---------|
| `SKILL.md` | This file — core philosophy & patterns |
| `components/product-card.html` | Standalone product card reference |
| `components/pdp-layout.html` | Product detail page shell |
| `components/cart-drawer.html` | Slide-out cart drawer |
| `components/checkout-form.html` | Single-page checkout form |
| `components/filter-sidebar.html` | Category filter UI |
| `tokens/design-tokens.css` | CSS custom properties for e-commerce |
| `tokens/design-tokens-luxury.css` | Luxury variant tokens |
| `examples/fashion-store/` | Complete fashion store example |
| `examples/electronics-store/` | Complete electronics store example |

---

## Quick Reference: Do's and Don'ts

**DO:**
- Use real product photography in examples (via Unsplash/placeholder services)
- Make the primary CTA ("Add to Cart", "Buy Now") unmissable
- Show prices clearly — never hide them until hover
- Design for the worst case: long product names, out-of-stock, no reviews yet

**DON'T:**
- Use fake urgency (fake countdown timers, fake stock counts)
- Hide the total cost until the last checkout step
- Make users create an account before they can purchase
- Use carousels for primary product discovery (they're ignored)
- Design only for perfect data — handle edge cases

---

## Integration Notes

This skill works best combined with:
- `frontend-design` skill (for overall aesthetic execution)
- `docx` or `pdf` skill (for design specs / handoff docs)

When the user provides a Figma link, screenshot, or describes their existing brand,
adapt all color tokens, font choices, and aesthetic direction to match.
