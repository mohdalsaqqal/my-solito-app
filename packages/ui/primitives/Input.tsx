"use client"

import { forwardRef, useId, useState } from 'react'
import { Platform, TextInput, TextInputProps, TextStyle, ViewStyle } from 'react-native'
import { borderWidth, colors, elevation, inputTokens, motionDuration, radius, spacing, typography } from '@real/tokens'
import { Input as ReusableInput } from '../reusables/input'
import { Box } from './Box'
import { Text } from './Text'

// Phase 1 migration shim: keep the existing shared input props stable while the
// underlying implementation moves onto the RNR input primitive. Avoid adding new
// compatibility-only props here; prefer evolving the RNR-native contract instead.
type InputProps = TextInputProps & {
  invalid?: boolean
  readOnly?: boolean
  radiusKey?: keyof typeof radius
  tone?: 'default' | 'trust' | 'admin'
  /** Accessible label for the input. Required on web for a11y compliance. */
  label?: string
  /** Visually hide the label while keeping it available to screen readers. */
  hideLabel?: boolean
}

type InputState = {
  invalid: boolean
  focused: boolean
  readOnly: boolean
  tone: NonNullable<InputProps['tone']>
}

function resolveInputContainerStyle({ invalid, focused, readOnly, tone }: InputState, radiusKey: keyof typeof radius): ViewStyle {
  const borderColor = invalid ? colors.error : focused ? colors.brandPrimary : colors.border

  return {
    borderWidth: borderWidth.thin,
    borderColor,
    borderRadius: radius[radiusKey],
    backgroundColor:
      tone === 'trust'
        ? readOnly
          ? colors.surfaceMuted
          : colors.surface
        : tone === 'admin'
          ? readOnly
            ? colors.backgroundSecondary
            : colors.backgroundSecondary
          : readOnly
            ? colors.backgroundSecondary
            : colors.surface,
    minHeight: inputTokens.height.md,
    paddingHorizontal: inputTokens.paddingX.md,
    paddingVertical: spacing.sm,
    boxShadow: focused ? elevation.xs : elevation.none,
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

const INPUT_LABEL_STYLE = {
  color: colors.textPrimary,
} as const

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { invalid = false, readOnly = false, editable = true, radiusKey = 'md', tone = 'default', style, onFocus, onBlur, label, hideLabel = false, ...props },
  ref
) {
  const [focused, setFocused] = useState(false)
  const isReadOnly = readOnly || editable === false
  const generatedId = useId()
  const inputId = (props.id as string) ?? generatedId

  const labelElement = label ? (
    <Box
      style={{
        marginBottom: spacing['4'],
        ...(hideLabel ? { position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' } : {}),
      }}
    >
      <Text
        variant='caption'
        weight='600'
        style={[INPUT_LABEL_STYLE]}
        // @ts-ignore — web-only prop for label association
        nativeID={`${inputId}-label`}
      >
        {label}
      </Text>
    </Box>
  ) : null

  return (
    <Box style={{ width: '100%' }}>
      {labelElement}
      <ReusableInput
        ref={ref}
        id={inputId}
        aria-labelledby={label ? `${inputId}-label` : undefined}
        aria-label={label ? undefined : props.placeholder}
        editable={!isReadOnly}
        aria-invalid={invalid || undefined}
        readOnly={Platform.OS === 'web' ? isReadOnly : undefined}
        accessibilityLabel={label ?? (props.placeholder as string)}
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
          resolveInputContainerStyle({ invalid, focused, readOnly: isReadOnly, tone }, radiusKey),
          resolveInputTextStyle(),
          style,
        ]}
        {...props}
      />
    </Box>
  )
})
