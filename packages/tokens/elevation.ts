// packages/tokens/elevation.ts
// CSS box-shadow strings — simplified to match shadows.ts semantic levels.
// 'card' matches NiceOne's product card glow: 0 0 5px rgba(0,0,6,0.14)
export const elevation = {
  none: 'none',

  xs:  '0 1px 2px rgba(0,0,0,0.05)',
  sm:  '0 2px 4px rgba(0,0,0,0.06)',
  md:  '0 4px 8px rgba(0,0,0,0.08)',
  lg:  '0 8px 16px rgba(0,0,0,0.10)',
  xl:  '0 12px 24px rgba(0,0,0,0.12)',

  // NiceOne card shadow
  card: '0 0 5px rgba(0,0,6,0.14)',

  // Semantic component tokens — kept unchanged
  drawerPanel:  '-8px 0 48px rgba(15,15,17,0.15)',
  drawerFooter: '0 -4px 24px rgba(15,15,17,0.04)',
} as const
