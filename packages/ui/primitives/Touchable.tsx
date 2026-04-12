import { ReactNode } from 'react'
import { Platform, Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native'
import { opacity, motion } from '@real/tokens'
import { cn } from '../reusables/lib/utils'

// Phase 1 migration shim: this keeps the repo's legacy press/link API stable
// while aligning web interaction behavior with the RNR/Uniwind stack. Do not
// expand this wrapper with new app-specific semantics unless the RNR contract
// cannot express them.
type TouchableProps = Omit<PressableProps, 'children'> & {
  children?: ReactNode | ((state: { pressed: boolean; hovered: boolean; focused: boolean }) => ReactNode)
  className?: string
  href?: string
  target?: string
  rel?: string
  download?: string
}

export function Touchable({
  children,
  disabled,
  style,
  className,
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
      className={cn(
        Platform.OS === 'web' &&
          'outline-none transition-[opacity,transform] focus-visible:ring-[4px] focus-visible:ring-ring/70 focus-visible:ring-offset-2',
        Platform.OS === 'web' && !href && 'cursor-pointer',
        Platform.OS === 'web' && href && 'cursor-pointer no-underline',
        disabled && Platform.OS === 'web' && 'pointer-events-none cursor-default',
        className,
      )}
      {...webInteractionProps}
      style={(state) => {
        const dynamicOpacity = disabled
          ? opacity.disabled
          : state.pressed
            ? opacity.medium
            : state.hovered
              ? opacity.high
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
