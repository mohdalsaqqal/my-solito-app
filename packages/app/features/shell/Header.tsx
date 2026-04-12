import { Platform } from 'react-native'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { borderWidth, headerScrollShadow, layout, radius, spacing, zIndex } from '@real/tokens'
import {
  BottomNav,
  Box,
  CartDrawer,
  Icon,
  Input,
  MiniSearchBar,
  SearchOverlay,
  SearchPanel,
  Text,
} from '@real/ui'
import { Button as ReusableButton } from '@real/ui/reusables/button'
import { SearchSuggestion } from './searchMock'
import { useHeaderScroll } from './useHeaderScroll'
import { useHeaderSearch } from './useHeaderSearch'
import { HeaderMegaMenu } from './HeaderMegaMenu'
import {
  CartLine,
  Direction,
  LocaleCode,
  NavItem,
  ShellContent,
  ShellMegaMenuSection,
  ShellMenuLink,
  SocialLink,
} from './types'
import { useBreakpoint, useThemeColors } from '@real/ui/responsive'

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
  onNativeCategoriesPress?: () => void
  onNativeAccountPress?: () => void
}

type LocalizedText = {
  en: string
  ar: string
}

type MenuAnalyticsPayload = {
  key: string
  kind: 'impression' | 'click'
  zone: string
  menuId?: string
  itemId?: string
  href?: string
}

function textForLocale(value: { en: string; ar: string } | undefined, locale: LocaleCode, fallback: string) {
  if (!value) {
    return fallback
  }
  return locale === 'ar' ? value.ar : value.en
}

function emitMenuAnalytics(payload: MenuAnalyticsPayload) {
  if (Platform.OS !== 'web') {
    return
  }

  const win = globalThis as {
    dataLayer?: Array<Record<string, unknown>>
    dispatchEvent?: (event: Event) => void
    CustomEvent?: typeof CustomEvent
  }

  const eventName = payload.key
  win.dataLayer?.push({
    event: eventName,
    analyticsType: 'menu',
    kind: payload.kind,
    zone: payload.zone,
    menuId: payload.menuId,
    itemId: payload.itemId,
    href: payload.href,
  })

  if (typeof win.dispatchEvent === 'function' && typeof win.CustomEvent === 'function') {
    win.dispatchEvent(
      new win.CustomEvent('real-menu-analytics', {
        detail: {
          event: eventName,
          analyticsType: 'menu',
          kind: payload.kind,
          zone: payload.zone,
          menuId: payload.menuId,
          itemId: payload.itemId,
          href: payload.href,
        },
      }),
    )
  }
}

const ARABIC_LABELS = {
  account: '??????',
  wishlist: '???????',
  cart: '?????',
  addedToCart: '??? ????? ?????? ??? ?????',
  searchProducts: '???? ?? ????????',
  searchProductsOrCategories: '???? ?? ???????? ?? ??????',
  categories: '??????',
  notifications: '?????????',
  language: '?????',
  deliveryTo: '??????? ???',
  browseAll: '??? ????',
  featuredBrands: '???????? ???????',
  shopLuxury: '?????? ?????',
}

const ENGLISH_LABELS = {
  account: 'Account',
  wishlist: 'Wishlist',
  cart: 'Cart',
  addedToCart: 'Added to cart',
  searchProducts: 'Search products',
  searchProductsOrCategories: 'Search products or categories',
  categories: 'Categories',
  notifications: 'Notifications',
  language: 'Language',
  deliveryTo: 'Deliver to',
  browseAll: 'Browse all',
  featuredBrands: 'Featured brands',
  shopLuxury: 'Luxury products',
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

const MEGA_MENU_BRANDS: Record<(typeof MEGA_MENU_CATEGORIES)[number]['id'], string[]> = {
  skincare: ['CeraVe', 'La Roche-Posay', 'The Ordinary', 'Bioderma', 'Av�ne'],
  makeup: ['Maybelline', 'NYX', 'Huda Beauty', 'L�Or�al Paris', 'e.l.f.'],
  hair: ['K�rastase', 'Olaplex', 'L�Or�al Professionnel', 'Mielle', 'Garnier'],
  body: ['Sol de Janeiro', 'Nivea', 'Vaseline', 'Neutrogena', 'Dove'],
  fragrance: ['Dior', 'YSL', 'Lattafa', 'Armaf', 'Carolina Herrera'],
  'gift-sets': ['Laneige', 'Rare Beauty', 'Pixi', 'Bath & Body Works', 'Moroccanoil'],
}

const PRIMARY_BAR_LINKS: Array<{ id: string; href: string; label: LocalizedText; luxury?: boolean }> = [
  { id: 'new-arrivals', href: '/shop/new', label: { en: 'New arrivals', ar: '??? ??????' } },
  { id: 'best-selling', href: '/shop/best-sellers', label: { en: 'Best selling', ar: '?????? ??????' } },
  { id: 'flash-offers', href: '/sales', label: { en: 'Flash offers %', ar: '???? ???? %' } },
  { id: 'luxury', href: '/shop/luxury', label: { en: 'Luxury product', ar: '?????? ?????' }, luxury: true },
] as const

const SECONDARY_BAR_LINKS: Array<{ id: string; href: string; label: LocalizedText }> = [
  { id: 'loyalty', href: '/account/loyalty', label: { en: 'Loyalty points', ar: '???? ??????' } },
  { id: 'tests', href: '/account/tests', label: { en: 'Tests results', ar: '????? ????????' } },
] as const

const FALLBACK_HEADER_PRIMARY_LINKS: ShellMenuLink[] = PRIMARY_BAR_LINKS.map((item) => ({
  id: item.id,
  label: item.label.en,
  href: item.href,
  analytics: {
    impressionKey: `menu.header_primary.${item.id}.impression`,
    clickKey: `menu.header_primary.${item.id}.click`,
  },
  luxury: item.luxury,
}))

const FALLBACK_MEGA_MENU: {
  analytics: { impressionKey: string; clickKey: string }
  sections: ShellMegaMenuSection[]
} = {
  analytics: {
    impressionKey: 'menu.header_mega_categories.impression',
    clickKey: 'menu.header_mega_categories.click',
  },
  sections: MEGA_MENU_CATEGORIES.map((item) => ({
    id: item.id,
    label: item.label,
    description:
      item.id === 'skincare'
        ? 'Serums, moisturizers, and SPF.'
        : item.id === 'makeup'
          ? 'Face, eye, and lip essentials.'
          : item.id === 'hair'
            ? 'Care, repair, and styling.'
            : item.id === 'body'
              ? 'Bath, hydration, and daily care.'
              : item.id === 'fragrance'
                ? 'Signature scents and travel sprays.'
                : 'Ready-to-gift and seasonal sets.',
    analytics: {
      impressionKey: `menu.header_mega_categories.${item.id}.impression`,
      clickKey: `menu.header_mega_categories.${item.id}.click`,
    },
    columns: (MEGA_MENU_DATA[item.id] ?? []).map((group) => ({
      id: `${item.id}-${group.title.toLowerCase().replace(/\s+/g, '-')}`,
      label: group.title,
      analytics: {
        impressionKey: `menu.header_mega_categories.${item.id}.${group.title.toLowerCase().replace(/\s+/g, '_')}.impression`,
        clickKey: `menu.header_mega_categories.${item.id}.${group.title.toLowerCase().replace(/\s+/g, '_')}.click`,
      },
      children: group.links.map((link) => ({
        id: `${item.id}-${link.toLowerCase().replace(/\s+/g, '-')}`,
        label: link,
        href: '/categories',
        analytics: {
          impressionKey: `menu.header_mega_categories.${item.id}.${link.toLowerCase().replace(/\s+/g, '_')}.impression`,
          clickKey: `menu.header_mega_categories.${item.id}.${link.toLowerCase().replace(/\s+/g, '_')}.click`,
        },
      })),
    })),
    brandRail: {
      title: 'Featured brands',
      analytics: {
        impressionKey: `menu.header_mega_categories.${item.id}.brands.impression`,
        clickKey: `menu.header_mega_categories.${item.id}.brands.click`,
      },
      items: (MEGA_MENU_BRANDS[item.id] ?? []).map((brand) => ({
        id: `${item.id}-${brand.toLowerCase().replace(/[\s']+/g, '-')}`,
        label: brand,
        href: `/shop?brands=${encodeURIComponent(brand.toLowerCase().replace(/[\s']+/g, '-'))}`,
        analytics: {
          impressionKey: `menu.header_mega_categories.${item.id}.${brand.toLowerCase().replace(/[\s']+/g, '_')}.impression`,
          clickKey: `menu.header_mega_categories.${item.id}.${brand.toLowerCase().replace(/[\s']+/g, '_')}.click`,
        },
      })),
    },
  })),
}

function DesktopIconButton({
  icon,
  label,
  count,
  onPress,
  active = false,
}: {
  icon: 'account' | 'wishlist' | 'cart' | 'notification' | 'categories'
  label: string
  count?: number
  onPress?: () => void
  active?: boolean
}) {
  const c = useThemeColors()
  return (
    <ReusableButton onPress={onPress} variant='ghost' size='icon' accessibilityLabel={label}>
      <Box
        style={{
          width: 44,
          height: 44,
          borderRadius: radius.sm,
          backgroundColor: active ? c.surfaceMuted : c.surface,
          borderWidth: borderWidth.thin,
          borderColor: active ? c.textPrimary : c.divider,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box style={{ position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon} size={20} color={c.textPrimary} weight={active ? 'fill' : 'regular'} />
          {typeof count === 'number' && count > 0 ? (
            <Box
              style={{
                position: 'absolute',
                top: -8,
                end: -10,
                minWidth: 18,
                height: 18,
                borderRadius: radius.full,
                backgroundColor: c.brandPrimary,
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: spacing['4'],
              }}
            >
              <Text variant='meta' tone='inverse' weight='700'>
                {count > 9 ? '9+' : String(count)}
              </Text>
            </Box>
          ) : null}
        </Box>
      </Box>
    </ReusableButton>
  )
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
  onNativeCategoriesPress,
  onNativeAccountPress,
}: HeaderProps) {
  void logoSrc
  void socialLinks
  void categories
  const profile = useBreakpoint()
  const c = useThemeColors()
  const isWeb = Platform.OS === 'web'
  const isDesktop = profile.breakpoint === 'desktop'
  const { isAtTop } = useHeaderScroll()
  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false)
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false)
  const [showCartToast, setShowCartToast] = useState(false)
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false)
  const [activeMegaCategoryId, setActiveMegaCategoryId] = useState('')
  const [utilityActiveIndex, setUtilityActiveIndex] = useState(0)
  const lastCartFeedbackKeyRef = useRef<number | undefined>(undefined)
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const seenMenuImpressionsRef = useRef<Set<string>>(new Set())
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

  void campaignText
  void campaignLink
  const utilityItems =
    shellContent?.topBar?.items?.map((item) => ({
      id: item.id,
      label: locale === 'ar' ? item.label.ar : item.label.en,
      href: item.href,
      highlight: item.highlight,
    })) ?? []
  const deliveryLabel = textForLocale(shellContent?.mobileHeader?.deliveryLabel, locale, labels.deliveryTo)
  const deliveryLocation = textForLocale(shellContent?.mobileHeader?.deliveryLocation, locale, 'Home, Amman')
  const mobileSearchPlaceholder = textForLocale(shellContent?.mobileHeader?.searchPlaceholder, locale, labels.searchProducts)
  const searchCopy = {
    titles: {
      trendingSearches: textForLocale(shellContent?.search?.panelTitles?.trendingSearches, locale, locale === 'ar' ? '?????? ????? ???????' : 'Trending Searches'),
      popularBrands: textForLocale(shellContent?.search?.panelTitles?.popularBrands, locale, locale === 'ar' ? '???????? ???????? ???????' : 'Popular Brands'),
      recentSearches: textForLocale(shellContent?.search?.panelTitles?.recentSearches, locale, locale === 'ar' ? '?????? ????? ???????' : 'Recent Searches'),
      suggestions: textForLocale(shellContent?.search?.panelTitles?.suggestions, locale, locale === 'ar' ? '???????? ?????' : 'Search Suggestions'),
      products: textForLocale(shellContent?.search?.panelTitles?.products, locale, locale === 'ar' ? '????????' : 'Products'),
    },
    messages: {
      loadingSuggestions: textForLocale(shellContent?.search?.panelMessages?.loadingSuggestions, locale, locale === 'ar' ? '???? ????? ??????????...' : 'Loading suggestions...'),
      unavailableSuggestions: textForLocale(shellContent?.search?.panelMessages?.unavailableSuggestions, locale, locale === 'ar' ? '?? ???? ???????? ??????.' : 'No suggestions right now.'),
      noMatchingSuggestions: textForLocale(shellContent?.search?.panelMessages?.noMatchingSuggestions, locale, locale === 'ar' ? '?? ???? ???????? ??????.' : 'No matching suggestions.'),
      noProductSuggestions: textForLocale(shellContent?.search?.panelMessages?.noProductSuggestions, locale, locale === 'ar' ? '?? ???? ???????? ??????.' : 'No product suggestions.'),
      noPopularBrands: textForLocale(shellContent?.search?.panelMessages?.noPopularBrands, locale, locale === 'ar' ? '?? ???? ?????? ?????.' : 'No popular brands.'),
      noRecentSearches: textForLocale(shellContent?.search?.panelMessages?.noRecentSearches, locale, locale === 'ar' ? '?? ???? ?????? ??? ?????.' : 'No recent searches.'),
    },
    clearRecentLabel: textForLocale(shellContent?.search?.clearRecentLabel, locale, locale === 'ar' ? '???' : 'Clear'),
  }
  const resolvedHeaderPrimaryLinks =
    shellContent?.navigation?.menus?.headerPrimary?.length
      ? shellContent.navigation.menus.headerPrimary
      : FALLBACK_HEADER_PRIMARY_LINKS
  const resolvedHeaderMegaMenu =
    shellContent?.navigation?.menus?.headerMegaCategories?.sections?.length
      ? shellContent.navigation.menus.headerMegaCategories
      : FALLBACK_MEGA_MENU
  const megaSections = resolvedHeaderMegaMenu?.sections ?? []
  const activeMegaSection =
    megaSections.find((section) => section.id === activeMegaCategoryId) ?? megaSections[0]
  const activeMegaFeaturedSlot = activeMegaSection?.featuredSlot
  const menuVisible = isDesktop ? isMegaMenuOpen : false
  const mobileSearchPanelTopOffset = spacing['40'] + spacing['32']
  const searchRegionId = 'header-search-region'
  const searchPanelRegionId = 'header-search-panel-region'
  const megaMenuPanelRegionId = 'header-mega-menu-panel-region'

  const trackMenuEvent = (payload: MenuAnalyticsPayload) => {
    const analyticsKey = payload.kind === 'click' ? payload.key : `${payload.key}::${payload.zone}`
    if (payload.kind === 'impression') {
      if (seenMenuImpressionsRef.current.has(analyticsKey)) {
        return
      }
      seenMenuImpressionsRef.current.add(analyticsKey)
    }
    emitMenuAnalytics(payload)
  }

  useEffect(() => {
    if (!activeMegaCategoryId && megaSections.length > 0) {
      setActiveMegaCategoryId(megaSections[0].id)
      return
    }

    if (activeMegaCategoryId && !megaSections.some((section) => section.id === activeMegaCategoryId)) {
      setActiveMegaCategoryId(megaSections[0]?.id ?? '')
    }
  }, [activeMegaCategoryId, megaSections])

  useEffect(() => {
    if (!isDesktop) {
      setIsMegaMenuOpen(false)
    }
  }, [isDesktop])

  useEffect(() => {
    resolvedHeaderPrimaryLinks.forEach((item) => {
      if (!item.analytics?.impressionKey) {
        return
      }
      trackMenuEvent({
        key: item.analytics.impressionKey,
        kind: 'impression',
        zone: 'header_primary',
        itemId: item.id,
        href: item.href,
      })
    })
  }, [resolvedHeaderPrimaryLinks])

  useEffect(() => {
    if (!menuVisible || megaSections.length === 0) {
      return
    }

    if (resolvedHeaderMegaMenu?.analytics?.impressionKey) {
      trackMenuEvent({
        key: resolvedHeaderMegaMenu.analytics.impressionKey,
        kind: 'impression',
        zone: 'header_mega_categories',
      })
    }

    if (activeMegaSection?.analytics?.impressionKey) {
      trackMenuEvent({
        key: activeMegaSection.analytics.impressionKey,
        kind: 'impression',
        zone: 'header_mega_categories.section',
        itemId: activeMegaSection.id,
        href: activeMegaSection.href,
      })
    }

    if (activeMegaSection?.brandRail?.analytics?.impressionKey) {
      trackMenuEvent({
        key: activeMegaSection.brandRail.analytics.impressionKey,
        kind: 'impression',
        zone: 'header_mega_categories.brand_rail',
        itemId: activeMegaSection.id,
      })
    }

    if (activeMegaFeaturedSlot?.analytics?.impressionKey) {
      trackMenuEvent({
        key: activeMegaFeaturedSlot.analytics.impressionKey,
        kind: 'impression',
        zone: 'header_mega_categories.featured_slot',
        itemId: activeMegaFeaturedSlot.id,
        href: activeMegaFeaturedSlot.href,
      })
    }
  }, [activeMegaFeaturedSlot, activeMegaSection, megaSections.length, menuVisible, resolvedHeaderMegaMenu])

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

  // Utility bar center rotation
  useEffect(() => {
    if (utilityItems.length <= 1) return
    const timer = setInterval(() => {
      setUtilityActiveIndex((current) => (current + 1) % utilityItems.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [utilityItems.length])

  // Fix 2: reset search overlay when user scrolls back to top
  useEffect(() => {
    if (isAtTop && searchOverlayOpen) {
      setSearchOverlayOpen(false)
    }
  }, [isAtTop, searchOverlayOpen])

  // Fix 4: memoize slide-out div style (only re-creates when isAtTop changes)
  const slideOutStyle = useMemo(
    () => ({
      position: 'sticky' as const,
      top: 0,
      transform: isAtTop ? 'translateY(0)' : 'translateY(-100%)',
      transition: 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1)',
      zIndex: zIndex.sticky + 5,
      backgroundColor: c.surface,
    }),
    [isAtTop]
  )

  const scrollShadow = isWeb && !isAtTop ? headerScrollShadow : 'none'

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

  const handleMegaSectionPress = (section: ShellMegaMenuSection) => {
    setActiveMegaCategoryId(section.id)
    if (section.analytics?.clickKey) {
      trackMenuEvent({
        key: section.analytics.clickKey,
        kind: 'click',
        zone: 'header_mega_categories.section',
        itemId: section.id,
        href: section.href,
      })
    }
  }

  const handleMegaLinkPress = (link: {
    id: string
    href?: string
    analytics?: { clickKey?: string; impressionKey?: string }
  }) => {
    if (link.analytics?.clickKey) {
      trackMenuEvent({
        key: link.analytics.clickKey,
        kind: 'click',
        zone: 'header_mega_categories.link',
        itemId: link.id,
        href: link.href,
      })
    }
  }

  const handleBrandPress = (brand: {
    id: string
    href?: string
    analytics?: { clickKey?: string; impressionKey?: string }
  }) => {
    if (brand.analytics?.clickKey) {
      trackMenuEvent({
        key: brand.analytics.clickKey,
        kind: 'click',
        zone: 'header_mega_categories.brand_rail',
        itemId: brand.id,
        href: brand.href,
      })
    }
  }

  const handleFeaturedSlotPress = (slot: {
    id: string
    href?: string
    analytics?: { clickKey?: string; impressionKey?: string }
  }) => {
    if (slot.analytics?.clickKey) {
      trackMenuEvent({
        key: slot.analytics.clickKey,
        kind: 'click',
        zone: 'header_mega_categories.featured_slot',
        itemId: slot.id,
        href: slot.href,
      })
    }
  }

  if (!isDesktop) {
    return (
      <Box style={{ backgroundColor: c.surface, direction: dir }}>
        {isWeb ? (
          <div style={slideOutStyle as any}>
            <Box
              style={{
                backgroundColor: c.surface,
                borderBottomWidth: borderWidth.thin,
                borderColor: c.divider,
              }}
            >
              <Box
                style={{
                  minHeight: 34,
                  paddingHorizontal: spacing.pageX,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: c.inkBlack,
                }}
              >
                <Text variant='meta' tone='inverse'>
                  {deliveryLabel}
                </Text>
                <Text variant='meta' tone='inverse' weight='700'>
                  {deliveryLocation}
                </Text>
              </Box>
              <Box
                style={{
                  minHeight: 72,
                  paddingHorizontal: spacing.pageX,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing['10'],
                }}
              >
                <Box style={{ flex: 1 }}>
                  <Box nativeID={searchRegionId} style={{ position: 'relative' }}>
                    <Box style={{ position: 'absolute', start: spacing['12'], top: 13, zIndex: 1 }}>
                      <Icon name='search' size={18} color={c.textSecondary} />
                    </Box>
                    <Input
                      value={query}
                      onChangeText={setQuery}
                      onFocus={() => setSearchOverlayOpen(true)}
                      onSubmitEditing={handleCommitSearch}
                      accessibilityLabel={labels.searchProducts}
                      radiusKey='full'
                      placeholder={mobileSearchPlaceholder}
                      style={{
                        minHeight: 46,
                        height: 46,
                        paddingStart: spacing['40'],
                        paddingEnd: spacing['16'],
                        backgroundColor: c.surfaceMuted,
                        borderColor: c.divider,
                      }}
                    />
                  </Box>
                </Box>
                <DesktopIconButton
                  icon='categories'
                  label={labels.categories}
                  onPress={() => navigateToHref('/categories')}
                />
                <DesktopIconButton icon='notification' label={labels.notifications} onPress={handleAccountPress} />
              </Box>
            </Box>
          </div>
        ) : (
          <Box
            style={{
              backgroundColor: c.surface,
              borderBottomWidth: borderWidth.thin,
              borderColor: c.divider,
            }}
          >
            <Box
              style={{
                minHeight: 34,
                paddingHorizontal: spacing.pageX,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: c.inkBlack,
              }}
            >
              <Text variant='meta' tone='inverse'>
                {deliveryLabel}
              </Text>
              <Text variant='meta' tone='inverse' weight='700'>
                {deliveryLocation}
              </Text>
            </Box>
            <Box
              style={{
                minHeight: 72,
                paddingHorizontal: spacing.pageX,
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing['10'],
              }}
            >
              <Box style={{ flex: 1 }}>
                <Box nativeID={searchRegionId} style={{ position: 'relative' }}>
                  <Box style={{ position: 'absolute', start: spacing['12'], top: 13, zIndex: 1 }}>
                    <Icon name='search' size={18} color={c.textSecondary} />
                  </Box>
                  <Input
                    value={query}
                    onChangeText={setQuery}
                    onFocus={() => setOpen(true)}
                    onBlur={() => setOpen(false)}
                    onSubmitEditing={handleCommitSearch}
                    accessibilityLabel={labels.searchProducts}
                    radiusKey='full'
                    placeholder={mobileSearchPlaceholder}
                    style={{
                      minHeight: 46,
                      height: 46,
                      paddingStart: spacing['40'],
                      paddingEnd: spacing['16'],
                      backgroundColor: c.surfaceMuted,
                      borderColor: c.divider,
                    }}
                  />
                </Box>
              </Box>
              <DesktopIconButton
                icon='categories'
                label={labels.categories}
                onPress={() => onNativeCategoriesPress?.()}
              />
              <DesktopIconButton icon='notification' label={labels.notifications} onPress={handleAccountPress} />
            </Box>
            <Box style={{ position: 'relative', paddingHorizontal: spacing.pageX, paddingBottom: spacing['12'] }}>
              <SearchPanel
                open={open}
                query={query}
                panelRegionId={searchPanelRegionId}
                fixed={false}
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
          </Box>
        )}

        {isWeb ? (
          <div
            style={{
              position: 'fixed' as any,
              top: 0,
              left: 0,
              right: 0,
              zIndex: zIndex.sticky + 4,
              opacity: isAtTop ? 0 : 1,
              pointerEvents: isAtTop ? 'none' : 'auto',
              transition: 'opacity 300ms cubic-bezier(0.16, 1, 0.3, 1)',
            } as any}
          >
            <MiniSearchBar placeholder={mobileSearchPlaceholder} onPress={() => setSearchOverlayOpen(true)} dir={dir} />
          </div>
        ) : null}

        {isWeb ? (
          <SearchOverlay
            open={searchOverlayOpen}
            query={query}
            placeholder={labels.searchProductsOrCategories}
            onClose={() => setSearchOverlayOpen(false)}
            onQueryChange={setQuery}
            onSubmit={() => {
              setSearchOverlayOpen(false)
              handleCommitSearch()
            }}
            onSelectSuggestion={(item) => {
              setSearchOverlayOpen(false)
              handleSelectSuggestion(item as SearchSuggestion)
            }}
            suggestions={suggestions}
            loading={loading}
            error={error}
            dir={dir}
          />
        ) : null}

        {isWeb ? (
          <div
            style={{
              position: 'fixed' as any,
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: zIndex.sticky + 20,
            }}
          >
            <BottomNav
              activeTab='home'
              cartCount={cartCount}
              onPressTab={(tab) => navigateToHref(tab === 'home' ? '/' : `/${tab}`)}
            />
          </div>
        ) : (
          <BottomNav
            activeTab='home'
            cartCount={cartCount}
            onPressTab={(tab) => navigateToHref(tab === 'home' ? '/' : `/${tab}`)}
          />
        )}
      </Box>
    )
  }

  if (isWeb && isDesktop) {
    return (
      <>
        <div
          style={{
            maxHeight: isAtTop ? `${layout.header.topBarHeight}px` : '0px',
            overflow: 'hidden',
            transition: 'max-height 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            direction: dir,
            backgroundColor: c.inkBlack,
          }}
        >
          <Box
            style={{
              width: '100%',
              maxWidth: layout.containerMaxWidth,
              alignSelf: 'center',
              minHeight: layout.header.topBarHeight,
              paddingHorizontal: spacing.pageX,
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing['16'],
            }}
          >
            {/* LEFT: utility links */}
            <Box style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing['12'], flexWrap: 'wrap' }}>
              {utilityItems.map((item, index) => (
                <Box key={item.id} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['12'] }}>
                  {item.href ? (
                    <ReusableButton href={item.href} variant='ghost' size='sm'>
                      <Text variant='meta' tone='inverse' weight='700'>
                        {item.label}
                      </Text>
                    </ReusableButton>
                  ) : (
                    <Text variant='meta' tone='inverse' weight='700'>
                      {item.label}
                    </Text>
                  )}
                  {index < utilityItems.length - 1 ? (
                    <Text variant='meta' tone='inverse' style={{ opacity: 0.35 }}>
                      |
                    </Text>
                  ) : null}
                </Box>
              ))}
            </Box>
            {/* CENTER: rotating campaign line */}
            <Box style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              {utilityItems.length > 0 ? (
                <Text variant='meta' tone='inverse' weight='700' style={{ textAlign: 'center' }}>
                  {utilityItems[utilityActiveIndex % Math.max(1, utilityItems.length)]?.label ?? ''}
                </Text>
              ) : null}
            </Box>
            {/* RIGHT: delivery location + language toggle */}
            <Box style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: spacing['12'] }}>
              <ReusableButton href='/account/addresses' variant='ghost' size='sm'>
                <Box style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['6'] }}>
                  <Icon name='location' size={14} color={c.textInverted} />
                  <Text variant='meta' tone='inverse'>
                    {deliveryLocation}
                  </Text>
                </Box>
              </ReusableButton>
              <Text variant='meta' tone='inverse' style={{ opacity: 0.35 }}>|</Text>
              <ReusableButton
                onPress={() => onLocaleChange?.(locale === 'ar' ? 'en' : 'ar')}
                variant='ghost'
                size='sm'
                accessibilityLabel={labels.language}
              >
                <Text variant='meta' tone='inverse' weight='700'>
                  {locale.toUpperCase()}
                </Text>
              </ReusableButton>
            </Box>
          </Box>
        </div>

        {/* Main row + nav row � sticky at top */}
        <div
          data-shell-breakpoint={profile.breakpoint}
          style={{
            position: 'sticky',
            top: 0,
            zIndex: zIndex.sticky + 10,
            backgroundColor: c.surface,
            boxShadow: scrollShadow,
            transition: 'box-shadow 0.2s ease',
            direction: dir,
          }}
        >
          <Box
            id={searchRegionId}
            style={{
              width: '100%',
              maxWidth: layout.containerMaxWidth,
              alignSelf: 'center',
              paddingHorizontal: spacing.pageX,
              minHeight: 88,
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing['12'],
            }}
          >
            <ReusableButton onPress={handleLogoPress} variant='ghost' size='default'>
              <Box style={{ minWidth: 156, gap: spacing['4'] }}>
                <Text variant='title' weight='700'>
                  {logoAlt}
                </Text>
                <Text variant='meta' tone='muted'>
                  {locale === 'ar' ? '????? ??????? ??????' : 'Your daily beauty destination'}
                </Text>
              </Box>
            </ReusableButton>

            <ReusableButton
              onPress={() => {
                if (megaSections.length === 0) {
                  navigateToHref('/categories')
                  return
                }
                if (!isMegaMenuOpen) setActiveMegaCategoryId(megaSections[0]?.id ?? '')
                setIsMegaMenuOpen((current) => !current)
              }}
              variant='ghost'
              size='default'
              accessibilityLabel={labels.categories}
            >
              <Box
                style={{
                  minWidth: 156,
                  minHeight: 48,
                  borderRadius: radius.full,
                  backgroundColor: c.textPrimary,
                  paddingHorizontal: spacing['16'],
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: spacing['8'],
                }}
              >
                <Box style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['8'] }}>
                  <Icon name='categories' size={18} color={c.textInverted} />
                  <Text tone='inverse' weight='700'>
                    {labels.categories}
                  </Text>
                </Box>
                <Icon name={isMegaMenuOpen ? 'caretDown' : 'caretRight'} size={14} color={c.textInverted} />
              </Box>
            </ReusableButton>

            <Box style={{ flex: 1, position: 'relative' }}>
              <Box style={{ position: 'absolute', start: spacing['12'], top: 14, zIndex: 1 }}>
                <Icon name='search' size={18} color={c.textSecondary} />
              </Box>
              <Input
                value={query}
                onChangeText={setQuery}
                onFocus={() => setOpen(true)}
                onSubmitEditing={handleCommitSearch}
                accessibilityLabel={labels.searchProducts}
                radiusKey='full'
                placeholder={locale === 'ar' ? '???? ?? ???? ?? 15000 ????' : 'Search 15,000+ products, brands, and routines'}
                style={{
                  minHeight: 48,
                  height: 48,
                  paddingStart: spacing['40'],
                  paddingEnd: spacing['16'],
                  backgroundColor: c.surfaceMuted,
                  borderColor: c.divider,
                }}
              />
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

            <Box style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['10'] }}>
              <DesktopIconButton icon='account' label={labels.account} onPress={handleAccountPress} />
              <DesktopIconButton icon='wishlist' label={labels.wishlist} count={wishlistCount} onPress={() => navigateToHref('/wishlist')} />
              <DesktopIconButton icon='cart' label={labels.cart} count={cartCount} active={showCartToast} onPress={() => setCartDrawerOpen(true)} />
            </Box>
          </Box>

          <Box
            style={{
              borderTopWidth: borderWidth.thin,
              borderBottomWidth: borderWidth.thin,
              borderColor: c.divider,
              backgroundColor: c.surfaceLowest,
            }}
          >
            <Box
              style={{
                width: '100%',
                maxWidth: layout.containerMaxWidth,
                alignSelf: 'center',
                minHeight: 52,
                paddingHorizontal: spacing.pageX,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: spacing['16'],
              }}
            >
              <Box style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['12'] }}>
                {resolvedHeaderPrimaryLinks.map((item) => (
                  <ReusableButton
                    key={item.id}
                    href={item.href}
                    onPress={() => {
                      if (item.analytics?.clickKey) {
                        trackMenuEvent({
                          key: item.analytics.clickKey,
                          kind: 'click',
                          zone: 'header_primary',
                          itemId: item.id,
                          href: item.href,
                        })
                      }
                    }}
                    variant='ghost'
                    size='sm'
                  >
                    <Box
                      style={{
                        minHeight: 44,
                        paddingHorizontal: spacing['12'],
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text variant='bodySm' weight='700' tone={item.luxury ? 'primary' : 'default'}>
                        {item.luxury ? '? ' : ''}{item.label}
                      </Text>
                    </Box>
                  </ReusableButton>
                ))}
              </Box>

              <Box style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['8'] }}>
                {SECONDARY_BAR_LINKS.map((item) => (
                  <ReusableButton key={item.id} href={item.href} variant='ghost' size='sm'>
                    <Box style={{ minHeight: 44, paddingHorizontal: spacing['8'], flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                      <Text variant='bodySm' weight='700' tone='muted'>
                        {locale === 'ar' ? item.label.ar : item.label.en}
                      </Text>
                    </Box>
                  </ReusableButton>
                ))}
              </Box>
            </Box>
          </Box>

          {/* Mega menu */}
          {isMegaMenuOpen ? (
            <HeaderMegaMenu
              activeSectionId={activeMegaCategoryId}
              browseAllLabel={labels.browseAll}
              featuredBrandsLabel={labels.featuredBrands}
              panelRegionId={megaMenuPanelRegionId}
              sections={megaSections}
              onClose={() => setIsMegaMenuOpen(false)}
              onSectionHover={setActiveMegaCategoryId}
              onSectionPress={handleMegaSectionPress}
              onLinkPress={handleMegaLinkPress}
              onBrandPress={handleBrandPress}
              onFeaturedSlotPress={handleFeaturedSlotPress}
            />
          ) : null}
        </div>

      {showCartToast ? (
        <Box
          accessibilityLiveRegion='polite'
          aria-live='polite'
          style={{
            position: 'fixed',
            top: isAtTop ? layout.header.topBarHeight + spacing.sm : spacing.sm,
            end: spacing.pageX,
            zIndex: zIndex.searchTop + 5,
            borderWidth: borderWidth.thin,
            borderColor: c.border,
            backgroundColor: c.surface,
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


