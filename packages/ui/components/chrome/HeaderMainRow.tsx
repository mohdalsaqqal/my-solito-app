import { borderWidth, colors, layout, letterSpacing, motionDuration, radius, shadows, spacing, typography } from '@real/tokens'
import { Box, Container, Input, Text, Touchable } from '../../primitives'
import { Icon } from '../Icon'

type HeaderMainRowProps = {
  logoText: string
  onPressLogo?: () => void
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
  accountLabel?: string
  wishlistLabel?: string
  cartLabel?: string
  onPressLocale: () => void
  onPressAccount?: () => void
  onPressCart?: () => void
  mobile?: boolean
  state?: 'loading' | 'empty' | 'error' | 'disabled' | 'default'
}

function Action({
  iconName,
  count,
  onPress,
  label,
  emphasized = false,
}: {
  iconName: 'account' | 'wishlist' | 'cart'
  count?: number
  onPress?: () => void
  label: string
  emphasized?: boolean
}) {
  const handlePress = () => {
    onPress?.()
  }

  return (
    <Touchable
      onPressIn={handlePress}
      onPress={handlePress}
      accessibilityRole='button'
      accessibilityLabel={label}
      style={{ minHeight: layout.header.navRowHeight, justifyContent: 'center' }}
    >
      {({ hovered, focused }) => {
        const active = hovered || focused
        return (
          <Box style={{ alignItems: 'center', gap: spacing['8'] }}>
            <Box
              style={{
                position: 'relative',
                minHeight: emphasized ? spacing['40'] : spacing['32'],
                minWidth: emphasized ? spacing['40'] : spacing['32'],
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: emphasized ? radius.full : radius.md,
                backgroundColor: emphasized
                  ? colors.brandPrimary
                  : active ? colors.inkDeep : 'transparent',
                transitionProperty: 'background-color,transform',
                transitionDuration: `${motionDuration.microInteraction}ms`,
                transform: [{ translateY: active ? -1 : 0 }],
                ...(emphasized ? {} : shadows.xs),
              }}
            >
              <Icon
                name={iconName}
                size={spacing['24']}
                color={emphasized ? colors.textInverted : (active ? colors.goldPrimary : colors.inkFrost)}
              />
              {iconName !== 'account' && typeof count === 'number' && count > 0 ? (
                <Box
                  pointerEvents='none'
                  style={{
                    position: 'absolute',
                    top: emphasized ? spacing['1'] : 0,
                    end: 0,
                    minWidth: spacing['16'],
                    height: spacing['16'],
                    borderRadius: radius.xs,
                    backgroundColor: colors.brandPrimary,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text variant='meta' tone='inverse' weight='700'>
                    {count > 9 ? '9+' : String(count)}
                  </Text>
                </Box>
              ) : null}
            </Box>
            <Box
              style={{
                height: 2,
                width: active ? spacing['24'] : 0,
                borderRadius: 2,
                backgroundColor: colors.brandPrimary,
                transitionProperty: 'width',
                transitionDuration: `${motionDuration.normal}ms`,
              }}
            />
          </Box>
        )
      }}
    </Touchable>
  )
}

export function HeaderMainRow({
  logoText,
  onPressLogo,
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
  accountLabel = 'Account',
  wishlistLabel = 'Wishlist',
  cartLabel = 'Cart',
  onPressLocale,
  onPressAccount,
  onPressCart,
  mobile = false,
  state = 'default',
}: HeaderMainRowProps) {
  const searchInputHeight = Math.round(spacing['40'] * 0.7 * 1.15 * 1.15 * 1.15)

  if (state === 'empty') {
    return null
  }

  if (state === 'loading') {
    return (
      <Box style={{ backgroundColor: colors.inkBlack }}>
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
      <Box style={{ backgroundColor: colors.inkBlack }}>
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
      <Box style={{ backgroundColor: colors.inkBlack }}>
        <Container>
          <Box style={{ minHeight: layout.header.mainRowHeight, flexDirection: 'row', alignItems: 'center', gap: spacing['16'] }}>
            <Touchable onPress={state === 'disabled' ? undefined : onPressLogo} style={{ flex: 1 }}>
              <Text variant='title' tone='inkFrost' numberOfLines={1} style={{ flex: 1 }}>
                {logoText}
              </Text>
            </Touchable>
            <Box style={{ flex: 1.8 }}>
              <Box nativeID={searchRegionId} style={{ position: 'relative', justifyContent: 'center', width: '100%' }}>
                <Box style={{ position: 'absolute', start: spacing['16'], zIndex: 1 }}>
                  <Icon name='search' color={colors.inkFrost} />
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
                    borderColor: colors.inkMid,
                    backgroundColor: colors.inkDeep,
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
    <Box style={{ backgroundColor: colors.inkBlack }}>
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
            <Touchable onPress={state === 'disabled' ? undefined : onPressLogo}>
              <Text variant='h2' tone='inkFrost' weight='700' numberOfLines={1} style={{ letterSpacing: letterSpacing.wide }}>
                {logoText}
              </Text>
            </Touchable>
          </Box>
          <Box
            style={{
              flex: 5,
              minWidth: spacing['128'],
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box nativeID={searchRegionId} style={{ position: 'relative', justifyContent: 'center', width: '100%' }}>
              <Box style={{ position: 'absolute', start: spacing['16'], zIndex: 1 }}>
                <Icon name='search' color={colors.inkFrost} />
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
                  borderColor: colors.inkMid,
                  borderWidth: borderWidth.thin,
                  backgroundColor: colors.inkDeep,
                }}
              />
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
            />
            <Touchable
              disabled={state === 'disabled'}
              onPress={onPressLocale}
              accessibilityRole='button'
              accessibilityLabel={localeLabel}
            >
              {({ hovered, focused }) => (
                <Box style={{ alignItems: 'center', gap: spacing['8'] }}>
                  <Box
                    style={{
                      minHeight: spacing['32'],
                      minWidth: spacing['32'],
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: radius.md,
                      backgroundColor: hovered || focused ? colors.inkDeep : 'transparent',
                      transitionProperty: 'background-color,transform',
                      transitionDuration: `${motionDuration.microInteraction}ms`,
                      transform: [{ translateY: hovered || focused ? -1 : 0 }],
                      ...shadows.xs,
                    }}
                  >
                    <Icon
                      name='language'
                      size={spacing['24']}
                      color={hovered || focused ? colors.goldPrimary : colors.inkFrost}
                    />
                  </Box>
                  <Box
                    style={{
                      height: 2,
                      width: hovered || focused ? spacing['24'] : 0,
                      borderRadius: 2,
                      backgroundColor: colors.brandPrimary,
                      transitionProperty: 'width',
                      transitionDuration: `${motionDuration.normal}ms`,
                    }}
                  />
                </Box>
              )}
            </Touchable>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}
