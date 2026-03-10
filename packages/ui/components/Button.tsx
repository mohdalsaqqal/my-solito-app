import { ReactNode } from 'react'
import { ActivityIndicator, ViewStyle } from 'react-native'
import { borderWidth, colors, opacity, radius, spacing } from '@real/tokens'
import { Button as ReusableButton } from '../reusables/button'
import { Text } from '../primitives/Text'

type ButtonProps = {
  children?: ReactNode
  variant?: 'solid' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
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
    minHeight: spacing['32'],
    paddingHorizontal: spacing.sm,
  },
  md: {
    minHeight: spacing['40'],
    paddingHorizontal: spacing.md,
  },
  lg: {
    minHeight: spacing['48'],
    paddingHorizontal: spacing.lg,
  },
}

const buttonContainerStyles: Record<ButtonVariant, ViewStyle> = {
  solid: {
    backgroundColor: colors.brandPrimary,
    borderColor: colors.brandPrimary,
    borderWidth: borderWidth.none,
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
}

const buttonTextTone: Record<ButtonVariant, 'inverse' | 'primary'> = {
  solid: 'inverse',
  outline: 'primary',
  ghost: 'primary',
}

const reusableVariantMap: Record<ButtonVariant, 'default' | 'outline' | 'ghost'> = {
  solid: 'default',
  outline: 'outline',
  ghost: 'ghost',
}

const reusableSizeMap: Record<ButtonSize, 'sm' | 'default' | 'lg'> = {
  sm: 'sm',
  md: 'default',
  lg: 'lg',
}

const spinnerColor: Record<ButtonVariant, string> = {
  solid: colors.white,
  outline: colors.brandPrimary,
  ghost: colors.brandPrimary,
}

export function Button({
  children,
  variant = 'solid',
  size = 'md',
  disabled,
  loading,
  onPress,
}: ButtonProps) {
  const sizeStyle = buttonSizeStyles[size]
  const variantStyle = buttonContainerStyles[variant]
  const isDisabled = disabled || loading

  return (
    <ReusableButton
      disabled={isDisabled}
      onPress={onPress}
      variant={reusableVariantMap[variant]}
      size={reusableSizeMap[size]}
      style={{
        minHeight: sizeStyle.minHeight,
        paddingHorizontal: sizeStyle.paddingHorizontal,
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isDisabled ? opacity.disabled : 1,
        ...variantStyle,
      }}
    >
      {loading ? (
        <ActivityIndicator
          accessibilityLabel="Loading"
          color={spinnerColor[variant]}
        />
      ) : (
        <Text
          tone={buttonTextTone[variant]}
          variant='label'
          style={{ textTransform: 'uppercase' }}
        >
          {children}
        </Text>
      )}
    </ReusableButton>
  )
}
