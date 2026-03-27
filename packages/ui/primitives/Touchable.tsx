import { ReactNode } from 'react'
import { Platform, Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native'
import { opacity, motion } from '@real/tokens'

type TouchableProps = Omit<PressableProps, 'children'> & {
  children?: ReactNode | ((state: { pressed: boolean; hovered: boolean; focused: boolean }) => ReactNode)
  disabledOpacity?: number
  pressedOpacity?: number
  hoveredOpacity?: number
  href?: string
  target?: string
  rel?: string
  download?: string
}

export function Touchable({
  children,
  disabled,
  style,
  disabledOpacity = opacity.disabled,
  pressedOpacity = opacity.medium,
  hoveredOpacity = opacity.high,
  href,
  target,
  rel,
  download,
  ...props
}: TouchableProps) {
  const webInteractionProps =
    Platform.OS === 'web'
      ? href
        ? ({
            href,
            hrefAttrs: {
              target,
              rel,
              download,
            },
          } as any)
        : ({ type: 'button' } as any)
      : undefined

  return (
    <Pressable
      disabled={disabled}
      {...webInteractionProps}
      style={(state) => {
        const dynamicOpacity = disabled
          ? disabledOpacity
          : state.pressed
            ? pressedOpacity
            : state.hovered
              ? hoveredOpacity
              : 1

        const baseStyle: ViewStyle & { transitionProperty?: string; transitionDuration?: string; transitionTimingFunction?: string } = {
          opacity: dynamicOpacity,
          transform: [{ scale: state.pressed ? 0.995 : 1 }],
          ...(Platform.OS === 'web' && {
            transitionProperty: 'opacity, transform',
            transitionDuration: `${state.pressed ? motion.durations.instant : motion.durations.microInteraction}ms`,
            transitionTimingFunction: motion.easings.standard,
          }),
        }

        if (typeof style === 'function') {
          return [baseStyle, style(state)] as StyleProp<ViewStyle>
        }

        return [baseStyle, style] as StyleProp<ViewStyle>
      }}
      {...props}
    >
      {(state) =>
        typeof children === 'function'
          ? children({
              pressed: state.pressed,
              hovered: state.hovered ?? false,
              focused: state.focused ?? false,
            })
          : children
      }
    </Pressable>
  )
}
