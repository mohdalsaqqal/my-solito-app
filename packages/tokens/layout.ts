export const breakpoints = {
  mobileMax: 640,
  tabletMin: 641,
  tabletMax: 1024,
  desktopMin: 1025,
  // Figma frame breakpoints
  figmaDesktop: 1280,
  figmaWide: 1920,
  wideMin: 1440,

  // Alias map for design-system parity
  xs: 659,
  sm: 799,
  md: 1019,
  lg: 1279,
  xl: 1419,
  gtSm: 801,
  gtMd: 1021,
} as const

export const layout = {
  // ── Figma System Layout Grid — pixel-perfect ─────────────────────────────
  // Mobile:        2 cols, 16px gutter, 16px margin  → page content = viewport − 32px
  // Desktop-1280: 12 cols, 32px gutter, 112px margin → content area = 1056px
  // Desktop-1920: 12 cols, 30px gutter, 240px margin → content area = 1440px
  figmaCanvas: {
    mobile: 320,
    desktop1440: 1440,
    dashboard1920: 1920,
  },
  figmaGrid: {
    mobile:        { columns: 2,  gutter: 16, margin: 16  },
    desktop1280:   { columns: 12, gutter: 32, margin: 112 },
    desktop1920:   { columns: 12, gutter: 30, margin: 240 },
  },

  // Content-area max widths derived from Figma grid margins
  containerMaxWidth:        1440, // storefront shell max width
  containerMaxWidthNarrow:  1056, // 1280 − (112 × 2) — standard Figma content area
  containerMaxWidthWide:    1440, // 1920 − (240 × 2) — wide desktop content area
  containerPaddingX: 16,          // Figma mobile margin

  admin: {
    sidebarExpanded: 260,
    sidebarCollapsed: 72,
    headerHeight: 64,
    containerDefault: 1120,
    containerDense: 1280,
  },
  maxWidth: {
    editorial: 1280,
    commerce: 1440,
    account: 1120,
    cart: 960,
    checkout: 1100,
    dashboard: 1400,
    product: 1200,
  },
  gutterX: {
    // Figma pixel-perfect gutter values
    sm:  16,  // Figma mobile: 16px gutter
    md:  24,
    lg:  32,  // Figma desktop-1280: 32px gutter
    xl:  30,  // Figma desktop-1920: 30px gutter
  },
  sectionY: {
    tight: 16,
    normal: 24,
    roomy: 32,
  },
  safeBottom: {
    none: 0,
    normal: 24,
    roomy: 48,
  },
  header: {
    topBarHeight: 28,
    mainRowHeight: 72,
    navRowHeight: 44,
    mobileExpandedHeight: 156,
    mobileStickyHeight: 56,
  },
} as const

// ── Icon sizes — Figma ICONS section ─────────────────────────────────────────
// Figma icon grid: 24px base, sizes: 16 / 20 / 24 / 32 / 48
export const iconSizes = {
  xs:  16,  // inline / badge
  sm:  20,  // compact UI
  md:  24,  // standard — Figma default
  lg:  32,  // featured / nav emphasis
  xl:  48,  // hero / empty state
} as const

export const grid = {
  productColumns: {
    mobile: 2,
    tablet: 3,
    desktop: 4,
  },
  brandColumns: {
    mobile: 2,
    tablet: 3,
    desktop: 6,
  },
  productMediaRatio: 1,
  bundleCardWidthMultiplier: 1.25,
} as const
