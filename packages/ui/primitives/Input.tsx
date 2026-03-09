import { forwardRef, useState } from 'react'
import { TextInput, TextInputProps, TextStyle, ViewStyle } from 'react-native'
import { borderWidth, colors, elevation, motionDuration, radius, spacing, typography } from '@real/tokens'
import { Input as ReusableInput } from '../reusables/input'

type InputProps = TextInputProps & {
  invalid?: boolean
  readOnly?: boolean
  radiusKey?: keyof typeof radius
}

type InputState = {
  invalid: boolean
  focused: boolean
  readOnly: boolean
}

function resolveInputContainerStyle({ invalid, focused, readOnly }: InputState, radiusKey: keyof typeof radius): ViewStyle {
  const borderColor = invalid ? colors.error : focused ? colors.brandPrimary : colors.border

  return {
    borderWidth: borderWidth.thin,
    borderColor,
    borderRadius: radius[radiusKey],
    backgroundColor: readOnly ? colors.backgroundSecondary : colors.surface,
    minHeight: spacing['48'],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing['16'],
    boxShadow: focused ? elevation.sm : elevation.none,
    transitionProperty: 'border-color, box-shadow, background-color',
    transitionDuration: `${motionDuration.microInteraction}ms`,
  }
}

function resolveInputTextStyle(): TextStyle {
  return {
    color: colors.textPrimary,
    fontSize: typography.body,
  }
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { invalid = false, readOnly = false, editable = true, radiusKey = 'xs', style, onFocus, onBlur, ...props },
  ref
) {
  const [focused, setFocused] = useState(false)
  const isReadOnly = readOnly || editable === false

  return (
    <ReusableInput
      ref={ref}
      editable={!isReadOnly}
      onFocus={(event) => {
        setFocused(true)
        onFocus?.(event)
      }}
      onBlur={(event) => {
        setFocused(false)
        onBlur?.(event)
      }}
      placeholderTextColor={colors.textSecondary}
      style={[
        resolveInputContainerStyle({ invalid, focused, readOnly: isReadOnly }, radiusKey),
        resolveInputTextStyle(),
        style,
      ]}
      {...props}
    />
  )
})
