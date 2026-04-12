import { BottomNavItem, FooterColumn, NavItem, ShellContent, SocialLink } from './types'

export const defaultCategories: NavItem[] = [
  { id: 'cat-shop', label: 'Shop', href: '/shop' },
  { id: 'cat-categories', label: 'Categories', href: '/categories' },
  { id: 'cat-brands', label: 'Brands', href: '/brands' },
  { id: 'cat-deals', label: 'Deals', href: '/sales' },
  { id: 'cat-new', label: 'New', href: '/shop/new' },
  { id: 'cat-bundles', label: 'Bundles', href: '/shop/bundles' },
]

export const defaultQuickActions: NavItem[] = [
  { id: 'qa-shop', label: 'Shop', href: '/shop' },
  { id: 'qa-categories', label: 'Categories', href: '/categories' },
  { id: 'qa-brands', label: 'Brands', href: '/brands' },
  { id: 'qa-deals', label: 'Deals', href: '/sales' },
  { id: 'qa-new', label: 'New', href: '/shop/new' },
  { id: 'qa-bundles', label: 'Bundles', href: '/shop/bundles' },
]

export const defaultSalesItems: NavItem[] = [
  { id: 'sale-main', label: 'Deals', href: '/sales' },
]

export const defaultBrandItems: NavItem[] = [
  { id: 'brand-main', label: 'Brands', href: '/brands' },
]

export const defaultFooterLinks: FooterColumn[] = [
  {
    id: 'shop',
    title: 'Shop',
    links: [
      { id: 'new-arrivals', label: 'New arrivals', href: '/shop/new' },
      { id: 'best-sellers', label: 'Best sellers', href: '/shop/best-sellers' },
      { id: 'flash-offers', label: 'Flash offers', href: '/sales' },
      { id: 'luxury-products', label: 'Luxury products', href: '/shop/luxury' },
    ],
  },
  {
    id: 'help',
    title: 'Help',
    links: [
      { id: 'track-order', label: 'Track order', href: '/account/orders' },
      { id: 'shipping', label: 'Shipping', href: '/shipping' },
      { id: 'returns', label: 'Returns', href: '/returns' },
      { id: 'contact-us', label: 'Contact us', href: '/contact' },
    ],
  },
  {
    id: 'account',
    title: 'Account',
    links: [
      { id: 'sign-in', label: 'Sign in', href: '/auth/login?next=/account' },
      { id: 'wishlist', label: 'Wishlist', href: '/wishlist' },
      { id: 'loyalty-points', label: 'Loyalty points', href: '/account/loyalty' },
      { id: 'test-results', label: 'Test results', href: '/account/tests' },
    ],
  },
  {
    id: 'about',
    title: 'About',
    links: [
      { id: 'about-us', label: 'About us', href: '/about' },
      { id: 'contact', label: 'Contact', href: '/contact' },
      { id: 'privacy', label: 'Privacy', href: '/privacy' },
      { id: 'terms', label: 'Terms', href: '/terms' },
    ],
  },
]

export const defaultSocialLinks: SocialLink[] = [
  { id: 'instagram', label: 'Instagram', href: 'https://instagram.com' },
  { id: 'facebook', label: 'Facebook', href: 'https://facebook.com' },
  { id: 'youtube', label: 'YouTube', href: 'https://youtube.com' },
  { id: 'tiktok', label: 'TikTok', href: 'https://tiktok.com' },
]

export const defaultShellContent: ShellContent = {
  topBar: {
    items: [
      {
        id: 'same-day-amman',
        label: {
          en: 'Same-day delivery in Amman on eligible orders',
          ar: 'توصيل في نفس اليوم في عمان للطلبات المؤهلة',
        },
      },
      {
        id: 'support-window',
        label: {
          en: 'Support 9am to midnight every day',
          ar: 'الدعم من 9 صباحاً حتى منتصف الليل يومياً',
        },
      },
      {
        id: 'returns-window',
        label: {
          en: 'Easy returns within 14 days',
          ar: 'إرجاع سهل خلال 14 يوماً',
        },
      },
    ],
  },
  branding: {
    logo: {
      uri: '/brand-logo-placeholder.svg',
      alt: {
        en: 'Real Cosmetics',
        ar: 'ريال كوزمتكس',
      },
    },
    logoSize: 'md',
  },
  navigation: {
    categories: defaultCategories.map((item) => ({
      id: item.id,
      href: item.href,
      group: item.group,
      description: item.description ? { en: item.description, ar: item.description } : undefined,
      label: {
        en: item.label,
        ar:
          item.id === 'cat-shop'
            ? 'تسوق'
            : item.id === 'cat-categories'
              ? 'الفئات'
              : item.id === 'cat-brands'
                ? 'العلامات'
                : item.id === 'cat-deals'
                  ? 'العروض'
                  : item.id === 'cat-new'
                    ? 'جديد'
                    : 'الباقات',
      },
    })),
    quickActions: defaultQuickActions.map((item) => ({
      id: item.id,
      href: item.href,
      label: {
        en: item.label,
        ar:
          item.id === 'qa-shop'
            ? 'تسوق'
            : item.id === 'qa-categories'
              ? 'الفئات'
              : item.id === 'qa-brands'
                ? 'العلامات'
                : item.id === 'qa-deals'
                  ? 'العروض'
                  : item.id === 'qa-new'
                    ? 'جديد'
                    : 'الباقات',
      },
    })),
  },
  footer: {
    newsletterTitle: {
      en: 'Get launch alerts and member-only deals',
      ar: 'احصل على تنبيهات الإطلاق وعروض الأعضاء',
    },
    newsletterSubtitle: {
      en: 'New arrivals, flash offers, and curated beauty picks delivered first.',
      ar: 'الإصدارات الجديدة وعروض الفلاش واختيارات الجمال تصلك أولاً.',
    },
    legalNotice: {
      en: 'REAL Cosmetics. All rights reserved.',
      ar: 'ريال كوزمتكس. جميع الحقوق محفوظة.',
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
  mobileHeader: {
    deliveryLabel: {
      en: 'Deliver to',
      ar: 'التوصيل إلى',
    },
    deliveryLocation: {
      en: 'Home, Amman',
      ar: 'المنزل، عمان',
    },
    searchPlaceholder: {
      en: 'Search products, brands, and skin needs',
      ar: 'ابحث عن المنتجات والعلامات واحتياجات البشرة',
    },
    shortcuts: [
      {
        id: 'mobile-skincare',
        label: {
          en: 'Skincare',
          ar: 'العناية',
        },
        href: '/shop/skincare',
        icon: 'product',
      },
      {
        id: 'mobile-makeup',
        label: {
          en: 'Makeup',
          ar: 'المكياج',
        },
        href: '/shop/makeup',
        icon: 'star',
      },
      {
        id: 'mobile-hair',
        label: {
          en: 'Hair',
          ar: 'الشعر',
        },
        href: '/shop/hair',
        icon: 'trending',
      },
      {
        id: 'mobile-fragrance',
        label: {
          en: 'Fragrance',
          ar: 'العطور',
        },
        href: '/shop/fragrance',
        icon: 'gift',
      },
      {
        id: 'mobile-offers',
        label: {
          en: 'Offers',
          ar: 'العروض',
        },
        href: '/sales',
        icon: 'deals',
      },
    ],
  },
  statusPages: {
    homeUnavailableTitle: {
      en: 'We are refreshing the storefront',
      ar: 'نعمل على تحديث المتجر حالياً',
    },
    homeUnavailableSubtitle: {
      en: 'Our catalog is temporarily unavailable. Please try again in a moment while we bring everything back online.',
      ar: 'الكتالوج غير متاح مؤقتاً. يرجى المحاولة مرة أخرى بعد قليل بينما نعيد كل شيء للعمل.',
    },
    homeUnavailableCtaLabel: {
      en: 'Try again',
      ar: 'حاول مرة أخرى',
    },
  },
}

export const defaultBottomNavItems: BottomNavItem[] = [
  { id: 'home', label: { en: 'Home', ar: 'الرئيسية' }, href: '/' },
  { id: 'categories', label: { en: 'Categories', ar: 'الفئات' }, href: '/categories' },
  { id: 'brands', label: { en: 'Brands', ar: 'العلامات' }, href: '/brands' },
  { id: 'cart', label: { en: 'Cart', ar: 'السلة' }, href: '/cart' },
  { id: 'account', label: { en: 'Account', ar: 'الحساب' }, href: '/account' },
]
