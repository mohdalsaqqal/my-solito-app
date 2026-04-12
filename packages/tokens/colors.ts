/**
 * REAL Cosmetics — Brand Color Tokens
 *
 * Extracted from logo: black headline, charcoal subhead, vibrant red underline.
 * All values in HSL for consistent JS/CSS bridge.
 *
 * Brand direction: mass-market commercial beauty (niceonesa.com).
 * Warm, inviting, conversion-oriented. NOT luxury-editorial.
 */

export const colors = {
  // ── Base surfaces — warm beauty commerce (not cold editorial) ─────────────
  background: 'hsl(12 8% 97.5%)',             // #f8f6f5 — warm off-white main bg
  backgroundSecondary: 'hsl(12 8% 95.0%)',    // #f3f0ef — warm section separator
  surface: 'hsl(0 0% 100%)',                   // #ffffff — cards, elevated objects
  surfaceMuted: 'hsl(12 8% 93.0%)',           // #efedeb — subtle surfaces

  // ── Grayscale — warm neutral (beauty-appropriate, not spreadsheet gray) ───
  gray0:  'hsl(12 8% 97%)',   // #f8f6f5 — warm base
  gray5:  'hsl(12 8% 90%)',   // #e8e4e2
  gray10: 'hsl(12 8% 82%)',   // #d7d2cf
  gray20: 'hsl(12 8% 72%)',   // #c1bab6
  gray30: 'hsl(12 6% 60%)',   // #a49e99
  gray40: 'hsl(12 6% 48%)',   // #86807b
  gray50: 'hsl(12 6% 38%)',   // #6c6661
  gray60: 'hsl(12 6% 28%)',   // #524d49
  gray70: 'hsl(12 6% 18%)',   // #383330
  gray80: 'hsl(12 6% 10%)',   // #211e1c
  gray90: 'hsl(0 0% 0%)',     // #000000
  gray100: 'hsl(0 0% 0%)',    // #000000

  // ── Tints — warm near-white steps ─────────────────────────────────────────
  tint0:  'hsl(12 8% 97%)',
  tint10: 'hsl(12 8% 98%)',
  tint20: 'hsl(12 8% 98%)',
  tint30: 'hsl(12 8% 99%)',
  tint40: 'hsl(12 8% 99%)',
  tint50: 'hsl(12 8% 99%)',
  tint60: 'hsl(0 0% 100%)',
  tint70: 'hsl(0 0% 100%)',

  // ── Ink family — logo "REAL" black & "Cosmetics" charcoal ─────────────────
  inkBlack: 'hsl(0 0% 0%)',           // #000000 — REAL headline
  inkDeep: 'hsl(0 0% 20%)',           // #333333 — Cosmetics subhead
  inkMid: 'hsl(0 0% 33%)',            // #555555 — supporting text
  inkFrost: 'hsl(12 8% 97%)',         // warm near-white for dark-mode text

  // ── Rose family — beauty commerce accents (replaces purple luxury) ────────
  // Derived from the logo red underline, softened for secondary use
  roseDark: 'hsl(357 86% 30%)',       // deep rose — dark backgrounds
  roseDeep: 'hsl(357 86% 38%)',       // rich rose — section backgrounds
  roseMid: 'hsl(357 75% 50%)',        // medium rose — borders, hover states
  roseAccent: 'hsl(357 70% 65%)',     // soft rose — active states, icons
  roseBlush: 'hsl(357 60% 95%)',      // pale rose — subtle backgrounds
  roseFrost: 'hsl(357 30% 97%)',      // near-white rose tint — text on dark

  // ── Coral/Amber family — promotional energy (replaces gold luxury) ────────
  // Warm, urgent tones for sales, badges, and promo surfaces
  coralPrimary: 'hsl(18 90% 55%)',    // vibrant coral — promo accents
  coralLight: 'hsl(18 85% 68%)',      // soft coral — secondary promo
  coralSubtle: 'hsl(18 70% 96%)',     // pale coral — subtle promo backgrounds
  amberWarm: 'hsl(35 90% 55%)',       // warm amber — rating stars, highlights
  amberLight: 'hsl(35 85% 65%)',      // soft amber
  amberSubtle: 'hsl(35 70% 96%)',     // pale amber

  // ── Logo brand red — the signature underline stroke ───────────────────────
  // Exact match: the red underline in the REAL Cosmetics logo
  brandPrimary: 'hsl(357 86% 44%)',   // #d31018 — logo red, PRIMARY brand color
  brandPrimaryHover: 'hsl(357 80% 38%)', // darker on hover
  brandPrimaryPressed: 'hsl(357 75% 32%)', // pressed state
  brandPrimarySubtle: 'hsl(357 60% 96%)',  // pale tint for subtle backgrounds
  
  // ── Commerce burgundy — softer, more premium CTA color ────────────────────
  // Replaces bright red for purchase actions — feels more premium and less aggressive
  commercePrimary: 'hsl(350 75% 35%)',    // #8B1538 — burgundy for Add to Cart
  commercePrimaryHover: 'hsl(350 70% 30%)', // darker burgundy on hover
  commercePrimaryPressed: 'hsl(350 65% 25%)', // pressed state
  commercePrimarySubtle: 'hsl(350 40% 96%)', // pale tint for subtle backgrounds

  // ── Utility color slots ───────────────────────────────────────────────────
  stroke: 'hsla(0 0% 0% / 0.10)',
  popPink: 'hsl(357 86% 44%)',       // same as brand primary — logo red
  popBlush: 'hsl(357 60% 96%)',      // same as brand primary subtle
  
  // ── Accessibility — focus ring color (WCAG 2.4.7) ─────────────────────────
  ring: 'hsl(210 80% 50%)',          // high-contrast blue for focus indicators

  // ── Figma palette anchors — updated to brand colors ───────────────────────
  primaryHome1: 'hsl(0 0% 0%)',       // REAL black
  primaryHome2: 'hsl(357 86% 44%)',   // logo red underline
  primaryHome3: 'hsl(357 80% 38%)',   // logo red hover
  secondaryHome1: 'hsl(18 90% 55%)',  // coral promotional
  secondaryHome2: 'hsl(0 0% 0%)',
  secondaryHome3: 'hsl(0 0% 0%)',
  linkPrimary: 'hsl(357 86% 44%)',    // logo red

  // ── Text — warm neutral hierarchy ─────────────────────────────────────────
  text: 'hsl(0 0% 0%)',               // pure black — on-surface (REAL)
  textPrimary: 'hsl(0 0% 0%)',        // pure black
  textSecondary: 'hsl(0 0% 20%)',     // #333333 — secondary label (Cosmetics)
  mutedText: 'hsl(0 0% 33%)',         // #555555 — muted text
  textMuted: 'hsl(0 0% 33%)',
  textInverted: 'hsl(0 0% 100%)',     // white text on dark

  // ── Borders — warm neutral ────────────────────────────────────────────────
  border: 'hsla(12 8% 80% / 0.50)',   // warm light gray border
  divider: 'hsla(12 8% 80% / 0.50)',

  // ── Primary CTA — logo black "REAL" ──────────────────────────────────────
  primary: 'hsl(0 0% 0%)',            // #000000 — primary CTA background
  secondary: 'hsl(12 8% 97.5%)',      // warm off-white — secondary surfaces
  accent: 'hsl(357 86% 44%)',         // logo red — accent color
  primaryText: 'hsl(0 0% 100%)',      // white text on dark CTA

  // ── Surface hierarchy ─────────────────────────────────────────────────────
  surfaceLowest: 'hsl(0 0% 100%)',    // #ffffff — cards, innermost layer
  surfaceContainerLow: 'hsl(12 8% 95.0%)', // #f3f0ef — section separators
  surfaceContainer: 'hsl(12 8% 93.0%)',    // #efedeb — mid-layer backgrounds
  surfaceDim: 'hsl(12 8% 89.0%)',          // #e8e4e2 — overlays

  // ── Ghost border — subtle warm pink ───────────────────────────────────────
  outlineVariant: 'hsl(357 40% 88%)', // warm pinkish border

  // ── Legacy aliases — DO NOT REMOVE (backward compat) ─────────────────────
  chipBackground: 'hsl(357 60% 96%)', // rose blush for chips
  brandTeal: 'hsl(357 86% 44%)',      // remapped to logo red
  brandMint: 'hsl(357 60% 96%)',      // remapped to brandPrimarySubtle
  brandGreen: 'hsl(357 80% 38%)',     // remapped to brandPrimaryHover

  // ── Correct-name aliases ──────────────────────────────────────────────────
  brandCrimson: 'hsl(357 86% 44%)',   // logo red
  brandCrimsonHover: 'hsl(357 80% 38%)',
  surfaceSubtle: 'hsl(12 8% 95.0%)',

  // ── Status — commercial beauty appropriate (WCAG AA 4.5:1) ───────────────
  success: 'hsl(153 60% 32%)',        // green — confirmed, in stock
  warning: 'hsl(24 85% 40%)',         // amber — attention needed
  danger: 'hsl(357 86% 38%)',         // deep red — errors, critical
  error: 'hsl(357 86% 38%)',          // deep red
  sale: 'hsl(357 86% 38%)',           // deep red — SALE badges
  info: 'hsl(210 70% 40%)',           // blue — informational

  // ── Utility ───────────────────────────────────────────────────────────────
  white: 'hsl(0 0% 100%)',
  black: 'hsl(0 0% 0%)',

  // ── Semantic intent aliases ───────────────────────────────────────────────
  salePrice: 'hsl(357 86% 44%)',      // logo red for sale prices
  ctaBackground: 'hsl(0 0% 0%)',      // black CTA (REAL)
  urgencyBadge: 'hsl(357 86% 44%)',   // logo red for urgency badges
} as const

// ── Dark mode equivalents ────────────────────────────────────────────────────
// Warm dark surfaces — not cold gray, not purple luxury.

export const colorsDark = {
  // ── Base surfaces — warm dark ─────────────────────────────────────────────
  background: 'hsl(12 6% 10%)',        // warm near-black
  backgroundSecondary: 'hsl(12 6% 13%)',
  surface: 'hsl(12 6% 13%)',
  surfaceMuted: 'hsl(12 6% 16%)',

  // ── Grayscale — dark mode ─────────────────────────────────────────────────
  gray0:  'hsl(12 6% 10%)',
  gray5:  'hsl(12 6% 14%)',
  gray10: 'hsl(12 6% 20%)',
  gray20: 'hsl(12 6% 28%)',
  gray30: 'hsl(12 6% 36%)',
  gray40: 'hsl(12 6% 44%)',
  gray50: 'hsl(12 6% 54%)',
  gray60: 'hsl(12 6% 64%)',
  gray70: 'hsl(12 6% 74%)',
  gray80: 'hsl(12 6% 84%)',
  gray90: 'hsl(12 6% 92%)',
  gray100: 'hsl(0 0% 100%)',

  // ── Tints — dark mode ─────────────────────────────────────────────────────
  tint0:  'hsl(12 6% 10%)',
  tint10: 'hsl(12 6% 12%)',
  tint20: 'hsl(12 6% 14%)',
  tint30: 'hsl(12 6% 16%)',
  tint40: 'hsl(12 6% 18%)',
  tint50: 'hsl(12 6% 20%)',
  tint60: 'hsl(12 6% 22%)',
  tint70: 'hsl(12 6% 24%)',

  // ── Ink family — inverted for dark mode ───────────────────────────────────
  inkBlack: 'hsl(0 0% 100%)',         // white — headline on dark
  inkDeep: 'hsl(12 8% 90%)',          // warm light — subhead on dark
  inkMid: 'hsl(12 8% 70%)',           // warm mid — supporting text
  inkFrost: 'hsl(12 6% 10%)',         // warm near-black

  // ── Rose family — dark mode ───────────────────────────────────────────────
  roseDark: 'hsl(357 60% 20%)',
  roseDeep: 'hsl(357 60% 28%)',
  roseMid: 'hsl(357 60% 45%)',
  roseAccent: 'hsl(357 55% 58%)',
  roseBlush: 'hsl(357 30% 16%)',
  roseFrost: 'hsl(357 15% 14%)',

  // ── Coral/Amber — dark mode ───────────────────────────────────────────────
  coralPrimary: 'hsl(18 80% 55%)',
  coralLight: 'hsl(18 75% 62%)',
  coralSubtle: 'hsl(18 40% 16%)',
  amberWarm: 'hsl(35 80% 55%)',
  amberLight: 'hsl(35 75% 62%)',
  amberSubtle: 'hsl(35 40% 16%)',

  // ── Logo brand red — dark mode ────────────────────────────────────────────
  brandPrimary: 'hsl(357 80% 55%)',   // brighter red for dark mode contrast
  brandPrimaryHover: 'hsl(357 75% 62%)',
  brandPrimaryPressed: 'hsl(357 70% 48%)',
  brandPrimarySubtle: 'hsl(357 40% 18%)',

  // ── Utility ──────────────────────────────────────────────────────────────
  stroke: 'hsla(0 0% 100% / 0.12)',
  popPink: 'hsl(357 80% 55%)',
  popBlush: 'hsl(357 40% 18%)',

  // ── Figma palette — dark mode ─────────────────────────────────────────────
  primaryHome1: 'hsl(0 0% 100%)',
  primaryHome2: 'hsl(357 80% 55%)',
  primaryHome3: 'hsl(357 75% 62%)',
  secondaryHome1: 'hsl(18 80% 55%)',
  secondaryHome2: 'hsl(0 0% 100%)',
  secondaryHome3: 'hsl(0 0% 100%)',
  linkPrimary: 'hsl(357 80% 55%)',

  // ── Text — dark mode ──────────────────────────────────────────────────────
  text: 'hsl(12 8% 95%)',
  textPrimary: 'hsl(12 8% 95%)',
  textSecondary: 'hsl(12 8% 70%)',
  mutedText: 'hsl(12 8% 60%)',
  textMuted: 'hsl(12 8% 60%)',
  textInverted: 'hsl(12 6% 10%)',

  // ── Borders — dark mode ───────────────────────────────────────────────────
  border: 'hsla(12 6% 40% / 0.50)',
  divider: 'hsla(12 6% 40% / 0.50)',

  // ── Primary CTA — dark mode (white on warm dark) ──────────────────────────
  primary: 'hsl(12 8% 95%)',
  secondary: 'hsl(12 6% 13%)',
  accent: 'hsl(357 80% 55%)',
  primaryText: 'hsl(12 6% 10%)',

  // ── Surface hierarchy — dark mode ─────────────────────────────────────────
  surfaceLowest: 'hsl(12 6% 15%)',
  surfaceContainerLow: 'hsl(12 6% 13%)',
  surfaceContainer: 'hsl(12 6% 16%)',
  surfaceDim: 'hsl(12 6% 18%)',

  // ── Ghost border — dark mode ──────────────────────────────────────────────
  outlineVariant: 'hsl(357 30% 28%)',

  // ── Legacy aliases — dark mode ────────────────────────────────────────────
  chipBackground: 'hsl(357 40% 18%)',
  brandTeal: 'hsl(357 80% 55%)',
  brandMint: 'hsl(357 40% 18%)',
  brandGreen: 'hsl(357 75% 62%)',

  // ── Correct-name aliases — dark mode ──────────────────────────────────────
  brandCrimson: 'hsl(357 80% 55%)',
  brandCrimsonHover: 'hsl(357 75% 62%)',
  surfaceSubtle: 'hsl(12 6% 13%)',

  // ── Status — dark mode (WCAG AA 4.5:1) ────────────────────────────────────
  success: 'hsl(153 50% 52%)',
  warning: 'hsl(24 85% 62%)',
  danger: 'hsl(357 80% 62%)',
  error: 'hsl(357 80% 62%)',
  sale: 'hsl(357 80% 62%)',
  info: 'hsl(210 70% 62%)',

  // ── Utility ───────────────────────────────────────────────────────────────
  white: 'hsl(12 8% 95%)',
  black: 'hsl(12 6% 10%)',

  // ── Semantic intent aliases — dark mode ───────────────────────────────────
  salePrice: 'hsl(357 80% 55%)',
  ctaBackground: 'hsl(12 8% 95%)',
  urgencyBadge: 'hsl(357 80% 55%)',
} as const
