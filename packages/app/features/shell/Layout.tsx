import { ReactNode, useMemo } from 'react'
import { Platform, Pressable, View } from 'react-native'
import { useWindowDimensions } from 'react-native'
import { borderWidth, breakpoints, colors, radius, spacing, zIndex } from '@real/tokens'
import { Box, Icon, Text } from '@real/ui'
import { defaultBottomNavItems, defaultShellContent } from './defaults'
import { Footer } from './Footer'
import { Header } from './Header'
import {
  BottomNavItem,
  CartLine,
  Direction,
  FooterColumn,
  LocaleCode,
  NavItem,
  ShellContent,
  SocialLink,
} from './types'

type LayoutProps = {
  children: ReactNode
  logoSrc: string
  logoAlt: string
  campaignText?: string
  campaignLink?: string
  cartCount: number
  wishlistCount?: number
  accountCount?: number
  cartItems: CartLine[]
  cartSubtotal: number
  cartLoading?: boolean
  cartError?: string | null
  cartFeedbackKey?: number
  categories: NavItem[]
  salesItems: NavItem[]
  brandItems: NavItem[]
  footerLinks: FooterColumn[]
  socialLinks: SocialLink[]
  newsletterTitle: string
  newsletterSubtitle: string
  onViewCart: () => void
  onCheckout: () => void
  onMobileCartNavigate: () => void
  onCartIncrease?: (item: CartLine) => void | Promise<void>
  onCartDecrease?: (item: CartLine) => void | Promise<void>
  onCartRemove?: (item: CartLine) => void | Promise<void>
  locale?: LocaleCode
  dir?: Direction
  shellContent?: ShellContent
  bottomNavItems?: BottomNavItem[]
  activeBottomNavId?: string
  onBottomNavChange?: (item: BottomNavItem) => void
  onSearchSubmit?: (query: string) => void
  mobileBottomInset?: number
  onLocaleChange?: (nextLocale: LocaleCode) => void
  onPressLogo?: () => void
  showFooter?: boolean
}

export function Layout({
  children,
  logoSrc,
  logoAlt,
  campaignText,
  campaignLink,
  cartCount,
  wishlistCount = 0,
  accountCount = 0,
  cartItems,
  cartSubtotal,
  cartLoading = false,
  cartError = null,
  cartFeedbackKey,
  categories,
  footerLinks,
  socialLinks,
  newsletterTitle,
  newsletterSubtitle,
  locale = 'en',
  dir = 'ltr',
  shellContent,
  bottomNavItems = defaultBottomNavItems,
  activeBottomNavId,
  onBottomNavChange,
  onSearchSubmit,
  mobileBottomInset = 0,
  onLocaleChange,
  onViewCart,
  onCheckout,
  onMobileCartNavigate,
  onCartIncrease,
  onCartDecrease,
  onCartRemove,
  onPressLogo,
  showFooter = true,
}: LayoutProps) {
  const { width } = useWindowDimensions()
  const isDesktopViewport = width >= breakpoints.desktopMin
  // Keep first SSR/hydration pass deterministic on web to avoid bottom-nav mismatch.
  const isDesktop = isDesktopViewport || (Platform.OS === 'web' && width === 0)
  const showMobileBottomNav = !isDesktop
  const mobileNavHeight = spacing['64'] + spacing['8']
  const mobileContentBottomOffset = showMobileBottomNav ? mobileNavHeight + mobileBottomInset : 0
  const resolvedShell = useMemo(
    () => ({
      ...defaultShellContent,
      ...shellContent,
      topBar: shellContent?.topBar ?? defaultShellContent.topBar,
      branding: shellContent?.branding ?? defaultShellContent.branding,
      footer: shellContent?.footer ?? defaultShellContent.footer,
    }),
    [shellContent]
  )

  const handleBottomNavPress = (item: BottomNavItem) => {
    if (onBottomNavChange) {
      onBottomNavChange(item)
      return
    }
    if (Platform.OS !== 'web') {
      return
    }
    if (!item.href || item.href === '#') {
      return
    }
    const win = (globalThis as { open?: (url?: string, target?: string) => void }).open
    win?.(item.href, '_self')
  }

  return (
    <Box flex={1} bg='background' style={{ direction: dir }}>
      <Header
        locale={locale}
        dir={dir}
        shellContent={resolvedShell}
        campaignText={campaignText}
        campaignLink={campaignLink}
        logoSrc={logoSrc}
        logoAlt={logoAlt}
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        accountCount={accountCount}
        categories={categories}
        cartItems={cartItems}
        cartSubtotal={cartSubtotal}
        cartLoading={cartLoading}
        cartError={cartError}
        cartFeedbackKey={cartFeedbackKey}
        onViewCart={onViewCart}
        onCheckout={onCheckout}
        onMobileCartNavigate={onMobileCartNavigate}
        onCartIncrease={onCartIncrease}
        onCartDecrease={onCartDecrease}
        onCartRemove={onCartRemove}
        onSearchSubmit={onSearchSubmit}
        onLogoPress={onPressLogo}
        onLocaleChange={onLocaleChange}
      />

      <Box flex={1} style={showMobileBottomNav ? { paddingBottom: mobileContentBottomOffset } : undefined}>
        {children}
      </Box>

      {showFooter ? (
        <Footer
          locale={locale}
          dir={dir}
          shellContent={resolvedShell}
          footerLinks={footerLinks}
          socialLinks={socialLinks}
          newsletterTitle={newsletterTitle}
          newsletterSubtitle={newsletterSubtitle}
        />
      ) : null}

      {showMobileBottomNav ? (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            start: 0,
            end: 0,
            zIndex: zIndex.base,
            borderTopWidth: borderWidth.thin,
            borderColor: colors.border,
            backgroundColor: colors.surface,
            flexDirection: 'row',
            justifyContent: 'space-around',
            paddingTop: spacing.xs,
            paddingBottom: spacing.xs + mobileBottomInset,
          }}
        >
          {bottomNavItems.map((item) => {
            const active = activeBottomNavId === item.id
            const label = locale === 'ar' ? item.label.ar : item.label.en
            return (
              <Pressable
                key={item.id}
                onPress={() => handleBottomNavPress(item)}
                style={{ paddingHorizontal: spacing.xs }}
              >
                <Box style={{ alignItems: 'center', gap: spacing.xxs }}>
                  <Box style={{ position: 'relative' }}>
                    <Icon
                      name={toBottomNavIconName(item.id)}
                      color={active ? colors.brandPrimary : colors.textSecondary}
                    />
                    {item.id === 'cart' && cartCount > 0 ? (
                      <Box
                        style={{
                          position: 'absolute',
                          top: -spacing.xxs,
                          end: -spacing.xs,
                          minWidth: spacing.md,
                          height: spacing.md,
                          borderRadius: radius.xs,
                          backgroundColor: colors.brandPrimary,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text variant='meta' tone='inverse' weight='700'>
                          {cartCount > 9 ? '9+' : String(cartCount)}
                        </Text>
                      </Box>
                    ) : null}
                  </Box>
                  <Text variant='meta' tone={active ? 'primary' : 'muted'}>
                    {label}
                  </Text>
                </Box>
              </Pressable>
            )
          })}
        </View>
      ) : null}
    </Box>
  )
}

function toBottomNavIconName(id: string): 'home' | 'categories' | 'cart' | 'deals' | 'account' | 'more' {
  if (id === 'home') return 'home'
  if (id === 'categories') return 'categories'
  if (id === 'cart') return 'cart'
  if (id === 'deals') return 'deals'
  if (id === 'account') return 'account'
  return 'more'
}
