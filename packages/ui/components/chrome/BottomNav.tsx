import React from 'react'
import { borderWidth, radius, spacing } from '@real/tokens'
import { Box, Text } from '../../primitives'
import { Button as ReusableButton } from '../../reusables/button'
import { Icon } from '../Icon'
import { useThemeColors } from '../../responsive'

export type BottomNavTab = 'home' | 'categories' | 'brands' | 'cart' | 'account'

type BottomNavProps = {
  activeTab?: BottomNavTab
  cartCount?: number
  onPressTab?: (tab: BottomNavTab) => void
  dir?: 'ltr' | 'rtl'
}

const TABS: Array<{
  id: BottomNavTab
  iconName: 'home' | 'categories' | 'star' | 'cart' | 'account'
  labelEn: string
  labelAr: string
}> = [
  { id: 'home',       iconName: 'home',       labelEn: 'Home',       labelAr: 'الرئيسية' },
  { id: 'categories', iconName: 'categories', labelEn: 'Categories', labelAr: 'الفئات'   },
  { id: 'brands',     iconName: 'star',       labelEn: 'Brands',     labelAr: 'العلامات' },
  { id: 'cart',       iconName: 'cart',       labelEn: 'Cart',       labelAr: 'السلة'    },
  { id: 'account',    iconName: 'account',    labelEn: 'Account',    labelAr: 'حسابي'    },
]

export const BottomNav = React.memo(function BottomNav({
  activeTab = 'home',
  cartCount = 0,
  onPressTab,
  dir = 'ltr',
}: BottomNavProps) {
  const c = useThemeColors()

  return (
    <Box
      style={{
        backgroundColor: c.surfaceLowest,
        borderTopWidth: borderWidth.thin,
        borderTopColor: c.divider,
      }}
    >
      <Box style={{ flexDirection: 'row', height: 56 }}>
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab
          const iconColor = isActive ? c.brandPrimary : c.textSecondary
          const label = dir === 'rtl' ? tab.labelAr : tab.labelEn

          return (
            <ReusableButton
              key={tab.id}
              onPress={() => onPressTab?.(tab.id)}
              variant='ghost'
              accessibilityLabel={label}
              style={{ flex: 1, paddingHorizontal: 0, paddingVertical: 0 }}
            >
              <Box
                style={{
                  flex: 1,
                  minHeight: 44,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: spacing['8'],
                  gap: spacing['4'],
                }}
              >
                <Box
                  style={{
                    position: 'absolute',
                    top: 0,
                    width: 20,
                    height: 2,
                    borderRadius: 2,
                    backgroundColor: isActive ? c.brandPrimary : 'transparent',
                  }}
                />
                <Box style={{ position: 'relative' }}>
                  <Icon
                    name={tab.iconName}
                    size={24}
                    color={iconColor}
                    weight={isActive ? 'fill' : 'regular'}
                  />
                  {tab.id === 'cart' && cartCount > 0 ? (
                    <Box
                      style={{
                        position: 'absolute',
                        top: -4,
                        end: -6,
                        minWidth: spacing['16'],
                        height: spacing['16'],
                        borderRadius: radius.xs,
                        backgroundColor: c.brandPrimary,
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingHorizontal: spacing['4'],
                      }}
                    >
                      <Text
                        variant='meta'
                        tone='inverse'
                        weight='700'
                      >
                        {cartCount > 9 ? '9+' : String(cartCount)}
                      </Text>
                    </Box>
                  ) : null}
                </Box>
                <Text
                  variant='caption'
                  style={{
                    fontSize: 11,
                    lineHeight: 14,
                    color: iconColor,
                    fontWeight: isActive ? '700' : '500',
                  }}
                >
                  {label}
                </Text>
              </Box>
            </ReusableButton>
          )
        })}
      </Box>
      <Box style={{ minHeight: spacing['4'] }} />
    </Box>
  )
})
