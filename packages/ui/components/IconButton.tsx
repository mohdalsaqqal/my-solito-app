import React from 'react'
import { ActivityIndicator, ViewStyle } from 'react-native'
import {
  borderWidth,
  iconButtonTokens,
  opacity,
} from '@real/tokens'
import { Icon, IconName } from './Icon'
import { Button as ReusableButton } from '../reusables/button'
import { useThemeColors, ColorMap } from '../responsive'

// Phase 2 migration layer: this wrapper keeps the storefront-facing icon-button
// contract stable while the implementation uses the RNR button primitive. Keep
// new behavior aligned with the target RNR control model.
type IconButtonProps = {
  icon: IconName
  label: string
  size?: 'md' | 'lg'
  tone?: 'soft' | 'ghost' | 'solid'
  active?: boolean
  iconColor?: string
  activeIconColor?: string
  disabled?: boolean
  loading?: boolean
  state?: 'loading' | 'empty' | 'error' | 'disabled' | 'default'
  onPress?: () => void
}

function getToneStyles(c: ColorMap): Record<
  NonNullable<IconButtonProps['tone']>,
  {
    idle: ViewStyle
    active: ViewStyle
  }
> {
  return {
    soft: {
      idle: {
        backgroundColor: c.surface,
        borderColor: 'transparent',
        borderWidth: borderWidth.none,
      },
      active: {
        backgroundColor: c.brandPrimarySubtle,
        borderColor: c.brandPrimary,
        borderWidth: borderWidth.thin,
      },
    },
    ghost: {
      idle: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        borderWidth: borderWidth.thin,
      },
      active: {
        backgroundColor: c.brandPrimarySubtle,
        borderColor: c.brandPrimary,
        borderWidth: borderWidth.thin,
      },
    },
    solid: {
      idle: {
        backgroundColor: c.brandPrimary,
        borderColor: c.brandPrimary,
        borderWidth: borderWidth.thin,
      },
      active: {
        backgroundColor: c.brandPrimaryHover,
        borderColor: c.brandPrimaryHover,
        borderWidth: borderWidth.thin,
      },
    },
  }
}

export const IconButton = React.memo(function IconButton({
  icon,
  label,
  size = 'md',
  tone = 'soft',
  active = false,
  iconColor,
  activeIconColor,
  disabled = false,
  loading = false,
  state = 'default',
  onPress,
}: IconButtonProps) {
  const c = useThemeColors()
  if (state === 'empty') {
    return null
  }

  const tones = getToneStyles(c)
  const resolvedDisabled = disabled || loading || state === 'disabled'
  const stateStyle =
    state === 'error'
      ? {
          backgroundColor: c.surface,
          borderColor: c.error,
          borderWidth: borderWidth.thin,
        }
      : active
        ? tones[tone].active
        : tones[tone].idle

  const buttonSize = size === 'lg' ? iconButtonTokens.size.lg : iconButtonTokens.size.md
  const iconSize = size === 'lg' ? iconButtonTokens.icon.lg : iconButtonTokens.icon.md
  const resolvedIconColor =
    tone === 'solid'
      ? c.white
      : state === 'error'
        ? c.error
        : active
          ? (activeIconColor ?? c.brandPrimary)
          : (iconColor ?? c.textPrimary)

  return (
    <ReusableButton
      accessibilityRole='button'
      accessibilityLabel={label}
      accessibilityState={{ disabled: resolvedDisabled, busy: loading }}
      disabled={resolvedDisabled}
      onPress={onPress}
      variant={tone === 'ghost' ? 'ghost' : tone === 'soft' ? 'secondary' : 'default'}
      size='icon'
      style={{
        width: buttonSize,
        height: buttonSize,
        borderRadius: iconButtonTokens.radius.default,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: resolvedDisabled ? opacity.disabled : 1,
        ...stateStyle,
      }}
    >
      {loading || state === 'loading' ? (
        <ActivityIndicator color={resolvedIconColor} />
      ) : (
        <Icon name={icon} size={iconSize} color={resolvedIconColor} weight={active ? 'fill' : 'regular'} />
      )}
    </ReusableButton>
  )
})
