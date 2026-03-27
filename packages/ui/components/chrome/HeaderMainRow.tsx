import { Image } from 'react-native'
import {
  borderWidth,
  colors,
  componentTokens,
  layout,
  letterSpacing,
  motionDuration,
  radius,
  spacing,
  typography,
} from '@real/tokens'
import { Box, Container, Text, Touchable } from '../../primitives'
import { Icon } from '../Icon'
import { SearchField as SharedSearchField } from '../SearchField'

type HeaderMainRowProps = {
  logoText: string
  logoSrc?: string
  logoSize?: 'sm' | 'md' | 'lg'
  variant?: 'search-centered' | 'mega-search'
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
  cartPulse?: boolean
  localeLabel: string
  currencyLabel?: string
  departmentsLabel?: string
  accountLabel?: string
  wishlistLabel?: string
  cartLabel?: string
  onPressLocale: () => void
  onPressCurrency?: () => void
  onPressDepartments?: () => void
  onPressAccount?: () => void
  onPressCart?: () => void
  departmentsActive?: boolean
  mobile?: boolean
  mobileCompact?: boolean
  mobileDeliveryLabel?: string
  mobileDeliveryValue?: string
  onPressMobilePrimaryAction?: () => void
  onPressMobileSecondaryAction?: () => void
  state?: 'loading' | 'empty' | 'error' | 'disabled' | 'default'
}

function BrandLockup({
  logoText,
  logoSrc,
  logoSize = 'md',
  onPress,
  href,
}: {
  logoText: string
  logoSrc?: string
  logoSize?: 'sm' | 'md' | 'lg'
  onPress?: () => void
  href?: string
}) {
  const isArabic = /[\u0600-\u06FF]/.test(logoText)
  const brandTokens = componentTokens.header.brand
  const title = isArabic ? logoText : 'REAL'
  const subtitle = isArabic ? 'مستحضرات تجميل' : 'cosmetics'
  const tagline = isArabic ? 'جمال بلا حدود' : 'endless beauty'
  const hasUploadedLogo = Boolean(logoSrc && logoSrc !== '/brand-logo-placeholder.svg')
  const logoHeight =
    logoSize === 'sm'
      ? componentTokens.header.brand.logoImageHeightSm
      : logoSize === 'lg'
        ? componentTokens.header.brand.logoImageHeightLg
        : componentTokens.header.brand.logoImageHeightMd
  const logoMaxWidth =
    logoSize === 'sm'
      ? componentTokens.header.brand.logoImageMaxWidthSm
      : logoSize === 'lg'
        ? componentTokens.header.brand.logoImageMaxWidthLg
        : componentTokens.header.brand.logoImageMaxWidthMd

  return (
    <Touchable onPress={onPress} href={href} accessibilityRole={href ? 'link' : 'button'}>
      {hasUploadedLogo ? (
        <Box
          style={{
            alignItems: 'flex-start',
            justifyContent: 'center',
            minHeight: logoHeight,
          }}
        >
          <Image
            source={{ uri: logoSrc }}
            resizeMode='contain'
            accessibilityLabel={logoText}
            style={{
              width: logoMaxWidth,
              height: logoHeight,
            }}
          />
        </Box>
      ) : (
        <Box style={{ alignItems: 'flex-start', gap: spacing['1'] }}>
          <Text
            weight={brandTokens.wordmarkWeight}
            numberOfLines={1}
            style={{
              color: colors.textPrimary,
              fontFamily: componentTokens.header.fonts.display,
              fontSize: isArabic ? typography.h5 : brandTokens.wordmarkSize,
              lineHeight: isArabic ? 32 : brandTokens.wordmarkLineHeight,
              letterSpacing: isArabic ? letterSpacing.normal : brandTokens.wordmarkTracking,
              textTransform: isArabic ? 'none' : 'uppercase',
            }}
          >
            {title}
          </Text>
          <Box style={{ alignItems: 'flex-start', gap: spacing['1'] }}>
            <Text
              variant='meta'
              tone='muted'
              weight={brandTokens.subtitleWeight}
              style={{
                fontFamily: componentTokens.header.fonts.body,
                fontSize: brandTokens.subtitleSize,
                lineHeight: brandTokens.subtitleLineHeight,
                textTransform: 'lowercase',
                letterSpacing: brandTokens.subtitleTracking,
              }}
            >
              {subtitle}
            </Text>
            {isArabic ? null : (
              <Box
                aria-hidden
                style={{
                  width: brandTokens.accentArcWidth,
                  height: brandTokens.accentArcHeight,
                  borderBottomWidth: brandTokens.accentArcThickness,
                  borderBottomColor: colors.brandPrimary,
                  borderRadius: radius.full,
                  opacity: 0.92,
                  transform: [{ translateY: brandTokens.accentArcOffsetY }],
                }}
              />
            )}
          </Box>
          <Text
            variant='meta'
            tone='default'
            weight={brandTokens.taglineWeight}
            style={{
              fontFamily: componentTokens.header.fonts.body,
              fontSize: brandTokens.taglineSize,
              lineHeight: brandTokens.taglineLineHeight,
              textTransform: 'lowercase',
              letterSpacing: brandTokens.taglineTracking,
            }}
          >
            {tagline}
          </Text>
        </Box>
      )}
    </Touchable>
  )
}

function Action({
  iconName,
  count,
  onPress,
  label,
  showCount = true,
  pulse = false,
}: {
  iconName: 'account' | 'wishlist' | 'cart'
  count?: number
  onPress?: () => void
  label: string
  showCount?: boolean
  pulse?: boolean
}) {
  return (
    <Touchable
      onPress={onPress}
      accessibilityRole='button'
      accessibilityLabel={label}
      style={{ minHeight: layout.header.navRowHeight, justifyContent: 'center' }}
    >
      {({ hovered, pressed, focused }) => {
        const active = hovered || focused
        return (
          <Box
            style={{
              position: 'relative',
              width: componentTokens.header.actions.buttonSize,
              height: componentTokens.header.actions.buttonSize,
              borderRadius: radius.full,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: active ? colors.backgroundSecondary : 'transparent',
              transform: pressed ? [{ scale: 0.95 }] : active ? [{ scale: 1.05 }] : [{ scale: 1 }],
              transitionProperty: 'background-color, transform',
              transitionDuration: `${motionDuration.microInteraction}ms`,
            } as any}
          >
            <Icon
              name={iconName}
              size={componentTokens.header.actions.iconSize}
              color={active ? colors.brandPrimary : colors.textPrimary}
              weight={active ? 'fill' : 'regular'}
            />
            {showCount && typeof count === 'number' && count > 0 ? (
              <Box
                pointerEvents='none'
                style={{
                  position: 'absolute',
                  top: -spacing['4'],
                  end: -spacing['4'],
                  minWidth: componentTokens.header.actions.badgeSize,
                  height: componentTokens.header.actions.badgeSize,
                  borderRadius: radius.full,
                  backgroundColor: colors.brandCrimson,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: spacing['2'],
                  borderWidth: borderWidth.thin,
                  borderColor: colors.surface,
                  ...(pulse
                    ? ({
                        transform: [{ scale: 1.06 }],
                        shadowColor: colors.brandCrimson,
                        shadowOpacity: 0.18,
                        shadowRadius: 10,
                        shadowOffset: { width: 0, height: 3 },
                      } as any)
                    : {}),
                }}
              >
                <Text variant='meta' size={10} tone='inverse' weight='700'>
                  {count > 9 ? '9+' : String(count)}
                </Text>
              </Box>
            ) : null}
          </Box>
        )
      }}
    </Touchable>
  )
}

function InlineControl({
  label,
  iconName,
  onPress,
  active = false,
}: {
  label: string
  iconName?: 'language'
  onPress: () => void
  active?: boolean
}) {
  return (
    <Touchable onPress={onPress} accessibilityRole='button' accessibilityLabel={label}>
      {({ hovered, pressed, focused }) => {
        const isActive = active || hovered || focused
        return (
          <Box
            style={{
              minHeight: componentTokens.header.controls.inlineHeight,
              flexDirection: 'row',
              alignItems: 'center',
              gap: componentTokens.header.controls.inlineGap,
              paddingHorizontal: componentTokens.header.controls.inlinePaddingX,
              paddingVertical: componentTokens.header.controls.inlinePaddingY,
              backgroundColor: isActive ? colors.backgroundSecondary : 'transparent',
              borderRadius: radius.full,
              transform: pressed ? [{ scale: 0.98 }] : [{ scale: 1 }],
              transitionProperty: 'background-color, transform',
              transitionDuration: `${motionDuration.microInteraction}ms`,
            } as any}
          >
            {iconName ? (
              <Icon
                name={iconName}
                size={componentTokens.header.controls.inlineIconSize}
                color={isActive ? colors.brandPrimary : colors.textPrimary}
              />
            ) : null}
            <Text
              variant='meta'
              weight='700'
              style={{
                fontFamily: componentTokens.header.fonts.body,
                fontSize: componentTokens.header.controls.inlineTextSize,
                lineHeight: componentTokens.header.controls.inlineTextLineHeight,
                textTransform: 'uppercase',
                letterSpacing: componentTokens.header.controls.inlineTextTracking,
                color: isActive ? colors.brandPrimary : colors.textPrimary,
              }}
            >
              {label}
            </Text>
            <Icon
              name='caretDown'
              size={componentTokens.header.controls.inlineCaretSize}
              color={isActive ? colors.brandPrimary : colors.textPrimary}
              weight='bold'
            />
          </Box>
        )
      }}
    </Touchable>
  )
}

function MobileDeliveryRow({
  label,
  value,
  onPress,
}: {
  label: string
  value: string
  onPress?: () => void
}) {
  return (
    <Touchable onPress={onPress} accessibilityRole='button' accessibilityLabel={`${label}: ${value}`}>
      {({ hovered, pressed, focused }) => {
        const active = hovered || focused
        return (
          <Box
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: componentTokens.header.mobile.deliveryGap,
              opacity: pressed ? 0.84 : 1,
            }}
          >
            <Icon
              name='location'
              size={componentTokens.header.mobile.deliveryIconSize}
              color={active ? colors.brandPrimary : colors.textPrimary}
              weight={active ? 'fill' : 'regular'}
            />
            <Text
              tone='muted'
              style={{
                fontFamily: componentTokens.header.fonts.body,
                fontSize: componentTokens.header.mobile.deliveryLabelSize,
                lineHeight: componentTokens.header.mobile.deliveryLabelLineHeight,
                letterSpacing: componentTokens.header.mobile.deliveryTracking,
              }}
            >
              {label}:
            </Text>
            <Text
              weight='700'
              numberOfLines={1}
              style={{
                flexShrink: 1,
                fontFamily: componentTokens.header.fonts.body,
                fontSize: componentTokens.header.mobile.deliveryValueSize,
                lineHeight: componentTokens.header.mobile.deliveryValueLineHeight,
                letterSpacing: componentTokens.header.mobile.deliveryTracking,
              }}
            >
              {value}
            </Text>
            <Icon name='caretDown' size={spacing['16']} color={colors.textPrimary} weight='bold' />
          </Box>
        )
      }}
    </Touchable>
  )
}

function MobileSearchPill({
  placeholder,
  onPress,
  compact = false,
}: {
  placeholder: string
  onPress: () => void
  compact?: boolean
}) {
  return (
    <Touchable onPress={onPress} accessibilityRole='button' accessibilityLabel={placeholder}>
      {({ hovered, pressed, focused }) => {
        const active = hovered || focused
        return (
          <Box
            style={{
              minHeight: componentTokens.header.mobile.searchHeight,
              height: componentTokens.header.mobile.searchHeight,
              borderRadius: componentTokens.header.mobile.searchRadius,
              backgroundColor: colors.surfaceMuted,
              borderWidth: borderWidth.thin,
              borderColor: active ? colors.brandPrimarySubtle : colors.border,
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing['10'],
              paddingHorizontal: spacing['16'],
              opacity: pressed ? 0.94 : 1,
            }}
          >
            <Icon
              name='search'
              size={componentTokens.header.mobile.searchIconSize}
              color={colors.textMuted}
              weight='regular'
            />
            <Text
              tone='muted'
              numberOfLines={1}
              style={{
                flex: 1,
                fontFamily: componentTokens.header.fonts.body,
                fontSize: compact ? typography.bodySm : componentTokens.header.mobile.searchTextSize,
                lineHeight: compact ? typography.bodySm + 4 : componentTokens.header.mobile.searchTextLineHeight,
              }}
            >
              {placeholder}
            </Text>
          </Box>
        )
      }}
    </Touchable>
  )
}

function MobileActionButton({
  iconName,
  label,
  onPress,
}: {
  iconName: 'categories' | 'cart'
  label: string
  onPress?: () => void
}) {
  return (
    <Touchable onPress={onPress} accessibilityRole='button' accessibilityLabel={label}>
      {({ hovered, pressed, focused }) => {
        const active = hovered || focused
        return (
          <Box
            style={{
              width: componentTokens.header.mobile.actionButtonSize,
              height: componentTokens.header.mobile.actionButtonSize,
              borderRadius: radius.full,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.surface,
              borderWidth: borderWidth.thin,
              borderColor: active ? colors.brandPrimarySubtle : colors.border,
              opacity: pressed ? 0.92 : 1,
            }}
          >
            <Icon
              name={iconName}
              size={componentTokens.header.mobile.actionIconSize}
              color={active ? colors.brandPrimary : colors.textPrimary}
              weight={active ? 'fill' : 'regular'}
            />
          </Box>
        )
      }}
    </Touchable>
  )
}

function SearchField({
  value,
  placeholder,
  onChange,
  onFocus,
  onBlur,
  onSubmit,
  readOnly,
  regionId,
  compact = false,
}: {
  value: string
  placeholder: string
  onChange: (value: string) => void
  onFocus: () => void
  onBlur?: () => void
  onSubmit?: () => void
  readOnly: boolean
  regionId?: string
  compact?: boolean
}) {
  const fieldHeight = compact ? spacing['48'] : spacing['48']

  return (
    <Box nativeID={regionId} style={{ position: 'relative', justifyContent: 'center', width: '100%' }}>
      <SharedSearchField
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        onSubmitEditing={onSubmit}
        editable={!readOnly}
        placeholder={placeholder}
        style={{
          fontFamily: componentTokens.header.fonts.body,
          paddingEnd: spacing['20'],
          paddingVertical: spacing['none'],
          fontSize: compact ? typography.bodySm : typography.body2,
          minHeight: fieldHeight,
          height: fieldHeight,
          borderColor: colors.border,
          backgroundColor: colors.surface,
          boxShadow: 'none',
        } as any}
      />
    </Box>
  )
}

export function HeaderMainRow({
  logoText,
  logoSrc,
  logoSize = 'md',
  variant = 'search-centered',
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
  cartPulse = false,
  localeLabel,
  currencyLabel = 'USD',
  departmentsLabel = 'All Categories',
  accountLabel = 'Account',
  wishlistLabel = 'Wishlist',
  cartLabel = 'Cart',
  onPressLocale,
  onPressCurrency,
  onPressDepartments,
  onPressAccount,
  onPressCart,
  departmentsActive = false,
  mobile = false,
  mobileCompact = false,
  mobileDeliveryLabel = '',
  mobileDeliveryValue = '',
  onPressMobilePrimaryAction,
  onPressMobileSecondaryAction,
  state = 'default',
}: HeaderMainRowProps) {
  const containerPaddingX = mobile ? layout.containerPaddingX : spacing.pageX

  if (state === 'empty') {
    return null
  }

  if (state === 'loading') {
    return (
      <Box style={{ backgroundColor: colors.surface }}>
        <Container paddingX={containerPaddingX}>
          <Box style={{ minHeight: layout.header.mainRowHeight, justifyContent: 'center' }}>
            <Text tone='muted' variant='caption'>
              Loading header…
            </Text>
          </Box>
        </Container>
      </Box>
    )
  }

  if (state === 'error') {
    return (
      <Box style={{ backgroundColor: colors.surface }}>
        <Container paddingX={containerPaddingX}>
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
      <Box
        style={{
          backgroundColor: colors.surface,
        }}
      >
        <Container paddingX={containerPaddingX}>
          <Box
            style={{
              paddingTop: mobileCompact
                ? componentTokens.header.mobile.compactPaddingTop
                : componentTokens.header.mobile.headerPaddingTop,
              paddingBottom: mobileCompact
                ? componentTokens.header.mobile.compactPaddingBottom
                : componentTokens.header.mobile.headerPaddingBottom,
              gap: componentTokens.header.mobile.stackGap,
            }}
          >
            <MobileDeliveryRow
              label={mobileDeliveryLabel}
              value={mobileDeliveryValue}
              onPress={state === 'disabled' ? undefined : onPressLogo}
            />
            <Box
              nativeID={searchRegionId}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: componentTokens.header.mobile.actionGap,
              }}
            >
              <Box style={{ flex: 1 }}>
                <MobileSearchPill
                  placeholder={searchPlaceholder}
                  onPress={state === 'disabled' ? () => undefined : onSearchFocus}
                  compact={mobileCompact}
                />
              </Box>
              {mobileCompact ? null : (
                <>
                  <MobileActionButton
                    iconName='categories'
                    label={departmentsLabel}
                    onPress={state === 'disabled' ? undefined : onPressMobilePrimaryAction}
                  />
                  <MobileActionButton
                    iconName='cart'
                    label={cartLabel}
                    onPress={state === 'disabled' ? undefined : onPressMobileSecondaryAction ?? onPressCart}
                  />
                </>
              )}
            </Box>
          </Box>
        </Container>
      </Box>
    )
  }

  return (
    <Box
      data-ect-node="HeaderMainRow"
      style={{
        backgroundColor: colors.surface,
        borderBottomWidth: borderWidth.thin,
        borderBottomColor: colors.divider,
      }}
    >
      <Container paddingX={containerPaddingX}>
        <Box
          style={{
            minHeight: layout.header.mainRowHeight,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: spacing['16'],
            paddingVertical: spacing['16'],
          }}
        >
          <Box
            style={{
              flex: variant === 'mega-search' ? undefined : 1.55,
              minWidth: variant === 'mega-search' ? 0 : spacing['128'],
              alignItems: 'flex-start',
              justifyContent: 'center',
            }}
          >
            <BrandLockup
              logoText={logoText}
              logoSrc={logoSrc}
              logoSize={logoSize}
              href={logoHref}
              onPress={state === 'disabled' ? undefined : onPressLogo}
            />
          </Box>

          <Box
            style={{
              flex: 1,
              minWidth: variant === 'mega-search' ? 0 : spacing['128'],
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {variant === 'mega-search' ? (
              <Box
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing['8'],
                }}
              >
                <Touchable
                  disabled={state === 'disabled'}
                  onPress={onPressDepartments}
                  accessibilityRole='button'
                  accessibilityLabel={departmentsLabel}
                >
                  {({ hovered, focused }) => {
                    const active = departmentsActive || hovered || focused

                    return (
                      <Box
                        style={{
                          minHeight: componentTokens.header.search.departmentsHeight,
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: componentTokens.header.search.departmentsGap,
                          borderRadius: radius.full,
                          borderWidth: borderWidth.thin,
                          borderColor: active ? colors.brandPrimary : colors.stroke,
                          backgroundColor: colors.surface,
                          paddingHorizontal: componentTokens.header.search.departmentsPaddingX,
                          transitionProperty: 'border-color,background-color',
                          transitionDuration: `${motionDuration.microInteraction}ms`,
                        }}
                      >
                        <Text
                          variant='caption'
                          weight='500'
                          tone='default'
                          style={{
                            fontFamily: componentTokens.header.fonts.body,
                            fontSize: componentTokens.header.search.departmentsTextSize,
                            lineHeight: componentTokens.header.search.departmentsTextLineHeight,
                          }}
                        >
                          {departmentsLabel}
                        </Text>
                        <Icon
                          name='caretDown'
                          size={14}
                          color={active ? colors.brandPrimary : colors.textPrimary}
                          weight='bold'
                        />
                      </Box>
                    )
                  }}
                </Touchable>
                <Box style={{ flex: 1 }}>
                  <SearchField
                    value={searchValue}
                    placeholder={searchPlaceholder}
                    onChange={onSearchChange}
                    onFocus={onSearchFocus}
                    onBlur={onSearchBlur}
                    onSubmit={onSearchSubmit}
                    readOnly={state === 'disabled'}
                    regionId={searchRegionId}
                  />
                </Box>
              </Box>
            ) : (
              <SearchField
                value={searchValue}
                placeholder={searchPlaceholder}
                onChange={onSearchChange}
                onFocus={onSearchFocus}
                onBlur={onSearchBlur}
                onSubmit={onSearchSubmit}
                readOnly={state === 'disabled'}
                regionId={searchRegionId}
              />
            )}
          </Box>

          <Box
            style={{
              flex: variant === 'mega-search' ? undefined : 1.7,
              minWidth: variant === 'mega-search' ? 0 : spacing['128'],
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: spacing['12'],
            }}
          >
            <InlineControl label={localeLabel} iconName='language' onPress={onPressLocale} />
            <InlineControl label={currencyLabel} onPress={onPressCurrency ?? (() => undefined)} />
            <Action
              iconName='account'
              count={accountCount}
              label={accountLabel}
              showCount={false}
              onPress={state === 'disabled' ? undefined : onPressAccount}
            />
            <Action iconName='wishlist' count={wishlistCount} label={wishlistLabel} />
            <Action
              iconName='cart'
              count={cartCount}
              label={cartLabel}
              onPress={state === 'disabled' ? undefined : onPressCart}
            />
          </Box>
        </Box>
      </Container>
    </Box>
  )
}
