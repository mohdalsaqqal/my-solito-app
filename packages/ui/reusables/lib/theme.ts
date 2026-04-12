export const NAV_THEME = {
  light: {
    background: 'hsl(0 0% 100%)',
    border: 'hsla(0 0% 0% / 0.10)',
    card: 'hsl(0 0% 100%)',
    notification: 'hsl(358 74% 50%)',
    primary: 'hsl(358 74% 50%)',
    text: 'hsl(0 0% 12%)',
  },
  dark: {
    background: 'hsl(0 0% 9%)',
    border: 'hsl(0 0% 22%)',
    card: 'hsl(0 0% 12%)',
    notification: 'hsl(358 74% 50%)',
    primary: 'hsl(358 74% 50%)',
    text: 'hsl(0 0% 94%)',
  },
} as const

export const themeColorVariables = [
  'background',
  'foreground',
  'card',
  'popover',
  'primary',
  'secondary',
  'muted',
  'accent',
  'destructive',
  'border',
  'input',
  'ring',
  'radius',
] as const
