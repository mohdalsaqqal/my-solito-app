import { ReactNode, useEffect, useMemo, useState } from 'react'
import { Platform, Pressable, View } from 'react-native'
import { useWindowDimensions } from 'react-native'
import { ArrowUp } from 'phosphor-react'
import { borderWidth, breakpoints, colors, layout, radius, spacing, zIndex } from '@real/tokens'
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

// ─────────────────────────────────────────────────────────────────────────────
// Grouped Prop Types (for better organization and maintainability)
// ─────────────────────────────────────────────────────────────────────────────

type LayoutBranding = {
  logoSrc: string
  logoAlt: string
}

type LayoutCampaign = {
  text?: string
  link?: string
}

type LayoutCart = {
  count: number
  items: CartLine[]
  subtotal: number
  loading?: boolean
  error?: string | null
  feedbackKey?: number
  onViewCart: () => void
  onCheckout: () => void
  onMobileCartNavigate: () => void
  onIncrease?: (item: CartLine) => void | Promise<void>
  onDecrease?: (item: CartLine) => void | Promise<void>
  onRemove?: (item: CartLine) => void | Promise<void>
}

type LayoutNavigation = {
  categories: NavItem[]
  salesItems: NavItem[]
  brandItems: NavItem[]
  footerLinks: FooterColumn[]
  socialLinks: SocialLink[]
  bottomNavItems?: BottomNavItem[]
  activeBottomNavId?: string
  onBottomNavChange?: (item: BottomNavItem) => void
}

type LayoutNewsletter = {
  title: string
  subtitle: string
}

type LayoutLocale = {
  code: LocaleCode
  dir?: Direction
  onChange?: (nextLocale: LocaleCode) => void
}

type LayoutActions = {
  onSearchSubmit?: (query: string) => void
  onPressLogo?: () => void
  onNativeAccountPress?: () => void
}

type LayoutDisplay = {
  showFooter?: boolean
  mobileBottomInset?: number
}

type LayoutProps = {
  children: ReactNode
  branding: LayoutBranding
  campaign?: LayoutCampaign
  cart: LayoutCart
  wishlistCount?: number
  accountCount?: number
  navigation: LayoutNavigation
  newsletter: LayoutNewsletter
  locale?: LayoutLocale
  shellContent?: ShellContent
  actions?: LayoutActions
  display?: LayoutDisplay
}

export function Layout({
  children,
  branding,
  campaign,
  cart,
  wishlistCount = 0,
  accountCount = 0,
  navigation,
  newsletter,
  locale: localeProps,
  shellContent,
  actions,
  display,
}: LayoutProps) {
  const { width } = useWindowDimensions()
  const isDesktopViewport = width >= breakpoints.desktopMin
  // Keep first SSR/hydration pass deterministic on web to avoid bottom-nav mismatch.
  const isDesktop = isDesktopViewport || (Platform.OS === 'web' && width === 0)
  const showMobileBottomNav = !isDesktop
  const mobileNavHeight = spacing['64'] + spacing['8']
  const mobileBottomInset = display?.mobileBottomInset ?? 0
  const mobileContentBottomOffset = showMobileBottomNav ? mobileNavHeight + mobileBottomInset : 0
  
  // Destructure grouped props
  const locale = localeProps?.code ?? 'en'
  const dir = localeProps?.dir ?? 'ltr'
  const onLocaleChange = localeProps?.onChange
  const onSearchSubmit = actions?.onSearchSubmit
  const onPressLogo = actions?.onPressLogo
  const showFooter = display?.showFooter ?? true
  
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    if (Platform.OS !== 'web') return
    let ticking = false
    const onScroll = () => {
      if (!ticking) {
        globalThis.requestAnimationFrame?.(() => {
          const scrollY = (globalThis as { scrollY?: number }).scrollY ?? 0
          setShowScrollTop(scrollY > 400)
          ticking = false
        })
        ticking = true
      }
    }
    globalThis.addEventListener?.('scroll', onScroll, { passive: true })
    return () => globalThis.removeEventListener?.('scroll', onScroll)
  }, [])

  const scrollToTop = () => {
    if (Platform.OS !== 'web') return
    ;(globalThis as { scrollTo?: (opts: ScrollToOptions) => void }).scrollTo?.({ top: 0, behavior: 'smooth' })
  }

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
    if (navigation.onBottomNavChange) {
      navigation.onBottomNavChange(item)
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

  // ── Header height offset ─────────────────────────────────────────────────
  // Desktop: promo bar (40) + main row (80) + nav row (40) = 160px
  // Mobile:  main row (80) + category strip (48) = 128px (approx)
  // On web the header is position:sticky so the browser handles the offset.
  // On native the header is position:absolute — we pad the content area.
  const desktopHeaderHeight =
    layout.header.topBarHeight + layout.header.mainRowHeight + layout.header.navRowHeight
  const mobileHeaderHeight = layout.header.mainRowHeight + spacing['48']
  const headerHeight = isDesktop ? desktopHeaderHeight : mobileHeaderHeight
  const contentTopOffset = Platform.OS !== 'web' ? headerHeight : 0

  return (
    <Box flex={1} bg='background' style={{ direction: dir }}>
      {/* Header — fixed/sticky at top, always above content */}
      <Box
        style={
          Platform.OS === 'web'
            ? ({
                position: 'sticky' as any,
                top: 0,
                zIndex: zIndex.sticky,
                width: '100%',
              } as any)
            : {
                position: 'absolute',
                top: 0,
                start: 0,
                end: 0,
                zIndex: zIndex.sticky,
              }
        }
      >
        <Header
          locale={locale}
          dir={dir}
          shellContent={resolvedShell}
          socialLinks={navigation.socialLinks}
          campaignText={campaign?.text}
          campaignLink={campaign?.link}
          logoSrc={branding.logoSrc}
          logoAlt={branding.logoAlt}
          cartCount={cart.count}
          wishlistCount={wishlistCount}
          accountCount={accountCount}
          categories={navigation.categories}
          cartItems={cart.items}
          cartSubtotal={cart.subtotal}
          cartLoading={cart.loading}
          cartError={cart.error}
          cartFeedbackKey={cart.feedbackKey}
          onViewCart={cart.onViewCart}
          onCheckout={cart.onCheckout}
          onMobileCartNavigate={cart.onMobileCartNavigate}
          onCartIncrease={cart.onIncrease}
          onCartDecrease={cart.onDecrease}
          onCartRemove={cart.onRemove}
          onSearchSubmit={onSearchSubmit}
          onLogoPress={onPressLogo}
          onLocaleChange={onLocaleChange}
          onNativeAccountPress={actions?.onNativeAccountPress}
        />
      </Box>

      {/* Content — offset top on native to clear absolute header; web sticky handles it */}
      <Box
        flex={1}
        style={{
          paddingTop: contentTopOffset,
          ...(showMobileBottomNav ? { paddingBottom: mobileContentBottomOffset } : {}),
        }}
      >
        {children}
      </Box>

      {showFooter ? (
        <Footer
          locale={locale}
          dir={dir}
          shellContent={resolvedShell}
          footerLinks={navigation.footerLinks}
          socialLinks={navigation.socialLinks}
          newsletterTitle={newsletter.title}
          newsletterSubtitle={newsletter.subtitle}
        />
      ) : null}

      {Platform.OS === 'web' && isDesktop && showScrollTop ? (
        <Pressable
          onPress={scrollToTop}
          aria-label='Scroll to top'
          style={({ hovered }: any) => ({
            position: 'fixed' as any,
            bottom: spacing['40'],
            insetInlineEnd: spacing['40'],
            zIndex: zIndex.sticky + 20,
            width: 44,
            height: 44,
            borderRadius: radius.full,
            backgroundColor: hovered ? colors.surfaceMuted : colors.surface,
            borderWidth: borderWidth.thin,
            borderColor: colors.border,
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: hovered
              ? '0 4px 12px rgba(14,10,10,0.14), 0 6px 24px rgba(14,10,10,0.10)'
              : '0 2px 8px rgba(14,10,10,0.10), 0 4px 18px rgba(14,10,10,0.08)',
            transition: 'background-color 0.15s ease, box-shadow 0.15s ease',
          } as any)}
        >
          <ArrowUp size={18} color={colors.textSecondary} weight='bold' />
        </Pressable>
      ) : null}

      {showMobileBottomNav ? (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            start: 0,
            end: 0,
            zIndex: zIndex.sticky,
            borderTopWidth: borderWidth.thin,
            borderColor: colors.border,
            backgroundColor: colors.surface,
            flexDirection: 'row',
            justifyContent: 'space-around',
            paddingTop: spacing.xs,
            paddingBottom: spacing.xs + mobileBottomInset,
          }}
        >
          {navigation.bottomNavItems?.map((item) => {
            const active = navigation.activeBottomNavId === item.id
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
                    {item.id === 'cart' && cart.count > 0 ? (
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
                          {cart.count > 9 ? '9+' : String(cart.count)}
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
          }) ?? null}
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
