export const status = {
  success: {
    base: 'hsl(144 63% 33%)',
    subtle: 'hsl(144 45% 94%)',
  },
  warning: {
    base: 'hsl(39 95% 43%)',
    subtle: 'hsl(40 100% 95%)',
  },
  error: {
    base: 'hsl(358 74% 50%)',
    subtle: 'hsl(355 70% 95%)',
  },
  info: {
    base: 'hsl(210 90% 40%)',
    subtle: 'hsl(214 78% 95%)',
  },
} as const

export const statusTone = status
