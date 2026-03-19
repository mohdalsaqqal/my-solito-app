import { Platform, useWindowDimensions } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { borderWidth, breakpoints, colors, layout, radius, spacing, zIndex } from '@real/tokens'
import {
  Box,
  CartDrawer,
  CategoryRow,
  HeaderMainRow,
  SearchPanel,
  Text,
  Touchable,
  TopPromoBar,
} from '@real/ui'
import { defaultQuickActions } from './defaults'
import { SearchSuggestion } from './searchMock'
import { useHeaderSearch } from './useHeaderSearch'
import { CartLine, Direction, LocaleCode, NavItem, ShellContent } from './types'
import { SocialLink } from './types'

type HeaderProps = {
  locale: LocaleCode
  dir: Direction
  shellContent?: ShellContent
  socialLinks?: SocialLink[]
  campaignText?: string
  campaignLink?: string
  logoSrc: string
  logoAlt: string
  cartCount: number
  wishlistCount?: number
  accountCount?: number
  categories: NavItem[]
  cartItems?: CartLine[]
  cartSubtotal?: number
  cartLoading?: boolean
  cartError?: string | null
  cartFeedbackKey?: number
  onViewCart?: () => void
  onCheckout?: () => void
  onCartIncrease?: (item: CartLine) => void | Promise<void>
  onCartDecrease?: (item: CartLine) => void | Promise<void>
  onCartRemove?: (item: CartLine) => void | Promise<void>
  onMobileCartNavigate?: () => void
  onCartClick?: () => void
  onSearchSubmit?: (query: string) => void
  onLogoPress?: () => void
  onLocaleChange?: (nextLocale: LocaleCode) => void
  onNativeAccountPress?: () => void
}

function textForLocale(value: { en: string; ar: string } | undefined, locale: LocaleCode, fallback: string) {
  if (!value) {
    return fallback
  }
  return locale === 'ar' ? value.ar : value.en
}

const ARABIC_LABELS = {
  account: 'الحساب',
  wishlist: 'المفضلة',
  cart: 'السلة',
  addedToCart: 'تمت الإضافة إلى السلة',
  searchProducts: 'ابحث عن منتج',
  searchProductsOrCategories: 'ابحث عن منتج أو فئة',
  scopePrefix: 'تصفح',
}

const ENGLISH_LABELS = {
  account: 'Account',
  wishlist: 'Wishlist',
  cart: 'Cart',
  addedToCart: 'Added to cart',
  searchProducts: 'Search products',
  searchProductsOrCategories: 'Search products or categories',
  scopePrefix: 'Browsing',
}

type MegaMenuGroup = {
  title: string
  links: string[]
}

const MEGA_MENU_CATEGORIES = [
  { id: 'skincare', label: 'Skincare' },
  { id: 'makeup', label: 'Makeup' },
  { id: 'hair', label: 'Hair' },
  { id: 'body', label: 'Body' },
  { id: 'fragrance', label: 'Fragrance' },
  { id: 'gift-sets', label: 'Gift Sets' },
] as const

const MEGA_MENU_DATA: Record<(typeof MEGA_MENU_CATEGORIES)[number]['id'], MegaMenuGroup[]> = {
  skincare: [
    { title: 'Shop by Type', links: ['Cleansers', 'Serums', 'Moisturizers', 'Sunscreen'] },
    { title: 'Skin Concerns', links: ['Acne', 'Dryness', 'Dark Spots', 'Anti Aging'] },
    { title: 'Featured', links: ['Korean Favorites', 'Derm Picks', 'Travel Minis', 'Gift Sets'] },
  ],
  makeup: [
    { title: 'Face', links: ['Foundation', 'Concealer', 'Powder', 'Blush'] },
    { title: 'Eyes', links: ['Mascara', 'Liner', 'Palettes', 'Brows'] },
    { title: 'Lips', links: ['Lipstick', 'Gloss', 'Tint', 'Liner'] },
  ],
  hair: [
    { title: 'Care', links: ['Shampoo', 'Conditioner', 'Masks', 'Scalp Care'] },
    { title: 'Styling', links: ['Heat Protect', 'Creams', 'Sprays', 'Oils'] },
    { title: 'Treatment', links: ['Repair', 'Volume', 'Curl Care', 'Color Safe'] },
  ],
  body: [
    { title: 'Bath', links: ['Body Wash', 'Scrubs', 'Soaps', 'Bath Oils'] },
    { title: 'Moisture', links: ['Lotions', 'Creams', 'Body Butter', 'Balms'] },
    { title: 'Care', links: ['Hand Care', 'Foot Care', 'Deodorant', 'SPF Body'] },
  ],
  fragrance: [
    { title: 'Women', links: ['Floral', 'Fresh', 'Sweet', 'Woody'] },
    { title: 'Men', links: ['Citrus', 'Aromatic', 'Amber', 'Leather'] },
    { title: 'Format', links: ['EDP', 'EDT', 'Travel Spray', 'Discovery Sets'] },
  ],
  'gift-sets': [
    { title: 'By Budget', links: ['Under $25', 'Under $50', 'Under $100', 'Luxury Gifts'] },
    { title: 'By Occasion', links: ['Birthday', 'Anniversary', 'Holiday', 'Thank You'] },
    { title: 'By Category', links: ['Skincare Kits', 'Makeup Kits', 'Fragrance Gifts', 'Body Gifts'] },
  ],
}

export function Header({
  locale,
  dir,
  shellContent,
  socialLinks = [],
  campaignText,
  campaignLink,
  logoSrc,
  logoAlt,
  cartCount,
  wishlistCount = 0,
  accountCount = 0,
  categories,
  cartItems = [],
  cartSubtotal = 0,
  cartLoading = false,
  cartError = null,
  cartFeedbackKey,
  onViewCart,
  onCheckout,
  onCartIncrease,
  onCartDecrease,
  onCartRemove,
  onMobileCartNavigate,
  onCartClick,
  onSearchSubmit,
  onLogoPress,
  onLocaleChange,
  onNativeAccountPress,
}: HeaderProps) {
  void logoSrc
  const { width } = useWindowDimensions()
  const isWeb = Platform.OS === 'web'
  const isDesktopViewport = width >= breakpoints.desktopMin
  // Keep first SSR/hydration pass deterministic on web to avoid mobile/desktop tree mismatch.
  const isDesktop = isDesktopViewport || (isWeb && width === 0)
  const [isPinned, setIsPinned] = useState(true)
  const [hasScrolled, setHasScrolled] = useState(false)
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false)
  const [showCartToast, setShowCartToast] = useState(false)
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false)
  const [activeMegaCategoryId, setActiveMegaCategoryId] = useState<(typeof MEGA_MENU_CATEGORIES)[number]['id']>(
    MEGA_MENU_CATEGORIES[0].id
  )
  const lastCartFeedbackKeyRef = useRef<number | undefined>(undefined)
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const labels = locale === 'ar' ? ARABIC_LABELS : ENGLISH_LABELS

  const {
    query,
    setQuery,
    open,
    setOpen,
    loading,
    error,
    suggestions,
    discovery,
    recents,
    selectSuggestion,
    selectRecent,
    commitSearch,
    clearRecents,
  } = useHeaderSearch()

  const promoText =
    campaignText ?? textForLocale(shellContent?.topBar?.message, locale, 'Free shipping on selected orders')
  const promoSecondaryText = textForLocale(shellContent?.topBar?.secondaryMessage, locale, '')
  const promoTertiaryText = textForLocale(shellContent?.topBar?.tertiaryMessage, locale, '')
  void campaignLink
  const cmsCategories = (shellContent?.navigation?.categories ?? []).flatMap((item) => {
    if (!item?.id || !item?.label) {
      return []
    }

    return [{
      id: item.id,
      label: locale === 'ar' ? item.label.ar : item.label.en,
      href: item.href ?? '#',
      group: item.group,
      description: item.description ? (locale === 'ar' ? item.description.ar : item.description.en) : undefined,
    }]
  })
  const cmsQuickActions = (shellContent?.navigation?.quickActions ?? []).flatMap((item) => {
    if (!item?.id || !item?.label) {
      return []
    }

    return [{
      id: item.id,
      label: locale === 'ar' ? item.label.ar : item.label.en,
      href: item.href ?? '#',
    }]
  })
  const effectiveCategories = cmsCategories.length > 0 ? cmsCategories : categories
  const effectiveQuickActions = cmsQuickActions.length > 0 ? cmsQuickActions : defaultQuickActions
  const searchCopy = {
    titles: {
      trendingSearches: textForLocale(shellContent?.search?.panelTitles?.trendingSearches, locale, locale === 'ar' ? 'عمليات البحث الرائجة' : 'Trending Searches'),
      popularBrands: textForLocale(shellContent?.search?.panelTitles?.popularBrands, locale, locale === 'ar' ? 'العلامات التجارية الشائعة' : 'Popular Brands'),
      recentSearches: textForLocale(shellContent?.search?.panelTitles?.recentSearches, locale, locale === 'ar' ? 'عمليات البحث الأخيرة' : 'Recent Searches'),
      suggestions: textForLocale(shellContent?.search?.panelTitles?.suggestions, locale, locale === 'ar' ? 'اقتراحات البحث' : 'Search Suggestions'),
      products: textForLocale(shellContent?.search?.panelTitles?.products, locale, locale === 'ar' ? 'المنتجات' : 'Products'),
    },
    messages: {
      loadingSuggestions: textForLocale(shellContent?.search?.panelMessages?.loadingSuggestions, locale, locale === 'ar' ? 'جاري تحميل الاقتراحات…' : 'Loading suggestions…'),
      unavailableSuggestions: textForLocale(shellContent?.search?.panelMessages?.unavailableSuggestions, locale, locale === 'ar' ? 'لا توجد اقتراحات حالياً.' : 'No suggestions right now.'),
      noMatchingSuggestions: textForLocale(shellContent?.search?.panelMessages?.noMatchingSuggestions, locale, locale === 'ar' ? 'لا توجد اقتراحات مطابقة.' : 'No matching suggestions.'),
      noProductSuggestions: textForLocale(shellContent?.search?.panelMessages?.noProductSuggestions, locale, locale === 'ar' ? 'لا توجد اقتراحات منتجات.' : 'No product suggestions.'),
      noPopularBrands: textForLocale(shellContent?.search?.panelMessages?.noPopularBrands, locale, locale === 'ar' ? 'لا توجد علامات شائعة.' : 'No popular brands.'),
      noRecentSearches: textForLocale(shellContent?.search?.panelMessages?.noRecentSearches, locale, locale === 'ar' ? 'لا توجد عمليات بحث حديثة.' : 'No recent searches.'),
    },
    clearRecentLabel: textForLocale(shellContent?.search?.clearRecentLabel, locale, locale === 'ar' ? 'مسح' : 'Clear'),
  }
  const pathname = isWeb ? (globalThis as { location?: { pathname?: string } }).location?.pathname ?? '/' : '/'
  const categoriesWithShop = [
    { id: 'cat-shop', label: locale === 'ar' ? 'تسوق' : 'Shop', href: '/shop' },
    ...effectiveCategories.filter((item) => item?.href && item.href !== '/shop'),
  ]
  const activeCategory = categoriesWithShop.find((item) => item.href && (pathname === item.href || pathname.startsWith(`${item.href}/`)))
  const activeQuickAction = effectiveQuickActions.find(
    (item) => item.href && (pathname === item.href || pathname.startsWith(`${item.href}/`))
  )
  const activeCategoryId = activeCategory?.id
  const activeQuickActionId = activeQuickAction?.id
  const activeMegaColumns = MEGA_MENU_DATA[activeMegaCategoryId] ?? MEGA_MENU_DATA.skincare
  const stickyBlockHeight = layout.header.mainRowHeight + layout.header.navRowHeight
  const mobileSearchPanelTopOffset = layout.header.mainRowHeight + spacing['40']
  const searchRegionId = 'header-search-region'
  const searchPanelRegionId = 'header-search-panel-region'
  const megaMenuPanelRegionId = 'header-mega-menu-panel-region'

  useEffect(() => {
    if (!isWeb || !isDesktop) {
      setIsPinned(false)
      return
    }

    let lastScrollY = 0
    let ticking = false

    const onScroll = () => {
      if (!ticking) {
        globalThis.requestAnimationFrame?.(() => {
          const scrollY = (globalThis as { scrollY?: number }).scrollY ?? 0
          const atTop = scrollY === 0
          setHasScrolled(!atTop)
          setIsPinned(atTop)
          lastScrollY = scrollY
          ticking = false
        })
        ticking = true
      }
    }

    onScroll()
    globalThis.addEventListener?.('scroll', onScroll, { passive: true })
    return () => globalThis.removeEventListener?.('scroll', onScroll)
  }, [isDesktop, isWeb])

  useEffect(() => {
    if (!isWeb || !open) {
      return
    }

    const doc = (globalThis as { document?: any }).document
    if (!doc) {
      return
    }

    const onPointerDown = (event: any) => {
      const region = doc.getElementById?.(searchRegionId)
      const panelRegion = doc.getElementById?.(searchPanelRegionId)
      const target = event?.target
      if (!target) {
        return
      }
      const insideHeaderRegion = region ? region.contains(target) : false
      const insidePanelRegion = panelRegion ? panelRegion.contains(target) : false
      if (!insideHeaderRegion && !insidePanelRegion) {
        setOpen(false)
      }
    }

    const onKeyDown = (event: any) => {
      if (event?.key === 'Escape') {
        setOpen(false)
      }
    }

    doc.addEventListener?.('pointerdown', onPointerDown, true)
    doc.addEventListener?.('mousedown', onPointerDown, true)
    doc.addEventListener?.('touchstart', onPointerDown, true)
    doc.addEventListener?.('keydown', onKeyDown)
    return () => {
      doc.removeEventListener?.('pointerdown', onPointerDown, true)
      doc.removeEventListener?.('mousedown', onPointerDown, true)
      doc.removeEventListener?.('touchstart', onPointerDown, true)
      doc.removeEventListener?.('keydown', onKeyDown)
    }
  }, [isWeb, open, setOpen])

  useEffect(() => {
    if (!isWeb || !isDesktop || !isMegaMenuOpen) {
      return
    }

    const doc = (globalThis as { document?: any }).document
    if (!doc) {
      return
    }

    const onPointerDown = (event: any) => {
      const triggerRegion = doc.getElementById?.(searchRegionId)
      const panelRegion = doc.getElementById?.(megaMenuPanelRegionId)
      const target = event?.target
      if (!target) {
        return
      }
      const insideTriggerRegion = triggerRegion ? triggerRegion.contains(target) : false
      const insidePanelRegion = panelRegion ? panelRegion.contains(target) : false
      if (!insideTriggerRegion && !insidePanelRegion) {
        setIsMegaMenuOpen(false)
      }
    }

    const onKeyDown = (event: any) => {
      if (event?.key === 'Escape') {
        setIsMegaMenuOpen(false)
      }
    }

    doc.addEventListener?.('pointerdown', onPointerDown, true)
    doc.addEventListener?.('mousedown', onPointerDown, true)
    doc.addEventListener?.('touchstart', onPointerDown, true)
    doc.addEventListener?.('keydown', onKeyDown)
    return () => {
      doc.removeEventListener?.('pointerdown', onPointerDown, true)
      doc.removeEventListener?.('mousedown', onPointerDown, true)
      doc.removeEventListener?.('touchstart', onPointerDown, true)
      doc.removeEventListener?.('keydown', onKeyDown)
    }
  }, [isDesktop, isMegaMenuOpen, isWeb])

  useEffect(() => {
    if (typeof cartFeedbackKey !== 'number') {
      return
    }
    if (lastCartFeedbackKeyRef.current === undefined) {
      lastCartFeedbackKeyRef.current = cartFeedbackKey
      return
    }
    if (lastCartFeedbackKeyRef.current !== cartFeedbackKey) {
      setShowCartToast(true)
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current)
      }
      toastTimeoutRef.current = setTimeout(() => {
        setShowCartToast(false)
      }, 1800)
      lastCartFeedbackKeyRef.current = cartFeedbackKey
    }
  }, [cartFeedbackKey])

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current)
      }
    }
  }, [])

  const scrollShadow = isWeb && hasScrolled
    ? '0 2px 8px rgba(14,10,10,0.06), 0 4px 18px rgba(14,10,10,0.07)'
    : 'none'

  const handleLogoPress = () => {
    if (onLogoPress) {
      onLogoPress()
      return
    }
    if (Platform.OS === 'web') {
      const win = (globalThis as { open?: (url?: string, target?: string) => void }).open
      win?.('/', '_self')
    }
  }

  const handleAccountPress = async () => {
    if (Platform.OS !== 'web') {
      onNativeAccountPress?.()
      return
    }
    try {
      const response = await fetch('/api/auth/session', {
        credentials: 'include',
        cache: 'no-store',
      })
      const payload = (await response.json().catch(() => null)) as
        | {
            success?: boolean
            data?: {
              userId?: string
              role?:
                | 'customer'
                | 'pharmacist'
                | 'admin'
                | 'marketing'
                | 'catalog'
                | 'support'
                | 'ops'
            } | null
          }
        | null
      const role = response.ok && payload?.success ? payload?.data?.role : undefined
      if (role === 'pharmacist') {
        navigateToHref('/pharmacist')
        return
      }
      if (
        role === 'admin' ||
        role === 'marketing' ||
        role === 'catalog' ||
        role === 'support' ||
        role === 'ops'
      ) {
        navigateToHref('/admin')
        return
      }
      const hasSession = Boolean(response.ok && payload?.success && payload?.data?.userId)
      navigateToHref(hasSession ? '/account' : '/auth/login?next=/account')
    } catch {
      navigateToHref('/auth/login?next=/account')
    }
  }

  const handleCategorySelect = (id: string) => {
    setOpen(false)
    setIsMegaMenuOpen(false)
  }

  const navigateToHref = (href?: string) => {
    if (!href || Platform.OS !== 'web') {
      return
    }
    const win = (globalThis as { open?: (url?: string, target?: string) => void }).open
    win?.(href, '_self')
  }

  const handleSelectSuggestion = (item: SearchSuggestion) => {
    selectSuggestion(item)
    navigateToHref(item.href)
  }

  const handleCommitSearch = () => {
    const normalized = query.trim()
    commitSearch()
    if (!normalized) {
      return
    }
    if (Platform.OS === 'web') {
      navigateToHref(`/search?q=${encodeURIComponent(normalized)}`)
      return
    }
    onSearchSubmit?.(normalized)
  }

  if (!isDesktop) {
    return (
      <Box
        style={{
          backgroundColor: colors.surface,
          direction: dir,
        }}
      >
        <Box style={{ position: 'relative' }}>
          <HeaderMainRow
            mobile
            logoText={logoAlt}
            onPressLogo={Platform.OS === 'web' ? undefined : handleLogoPress}
            logoHref='/'
            searchValue={query}
            searchPlaceholder={labels.searchProducts}
            onSearchChange={setQuery}
            onSearchFocus={() => setOpen(true)}
            onSearchBlur={() => setOpen(false)}
            onSearchSubmit={handleCommitSearch}
            searchRegionId={searchRegionId}
            localeLabel={locale.toUpperCase()}
            accountLabel={labels.account}
            wishlistLabel={labels.wishlist}
            cartLabel={labels.cart}
            onPressLocale={() => onLocaleChange?.(locale === 'ar' ? 'en' : 'ar')}
            onPressAccount={handleAccountPress}
            cartCount={cartCount}
            accountCount={accountCount}
            wishlistCount={wishlistCount}
            onPressCart={onMobileCartNavigate ?? onCartClick}
          />
          <SearchPanel
            open={open}
            query={query}
            panelRegionId={searchPanelRegionId}
            fixed
            topOffset={mobileSearchPanelTopOffset}
            onRequestClose={() => setOpen(false)}
            loading={loading}
            error={error}
            suggestions={suggestions}
            trendingSearches={discovery.trendingSearches}
            popularBrands={discovery.popularBrands}
            recents={recents}
            onSelectSuggestion={handleSelectSuggestion}
            onSelectRecent={selectRecent}
            onClearRecents={clearRecents}
            copy={searchCopy}
          />
        </Box>
        <CategoryRow
          items={categoriesWithShop}
          activeId={activeCategoryId}
          scopeLabel={activeCategory ? `${labels.scopePrefix}: ${activeCategory.label}` : undefined}
          mobile
          onSelect={handleCategorySelect}
        />
      </Box>
    )
  }

  if (isWeb && isDesktop) {
    return (
      <>
        {/* Top promo bar — collapses on scroll */}
        <div
          style={{
            maxHeight: isPinned ? `${layout.header.topBarHeight}px` : '0px',
            overflow: 'hidden',
            transition: 'max-height 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            direction: dir,
          }}
        >
          <TopPromoBar
            message={promoText}
            secondaryMessage={promoSecondaryText || undefined}
            tertiaryMessage={promoTertiaryText || undefined}
            socialItems={socialLinks}
            onPressSocial={(id) => {
              const item = socialLinks.find((entry) => entry.id === id)
              if (!item) return
              const win = (globalThis as { open?: (url?: string, target?: string, features?: string) => void }).open
              win?.(item.href, '_blank', 'noopener,noreferrer')
            }}
          />
        </div>

        {/* Main row + nav row — sticky at top */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: zIndex.sticky + 10,
            backgroundColor: colors.surface,
            boxShadow: scrollShadow,
            transition: 'box-shadow 0.2s ease',
            direction: dir,
          }}
        >
          {/* Main logo/search/cart row */}
          <div nativeID={searchRegionId} style={{ position: 'relative', zIndex: zIndex.searchTop + 2 } as any}>
            <HeaderMainRow
              variant='mega-search'
              logoText={logoAlt}
              onPressLogo={undefined}
              logoHref='/'
              searchValue={query}
              searchPlaceholder={locale === 'ar' ? 'ابحث في أكثر من 15,000 منتج...' : 'Search 15,000+ products...'}
              onSearchChange={setQuery}
              onSearchFocus={() => setOpen(true)}
              onSearchSubmit={handleCommitSearch}
              searchRegionId={undefined}
              localeLabel={locale.toUpperCase()}
              departmentsLabel={locale === 'ar' ? 'كل الفئات' : 'All Categories'}
              accountLabel={labels.account}
              wishlistLabel={labels.wishlist}
              cartLabel={labels.cart}
              onPressLocale={() => onLocaleChange?.(locale === 'ar' ? 'en' : 'ar')}
              onPressDepartments={() => {
                if (!isMegaMenuOpen) setActiveMegaCategoryId(MEGA_MENU_CATEGORIES[0].id)
                setIsMegaMenuOpen((c) => !c)
              }}
              onPressAccount={handleAccountPress}
              cartCount={cartCount}
              accountCount={accountCount}
              wishlistCount={wishlistCount}
              cartPulse={showCartToast}
              departmentsActive={isMegaMenuOpen}
              onPressCart={() => setCartDrawerOpen(true)}
            />
            <Box style={{ paddingHorizontal: spacing.pageX }}>
              <Box style={{ marginStart: '25%' as any, width: '50%' as any }}>
                <SearchPanel
                  open={open}
                  query={query}
                  panelRegionId={searchPanelRegionId}
                  compact
                  onRequestClose={() => setOpen(false)}
                  loading={loading}
                  error={error}
                  suggestions={suggestions}
                  trendingSearches={discovery.trendingSearches}
                  popularBrands={discovery.popularBrands}
                  recents={recents}
                  onSelectSuggestion={handleSelectSuggestion}
                  onSelectRecent={selectRecent}
                  onClearRecents={clearRecents}
                  copy={searchCopy}
                />
              </Box>
            </Box>
          </div>

          {/* Nav/quick-actions row — collapses on scroll */}
          <div
            style={{
              maxHeight: isPinned ? `${layout.header.navRowHeight}px` : '0px',
              overflow: 'hidden',
              transition: 'max-height 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <CategoryRow
              items={effectiveQuickActions}
              activeId={activeQuickActionId}
              variant='quickActions'
              onSelect={handleCategorySelect}
            />
          </div>

          {/* Mega menu */}
          {isMegaMenuOpen ? (
            <Box
              nativeID={megaMenuPanelRegionId}
              style={{
                borderTopWidth: borderWidth.thin,
                borderColor: colors.divider,
                backgroundColor: colors.surfaceMuted,
              }}
            >
              <Box
                style={{
                  width: '100%',
                  maxWidth: layout.containerMaxWidth,
                  alignSelf: 'center',
                  paddingHorizontal: spacing['16'],
                  paddingVertical: spacing['24'],
                  flexDirection: 'row',
                  gap: spacing['24'],
                }}
              >
                <Box
                  style={{
                    width: 220,
                    borderEndWidth: borderWidth.thin,
                    borderColor: colors.divider,
                    paddingEnd: spacing['16'],
                    gap: spacing['4'],
                  }}
                >
                  {MEGA_MENU_CATEGORIES.map((item) => {
                    const active = item.id === activeMegaCategoryId
                    return (
                      <Touchable
                        key={item.id}
                        onHoverIn={() => setActiveMegaCategoryId(item.id)}
                        onFocus={() => setActiveMegaCategoryId(item.id)}
                        onPress={() => setActiveMegaCategoryId(item.id)}
                      >
                        {({ hovered, focused }) => {
                          const interactive = active || hovered || focused
                          return (
                            <Box
                              style={{
                                minHeight: 40,
                                borderRadius: radius.md,
                                backgroundColor: interactive ? colors.brandPrimarySubtle : 'transparent',
                                paddingHorizontal: spacing['8'],
                                paddingVertical: spacing['8'],
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                              }}
                            >
                              <Text variant='bodySm' tone={interactive ? 'default' : 'muted'}>{item.label}</Text>
                              <Text variant='meta' tone={interactive ? 'default' : 'muted'}>v</Text>
                            </Box>
                          )
                        }}
                      </Touchable>
                    )
                  })}
                </Box>
                <Box style={{ flex: 1, flexDirection: 'row', gap: spacing['24'] }}>
                  {activeMegaColumns.map((group) => (
                    <Box key={group.title} style={{ flex: 1, gap: spacing['8'] }}>
                      <Text variant='meta' weight='700' style={{ textTransform: 'uppercase', letterSpacing: 1.2 }}>
                        {group.title}
                      </Text>
                      <Box style={{ gap: spacing['4'] }}>
                        {group.links.map((link) => (
                          <Touchable key={link} onPress={() => setIsMegaMenuOpen(false)}>
                            {({ hovered, focused }) => (
                              <Text tone={hovered || focused ? 'default' : 'muted'} variant='bodySm'>{link}</Text>
                            )}
                          </Touchable>
                        ))}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          ) : null}
        </div>

      {showCartToast ? (
        <Box
          accessibilityLiveRegion='polite'
          aria-live='polite'
          style={{
            position: 'fixed',
            top: isPinned ? layout.header.topBarHeight + spacing.sm : spacing.sm,
            end: spacing.pageX,
            zIndex: zIndex.searchTop + 5,
            borderWidth: borderWidth.thin,
            borderColor: colors.border,
            backgroundColor: colors.surface,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.xs,
            transition: 'top 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          } as any}
        >
          <Text variant='bodySm'>{labels.addedToCart}</Text>
        </Box>
      ) : null}

      <CartDrawer
        open={isDesktop && cartDrawerOpen}
        items={cartItems}
        subtotal={cartSubtotal}
        loading={cartLoading}
        error={cartError}
        onClose={() => setCartDrawerOpen(false)}
        onIncrease={onCartIncrease}
        onDecrease={onCartDecrease}
        onRemove={onCartRemove}
        onViewCart={() => {
          onViewCart?.()
          if (Platform.OS === 'web') {
            const currentPath =
              (globalThis as { location?: { pathname?: string } }).location?.pathname ?? ''
            if (currentPath !== '/cart') {
              const win = (globalThis as { open?: (url?: string, target?: string) => void }).open
              win?.('/cart', '_self')
            }
          }
        }}
        onCheckout={onCheckout ?? (() => undefined)}
      />
    </>
  )
  }

  return null
}

