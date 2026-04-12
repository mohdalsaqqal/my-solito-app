import React from 'react'
import { View } from 'react-native'
import { borderWidth, opacity, radius, spacing } from '@real/tokens'
import { Text } from '../primitives/Text'
import { useThemeColors } from '../responsive'

type PaymentBadgeItem = {
  id: string
  label: string
  backgroundColor: string
  tone: 'default' | 'inverse'
  bordered?: boolean
}

type PaymentBadgesProps = {
  items?: PaymentBadgeItem[]
  state?: 'loading' | 'empty' | 'error' | 'disabled' | 'default'
}

function getDefaultItems(c: ReturnType<typeof useThemeColors>): PaymentBadgeItem[] {
  return [
    { id: 'amex', label: 'AMEX', backgroundColor: c.info, tone: 'inverse' },
    { id: 'mc', label: 'MC', backgroundColor: c.amberSubtle, tone: 'default', bordered: true },
    { id: 'visa', label: 'VISA', backgroundColor: c.brandPrimary, tone: 'inverse' },
    { id: 'pay', label: 'PAY', backgroundColor: c.surface, tone: 'default', bordered: true },
  ]
}

export const PaymentBadges = React.memo(function PaymentBadges({
  items,
  state = 'default',
}: PaymentBadgesProps) {
  const c = useThemeColors()
  const defaultItems = getDefaultItems(c)
  const resolvedItems = items ?? defaultItems

  if (state === 'empty') {
    return null
  }

  if (state === 'loading') {
    return (
      <View style={{ flexDirection: 'row', gap: spacing['4'] }}>
        {defaultItems.map((item) => (
          <View
            key={item.id}
            style={{
              minHeight: spacing['24'],
              minWidth: spacing['40'],
              borderRadius: radius.md,
              backgroundColor: c.backgroundSecondary,
            }}
          />
        ))}
      </View>
    )
  }

  const renderedItems: PaymentBadgeItem[] =
    state === 'error'
      ? [{ id: 'error', label: '--', backgroundColor: c.surface, tone: 'default', bordered: true }]
      : resolvedItems

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['4'], opacity: state === 'disabled' ? opacity.disabled : 1 }}>
      {renderedItems.map((item) => (
        <View
          key={item.id}
          style={{
            minHeight: spacing['24'],
            paddingHorizontal: spacing['8'],
            borderRadius: radius.md,
            backgroundColor: item.backgroundColor,
            borderWidth: item.bordered ? borderWidth.thin : borderWidth.none,
            borderColor: item.bordered ? c.border : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            variant='caption'
            weight='700'
            tone={item.tone}
            style={{ textTransform: 'uppercase' }}
          >
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  )
})
