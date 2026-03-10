export const colors = {
  // Base surfaces — warm-tinted neutrals (hue 30°, 5-8% saturation)
  background: 'hsl(0 0% 100%)',
  backgroundSecondary: 'hsl(0 0% 97%)',
  surface: 'hsl(0 0% 100%)',
  surfaceMuted: 'hsl(0 0% 97%)',

  // Ink family — prestige dark surfaces + on-ink text (The Atelier)
  inkBlack: 'hsl(20 10% 8%)',      // ink section background — same value as 'black'/'text'; explicit semantic name for ink sections
  inkDeep: 'hsl(20 8% 13%)',       // card backgrounds inside ink sections
  inkMid: 'hsl(20 8% 20%)',        // dividers / borders inside ink sections
  inkFrost: 'hsl(30 8% 95%)',      // light text ON ink (warm off-white, not harsh)

  // Gold family — luxury / loyalty accent (The Atelier)
  goldPrimary: 'hsl(39 95% 43%)',  // gold text, loyalty badge fills, featured labels
  goldLight: 'hsl(42 100% 75%)',   // hover / active state of gold elements
  goldSubtle: 'hsl(42 60% 92%)',   // subtle gold tint on white backgrounds

  // Text — warm-tinted neutrals
  text: 'hsl(20 10% 8%)',
  textPrimary: 'hsl(20 10% 8%)',
  textSecondary: 'hsl(20 8% 35%)',
  mutedText: 'hsl(20 8% 35%)',
  textMuted: 'hsl(20 8% 35%)',
  textInverted: 'hsl(0 0% 100%)',

  // Borders — warm-tinted
  border: 'hsl(30 10% 88%)',
  divider: 'hsl(30 10% 88%)',

  // Brand
  primary: 'hsl(20 10% 8%)',
  secondary: 'hsl(358 74% 50%)',
  accent: 'hsl(20 10% 8%)',
  brandPrimary: 'hsl(358 74% 50%)',
  brandPrimaryHover: 'hsl(358 74% 44%)',
  brandPrimaryPressed: 'hsl(358 74% 38%)',
  brandPrimarySubtle: 'hsl(30 6% 97%)',
  primaryText: 'hsl(0 0% 100%)',

  // Legacy aliases used in existing shell code — DO NOT REMOVE (backward compat)
  chipBackground: 'hsl(30 6% 97%)',
  brandTeal: 'hsl(358 74% 50%)',   // legacy name — same as brandPrimary
  brandMint: 'hsl(30 6% 97%)',     // legacy name — same as surfaceMuted
  brandGreen: 'hsl(358 74% 44%)',  // legacy name — same as brandPrimaryHover

  // Correct-name aliases (use these going forward)
  brandCrimson: 'hsl(358 74% 50%)',
  brandCrimsonHover: 'hsl(358 74% 44%)',
  surfaceSubtle: 'hsl(30 6% 97%)',

  // Status
  success: 'hsl(162 100% 39%)',
  warning: 'hsl(40 100% 50%)',
  danger: 'hsl(358 100% 42%)',
  error: 'hsl(358 100% 42%)',
  sale: 'hsl(358 100% 42%)',
  info: 'hsl(210 90% 40%)',

  // Utility
  white: 'hsl(0 0% 100%)',
  black: 'hsl(20 10% 8%)',         // see also: inkBlack (semantic alias for ink-section use)

  // Semantic intent aliases — explicit intent at call sites
  salePrice: 'hsl(358 74% 50%)',      // = brandPrimary — for PriceTag sale price
  ctaBackground: 'hsl(358 74% 50%)',  // = brandPrimary — for add-to-cart buttons
  urgencyBadge: 'hsl(358 74% 50%)',   // = brandPrimary — for flash-sale badges
} as const
