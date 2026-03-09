import { Platform, useWindowDimensions } from 'react-native'
import { useEffect, useRef, useState } from 'react'
import { borderWidth, breakpoints, colors, layout, shadows, spacing, zIndex } from '@real/tokens'
import {
  Box,
  CartDrawer,
  CategoryRow,
  HeaderMainRow,
  SearchPanel,
  Text,
  TopPromoBar,
} from '@real/ui'
import { SearchSuggestion } from './searchMock'
import { useHeaderSearch } from './useHeaderSearch'
import { CartLine, Direction, LocaleCode, NavItem, ShellContent } from './types'

type HeaderProps = {
  locale: LocaleCode
  dir: Direction
  shellContent?: ShellContent
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
}

function textForLocale(value: { en: string; ar: string } | undefined, locale: LocaleCode, fallback: string) {
  if (!value) {
    return fallback
  }
  return locale === 'ar' ? value.ar : value.en
}

function resolveCampaignHref(candidate: string | undefined) {
  if (!candidate) {
    return undefined
  }
  const normalized = candidate.trim()
  if (!normalized) {
    return undefined
  }
  if (normalized.startsWith('/') || normalized.startsWith('http://') || normalized.startsWith('https://')) {
    return normalized
  }
  return undefined
}

const ARABIC_LABELS = {
  account: 'الحساب',
  wishlist: 'المفضلة',
  cart: 'السلة',
  searchProducts: 'ابحث عن منتج',
  searchProductsOrCategories: 'ابحث عن منتج أو فئة',
  scopePrefix: 'تصفح',
}

const ENGLISH_LABELS = {
  account: 'Account',
  wishlist: 'Wishlist',
  cart: 'Cart',
  searchProducts: 'Search products',
  searchProductsOrCategories: 'Search products or categories',
  scopePrefix: 'Browsing',
}

export function Header({
  locale,
  dir,
  shellContent,
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
}: HeaderProps) {
  void logoSrc
  const { width } = useWindowDimensions()
  const isWeb = Platform.OS === 'web'
  const isDesktopViewport = width >= breakpoints.desktopMin
  // Keep first SSR/hydration pass deterministic on web to avoid mobile/desktop tree mismatch.
  const isDesktop = isDesktopViewport || (isWeb && width === 0)
  const [isPinned, setIsPinned] = useState(false)
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false)
  const [showCartToast, setShowCartToast] = useState(false)
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
  const promoCtaLabel = textForLocale(shellContent?.topBar?.ctaLabel, locale, locale === 'ar' ? 'تسوق الآن' : 'Shop now')
  const promoCtaHref = resolveCampaignHref(campaignLink) ?? shellContent?.topBar?.ctaHref
  const cmsCategories = (shellContent?.navigation?.categories ?? []).map((item) => ({
    id: item.id,
    label: locale === 'ar' ? item.label.ar : item.label.en,
    href: item.href,
    group: item.group,
    description: item.description ? (locale === 'ar' ? item.description.ar : item.description.en) : undefined,
  }))
  const effectiveCategories = cmsCategories.length > 0 ? cmsCategories : categories
  const searchCopy = {
    titles: {
      trendingSearches: textForLocale(shellContent?.search?.panelTitles?.trendingSearches, locale, locale === 'ar' ? 'عمليات البحث الرائجة' : 'Trending Searches'),
      popularBrands: textForLocale(shellContent?.search?.panelTitles?.popularBrands, locale, locale === 'ar' ? 'العلامات التجارية الشائعة' : 'Popular Brands'),
      recentSearches: textForLocale(shellContent?.search?.panelTitles?.recentSearches, locale, locale === 'ar' ? 'عمليات البحث الأخيرة' : 'Recent Searches'),
      suggestions: textForLocale(shellContent?.search?.panelTitles?.suggestions, locale, locale === 'ar' ? 'اقتراحات البحث' : 'Search Suggestions'),
      products: textForLocale(shellContent?.search?.panelTitles?.products, locale, locale === 'ar' ? 'المنتجات' : 'Products'),
    },
    messages: {
      loadingSuggestions: textForLocale(shellContent?.search?.panelMessages?.loadingSuggestions, locale, locale === 'ar' ? 'جاري تحميل الاقتراحات...' : 'Loading suggestions...'),
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
    ...effectiveCategories.filter((item) => item.href !== '/shop'),
  ]
  const activeCategory = categoriesWithShop.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
  const activeCategoryId = activeCategory?.id
  const scopeLabel = activeCategory ? `${labels.scopePrefix}: ${activeCategory.label}` : undefined
  const stickyBlockHeight = layout.header.mainRowHeight + layout.header.navRowHeight
  const searchRegionId = 'header-search-region'
  const searchPanelRegionId = 'header-search-panel-region'

  useEffect(() => {
    if (!isWeb || !isDesktop) {
      setIsPinned(false)
      return
    }

    const onScroll = () => {
      const scrollY = (globalThis as { scrollY?: number }).scrollY ?? 0
      setIsPinned(scrollY > layout.header.topBarHeight)
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

  const stickyStyle =
    isDesktop && isWeb
      ? ({
          position: isPinned ? 'fixed' : 'relative',
          top: isPinned ? 0 : undefined,
          start: isPinned ? 0 : undefined,
          end: isPinned ? 0 : undefined,
          zIndex: zIndex.searchTop + 1,
          backgroundColor: colors.surface,
        } as any)
      : null

  const handlePromoCtaPress = () => {
    if (!promoCtaHref) {
      return
    }
    if (Platform.OS === 'web') {
      const win = (globalThis as { open?: (url?: string, target?: string) => void }).open
      win?.(promoCtaHref, '_self')
      return
    }
  }

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
    if (Platform.OS !== 'web') {
      return
    }
    const selected = categoriesWithShop.find((item) => item.id === id)
    if (!selected?.href) {
      return
    }
    const win = (globalThis as { open?: (url?: string, target?: string) => void }).open
    win?.(selected.href, '_self')
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
            onPressLogo={handleLogoPress}
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
            topOffset={layout.header.mainRowHeight + spacing['8']}
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
            scopeLabel={scopeLabel}
            mobile
            onSelect={handleCategorySelect}
          />
      </Box>
    )
  }

  return (
    <Box style={{ direction: dir, position: 'relative', zIndex: zIndex.searchTop + 2 }}>
      <TopPromoBar
        message={promoText}
        secondaryMessage={promoSecondaryText || undefined}
        ctaLabel={promoCtaLabel}
        onPressCta={handlePromoCtaPress}
      />

      {isPinned ? <Box style={{ height: stickyBlockHeight }} /> : null}
      <Box style={stickyStyle}>
        <Box nativeID={searchRegionId} style={{ position: 'relative', zIndex: zIndex.searchTop + 2 }}>
          <HeaderMainRow
            logoText={logoAlt}
            onPressLogo={handleLogoPress}
            searchValue={query}
            searchPlaceholder={labels.searchProductsOrCategories}
            onSearchChange={setQuery}
            onSearchFocus={() => setOpen(true)}
            onSearchSubmit={handleCommitSearch}
            searchRegionId={undefined}
            localeLabel={locale.toUpperCase()}
            accountLabel={labels.account}
            wishlistLabel={labels.wishlist}
            cartLabel={labels.cart}
            onPressLocale={() => onLocaleChange?.(locale === 'ar' ? 'en' : 'ar')}
            onPressAccount={handleAccountPress}
            cartCount={cartCount}
            accountCount={accountCount}
            wishlistCount={wishlistCount}
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
        </Box>

        <Box style={shadows.sm}>
          <CategoryRow
            items={categoriesWithShop}
            activeId={activeCategoryId}
            scopeLabel={scopeLabel}
            onSelect={handleCategorySelect}
          />
        </Box>
      </Box>

      {showCartToast ? (
        <Box
          style={{
            position: 'fixed',
            top: layout.header.topBarHeight + spacing.sm,
            end: spacing.pageX,
            zIndex: zIndex.searchTop + 5,
            borderWidth: borderWidth.thin,
            borderColor: colors.border,
            backgroundColor: colors.surface,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.xs,
          } as any}
        >
          <Text variant='bodySm'>Added to cart</Text>
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
    </Box>
  )
}
