export const breakpoints = {
  mobileMax: 640,
  tabletMin: 641,
  tabletMax: 1024,
  desktopMin: 1025,
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
  containerMaxWidth: 1440,
  containerPaddingX: 16,
  admin: {
    sidebarExpanded: 260,
    sidebarCollapsed: 72,
    headerHeight: 64,
    containerDefault: 1120,
    containerDense: 1280,
  },
  maxWidth: {
    editorial: 1280,
    commerce: 1200,
    account: 1120,
    cart: 960,
    checkout: 1100,
    dashboard: 1400,
    product: 1200,
  },
  gutterX: {
    sm: 16,
    md: 24,
    lg: 32,
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
    mainRowHeight: 64,
    navRowHeight: 40,
  },
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
