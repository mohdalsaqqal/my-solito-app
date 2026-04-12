import { ReactNode, useEffect, useMemo, useState } from 'react'
import { Platform, Pressable, View } from 'react-native'
import { ArrowUp } from 'phosphor-react'
import { borderWidth, layout, radius, spacing, zIndex, boxShadowStrings } from '@real/tokens'
import { Box, Icon, Text } from '@real/ui'
import { useBreakpoint, useThemeColors } from '@real/ui/responsive'
import {
  defaultBottomNavItems,
  defaultBrandItems,
  defaultCategories,
  defaultFooterLinks,
  defaultSalesItems,
  defaultShellContent,
  defaultSocialLinks,
} from './defaults'
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

export type LayoutBranding = {
  logoSrc: string
  logoAlt: string
  logoSize?: 'sm' | 'md' | 'lg'
}

export type LayoutCampaign = {
  text?: string
  link?: string
}

export type LayoutCart = {
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

export type LayoutNavigation = {
  categories: NavItem[]
  salesItems: NavItem[]
  brandItems: NavItem[]
  footerLinks: FooterColumn[]
  socialLinks: SocialLink[]
  bottomNavItems?: BottomNavItem[]
  activeBottomNavId?: string
  onBottomNavChange?: (item: BottomNavItem) => void
}

export type LayoutNewsletter = {
  title: string
  subtitle: string
}

export type LayoutLocale = {
  code: LocaleCode
  dir?: Direction
  onChange?: (nextLocale: LocaleCode) => void
}

export type LayoutActions = {
  onSearchSubmit?: (query: string) => void
  onPressLogo?: () => void
  onNativeCategoriesPress?: () => void
  onNativeAccountPress?: () => void
}

export type LayoutDisplay = {
  showFooter?: boolean
  mobileBottomInset?: number
}

export type LayoutProps = {
  children: ReactNode
  branding?: LayoutBranding
  campaign?: LayoutCampaign
  cart?: LayoutCart
  wishlistCount?: number
  accountCount?: number
  navigation?: LayoutNavigation
  newsletter?: LayoutNewsletter
  locale?: LayoutLocale | LocaleCode
  shellContent?: ShellContent
  actions?: LayoutActions
  display?: LayoutDisplay
  logoSrc?: string
  logoAlt?: string
  logoSize?: 'sm' | 'md' | 'lg'
  campaignText?: string
  campaignLink?: string
  cartCount?: number
  cartItems?: CartLine[]
  cartSubtotal?: number
  cartLoading?: boolean
  cartError?: string | null
  cartFeedbackKey?: number
  categories?: NavItem[]
  salesItems?: NavItem[]
  brandItems?: NavItem[]
  footerLinks?: FooterColumn[]
  socialLinks?: SocialLink[]
  newsletterTitle?: string
  newsletterSubtitle?: string
  onViewCart?: () => void
  onCheckout?: () => void
  onMobileCartNavigate?: () => void
  onCartIncrease?: (item: CartLine) => void | Promise<void>
  onCartDecrease?: (item: CartLine) => void | Promise<void>
  onCartRemove?: (item: CartLine) => void | Promise<void>
  dir?: Direction
  onLocaleChange?: (nextLocale: LocaleCode) => void
  onSearchSubmit?: (query: string) => void
  onPressLogo?: () => void
  onNativeCategoriesPress?: () => void
  onNativeAccountPress?: () => void
  showFooter?: boolean
  mobileBottomInset?: number
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
  logoSrc,
  logoAlt,
  logoSize,
  campaignText,
  campaignLink,
  cartCount,
  cartItems,
  cartSubtotal,
  cartLoading,
  cartError,
  cartFeedbackKey,
  categories,
  salesItems,
  brandItems,
  footerLinks,
  socialLinks,
  newsletterTitle,
  newsletterSubtitle,
  onViewCart,
  onCheckout,
  onMobileCartNavigate,
  onCartIncrease,
  onCartDecrease,
  onCartRemove,
  dir: legacyDir,
  onLocaleChange: legacyOnLocaleChange,
  onSearchSubmit: legacyOnSearchSubmit,
  onPressLogo: legacyOnPressLogo,
  onNativeCategoriesPress: legacyOnNativeCategoriesPress,
  onNativeAccountPress: legacyOnNativeAccountPress,
  showFooter: legacyShowFooter,
  mobileBottomInset: legacyMobileBottomInset,
}: LayoutProps) {
  const profile = useBreakpoint()
  const isDesktopViewport = profile.breakpoint === 'desktop'
  const isDesktop = isDesktopViewport
  const c = useThemeColors()
  const showMobileBottomNav = !isDesktop
  const mobileNavHeight = spacing['64'] + spacing['8']
  const mobileBottomInset = display?.mobileBottomInset ?? legacyMobileBottomInset ?? 0
  const mobileContentBottomOffset = showMobileBottomNav ? mobileNavHeight + mobileBottomInset : 0
  
  // Destructure grouped props
  const locale = typeof localeProps === 'string' ? localeProps : localeProps?.code ?? 'en'
  const dir = (typeof localeProps === 'string' ? undefined : localeProps?.dir) ?? legacyDir ?? 'ltr'
  const onLocaleChange =
    (typeof localeProps === 'string' ? undefined : localeProps?.onChange) ?? legacyOnLocaleChange
  const onSearchSubmit = actions?.onSearchSubmit ?? legacyOnSearchSubmit
  const onPressLogo = actions?.onPressLogo ?? legacyOnPressLogo
  const onNativeCategoriesPress =
    actions?.onNativeCategoriesPress ?? legacyOnNativeCategoriesPress
  const onNativeAccountPress = actions?.onNativeAccountPress ?? legacyOnNativeAccountPress
  const showFooter = display?.showFooter ?? legacyShowFooter ?? true
  const showDesktopFooter = showFooter && Platform.OS === 'web' && isDesktop
  
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

  const resolvedBranding = useMemo<LayoutBranding>(
    () => {
      const fallbackBranding = shellContent?.branding ?? defaultShellContent.branding
      return {
        logoSrc: branding?.logoSrc ?? logoSrc ?? fallbackBranding?.logo.uri ?? '/brand-logo-placeholder.svg',
        logoAlt:
          branding?.logoAlt ??
          logoAlt ??
          (locale === 'ar' ? fallbackBranding?.logo.alt.ar : fallbackBranding?.logo.alt.en) ??
          'Real Cosmetics',
        logoSize: branding?.logoSize ?? logoSize ?? fallbackBranding?.logoSize,
      }
    },
    [branding, locale, logoAlt, logoSize, logoSrc, shellContent?.branding?.logo.alt.ar, shellContent?.branding?.logo.alt.en, shellContent?.branding?.logo.uri, shellContent?.branding?.logoSize]
  )

  const resolvedCampaign = useMemo<LayoutCampaign | undefined>(
    () => {
      if (campaign?.text || campaign?.link) {
        return campaign
      }
      if (campaignText || campaignLink) {
        return {
          text: campaignText,
          link: campaignLink,
        }
      }
      return undefined
    },
    [campaign, campaignLink, campaignText]
  )

  const resolvedCart = useMemo<LayoutCart>(
    () => ({
      count: cart?.count ?? cartCount ?? 0,
      items: cart?.items ?? cartItems ?? [],
      subtotal: cart?.subtotal ?? cartSubtotal ?? 0,
      loading: cart?.loading ?? cartLoading,
      error: cart?.error ?? cartError,
      feedbackKey: cart?.feedbackKey ?? cartFeedbackKey,
      onViewCart: cart?.onViewCart ?? onViewCart ?? (() => undefined),
      onCheckout: cart?.onCheckout ?? onCheckout ?? (() => undefined),
      onMobileCartNavigate: cart?.onMobileCartNavigate ?? onMobileCartNavigate ?? (() => undefined),
      onIncrease: cart?.onIncrease ?? onCartIncrease,
      onDecrease: cart?.onDecrease ?? onCartDecrease,
      onRemove: cart?.onRemove ?? onCartRemove,
    }),
    [cart, cartCount, cartError, cartFeedbackKey, cartItems, cartLoading, cartSubtotal, onCartDecrease, onCartIncrease, onCartRemove, onCheckout, onMobileCartNavigate, onViewCart]
  )

  const resolvedNavigation = useMemo<LayoutNavigation>(
    () => ({
      categories: navigation?.categories ?? categories ?? defaultCategories,
      salesItems: navigation?.salesItems ?? salesItems ?? defaultSalesItems,
      brandItems: navigation?.brandItems ?? brandItems ?? defaultBrandItems,
      footerLinks: navigation?.footerLinks ?? footerLinks ?? defaultFooterLinks,
      socialLinks: navigation?.socialLinks ?? socialLinks ?? defaultSocialLinks,
      bottomNavItems: navigation?.bottomNavItems ?? defaultBottomNavItems,
      activeBottomNavId: navigation?.activeBottomNavId,
      onBottomNavChange: navigation?.onBottomNavChange,
    }),
    [brandItems, categories, footerLinks, navigation, salesItems, socialLinks]
  )

  const resolvedNewsletter = useMemo<LayoutNewsletter>(
    () => {
      const fallbackFooter = shellContent?.footer ?? defaultShellContent.footer
      return {
        title: newsletter?.title ?? newsletterTitle ?? fallbackFooter?.newsletterTitle?.en ?? 'Stay in the loop',
        subtitle:
          newsletter?.subtitle ??
          newsletterSubtitle ??
          fallbackFooter?.newsletterSubtitle?.en ??
          'Get launches, offers, and skincare insights.',
      }
    },
    [newsletter, newsletterSubtitle, newsletterTitle, shellContent?.footer]
  )

  const handleBottomNavPress = (item: BottomNavItem) => {
    if (resolvedNavigation.onBottomNavChange) {
      resolvedNavigation.onBottomNavChange(item)
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

  // ── Header height offset (native only) ──────────────────────────────────
  // On web: Header manages its own sticky/fixed positioning internally.
  //         Layout must NOT wrap it in any positioned container — doing so
  //         creates a stacking context that breaks inner position:sticky children.
  //         Content needs no top padding; the header is in normal flow on web.
  // On native: Header is position:absolute at zIndex.sticky (set inside Header).
  //            Content must be padded by headerHeight to clear it.
  const desktopHeaderHeight =
    layout.header.topBarHeight + layout.header.mainRowHeight + layout.header.navRowHeight
  const mobileHeaderHeight = layout.header.mobileExpandedHeight
  const nativeHeaderHeight = isDesktop ? desktopHeaderHeight : mobileHeaderHeight
  const contentTopOffset = Platform.OS !== 'web' ? nativeHeaderHeight : 0

  return (
    <Box flex={1} bg='background' style={{ direction: dir }}>
      {/* Header — on web: normal flow, Header owns its own sticky/fixed layers.
                  on native: position:absolute handled inside Header.tsx */}
      <Header
        locale={locale}
        dir={dir}
        shellContent={resolvedShell}
        socialLinks={resolvedNavigation.socialLinks}
        campaignText={resolvedCampaign?.text}
        campaignLink={resolvedCampaign?.link}
        logoSrc={resolvedBranding.logoSrc}
        logoAlt={resolvedBranding.logoAlt}
        cartCount={resolvedCart.count}
        wishlistCount={wishlistCount}
        accountCount={accountCount}
        categories={resolvedNavigation.categories}
        cartItems={resolvedCart.items}
        cartSubtotal={resolvedCart.subtotal}
        cartLoading={resolvedCart.loading}
        cartError={resolvedCart.error}
        cartFeedbackKey={resolvedCart.feedbackKey}
        onViewCart={resolvedCart.onViewCart}
        onCheckout={resolvedCart.onCheckout}
        onMobileCartNavigate={resolvedCart.onMobileCartNavigate}
        onCartIncrease={resolvedCart.onIncrease}
        onCartDecrease={resolvedCart.onDecrease}
        onCartRemove={resolvedCart.onRemove}
        onSearchSubmit={onSearchSubmit}
        onLogoPress={onPressLogo}
        onLocaleChange={onLocaleChange}
        onNativeCategoriesPress={onNativeCategoriesPress}
        onNativeAccountPress={onNativeAccountPress}
      />

      {/* Content — padded top on native to clear absolute header */}
      <Box
        flex={1}
        style={{
          paddingTop: contentTopOffset,
          ...(showMobileBottomNav ? { paddingBottom: mobileContentBottomOffset } : {}),
        }}
      >
        {children}
      </Box>

      {showDesktopFooter ? (
        <Footer
          locale={locale}
          dir={dir}
          shellContent={resolvedShell}
          footerLinks={resolvedNavigation.footerLinks}
          socialLinks={resolvedNavigation.socialLinks}
          newsletterTitle={resolvedNewsletter.title}
          newsletterSubtitle={resolvedNewsletter.subtitle}
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
            backgroundColor: hovered ? c.surfaceMuted : c.surface,
            borderWidth: borderWidth.thin,
            borderColor: c.border,
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: hovered
              ? boxShadowStrings.lg
              : boxShadowStrings.md,
            transition: 'background-color 0.15s ease, box-shadow 0.15s ease',
          } as any)}
        >
          <ArrowUp size={18} color={c.textSecondary} weight='bold' />
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
            borderColor: c.border,
            backgroundColor: c.surface,
            flexDirection: 'row',
            justifyContent: 'space-between',
            minHeight: spacing['56'] + spacing.xxs + mobileBottomInset,
            paddingTop: spacing['6'],
            paddingBottom: spacing['6'] + mobileBottomInset,
          }}
        >
          {resolvedNavigation.bottomNavItems?.map((item) => {
            const active = resolvedNavigation.activeBottomNavId === item.id
            const label = locale === 'ar' ? item.label.ar : item.label.en
            return (
              <Pressable
                key={item.id}
                onPress={() => handleBottomNavPress(item)}
                style={{ flex: 1, paddingHorizontal: spacing['4'] }}
              >
                <Box style={{ alignItems: 'center', gap: spacing['4'] }}>
                  <Box style={{ position: 'relative' }}>
                    <Icon
                      name={toBottomNavIconName(item.id)}
                      size={22}
                      color={active ? c.textPrimary : c.textSecondary}
                      weight={active ? 'fill' : 'regular'}
                    />
                    {item.id === 'cart' && resolvedCart.count > 0 ? (
                      <Box
                        style={{
                          position: 'absolute',
                          top: -spacing['4'],
                          end: -spacing['6'],
                          minWidth: spacing.md,
                          height: spacing.md,
                          borderRadius: radius.full,
                          backgroundColor: c.brandPrimary,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text variant='meta' tone='inverse' weight='700'>
                          {resolvedCart.count > 9 ? '9+' : String(resolvedCart.count)}
                        </Text>
                      </Box>
                    ) : null}
                  </Box>
                  <Text
                    variant='meta'
                    tone={active ? 'default' : 'muted'}
                    weight={active ? '700' : '500'}
                  >
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

function toBottomNavIconName(id: string): 'home' | 'categories' | 'cart' | 'deals' | 'account' | 'wishlist' | 'star' | 'more' {
  if (id === 'home') return 'home'
  if (id === 'categories') return 'categories'
  if (id === 'brands') return 'star'
  if (id === 'cart') return 'cart'
  if (id === 'wishlist') return 'wishlist'
  if (id === 'deals') return 'deals'
  if (id === 'account') return 'account'
  return 'more'
}
