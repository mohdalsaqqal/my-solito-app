export const typography = {
  h1: 64,
  h2: 48,
  h3: 36,
  h4: 30,
  h5: 24,
  h6: 20,
  subtitle1: 16,
  subtitle2: 14,
  body1: 16,
  body2: 14,
  button: 16,
  caption: 13,
  overline: 10,

  // ── Legacy / component aliases (keep for backward compat) ─────────────────
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  display: 64,

  base: 16,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,

  displayTier: 64,
  headlineTier: 34,
  subHeadlineTier: 28,
  bodyTier: 16,
  captionTier: 13,

  heading6: 11,
  heading7: 32,
  heading8: 48,
  heading9: 56,
  heading10: 64,

  bodySm: 14,
  bodyMd: 16,
  bodyLg: 18,
  body: 16,
  hero: 56,
  campaign: 64,
  headline: 34,
  subheadline: 16,
  price: 20,
  nav: 13,
  label: 11,
  meta: 12,
  footer: 13,
} as const

export const fontFamilies = {
  // ── DESIGN.md §3 — "The Editorial Voice" ─────────────────────────────────
  // Display/Headlines: Noto Serif — heritage, timelessness, "endless beauty"
  // Body/Labels:       Manrope — geometric sans, modern, technical precision
  sans: 'var(--font-manrope, "Manrope"), -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", sans-serif',
  heading: 'var(--font-noto-serif, "Noto Serif"), Georgia, "Times New Roman", serif',
  display: 'var(--font-noto-serif, "Noto Serif"), Georgia, "Times New Roman", serif',
  secondary: 'var(--font-manrope, "Manrope"), -apple-system, system-ui, sans-serif',
  logo: 'var(--font-noto-serif, "Noto Serif"), Georgia, serif',
  logoSecondary: 'var(--font-manrope, "Manrope"), sans-serif',
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
  h1: 72,
  h2: 56,
  h3: 44,
  h4: 36,
  h5: 30,
  h6: 24,    // Figma H6 20/24
  subtitle1: 24,
  subtitle2: 22,
  body1: 24,
  body2: 22,
  button: 20,
  caption: 18,
  overline: 16,
  tight: 1.15,
  normal: 1.35,
  relaxed: 1.55,
  body: 24,
  heading: 40,
  hero: 68,
} as const

export const letterSpacing = {
  h1: -1.92,
  h2: -1.2,
  h3: 0,
  h4: 0.085,
  h5: 0,
  h6: 0.03,
  subtitle1: 0.2,
  subtitle2: 0.14,
  body1: 0.08,
  body2: 0.035,
  caption: 0.06,
  button: 0,
  // DESIGN.md §3 — editorial display tracking (wide on display-lg)
  displayWide: 2.8,   // display-lg 3.5rem with wide tracking — "Art Pieces"
  labelSmallCaps: 1.6, // label-md/sm in small-caps or generous spacing
  // Legacy aliases (kept for backward compat)
  tight: -0.6,
  normal: 0,
  wide: 0.3,
  caps: 1,
  capsWide: 2,
  headlineTier: -0.8,
  subHeaderCaps: 1.2,
  campaignHeading: -1.6,
  labelPill: 1.92,
  overline: 1.6,
} as const
