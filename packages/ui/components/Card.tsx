import { ReactNode } from 'react'
import { Platform, View, ViewProps } from 'react-native'
import { borderWidth, elevation, radius, shadows, spacing } from '@real/tokens'
import { useThemeColors } from '../responsive'

type CardSurfaceRole = 'commerce' | 'promo' | 'campaign' | 'trust' | 'admin'

type CardProps = ViewProps & {
  children?: ReactNode
  variant?: 'flat' | 'raised'
  tone?: 'default' | 'subtle'
  borderTone?: 'border' | 'divider'
  radiusKey?: keyof typeof radius
  surfaceRole?: CardSurfaceRole
  className?: string
}

function resolveCardSurfaceStyle(c: ReturnType<typeof useThemeColors>, surfaceRole: CardSurfaceRole | undefined, tone: NonNullable<CardProps['tone']>) {
  if (!surfaceRole) {
    return {
      backgroundColor: tone === 'subtle' ? c.backgroundSecondary : c.surface,
      borderColor: c.border,
    }
  }

  switch (surfaceRole) {
    case 'promo':
      return {
        backgroundColor: c.brandPrimarySubtle,
        borderColor: c.stroke,
      }
    case 'campaign':
      return {
        backgroundColor: c.inkBlack,
        borderColor: c.stroke,
      }
    case 'trust':
      return {
        backgroundColor: c.surfaceMuted,
        borderColor: c.border,
      }
    case 'admin':
      return {
        backgroundColor: c.surface,
        borderColor: c.stroke,
      }
    case 'commerce':
    default:
      return {
        backgroundColor: c.surface,
        borderColor: c.border,
      }
  }
}

export function Card({
  children,
  variant = 'flat',
  tone = 'default',
  borderTone = 'border',
  radiusKey = 'md',
  surfaceRole,
  style,
  ...props
}: CardProps) {
  const c = useThemeColors()
  const surfaceStyle = resolveCardSurfaceStyle(c, surfaceRole, tone)

  return (
    <View
      style={[
        {
          backgroundColor: surfaceStyle.backgroundColor,
          borderColor: borderTone === 'divider' ? c.divider : surfaceStyle.borderColor,
          borderWidth: borderWidth.none,
          borderRadius: radius[radiusKey],
          padding: spacing['12'],
          ...(variant === 'raised'
            ? Platform.OS === 'web'
              ? ({ boxShadow: elevation.sm } as any)
              : shadows.sm
            : null),
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  )
}
