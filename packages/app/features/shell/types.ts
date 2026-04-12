export type NavItem = {
  id: string
  label: string
  href: string
  group?: string
  description?: string
}

export type CartLine = {
  id: string
  name: string
  quantity: number
  price: number
  currency: string
  imageUrl?: string
  brand?: string
}

export type FooterLink = {
  id: string
  label: string
  href: string
}

export type FooterColumn = {
  id: string
  title: string
  links: FooterLink[]
}

export type SocialLink = {
  id: string
  label: string
  href: string
}

export type LocaleCode = 'en' | 'ar'
export type Direction = 'ltr' | 'rtl'

export type LocalizedText = {
  en: string
  ar: string
}

export type UtilityBarItem = {
  id: string
  label: string
  href?: string
  highlight?: boolean
}

export type LogoSizeKey = 'sm' | 'md' | 'lg'

export type MenuAnalyticsConfig = {
  impressionKey?: string
  clickKey?: string
}

export type ShellMenuLink = {
  id: string
  label: string
  href: string
  description?: string
  analytics?: MenuAnalyticsConfig
  luxury?: boolean
}

export type ShellFeaturedSlot = {
  id: string
  type: 'banner' | 'product' | 'campaign'
  title?: string
  subtitle?: string
  ctaLabel?: string
  href?: string
  imageUrl?: string
  analytics?: MenuAnalyticsConfig
}

export type ShellBrandRail = {
  title?: string
  items: ShellMenuLink[]
  analytics?: MenuAnalyticsConfig
}

export type ShellMegaMenuColumn = {
  id: string
  label: string
  href?: string
  children: ShellMenuLink[]
  analytics?: MenuAnalyticsConfig
}

export type ShellMegaMenuSection = {
  id: string
  label: string
  href?: string
  description?: string
  columns: ShellMegaMenuColumn[]
  brandRail?: ShellBrandRail
  featuredSlot?: ShellFeaturedSlot
  analytics?: MenuAnalyticsConfig
}

export type ShellResolvedMenus = {
  headerPrimary?: ShellMenuLink[]
  headerMegaCategories?: {
    analytics?: MenuAnalyticsConfig
    sections: ShellMegaMenuSection[]
  }
}

export type ShellContent = {
  topBar?: {
    message?: LocalizedText
    secondaryMessage?: LocalizedText
    tertiaryMessage?: LocalizedText
    ctaLabel?: LocalizedText
    ctaHref?: string
    items?: Array<{
      id: string
      label: LocalizedText
      href?: string
      highlight?: boolean
    }>
  }
  branding?: {
    logo: {
      uri: string
      alt: LocalizedText
    }
    logoSize?: LogoSizeKey
  }
  navigation?: {
    categories?: Array<{
      id: string
      label: LocalizedText
      href: string
      group?: string
      description?: LocalizedText
    }>
    quickActions?: Array<{
      id: string
      label: LocalizedText
      href: string
    }>
    menus?: ShellResolvedMenus
  }
  footer?: {
    newsletterTitle?: LocalizedText
    newsletterSubtitle?: LocalizedText
    legalNotice?: LocalizedText
  }
  search?: {
    panelTitles?: {
      trendingSearches?: LocalizedText
      popularBrands?: LocalizedText
      recentSearches?: LocalizedText
      suggestions?: LocalizedText
      products?: LocalizedText
    }
    panelMessages?: {
      loadingSuggestions?: LocalizedText
      unavailableSuggestions?: LocalizedText
      noMatchingSuggestions?: LocalizedText
      noProductSuggestions?: LocalizedText
      noPopularBrands?: LocalizedText
      noRecentSearches?: LocalizedText
    }
    clearRecentLabel?: LocalizedText
  }
  mobileHeader?: {
    deliveryLabel?: LocalizedText
    deliveryLocation?: LocalizedText
    searchPlaceholder?: LocalizedText
    shortcuts?: Array<{
      id: string
      label: LocalizedText
      href: string
      icon?: 'categories' | 'product' | 'star' | 'trending' | 'gift' | 'deals'
    }>
  }
  statusPages?: {
    homeUnavailableTitle?: LocalizedText
    homeUnavailableSubtitle?: LocalizedText
    homeUnavailableCtaLabel?: LocalizedText
  }
}

export type BottomNavItem = {
  id: string
  label: LocalizedText
  href: string
}
