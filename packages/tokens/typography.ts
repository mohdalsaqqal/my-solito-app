export const typography = {
  // ── Figma type scale — pixel-perfect ─────────────────────────────────────
  // H1 96 / H2 60 / H3 48 / H4 34 / H5 26 / H6 20
  // Body1 16 / Body2 14 / Caption 12 / Button 16 / Overline 10
  h1: 96,
  h2: 60,
  h3: 48,
  h4: 34,
  h5: 26,
  h6: 20,
  body1: 16,
  body2: 14,
  button: 16,
  overline: 10,

  // ── Legacy / component aliases (keep for backward compat) ─────────────────
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  display: 96,       // → Figma H1

  base: 16,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,

  displayTier: 96,       // → Figma H1
  headlineTier: 34,      // → Figma H4 — section-level headings
  subHeadlineTier: 20,   // → Figma H6
  bodyTier: 16,
  captionTier: 12,

  heading6: 15,
  heading7: 28,
  heading8: 48,   // → Figma H3
  heading9: 60,   // → Figma H2
  heading10: 96,  // → Figma H1

  bodySm: 14,
  bodyMd: 16,
  bodyLg: 18,
  body: 16,
  hero: 96,      // → Figma H1
  // Campaign tiers — The Atelier mixed-weight contrast system
  campaign: 96,      // full-width hero headlines — Figma H1
  headline: 60,      // section-level ink-anchor headings — Figma H2
  subheadline: 18,   // offer descriptor line above/below campaign number
  price: 20,
  caption: 12,
  nav: 13,
  label: 12,
  meta: 11,
  footer: 13,
} as const

export const fontFamilies = {
  // ── Figma pixel-perfect: Poppins primary, Montserrat secondary ────────────
  sans: '"Poppins", -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  heading: '"Poppins", "Montserrat", -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", sans-serif',
  display: '"Poppins", "Montserrat", -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", sans-serif',
  secondary: '"Montserrat", "Poppins", -apple-system, system-ui, sans-serif',
  mono: 'Menlo, monospace',
} as const

export const fontWeights = {
  ultra: '100',      // ultra-thin descriptor text in campaign contrast pairs
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  black: '900',
} as const

export const lineHeights = {
  // ── Figma pixel-perfect line heights ──────────────────────────────────────
  h1: 104,   // Figma H1 96/104
  h2: 68,    // Figma H2 60/68
  h3: 52,    // Figma H3 48/52
  h4: 40,    // Figma H4 34/40
  h5: 32,    // Figma H5 26/32
  h6: 24,    // Figma H6 20/24
  body1: 24, // Figma Body1 16/24
  body2: 20, // Figma Body2 14/20
  caption: 16, // Figma Caption 12/16
  overline: 16, // Figma Overline 10/16
  // Legacy ratio aliases
  tight: 1.2,
  normal: 1.4,
  relaxed: 1.6,
  body: 24,
  heading: 40,
  hero: 104,
} as const

export const letterSpacing = {
  // ── Figma pixel-perfect letter spacing ────────────────────────────────────
  h1: -1.44,   // Figma H1: -1.44px (≈ -0.015em at 96px)
  h2: -0.3,    // Figma H2: -0.3px  (≈ -0.005em at 60px)
  // Legacy aliases (kept for backward compat)
  tight: -0.2,
  normal: 0,
  wide: 0.3,
  caps: 1,
  capsWide: 2,
  headlineTier: -0.3,
  subHeaderCaps: 1.2,
  campaignHeading: -1.44,
  labelPill: 1.92,
  overline: 1.6,   // Figma Overline: +1.6px (wide caps tracking)
} as const
