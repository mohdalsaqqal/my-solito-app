export const opacity = {
  low: 0.5,
  medium: 0.75,
  high: 0.9,
  disabled: 0.5,
  overlayLight: 0.4,
  overlayDark: 0.78,
  // Additional common values
  subtle: 0.66,
  mediumLight: 0.86,
  mediumStrong: 0.84,
} as const

// Scrim tokens — dark gradients used over hero/media images
export const scrim = {
  // Standard hero card: bottom-up dark scrim
  heroMedia: 'linear-gradient(to top, rgba(31,31,31,1) 0%, rgba(31,31,31,0.72) 28%, transparent 64%)',
  // Lead/featured hero card: deeper bottom-up scrim
  heroMediaLead: 'linear-gradient(to top, rgba(12,12,14,1) 0%, rgba(12,12,14,0.82) 34%, rgba(12,12,14,0.12) 72%)',
  // Native fallback (no gradient support) — solid semi-transparent
  heroMediaNative: 'rgba(31,31,31,0.62)',
  heroMediaLeadNative: 'rgba(12,12,14,0.78)',
  // Light storefront wash used over commerce-first hero imagery
  heroMediaSurface: 'linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0.6) 28%, transparent 64%)',
  heroMediaSurfaceBottom: 'linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0.5) 40%, transparent 100%)',
  heroMediaSurfaceNative: 'rgba(255,255,255,0.55)',
  // Commerce offer and spotlight overlays
  offerBannerMedia: 'linear-gradient(to right, rgba(0,0,0,0.58), rgba(0,0,0,0.28), rgba(0,0,0,0.04))',
  offerBannerMediaNative: 'rgba(0,0,0,0.5)',
  brandSpotlightBanner: 'linear-gradient(to right, rgba(15,15,17,0.72), rgba(15,15,17,0.30), rgba(15,15,17,0))',
  brandSpotlightBannerNative: 'rgba(15,15,17,0.56)',
  brandSpotlightHighlight: 'radial-gradient(circle at top right, rgba(255,255,255,0.18), transparent 34%)',
} as const

// Frosted/glass surface tokens
export const glass = {
  // White frosted badge background (hero card badge on non-lead slides)
  badgeWhite: 'rgba(255,255,255,0.94)',
  // Subtle white highlight for active states on dark surfaces
  surfaceActiveLight: 'rgba(255,255,255,0.08)',
  offerBannerGloss: 'rgba(255,255,255,0.02)',
  offerBannerCta: 'rgba(255,255,255,0.04)',
  offerBannerCtaBorder: 'rgba(255,255,255,0.4)',
  offerBannerCtaHover: 'rgba(255,255,255,0.92)',
} as const
