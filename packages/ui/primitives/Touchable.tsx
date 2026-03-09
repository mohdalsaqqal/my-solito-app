import { ReactNode } from 'react'
import { Platform, Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native'
import { opacity } from '@real/tokens'

type TouchableProps = Omit<PressableProps, 'children'> & {
  children?: ReactNode | ((state: { pressed: boolean; hovered: boolean; focused: boolean }) => ReactNode)
  disabledOpacity?: number
  pressedOpacity?: number
  hoveredOpacity?: number
}

export function Touchable({
  children,
  disabled,
  style,
  disabledOpacity = opacity.disabled,
  pressedOpacity = opacity.pressed,
  hoveredOpacity = opacity.hover,
  ...props
}: TouchableProps) {
  const webButtonProps = Platform.OS === 'web' ? ({ type: 'button' } as any) : undefined

  return (
    <Pressable
      disabled={disabled}
      {...webButtonProps}
      style={(state) => {
        const dynamicOpacity = disabled
          ? disabledOpacity
          : state.pressed
            ? pressedOpacity
            : state.hovered
              ? hoveredOpacity
              : 1

        const baseStyle: ViewStyle = {
          opacity: dynamicOpacity,
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
