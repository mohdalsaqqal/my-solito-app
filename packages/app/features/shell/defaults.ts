import { BottomNavItem, FooterColumn, NavItem, ShellContent, SocialLink } from './types'

export const defaultCategories: NavItem[] = [
  { id: 'cat-luxury-brands', label: 'Luxury Brands', href: '/shop/categories/luxury-brands' },
  { id: 'cat-flash-sale', label: '% Flash Sale', href: '/sales' },
  { id: 'cat-skincare', label: 'Skincare', href: '/shop/categories/skincare' },
  { id: 'cat-makeup', label: 'Makeup', href: '/shop/categories/makeup' },
  { id: 'cat-haircare', label: 'Haircare', href: '/shop/categories/haircare' },
  { id: 'cat-wellness', label: 'Wellness', href: '/shop/categories/wellness' },
]

// Kept for API compatibility with existing route imports.
export const defaultSalesItems: NavItem[] = [
  { id: 'sale-main', label: '% Sale', href: '/sales' },
]

// Kept for API compatibility with existing route imports.
export const defaultBrandItems: NavItem[] = [
  { id: 'brand-main', label: 'Brands', href: '/brands' },
]

export const defaultFooterLinks: FooterColumn[] = [
  {
    id: 'about',
    title: 'About',
    links: [
      { id: 'about-us', label: 'About us', href: '/about' },
      { id: 'contact', label: 'Contact', href: '/contact' },
    ],
  },
  {
    id: 'shop',
    title: 'Shop',
    links: [
      { id: 'all-products', label: 'All products', href: '/shop' },
      { id: 'new-arrivals', label: 'New arrivals', href: '/shop/new' },
    ],
  },
  {
    id: 'help',
    title: 'Help',
    links: [
      { id: 'shipping', label: 'Shipping', href: '/shipping' },
      { id: 'returns', label: 'Returns', href: '/returns' },
    ],
  },
  {
    id: 'legal',
    title: 'Legal',
    links: [
      { id: 'privacy', label: 'Privacy', href: '/privacy' },
      { id: 'terms', label: 'Terms', href: '/terms' },
    ],
  },
]

export const defaultSocialLinks: SocialLink[] = [
  { id: 'instagram', label: 'Instagram', href: 'https://instagram.com' },
  { id: 'facebook', label: 'Facebook', href: 'https://facebook.com' },
  { id: 'youtube', label: 'YouTube', href: 'https://youtube.com' },
]

export const defaultShellContent: ShellContent = {
  topBar: {
    message: {
      en: 'Free shipping on orders over 20 JOD',
      ar: 'شحن مجاني للطلبات التي تزيد عن 20 دينار',
    },
    secondaryMessage: {
      en: 'Daily flash offers update every hour',
      ar: 'عروض سريعة تتجدد كل ساعة',
    },
    ctaLabel: {
      en: 'Shop now',
      ar: 'تسوق الآن',
    },
    ctaHref: '/shop',
  },
  branding: {
    logo: {
      uri: '/brand-logo-placeholder.svg',
      alt: {
        en: 'Real Cosmetics',
        ar: 'ريال كوزمتكس',
      },
    },
  },
  navigation: {
    categories: defaultCategories.map((item) => ({
      id: item.id,
      href: item.href,
      group: item.group,
      description: item.description
        ? { en: item.description, ar: item.description }
        : undefined,
      label: { en: item.label, ar: item.label },
    })),
  },
  footer: {
    newsletterTitle: {
      en: 'Join Our Newsletter',
      ar: 'اشترك في النشرة البريدية',
    },
    newsletterSubtitle: {
      en: 'Get product drops and member-only offers.',
      ar: 'احصل على الإصدارات الجديدة والعروض الحصرية.',
    },
    legalNotice: {
      en: '(c) Real Cosmetics',
      ar: '(c) ريال كوزمتكس',
    },
  },
  search: {
    panelTitles: {
      trendingSearches: {
        en: 'Trending Searches',
        ar: 'عمليات البحث الرائجة',
      },
      popularBrands: {
        en: 'Popular Brands',
        ar: 'العلامات التجارية الشائعة',
      },
      recentSearches: {
        en: 'Recent Searches',
        ar: 'عمليات البحث الأخيرة',
      },
      suggestions: {
        en: 'Search Suggestions',
        ar: 'اقتراحات البحث',
      },
      products: {
        en: 'Products',
        ar: 'المنتجات',
      },
    },
    panelMessages: {
      loadingSuggestions: {
        en: 'Loading suggestions...',
        ar: 'جاري تحميل الاقتراحات...',
      },
      unavailableSuggestions: {
        en: 'No suggestions right now.',
        ar: 'لا توجد اقتراحات حالياً.',
      },
      noMatchingSuggestions: {
        en: 'No matching suggestions.',
        ar: 'لا توجد اقتراحات مطابقة.',
      },
      noProductSuggestions: {
        en: 'No product suggestions.',
        ar: 'لا توجد اقتراحات منتجات.',
      },
      noPopularBrands: {
        en: 'No popular brands.',
        ar: 'لا توجد علامات شائعة.',
      },
      noRecentSearches: {
        en: 'No recent searches.',
        ar: 'لا توجد عمليات بحث حديثة.',
      },
    },
    clearRecentLabel: {
      en: 'Clear',
      ar: 'مسح',
    },
  },
}

export const defaultBottomNavItems: BottomNavItem[] = [
  { id: 'home', label: { en: 'Home', ar: 'الرئيسية' }, href: '/' },
  { id: 'categories', label: { en: 'Categories', ar: 'الفئات' }, href: '/shop' },
  { id: 'cart', label: { en: 'Cart', ar: 'السلة' }, href: '/cart' },
  { id: 'account', label: { en: 'Account', ar: 'الحساب' }, href: '/account' },
  { id: 'more', label: { en: 'More', ar: 'المزيد' }, href: '#' },
]
