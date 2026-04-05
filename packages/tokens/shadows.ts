// packages/tokens/shadows.ts
// Simplified 4-level system matching NiceOne's shadow language.
// 'card' is the NiceOne omnidirectional product card glow.
export const shadows = {
  none: {
    shadowColor: 'hsl(0 0% 0%)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: 'hsl(0 0% 0%)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: 'hsl(0 0% 0%)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: 'hsl(0 0% 0%)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: 'hsl(0 0% 0%)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: 'hsl(0 0% 0%)',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
  // NiceOne card shadow — omnidirectional soft glow, no directionality
  card: {
    shadowColor: 'hsl(0 0% 0%)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.14,
    shadowRadius: 5,
    elevation: 2,
  },
} as const

// Web-only sticky header shadow — unchanged
export const headerScrollShadow = '0 6px 20px rgba(20,18,15,0.06)'
