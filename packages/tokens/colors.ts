export const colors = {
  // Base surfaces — warm-tinted neutrals (hue 30°, 5-8% saturation)
  background: 'hsl(30 8% 99%)',
  backgroundSecondary: 'hsl(30 6% 97%)',
  surface: 'hsl(30 8% 99%)',
  surfaceMuted: 'hsl(30 6% 97%)',

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
  black: 'hsl(20 10% 8%)',
} as const
