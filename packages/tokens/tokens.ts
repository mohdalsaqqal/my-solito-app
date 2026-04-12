import { borderStyle, borderWidth } from './borders'
import { componentTokens } from './components'
import { colors } from './colors'
import { elevation } from './elevation'
import { layers, opacity, zIndex } from './layers'
import { layout } from './layout'
import { motion } from './motion'
import { radius } from './radius'
import { shadows } from './shadows'
import { spacing } from './spacing'
import { statusTone } from './status'
import { fontFamilies, fontWeights, letterSpacing, lineHeights, typography } from './typography'

export const tokens = {
  colors,
  spacing,
  borderRadius: radius,
  typography: {
    fontFamily: fontFamilies,
    fontSize: typography,
    fontWeight: fontWeights,
    lineHeight: lineHeights,
    letterSpacing,
  },
  shadows,
  border: {
    width: borderWidth,
    style: borderStyle,
  },
  elevation,
  layers,
  zIndex,
  opacity,
  layout,
  motion,
  components: componentTokens,
  statusTone,
} as const
