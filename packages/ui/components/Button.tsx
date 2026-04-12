import { ReactNode } from 'react'
import { ActivityIndicator, Platform, Pressable, ViewStyle } from 'react-native'
import { borderWidth, buttonTokens, colors, elevation, fontWeights, motionDuration, opacity, shadows, spacing } from '@real/tokens'
import { Box } from '../primitives/Box'
import { Text } from '../primitives/Text'

type ButtonProps = {
  children?: ReactNode
  variant?: 'solid' | 'soft' | 'outline' | 'ghost' | 'secondaryQuiet' | 'premiumAccent' | 'primaryCommerce'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  fullWidth?: boolean
  shape?: 'default' | 'pill'
  onPress?: () => void
}

type ButtonVariant = NonNullable<ButtonProps['variant']>
type ButtonSize = NonNullable<ButtonProps['size']>

const buttonSizeStyles: Record<
  ButtonSize,
  {
    minHeight: number
    paddingHorizontal: number
  }
> = {
  sm: {
    minHeight: buttonTokens.height.sm,
    paddingHorizontal: buttonTokens.paddingX.sm,
  },
  md: {
    minHeight: buttonTokens.height.md,
    paddingHorizontal: buttonTokens.paddingX.md,
  },
  lg: {
    minHeight: buttonTokens.height.lg,
    paddingHorizontal: buttonTokens.paddingX.lg,
  },
}

const buttonContainerStyles: Record<ButtonVariant, ViewStyle> = {
  solid: {
    backgroundColor: colors.brandPrimary,
    borderColor: colors.brandPrimary,
    borderWidth: borderWidth.none,
  },
  soft: {
    backgroundColor: colors.surface,
    borderColor: colors.textPrimary,
    borderWidth: borderWidth.thin,
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: colors.brandPrimary,
    borderWidth: borderWidth.thin,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderWidth: borderWidth.none,
  },
  // Section header "see all" link — text-only with underline on hover
  secondaryQuiet: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderWidth: borderWidth.none,
  },
  // Premium dark CTA — ink-black button for newsletter/auth
  premiumAccent: {
    backgroundColor: colors.inkBlack,
    borderColor: colors.inkBlack,
    borderWidth: borderWidth.none,
  },
  // Commerce buy action — deep blood red for add-to-cart
  primaryCommerce: {
    backgroundColor: colors.brandPrimary,
    borderColor: colors.brandPrimary,
    borderWidth: borderWidth.none,
  },
}

const buttonTextTone: Record<ButtonVariant, 'inverse' | 'primary' | 'default'> = {
  solid: 'inverse',
  soft: 'default',
  outline: 'primary',
  ghost: 'primary',
  secondaryQuiet: 'primary',
  premiumAccent: 'inverse',
  primaryCommerce: 'inverse',
}

const spinnerColor: Record<ButtonVariant, string> = {
  solid: colors.white,
  soft: colors.textPrimary,
  outline: colors.brandPrimary,
  ghost: colors.brandPrimary,
  secondaryQuiet: colors.textPrimary,
  premiumAccent: colors.white,
  primaryCommerce: colors.white,
}

export function Button({
  children,
  variant = 'solid',
  size = 'md',
  disabled,
  loading,
  leftIcon,
  rightIcon,
  fullWidth = false,
  shape = 'default',
  onPress,
}: ButtonProps) {
  const sizeStyle = buttonSizeStyles[size]
  const variantStyle = buttonContainerStyles[variant]
  const isDisabled = disabled || loading
  const isWeb = Platform.OS === 'web'

  return (
    <Pressable
      accessibilityRole='button'
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={(state: any) => {
        const hovered = Boolean(state.hovered)
        const focused = Boolean(state.focused)
        const interactive = hovered || focused
        const resolvedShape = shape === 'default' ? 'pill' : shape
        const radius = resolvedShape === 'pill' ? buttonTokens.radius.pill : buttonTokens.radius.default
        const ctaActiveBackground =
          variant === 'solid'
            ? interactive
              ? colors.brandPrimaryHover
              : colors.brandPrimary
          : variant === 'primaryCommerce'
            ? interactive
              ? colors.brandPrimaryHover
              : colors.brandPrimary
          : variant === 'premiumAccent'
            ? interactive
              ? colors.inkMid
              : colors.inkBlack
            : variantStyle.backgroundColor

        return {
          minHeight: sizeStyle.minHeight,
          paddingHorizontal: sizeStyle.paddingHorizontal,
          borderRadius: radius,
          alignItems: 'center',
          justifyContent: 'center',
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          width: fullWidth ? '100%' : undefined,
          opacity: isDisabled ? opacity.disabled : 1,
          transform: [{ scale: interactive && !isDisabled ? 1.005 : 1 }],
          transitionProperty: 'background-color, border-color, box-shadow, transform',
          transitionDuration: `${motionDuration.hoverScale}ms`,
          backgroundColor: ctaActiveBackground,
          borderColor:
            variant === 'outline'
              ? interactive
                ? colors.brandPrimaryHover
                : colors.brandPrimary
            : variant === 'soft'
              ? interactive
                ? colors.textPrimary
                : colors.border
              : variantStyle.borderColor,
          borderWidth: variantStyle.borderWidth,
          ...(variant === 'solid' || variant === 'primaryCommerce'
            ? isWeb
              ? { boxShadow: interactive ? elevation.xs : elevation.none }
              : interactive
                ? shadows.xs
                : shadows.none
            : null),
          ...(variant === 'secondaryQuiet'
            ? {
                textDecorationLine: interactive ? 'underline' : 'none' as const,
              }
            : null),
        }
      }}
    >
      {loading ? (
        <ActivityIndicator accessibilityLabel='Loading' color={spinnerColor[variant]} />
      ) : (
        <Box style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm }}>
          {leftIcon ? leftIcon : null}
          <Text tone={buttonTextTone[variant]} variant='bodySm' weight={fontWeights.semibold}>
            {children}
          </Text>
          {rightIcon ? rightIcon : null}
        </Box>
      )}
    </Pressable>
  )
}
