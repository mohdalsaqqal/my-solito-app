export const motionDuration = {
  instant: 0,
  hover: 100,
  micro: 100,
  microInteraction: 200,
  interactive: 200,
  small: 200,
  medium: 300,
  hoverScale: 200,
  enter: 240,
  exit: 180,
  pageReveal: 400,
  reveal: 400,
  large: 400,
  xl: 500,
  stagger: 20,

  // Backward-compatible aliases
  fast: 200,
  normal: 300,
  slow: 400,
  slower: 500,
} as const

export const motionEasing = {
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',

  // Backward-compatible aliases
  standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
  entrance: 'cubic-bezier(0, 0, 0.2, 1)',
  exit: 'cubic-bezier(0.4, 0, 1, 1)',
} as const

// Backward-compatible shape for existing imports.
export const motion = {
  durations: motionDuration,
  easings: motionEasing,
} as const
