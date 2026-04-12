import React, { useState } from 'react'
import { borderWidth, layout, letterSpacing, motionDuration, radius, shadows, spacing, typography } from '@real/tokens'
import { Box, Container, Input, Text } from '../../primitives'
import { Button as ReusableButton } from '../../reusables/button'
import { Badge } from '../Badge'
import { Button } from '../Button'
import { Icon } from '../Icon'
import { useThemeColors } from '../../responsive'

type HeaderMainRowProps = {
  variant?: 'default' | 'mega-search'
  logoText: string
  onPressLogo?: () => void
  logoHref?: string
  searchValue: string
  searchPlaceholder: string
  onSearchChange: (value: string) => void
  onSearchFocus: () => void
  onSearchBlur?: () => void
  onSearchSubmit?: () => void
  searchRegionId?: string
  accountCount?: number
  wishlistCount?: number
  cartCount?: number
  localeLabel: string
  departmentsLabel?: string
  accountLabel?: string
  wishlistLabel?: string
  cartLabel?: string
  onPressLocale: () => void
  onPressDepartments?: () => void
  onPressAccount?: () => void
  onPressCart?: () => void
  departmentsActive?: boolean
  cartPulse?: boolean
  mobile?: boolean
  state?: 'loading' | 'empty' | 'error' | 'disabled' | 'default'
}

function Action({
  iconName,
  count,
  onPress,
  label,
  emphasized = false,
  pulse = false,
}: {
  iconName: 'account' | 'wishlist' | 'cart'
  count?: number
  onPress?: () => void
  label: string
  emphasized?: boolean
  pulse?: boolean
}) {
  const [interactive, setInteractive] = useState(false)
  const c = useThemeColors()

  return (
    <Box style={{ alignItems: 'center', gap: spacing['8'] }}>
      <ReusableButton
        onPress={onPress}
        onHoverIn={() => setInteractive(true)}
        onHoverOut={() => setInteractive(false)}
        onFocus={() => setInteractive(true)}
        onBlur={() => setInteractive(false)}
        accessibilityLabel={label}
        variant={emphasized ? 'default' : 'ghost'}
        size='icon'
        style={{
          minHeight: emphasized ? spacing['40'] : spacing['40'],
          minWidth: emphasized ? spacing['40'] : spacing['40'],
          borderRadius: emphasized ? radius.full : radius.md,
          backgroundColor: emphasized ? c.brandPrimary : interactive ? c.surfaceMuted : 'transparent',
          transitionProperty: 'background-color,transform',
          transitionDuration: `${motionDuration.microInteraction}ms`,
          transform: [{ translateY: interactive ? -1 : 0 }],
        }}
      >
        <Box
          style={{
            position: 'relative',
            minHeight: spacing['40'],
            minWidth: spacing['40'],
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon
            name={iconName}
            size={spacing['24']}
            color={emphasized ? c.textInverted : interactive ? c.roseAccent : c.textPrimary}
            weight={interactive ? 'fill' : 'regular'}
          />
          {iconName !== 'account' && typeof count === 'number' && count > 0 ? (
            <Box
              style={{
                position: 'absolute',
                pointerEvents: 'none',
                top: emphasized ? spacing['1'] : 0,
                end: 0,
                minWidth: spacing['16'],
                height: spacing['16'],
                borderRadius: radius.xs,
                backgroundColor: c.brandPrimary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text variant='meta' tone='inverse' weight='700'>
                {count > 9 ? '9+' : String(count)}
              </Text>
            </Box>
          ) : null}
          {iconName === 'cart' && pulse ? (
            <Box
              style={{
                position: 'absolute',
                pointerEvents: 'none',
                top: spacing['1'],
                end: 0,
              }}
            >
              <Badge tone='accent' size='sm' style={{ minHeight: spacing['16'], paddingHorizontal: spacing['6'] }}>
                {` `}
              </Badge>
            </Box>
          ) : null}
        </Box>
      </ReusableButton>
      <Box
        style={{
          height: 2,
          width: interactive ? spacing['24'] : 0,
          borderRadius: 2,
          backgroundColor: c.brandPrimary,
          transitionProperty: 'width',
          transitionDuration: `${motionDuration.normal}ms`,
        }}
      />
    </Box>
  )
}

export const HeaderMainRow = React.memo(function HeaderMainRow({
  variant = 'default',
  logoText,
  onPressLogo,
  logoHref,
  searchValue,
  searchPlaceholder,
  onSearchChange,
  onSearchFocus,
  onSearchBlur,
  onSearchSubmit,
  searchRegionId,
  accountCount = 0,
  wishlistCount = 0,
  cartCount = 0,
  localeLabel,
  departmentsLabel = 'All Categories',
  accountLabel = 'Account',
  wishlistLabel = 'Wishlist',
  cartLabel = 'Cart',
  onPressLocale,
  onPressDepartments,
  onPressAccount,
  onPressCart,
  departmentsActive = false,
  cartPulse = false,
  mobile = false,
  state = 'default',
}: HeaderMainRowProps) {
  const c = useThemeColors()
  const [localeInteractive, setLocaleInteractive] = useState(false)
  const searchInputHeight = spacing['40']
  const isMegaSearch = variant === 'mega-search'

  if (state === 'empty') {
    return null
  }

  if (state === 'loading') {
    return (
      <Box style={{ backgroundColor: c.surfaceLowest }}>
        <Container>
          <Box style={{ minHeight: layout.header.mainRowHeight, justifyContent: 'center' }}>
            <Text tone='muted' variant='caption'>
              Loading header...
            </Text>
          </Box>
        </Container>
      </Box>
    )
  }

  if (state === 'error') {
    return (
      <Box style={{ backgroundColor: c.surfaceLowest }}>
        <Container>
          <Box style={{ minHeight: layout.header.mainRowHeight, justifyContent: 'center' }}>
            <Text tone='danger' variant='caption'>
              Header unavailable.
            </Text>
          </Box>
        </Container>
      </Box>
    )
  }

  if (mobile) {
    return (
      <Box style={{ backgroundColor: c.surfaceLowest }}>
        <Container>
          <Box style={{ minHeight: layout.header.mainRowHeight, flexDirection: 'row', alignItems: 'center', gap: spacing['16'] }}>
            <ReusableButton
              href={logoHref}
              onPress={state === 'disabled' ? undefined : onPressLogo}
              variant='ghost'
              style={{ flex: 1, paddingHorizontal: 0, paddingVertical: 0 }}
            >
              <Text variant='title' tone='primary' numberOfLines={1} style={{ flex: 1 }}>
                {logoText}
              </Text>
            </ReusableButton>
            <Box style={{ flex: 1.8 }}>
              <Box nativeID={searchRegionId} style={{ position: 'relative', justifyContent: 'center', width: '100%' }}>
                <Box style={{ position: 'absolute', start: spacing['16'], zIndex: 1 }}>
                  <Icon name='search' color={c.textPrimary} />
                </Box>
                <Input
                  value={searchValue}
                  onChangeText={onSearchChange}
                  onFocus={onSearchFocus}
                  onBlur={onSearchBlur}
                  onSubmitEditing={onSearchSubmit}
                  readOnly={state === 'disabled'}
                  radiusKey='full'
                  placeholder={searchPlaceholder}
                  style={{
                    paddingStart: spacing['32'],
                    paddingEnd: spacing['16'],
                    paddingVertical: spacing['2'],
                    fontSize: typography.bodySm,
                    minHeight: searchInputHeight,
                    height: searchInputHeight,
                    borderColor: c.gray10,
                    backgroundColor: c.surfaceContainerLow,
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
    )
  }

  return (
    <Box style={{ backgroundColor: c.surfaceLowest }}>
      <Container>
        <Box
          style={{
            minHeight: layout.header.mainRowHeight,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: spacing['16'],
          }}
        >
          <Box
            style={{
              flex: 2,
              minWidth: spacing['128'],
              alignItems: 'flex-start',
              justifyContent: 'center',
            }}
          >
            <ReusableButton
              href={logoHref}
              onPress={state === 'disabled' ? undefined : onPressLogo}
              variant='ghost'
              style={{ paddingHorizontal: 0, paddingVertical: 0 }}
            >
              <Text variant='h2' tone='primary' weight='700' numberOfLines={1} style={{ letterSpacing: letterSpacing.wide }}>
                {logoText}
              </Text>
            </ReusableButton>
          </Box>
          <Box
            style={{
              flex: 5,
              minWidth: spacing['128'],
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['8'], width: '100%' }}>
              {isMegaSearch ? (
                <Box style={{ minWidth: spacing['128'] }}>
                  <Button
                    variant={departmentsActive ? 'solid' : 'secondaryQuiet'}
                    size='sm'
                    shape='pill'
                    onPress={state === 'disabled' ? undefined : onPressDepartments}
                  >
                    {departmentsLabel}
                  </Button>
                </Box>
              ) : null}
              <Box nativeID={searchRegionId} style={{ position: 'relative', justifyContent: 'center', width: '100%', flex: 1 }}>
                <Box style={{ position: 'absolute', start: spacing['16'], zIndex: 1 }}>
                  <Icon name='search' color={c.textPrimary} />
                </Box>
                <Input
                  value={searchValue}
                  onChangeText={onSearchChange}
                  onFocus={onSearchFocus}
                  onBlur={onSearchBlur}
                  onSubmitEditing={onSearchSubmit}
                  readOnly={state === 'disabled'}
                  radiusKey='full'
                  placeholder={searchPlaceholder}
                  style={{
                    paddingStart: spacing['32'],
                    paddingEnd: spacing['16'],
                    paddingVertical: spacing['2'],
                    fontSize: typography.bodySm,
                    minHeight: searchInputHeight,
                    height: searchInputHeight,
                    borderColor: c.gray10,
                    borderWidth: borderWidth.thin,
                    backgroundColor: c.surfaceContainerLow,
                  }}
                />
              </Box>
            </Box>
          </Box>
          <Box
            style={{
              flex: 2,
              minWidth: spacing['128'],
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: spacing['16'],
            }}
          >
            <Action
              iconName='account'
              count={accountCount}
              label={accountLabel}
              onPress={state === 'disabled' ? undefined : onPressAccount}
            />
            <Action iconName='wishlist' count={wishlistCount} label={wishlistLabel} />
            <Action
              iconName='cart'
              count={cartCount}
              label={cartLabel}
              onPress={state === 'disabled' ? undefined : onPressCart}
              emphasized
              pulse={cartPulse}
            />
            <Box style={{ alignItems: 'center', gap: spacing['8'] }}>
              <ReusableButton
                disabled={state === 'disabled'}
                onPress={onPressLocale}
                onHoverIn={() => setLocaleInteractive(true)}
                onHoverOut={() => setLocaleInteractive(false)}
                onFocus={() => setLocaleInteractive(true)}
                onBlur={() => setLocaleInteractive(false)}
                accessibilityLabel={localeLabel}
                variant='ghost'
                size='icon'
                style={{
                  minHeight: spacing['40'],
                  minWidth: spacing['40'],
                  borderRadius: radius.md,
                  backgroundColor: localeInteractive ? c.surfaceMuted : 'transparent',
                  transitionProperty: 'background-color,transform',
                  transitionDuration: `${motionDuration.microInteraction}ms`,
                  transform: [{ translateY: localeInteractive ? -1 : 0 }],
                  ...shadows.xs,
                }}
              >
                <Icon
                  name='language'
                  size={spacing['24']}
                  color={localeInteractive ? c.roseAccent : c.textPrimary}
                />
              </ReusableButton>
              <Box
                style={{
                  height: 2,
                  width: localeInteractive ? spacing['24'] : 0,
                  borderRadius: 2,
                  backgroundColor: c.brandPrimary,
                  transitionProperty: 'width',
                  transitionDuration: `${motionDuration.normal}ms`,
                }}
              />
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  )
})
