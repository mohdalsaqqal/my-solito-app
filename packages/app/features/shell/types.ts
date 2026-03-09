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

export type ShellContent = {
  topBar?: {
    message: LocalizedText
    secondaryMessage?: LocalizedText
    ctaLabel?: LocalizedText
    ctaHref?: string
  }
  branding?: {
    logo: {
      uri: string
      alt: LocalizedText
    }
  }
  navigation?: {
    categories?: Array<{
      id: string
      label: LocalizedText
      href: string
      group?: string
      description?: LocalizedText
    }>
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
}

export type BottomNavItem = {
  id: string
  label: LocalizedText
  href: string
}
