export const motionDuration = {
  instant: 0,
  microInteraction: 300,
  hoverScale: 400,
  pageReveal: 600,
  stagger: 20,

  // Backward-compatible aliases
  fast: 300,
  normal: 300,
  slow: 600,
  slower: 680,
} as const

export const motionEasing = {
  standard: 'cubic-bezier(0.16, 1, 0.3, 1)',
  entrance: 'cubic-bezier(0.16, 1, 0.3, 1)',
  exit: 'cubic-bezier(0.16, 1, 0.3, 1)',
} as const

// Backward-compatible shape for existing imports.
export const motion = {
  durations: motionDuration,
  easings: motionEasing,
} as const
