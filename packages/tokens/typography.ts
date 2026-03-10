export const typography = {
  // Balanced type scale
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  display: 36,

  // Token aliases from provided system
  base: 16,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,

  // Five-tier typography authority
  displayTier: 36,
  headlineTier: 32,
  subHeadlineTier: 20,
  bodyTier: 16,
  captionTier: 12,

  // Design-system semantic heading aliases (Tamagui-style mapping)
  heading6: 15, // ~$6
  heading7: 28, // ~$7 section title
  heading8: 36, // ~$8 hero mobile
  heading9: 48, // ~$9 brand banner
  heading10: 64, // ~$10 hero desktop

  // Existing semantic aliases used by components
  bodySm: 14,
  bodyMd: 16,
  bodyLg: 18,
  body: 16,
  hero: 48,
  // Campaign tiers — The Atelier mixed-weight contrast system
  campaign: 72,      // full-width hero headlines (home hero, campaign anchors)
  headline: 56,      // section-level ink-anchor headings
  subheadline: 18,   // offer descriptor line above/below campaign number
  price: 20,
  caption: 12,
  nav: 13,
  label: 12,
  meta: 11,
  footer: 13,
} as const

export const fontFamilies = {
  sans: '"Inter", -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  heading: '"Space Grotesk", "Inter", -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  display: '"Space Grotesk", "Inter", -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  mono: 'Menlo',
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
  tight: 1.2,
  normal: 1.4,
  relaxed: 1.6,
  body: 24,
  heading: 32,
  hero: 52,
} as const

export const letterSpacing = {
  tight: -0.2,
  normal: 0,
  wide: 0.3,
  caps: 1,
  capsWide: 2,
  headline: -0.3,
  subHeaderCaps: 1.2,
  campaignHeading: -0.48,  // ≈ -0.03em at 16px — tight editorial for campaign headlines
  labelPill: 1.92,         // ≈ 0.12em at 16px — wide prestige caps for badge/label pills
} as const
