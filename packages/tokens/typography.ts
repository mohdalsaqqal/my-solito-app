export const typography = {
  // Display / Hero
  display:   20,
  hero:      20,
  campaign:  18,

  // Headings
  h1:        20,
  h2:        18,
  h3:        16,
  h4:        14,
  h5:        13,
  h6:        12,

  // Subheadings
  headline:     18,
  subheadline:  14,
  subtitle1:    14,
  subtitle2:    12,

  // Body
  body1:     14,
  body2:     12,
  bodySm:    12,
  bodyMd:    14,
  bodyLg:    16,
  body:      14,

  // UI elements
  button:    14,
  label:     12,
  caption:   11,
  overline:  10,
  meta:      11,
  nav:       13,
  price:     16,
  footer:    12,

  // Legacy aliases (kept for backward compat)
  xs:    11,
  sm:    12,
  md:    14,
  lg:    16,
  xl:    18,
  xxl:   20,
  base:  14,
  '2xl': 18,
  '3xl': 20,
  '4xl': 20,

  // Tier aliases
  displayTier:     20,
  headlineTier:    18,
  subHeadlineTier: 14,
  bodyTier:        14,
  captionTier:     11,

  // Numbered heading aliases
  heading6:  12,
  heading7:  14,
  heading8:  16,
  heading9:  18,
  heading10: 20,
} as const

export const fontFamilies = {
  sans:         'var(--font-dm-sans, "DM Sans"), -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", sans-serif',
  heading:      'var(--font-dm-sans, "DM Sans"), -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", sans-serif',
  display:      'var(--font-dm-sans, "DM Sans"), -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", sans-serif',
  secondary:    'var(--font-dm-sans, "DM Sans"), -apple-system, system-ui, sans-serif',
  logo:         'var(--font-dm-sans, "DM Sans"), -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", sans-serif',
  logoSecondary:'var(--font-dm-sans, "DM Sans"), sans-serif',
  arabic:       '"Tajawal", -apple-system, system-ui, sans-serif',
  mono:         'Menlo, monospace',
} as const

export const fontWeights = {
  ultra:    '100',
  light:    '300',
  regular:  '400',
  medium:   '500',
  semibold: '600',
  bold:     '700',
  black:    '900',
} as const

export const lineHeights = {
  h1: 28,  h2: 26,  h3: 24,
  h4: 20,  h5: 18,  h6: 18,
  subtitle1: 20,  subtitle2: 18,
  body1: 22,  body2: 18,
  button: 20,  caption: 16,  overline: 16,
  tight: 1.15,  normal: 1.35,  relaxed: 1.55,
  body: 22,  heading: 28,  hero: 28,
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
  displayWide: 2.8,
  labelSmallCaps: 1.6,
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
