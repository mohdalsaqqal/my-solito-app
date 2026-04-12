# REAL Cosmetics — Brand Identity System Design

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:writing-plans to create the implementation plan from this design doc.

**Goal:** Transform the REAL cosmetics UI from a generic beauty store into a distinctive, conversion-optimised brand identity built around the red arc motif from the logo.

**Brand Idea:** "endless beauty" — bold confidence meets graceful femininity. The red arc is the brand's visual signature across every touchpoint.

**Tagline:** endless beauty

---

## 1. Color System

Strict 3-color palette mirroring the logo (black, white, red). No exceptions.

| Token | Value | Role |
|---|---|---|
| `--color-bg` | `#FFFFFF` | Page background |
| `--color-surface` | `#F8F8F8` | Cards, inputs |
| `--color-fg` | `#111111` | Body text |
| `--color-ink` | `#000000` | Headers, display text, footer bg |
| `--color-brand` | `#C2233B` | Arc, CTAs, urgency signals — ONLY |
| `--color-brand-strong` | `#A91D32` | Brand hover/active states |

**Rules:**
- Red appears ONLY where the eye should go (CTAs, arc, urgency badges)
- Everything else is black, white, or grey
- No warm tones, no blues, no greens in primary UI (mint/sun tokens remain for system states only)

---

## 2. Typography

Two-font system that mirrors the logo's tension: bold serif + clean sans-serif.

| Role | Font | Source |
|---|---|---|
| Display / Headlines | Playfair Display | Google Fonts |
| Body / UI | Inter | Google Fonts (already system default) |

**Scale:**
- Hero H1: Playfair Display, 56–72px, weight 700, color ink
- Section titles: Playfair Display, 32–40px, weight 700
- Product names: Inter, 15–16px, weight 500
- Labels/badges: Inter, 11–12px, weight 600, tracked wide (0.08em)
- Price: Inter, 18px, weight 700
- Body: Inter, 14px, weight 400

**Implementation:**
- Add Google Fonts link to `index.html`: Playfair Display (700, 900) + Inter (400, 500, 600, 700)
- Add `fontFamily.display: ['Playfair Display', 'Georgia', 'serif']` to `tailwind.config.ts`
- Apply `font-display` to all `<h1>`, `<h2>` section titles and hero headlines

---

## 3. The Arc Identity System

The red arc from the logo (a single confident swoosh below text) becomes the visual DNA of the site.

### Arc SVG Shape
```svg
<path d="M0,8 Q50,0 100,8" stroke="#C2233B" stroke-width="2.5" fill="none"/>
```
Parameterised by width. Always positioned below text. Never filled. Always brand red.

### Arc Animation
CSS `stroke-dashoffset` draw-in animation, left → right, 0.4s ease-out. Triggered on:
- Page load (hero arc)
- Scroll into view (section title arcs)
- Hover (CTA/button arcs)

```css
@keyframes arc-draw {
  from { stroke-dashoffset: var(--arc-length); }
  to   { stroke-dashoffset: 0; }
}
```

### Arc Component
Create `src/components/shared/BrandArc.tsx`:
```tsx
// Props: width, animated (boolean), className
// Renders the SVG arc with optional draw-in animation
```

### Arc Usage Map

| Location | Trigger | Size | Animated |
|---|---|---|---|
| Hero headline keyword | Page load | Large (200–300px) | Yes — draw left→right |
| Section titles (H2) | Scroll into view | Medium (80–120px) | Yes — draw left→right |
| Active nav link | Always | Small (40–60px) | No — static |
| "Shop Now" CTA hover | Hover | Medium (80px) | Yes — fast 0.2s |
| "Add to Cart" hover | Hover | Full button width | Yes — fast 0.2s |
| Footer top divider | Always | Full width | No — static |
| "Selling fast" badge | Always | Text width | No — static |

---

## 4. Component Updates

### Hero Section (`HeaderHeroSection.tsx`)
- Headline: Playfair Display, large, ink
- Key word underlined with animated BrandArc on load
- Subtext: Inter, tracked wide, muted grey
- CTA: Black button "Shop Now" — BrandArc sweeps under on hover
- Add "endless beauty" tagline in small tracked caps

### Section Titles (all sections)
- Change all `<h2>` section headings to `font-display` (Playfair Display)
- Add `<BrandArc>` below each, animates on scroll into view

### Navigation (`EcommerceHeader.tsx`)
- Active nav link: replace underline with BrandArc (static, small)
- Cart/wishlist counts: red badges (already done ✓)
- "Free shipping" bar: already black bg ✓

### Product Card (`CardProductElement` / `atoms.tsx`)
- Brand name: Inter, 11px, tracked wide, red — above product title
- Product title: Inter 500, 15px, ink
- Price: Inter 700, 18px — sale price large, original strikethrough small
- "You save $X": change from green to red text (urgency signal)
- "Add to Cart" button: black bg, white text, BrandArc animates under on hover
- "Selling fast" / "Only X left": red text with static BrandArc underneath
- Quick view link: text link with BrandArc on hover (not a box button)

### Footer (`FooterSection.tsx`)
- Add "endless beauty" tagline prominently below logo
- Add full-width BrandArc as divider at very top of footer
- Keep black bg ✓

---

## 5. Conversion Signals

These micro-copy and layout changes are proven to lift add-to-cart rates:

| Signal | Change | Where |
|---|---|---|
| Urgency | "Only X left" in red near price | Product card + PDP |
| Social proof | Star rating moved directly below product name | Product card |
| Savings | "You save $X" in red (not green) | Product card |
| Trust | "Free shipping over $50" always visible | Sticky header bar |
| FOMO | "X people viewing this" (future) | PDP |
| Scarcity | "Selling fast" with red arc | Product card badge |

---

## 6. Files to Change

| File | Change |
|---|---|
| `index.html` | Add Google Fonts link (Playfair Display + Inter) |
| `tailwind.config.ts` | Add `fontFamily.display`, update color tokens |
| `src/styles/tokens.css` | Update `--color-bg` to `#FFFFFF`, add arc animation keyframes |
| `src/components/shared/BrandArc.tsx` | **NEW** — arc SVG component |
| `src/components/atoms.tsx` | Update product card: font, arc hover, "you save" color, urgency signals |
| `src/components/HeaderHeroSection.tsx` | Add Playfair Display headline + animated arc |
| `src/components/IndexScreen.tsx` | Update section H2s to font-display + add BrandArc |
| `src/components/FooterSection.tsx` | Add tagline + arc divider |
| `src/components/headers/EcommerceHeader.tsx` | Arc as active nav indicator |

---

## Success Criteria

- Red arc visible and animated on hero load
- All H2 section titles use Playfair Display
- Product cards show arc on hover over CTA
- Active nav link shows arc indicator
- Footer has arc divider + "endless beauty" tagline
- "You save" text is red, not green
- Zero hardcoded warm/cool tones added — strict black/white/red only
