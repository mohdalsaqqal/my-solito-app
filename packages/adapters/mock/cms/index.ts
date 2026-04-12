import { CMSProvider } from '@real/providers/contracts'
import { generatedMockProductRows } from '../product/generated-mock-erp-data'

type MockProductRow = {
  id: string
  brand?: string
  category?: string
  image?: string
  csv_brand_label?: string
  rating?: number
  reviews?: number
}

type BrandShowcaseRow = {
  id: string
  slug: string
  name: string
  href: string
  logoUrl?: string
  spotlight: {
    id: string
    enabled: boolean
    bannerTitle: { en: string; ar: string }
    bannerSubtitle: { en: string; ar: string }
    bannerCtaLabel: { en: string; ar: string }
    bannerHref: string
    bannerImageUrl?: string
    railTitle: { en: string; ar: string }
    query: {
      source: 'best_sellers'
      limit: number
      sortBy: 'price_desc'
      brandNames: string[]
    }
  }
}

const sourceProducts = generatedMockProductRows as MockProductRow[]

function formatBrandName(slug: string, label?: string) {
  if (label && label.trim()) return label.trim()
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function buildBrandShowcaseRows(): BrandShowcaseRow[] {
  const grouped = new Map<
    string,
    {
      label?: string
      productCount: number
      topImage?: string
      reviewsScore: number
      ratingScore: number
      categories: Set<string>
    }
  >()

  for (const product of sourceProducts) {
    if (!product.brand) continue
    const current = grouped.get(product.brand) ?? {
      label: product.csv_brand_label,
      productCount: 0,
      topImage: product.image,
      reviewsScore: 0,
      ratingScore: 0,
      categories: new Set<string>(),
    }

    current.label ||= product.csv_brand_label
    current.productCount += 1
    current.reviewsScore += product.reviews ?? 0
    current.ratingScore += product.rating ?? 0
    if (!current.topImage && product.image) current.topImage = product.image
    if (product.category) current.categories.add(product.category)
    grouped.set(product.brand, current)
  }

  return Array.from(grouped.entries())
    .map<BrandShowcaseRow>(([slug, entry]) => {
      const name = formatBrandName(slug, entry.label)
      const leadCategory = Array.from(entry.categories)[0] ?? 'beauty'

      return {
        id: `cms-brand-${slug}`,
        slug,
        name,
        href: `/shop?brands=${slug}`,
        logoUrl: entry.topImage,
        spotlight: {
          id: `spotlight-${slug}`,
          enabled: true,
          bannerTitle: {
            en: `${name} Spotlight`,
            ar: `${name} Spotlight`,
          },
          bannerSubtitle: {
            en: `Shop the most-loved ${leadCategory.replace(/-/g, ' ')} picks from ${name}.`,
            ar: `Shop the most-loved ${leadCategory.replace(/-/g, ' ')} picks from ${name}.`,
          },
          bannerCtaLabel: {
            en: `Shop ${name}`,
            ar: `Shop ${name}`,
          },
          bannerHref: `/shop?brands=${slug}`,
          bannerImageUrl: entry.topImage,
          railTitle: {
            en: `${name} Highlights`,
            ar: `${name} Highlights`,
          },
          query: {
            source: 'best_sellers',
            limit: 8,
            sortBy: 'price_desc',
            brandNames: [name],
          },
        },
      }
    })
    .sort((left, right) => {
      const leftMeta = grouped.get(left.slug)
      const rightMeta = grouped.get(right.slug)
      const countDelta = (rightMeta?.productCount ?? 0) - (leftMeta?.productCount ?? 0)
      if (countDelta !== 0) return countDelta
      const reviewsDelta = (rightMeta?.reviewsScore ?? 0) - (leftMeta?.reviewsScore ?? 0)
      if (reviewsDelta !== 0) return reviewsDelta
      const ratingDelta = (rightMeta?.ratingScore ?? 0) - (leftMeta?.ratingScore ?? 0)
      if (ratingDelta !== 0) return ratingDelta
      return left.name.localeCompare(right.name)
    })
}

const cmsBrandShowcase = buildBrandShowcaseRows()
const cmsMarketingBrands = cmsBrandShowcase.slice(0, 8).map((brand) => ({
  id: brand.id,
  name: brand.name,
  href: brand.href,
  logoUrl: brand.logoUrl,
}))
const cmsBrandSpotlights = cmsBrandShowcase.slice(0, 2).map((brand) => brand.spotlight)

export const mockCMSAdapter: CMSProvider = {
  async getHome() {
    return {
      ok: true,
      data: {
        heroSlides: [
          {
            id: 'hero-1',
            title: 'Clean Beauty Essentials',
            subtitle: 'Mock CMS hero content',
            ctaLabel: 'Shop now',
          },
        ],
        shell: {
          topBar: {
            message: {
              en: 'Free shipping on orders over 20 JDS',
              ar: 'شحن مجاني للطلبات التي تزيد عن 20 دينار',
            },
            secondaryMessage: {
              en: 'Flash deals rotate hourly. Limited inventory.',
              ar: 'العروض السريعة تتغير كل ساعة. مخزون محدود.',
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
            logoSize: 'md',
          },
          navigation: {
            categories: [
              {
                id: 'cat-luxury-brands',
                label: { en: 'Luxury Brands', ar: 'العلامات الفاخرة' },
                href: '/shop?categories=luxury-brands',
              },
              {
                id: 'cat-flash-sale',
                label: { en: '% Flash Sale', ar: '% تخفيضات سريعة' },
                href: '/sales',
              },
              {
                id: 'cat-skincare',
                label: { en: 'Skincare', ar: 'العناية بالبشرة' },
                href: '/shop?categories=skincare',
              },
              {
                id: 'cat-makeup',
                label: { en: 'Makeup', ar: 'المكياج' },
                href: '/shop?categories=makeup',
              },
              {
                id: 'cat-haircare',
                label: { en: 'Haircare', ar: 'العناية بالشعر' },
                href: '/shop?categories=haircare',
              },
              {
                id: 'cat-wellness',
                label: { en: 'Wellness', ar: 'العافية' },
                href: '/shop?categories=wellness',
              },
            ],
          },
          footer: {
            newsletterTitle: {
              en: 'Stay in the loop',
              ar: 'ابق على اطلاع',
            },
            newsletterSubtitle: {
              en: 'Get launches, offers, and skincare insights.',
              ar: 'احصل على أحدث الإطلاقات والعروض ونصائح العناية بالبشرة.',
            },
            legalNotice: {
              en: '(c) Real Cosmetics',
              ar: '(c) ريال كوزمتكس',
            },
            socialLabels: [
              {
                id: 'ig',
                label: {
                  en: 'Instagram',
                  ar: 'انستغرام',
                },
              },
              {
                id: 'x',
                label: {
                  en: 'X',
                  ar: 'إكس',
                },
              },
              {
                id: 'yt',
                label: {
                  en: 'YouTube',
                  ar: 'يوتيوب',
                },
              },
            ],
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
        },
        marketing: {
          railAutoplay: {
            hero: {
              enabled: true,
              autoplayMs: 3200,
            },
            categories: {
              enabled: true,
              autoplayMs: 4400,
            },
            newArrivals: {
              enabled: true,
              autoplayMs: 4200,
            },
            featured: {
              enabled: true,
              autoplayMs: 4600,
            },
            brandSpotlights: {
              enabled: true,
              autoplayMs: 4800,
            },
          },
          rails: [
            {
              id: 'best-items-month',
              enabled: true,
              title: {
                en: 'Best Items for This Month',
                ar: 'أفضل المنتجات لهذا الشهر',
              },
              query: {
                source: 'best_sellers',
                limit: 12,
                sortBy: 'price_desc',
              },
            },
            {
              id: 'new-arrivals',
              enabled: true,
              title: {
                en: 'New Arrivals',
                ar: 'وصل حديثاً',
              },
              query: {
                source: 'new_arrivals',
                limit: 12,
                sortBy: 'name_asc',
              },
            },
            {
              id: 'value-bundles',
              enabled: true,
              title: {
                en: 'Value Bundles',
                ar: 'باقات التوفير',
              },
              query: {
                source: 'bundle_only',
                limit: 12,
                sortBy: 'price_desc',
              },
            },
          ],
          completeSet: {
            enabled: true,
            title: {
              en: 'Complete the Set',
              ar: 'أكمل المجموعة',
            },
            subtitle: {
              en: 'Frequently bought together to complete your routine.',
              ar: 'منتجات تُشترى معاً لإكمال روتينك.',
            },
            ctaLabel: {
              en: 'Shop full routine',
              ar: 'تسوق الروتين الكامل',
            },
            ctaHref: '/shop',
            query: {
              source: 'bundle_only',
              limit: 8,
              sortBy: 'price_desc',
            },
          },
          featuredSlot: {
            enabled: true,
            title: {
              en: 'Featured Campaign',
              ar: 'الحملة المميزة',
            },
            subtitle: {
              en: 'Sponsored spotlight with premium picks and editor curation.',
              ar: 'واجهة دعائية مميزة مع اختيارات فاخرة وتنسيق تحريري.',
            },
            ctaLabel: {
              en: 'Explore campaign',
              ar: 'استكشف الحملة',
            },
            href: '/shop',
            imageUrl:
              'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1800&h=700&q=80',
          },
          brandSpotlights: cmsBrandSpotlights,
          brandSections: cmsBrandSpotlights,
          ticker: {
            enabled: true,
            speedMs: 22000,
            items: [
              {
                id: 'ticker-1',
                message: {
                  en: 'Free shipping on orders over 20 JDs',
                  ar: 'شحن مجاني للطلبات فوق 20 دينار',
                },
                href: '/shipping',
              },
              {
                id: 'ticker-2',
                message: {
                  en: 'Official pharmacy-backed beauty picks',
                  ar: 'اختيارات تجميل موثوقة ومدعومة صيدلانياً',
                },
              },
              {
                id: 'ticker-3',
                message: {
                  en: 'New arrivals from premium brands every week',
                  ar: 'وصول جديد أسبوعي من العلامات الفاخرة',
                },
                href: '/shop/new',
              },
            ],
          },
          hero: {
            autoplay: true,
            autoplayMs: 3200,
            cards: [
              {
                id: 'm-hero-1',
                title: 'Build a Better Daily Ritual',
                subtitle: 'A skin-first edit of cleansers, serums, and moisturizers that layer beautifully.',
                ctaLabel: 'Explore the edit',
                href: '/shop',
                imageUrl: '/figma/hero/tile-2-editorial.png',
                badgeLabel: {
                  en: 'Routine Notes',
                  ar: 'ملاحظات الروتين',
                },
              },
              {
                id: 'm-hero-2',
                title: 'Fresh Launches Across the Floor',
                subtitle: 'Trending drops, exclusive bundles, and just-landed beauty from the brands shoppers watch.',
                ctaLabel: 'Shop new arrivals',
                href: '/shop',
                imageUrl: '/figma/hero/tile-3-new.jpg',
                badgeLabel: {
                  en: 'New In',
                  ar: 'جديد',
                },
              },
              {
                id: 'm-hero-3',
                title: 'A More Refined Way to Shop Beauty',
                subtitle: 'Discover prestige fragrance, polished skincare, and elevated gifting in one destination.',
                ctaLabel: 'Enter prestige',
                href: '/shop',
                imageUrl: '/figma/hero/tile-4-luxury.png',
                badgeLabel: {
                  en: 'Prestige Hall',
                  ar: 'قاعة الفخامة',
                },
              },
              {
                id: 'm-hero-4',
                title: 'More Beauty in Every Order',
                subtitle: 'Unlock bonus samples, bundle savings, and member-only offers built to convert.',
                ctaLabel: 'Unlock offers',
                href: '/shop',
                imageUrl: '/figma/hero/tile-5-member.png',
                badgeLabel: {
                  en: 'Member Value',
                  ar: 'قيمة الأعضاء',
                },
              },
            ],
          },
          campaigns: [
            {
              id: 'm-camp-hero-primary',
              enabled: true,
              zone: 'home_hero_primary',
              title: {
                en: "The Week's Best Beauty Savings",
                ar: 'أفضل عروض الجمال لهذا الأسبوع',
              },
              subtitle: {
                en: 'Shop the strongest markdowns across skincare, fragrance, hair, and makeup.',
                ar: 'تسوقي أقوى التخفيضات عبر العناية بالبشرة والعطور والشعر والمكياج.',
              },
              ctaLabel: {
                en: 'See all deals',
                ar: 'عرض كل التخفيضات',
              },
              href: '/shop',
              imageUrl: '/figma/hero/tile-1-top-offers.png',
              timerEndsAt: '2026-03-31T22:59:59.000Z',
              urgencyBadge: {
                en: 'Top Offers',
                ar: 'أفضل العروض',
              },
              showTimer: false,
              showUrgency: false,
            },
            {
              id: 'm-camp-home-flash-zone',
              enabled: true,
              zone: 'home_flash_sale',
              title: {
                en: 'Flash Zone: up to 45% off',
                ar: 'منطقة العروض: حتى 45% خصم',
              },
              subtitle: {
                en: 'Inventory changes hourly on selected bundles and skincare routines.',
                ar: 'المخزون يتغير كل ساعة على باقات وروتينات مختارة.',
              },
              ctaLabel: {
                en: 'Open flash sale',
                ar: 'افتح العروض',
              },
              href: '/sales',
              imageUrl:
                'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&h=600&q=80',
              timerEndsAt: '2026-03-02T20:00:00.000Z',
              urgencyBadge: {
                en: 'Selling fast',
                ar: 'يباع بسرعة',
              },
              showTimer: true,
              showUrgency: true,
            },
            {
              id: 'm-camp-shop-banner',
              enabled: true,
              zone: 'shop_banner',
              title: {
                en: 'Daily deal marketplace',
                ar: 'سوق عروض يومي',
              },
              subtitle: {
                en: 'Offers rotate throughout the day. Prices update by stock pressure.',
                ar: 'العروض تتجدد طوال اليوم والأسعار تتغير حسب ضغط المخزون.',
              },
              ctaLabel: {
                en: 'Shop all deals',
                ar: 'تسوق كل العروض',
              },
              href: '/shop',
              timerEndsAt: '2026-03-01T21:00:00.000Z',
              urgencyBadge: {
                en: 'Today only',
                ar: 'اليوم فقط',
              },
              showTimer: true,
              showUrgency: true,
            },
          ],
          campaignZoneOverrides: {
            home: {
              heroPrimaryCampaignId: 'm-camp-hero-primary',
              flashSaleCampaignId: 'm-camp-home-flash-zone',
            },
            shop: {
              bannerCampaignId: 'm-camp-shop-banner',
            },
            productCard: {
              urgencyEnabled: true,
              urgencyLabel: {
                en: 'Selling fast',
                ar: 'يباع بسرعة',
              },
              discountBadgeEnabled: true,
              lowStockThreshold: 2,
              lowStockLabel: {
                en: 'Almost gone',
                ar: 'شارف على النفاد',
              },
            },
          },
          brands: cmsMarketingBrands,
          topBrandsTitle: {
            en: 'Top Brands',
            ar: 'أهم العلامات التجارية',
          },
          educationBanner: {
            enabled: true,
            title: {
              en: 'Find Your Perfect Routine',
              ar: 'ابحثي عن روتينك المثالي',
            },
            subtitle: {
              en: 'Take a guided skin quiz and unlock expert product picks.',
              ar: 'خذي اختبار البشرة واحصلي على ترشيحات دقيقة.',
            },
            ctaLabel: {
              en: 'Take Test',
              ar: 'ابدأ الاختبار',
            },
            href: '/shop',
            imageUrl:
              'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1800&h=700&q=80',
          },
          offerBanners: [
            {
              id: 'offer-banner-1',
              enabled: true,
              imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1800&h=700&q=80',
              href: '/shop?categories=skincare',
              ctaLabel: { en: 'Shop Skincare', ar: 'تسوق العناية بالبشرة' },
            },
            {
              id: 'offer-banner-2',
              enabled: true,
              imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1800&h=700&q=80',
              href: '/shop?categories=makeup',
              ctaLabel: { en: 'Shop Makeup', ar: 'تسوق المكياج' },
            },
            {
              id: 'offer-banner-3',
              enabled: true,
              imageUrl: 'https://images.unsplash.com/photo-1541643600914-78b084683702?auto=format&fit=crop&w=1800&h=700&q=80',
              href: '/shop?categories=fragrance',
              ctaLabel: { en: 'Shop Fragrance', ar: 'تسوق العطور' },
            },
            {
              id: 'offer-banner-4',
              enabled: true,
              imageUrl: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=1800&h=700&q=80',
              href: '/shop?categories=haircare',
              ctaLabel: { en: 'Shop Haircare', ar: 'تسوق العناية بالشعر' },
            },
          ],
          editorialHotspotSection: {
            enabled: true,
            title: {
              en: 'The Makeup Map',
              ar: 'خريطة المكياج',
            },
            subtitle: {
              en: 'Follow the look with a quieter editorial image and the exact products layered beside it.',
              ar: 'اتبعي الإطلالة عبر صورة تحريرية هادئة مع المنتجات الدقيقة المعروضة بجانبها.',
            },
            ctaLabel: {
              en: 'Shop the look',
              ar: 'تسوقي الإطلالة',
            },
            href: '/shop?categories=makeup',
            imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1800&h=1800&q=80',
            productIds: ['76959', '66583', '72078', '76960'],
          },
          ugcGallery: {
            enabled: true,
            title: {
              en: 'Looks From Our Community',
              ar: 'إطلالات من مجتمعنا',
            },
            items: [
              {
                id: 'ugc-1',
                imageUrl: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&w=900&h=900&q=80',
                caption: {
                  en: 'Hydrating Serum Glow',
                  ar: 'إشراقة سيروم الترطيب',
                },
                productId: '1',
              },
              {
                id: 'ugc-2',
                imageUrl: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&h=900&q=80',
                caption: {
                  en: 'Bold Lip Story',
                  ar: 'إطلالة شفاه جريئة',
                },
                productId: '3',
              },
              {
                id: 'ugc-3',
                imageUrl: 'https://images.unsplash.com/photo-1498842812179-c81beecf902c?auto=format&fit=crop&w=900&h=900&q=80',
                caption: {
                  en: 'Soft Matte Daily Look',
                  ar: 'إطلالة يومية مات ناعمة',
                },
                productId: '4',
              },
            ],
          },
          newsletterCta: {
            enabled: true,
            title: {
              en: 'Join our rewards program',
              ar: 'انضم لبرنامج المكافآت',
            },
            subtitle: {
              en: 'Earn points on every order and unlock exclusive launches.',
              ar: 'اكسب نقاطاً مع كل طلب واحصل على إطلاقات حصرية.',
            },
            ctaLabel: {
              en: 'Subscribe',
              ar: 'اشترك',
            },
            href: '/account',
          },
          personalization: {
            enabled: true,
            mode: 'rule-based',
            recommendedTitle: {
              en: 'Recommended for You',
              ar: 'موصى بها لك',
            },
          },
        },
        page: {
          id: 'home-v1',
          slug: 'home',
          releaseId: 'release-mock-1',
          blocks: [
            {
              id: 'block-promo-strip-1',
              type: 'promo_strip',
              position: 1,
              releaseId: 'release-mock-1',
              locale: 'en',
              text: { en: 'Free shipping on orders over 20 JDs — Flash deals rotate hourly', ar: 'شحن مجاني للطلبات فوق 20 دينار — عروض سريعة تتجدد كل ساعة' },
              href: '/shop',
            },
            {
              id: 'block-hero-1',
              type: 'hero_carousel',
              position: 10,
              releaseId: 'release-mock-1',
              locale: 'en',
              autoplayMs: 4200,
              cards: [
                {
                  id: 'hero-card-1',
                  titleEn: 'The Perfect Finishing Touch',
                  titleAr: 'اللمسة الأخيرة المثالية',
                  subtitleEn: 'Shop the season\'s most-loved beauty picks',
                  subtitleAr: 'تسوقي أكثر منتجات الجمال المحبوبة في الموسم',
                  imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1800&h=700&q=80',
                  ctaLabelEn: 'Shop Now',
                  ctaLabelAr: 'تسوق الآن',
                  href: '/shop',
                },
                {
                  id: 'hero-card-2',
                  titleEn: 'Deals Up To 60% Off',
                  titleAr: 'عروض تصل إلى 60% خصم',
                  subtitleEn: 'Limited time offers on top brands',
                  subtitleAr: 'عروض محدودة على أفضل العلامات التجارية',
                  imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1800&h=700&q=80',
                  ctaLabelEn: 'See Deals',
                  ctaLabelAr: 'شاهد العروض',
                  href: '/shop',
                },
              ],
            },
            {
              id: 'block-category-1',
              type: 'category_shortcuts',
              position: 20,
              releaseId: 'release-mock-1',
              locale: 'en',
              title: { en: 'Top Deals', ar: 'أفضل العروض' },
              items: [
                { id: 'cat-makeup', label: { en: 'Makeup', ar: 'مكياج' }, href: '/shop?categories=makeup', imageUrl: 'https://images.unsplash.com/photo-1512207736890-6ffed8a84e8d?auto=format&fit=crop&w=200&h=200&q=80' },
                { id: 'cat-skincare', label: { en: 'Skincare', ar: 'بشرة' }, href: '/shop?categories=skincare', imageUrl: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=200&h=200&q=80' },
                { id: 'cat-fragrance', label: { en: 'Fragrance', ar: 'عطور' }, href: '/shop?categories=fragrance', imageUrl: 'https://images.unsplash.com/photo-1541643600914-78b084683702?auto=format&fit=crop&w=200&h=200&q=80' },
                { id: 'cat-haircare', label: { en: 'Haircare', ar: 'شعر' }, href: '/shop?categories=haircare', imageUrl: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=200&h=200&q=80' },
                { id: 'cat-wellness', label: { en: 'Wellness', ar: 'صحة' }, href: '/shop?categories=wellness', imageUrl: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=200&h=200&q=80' },
              ],
            },
            {
              id: 'block-deal-banners-makeup',
              type: 'brand_deal_banner',
              position: 30,
              releaseId: 'release-mock-1',
              locale: 'en',
              titleEn: '',
              titleAr: '',
              items: [
                {
                  id: 'deal-calla',
                  brandNameEn: 'CALLA MAKEUP',
                  brandNameAr: 'كالا ميكاب',
                  preLabelEn: 'DEALS UP TO',
                  preLabelAr: 'عروض تصل إلى',
                  discountLabelEn: '60%',
                  discountLabelAr: '60%',
                  backgroundColor: 'hsl(340 60% 95%)',
                  imageUrl: 'https://images.unsplash.com/photo-1512207736890-6ffed8a84e8d?auto=format&fit=crop&w=300&h=200&q=80',
                  href: '/shop?brands=calla',
                },
                {
                  id: 'deal-topface',
                  brandNameEn: 'topface',
                  brandNameAr: 'توب فيس',
                  preLabelEn: 'DEALS UP TO',
                  preLabelAr: 'عروض تصل إلى',
                  discountLabelEn: '50%',
                  discountLabelAr: '50%',
                  backgroundColor: 'hsl(35 70% 96%)',
                  href: '/shop?brands=topface',
                },
                {
                  id: 'deal-ola-hair',
                  brandNameEn: 'OLA HAIR',
                  brandNameAr: 'أولا هير',
                  preLabelEn: 'DEALS UP TO',
                  preLabelAr: 'عروض تصل إلى',
                  discountLabelEn: '50%',
                  discountLabelAr: '50%',
                  backgroundColor: 'hsl(200 50% 95%)',
                  href: '/shop?brands=ola-hair',
                },
                {
                  id: 'deal-mesauda',
                  brandNameEn: 'MESAUDA',
                  brandNameAr: 'مساودا',
                  preLabelEn: 'DEALS UP TO',
                  preLabelAr: 'عروض تصل إلى',
                  discountLabelEn: '35%',
                  discountLabelAr: '35%',
                  backgroundColor: 'hsl(12 8% 95%)',
                  href: '/shop?brands=mesauda',
                },
              ],
            },
            {
              id: 'block-trending-rail',
              type: 'product_slider',
              position: 40,
              releaseId: 'release-mock-1',
              locale: 'en',
              title: { en: 'Trending Products', ar: 'المنتجات الرائجة' },
              querySlug: 'trending',
            },
            {
              id: 'block-deal-banners-skin',
              type: 'brand_deal_banner',
              position: 50,
              releaseId: 'release-mock-1',
              locale: 'en',
              items: [
                {
                  id: 'deal-nars',
                  brandNameEn: 'NARS',
                  brandNameAr: 'نارس',
                  preLabelEn: 'DEALS UP TO',
                  preLabelAr: 'عروض تصل إلى',
                  discountLabelEn: '50%',
                  discountLabelAr: '50%',
                  backgroundColor: 'hsl(0 0% 97%)',
                  href: '/shop?brands=nars',
                },
                {
                  id: 'deal-entrody',
                  brandNameEn: 'ENTRODY',
                  brandNameAr: 'إنترودي',
                  preLabelEn: 'DEALS UP TO',
                  preLabelAr: 'عروض تصل إلى',
                  discountLabelEn: '40%',
                  discountLabelAr: '40%',
                  backgroundColor: 'hsl(180 40% 96%)',
                  href: '/shop?brands=entrody',
                },
                {
                  id: 'deal-huda',
                  brandNameEn: 'huda beauty',
                  brandNameAr: 'هدى بيوتي',
                  preLabelEn: 'DEALS UP TO',
                  preLabelAr: 'عروض تصل إلى',
                  discountLabelEn: '15%',
                  discountLabelAr: '15%',
                  backgroundColor: 'hsl(30 50% 96%)',
                  href: '/shop?brands=huda-beauty',
                },
              ],
            },
            {
              id: 'block-offer-banners-1',
              type: 'offer_banners',
              position: 60,
              releaseId: 'release-mock-1',
              locale: 'en',
              items: [
                {
                  id: 'offer-1',
                  imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&h=500&q=80',
                  href: '/shop?categories=makeup',
                  ctaLabelEn: '1+1 FREE',
                  ctaLabelAr: '1+1 مجاناً',
                },
                {
                  id: 'offer-2',
                  imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&h=500&q=80',
                  href: '/shop?categories=skincare',
                  ctaLabelEn: '1+1 FREE',
                  ctaLabelAr: '1+1 مجاناً',
                },
              ],
            },
            {
              id: 'block-best-makeup-rail',
              type: 'product_slider',
              position: 70,
              releaseId: 'release-mock-1',
              locale: 'en',
              title: { en: 'Best Makeup Deals', ar: 'أفضل عروض المكياج' },
              querySlug: 'best-makeup',
            },
            {
              id: 'block-deal-banners-pharma',
              type: 'brand_deal_banner',
              position: 80,
              releaseId: 'release-mock-1',
              locale: 'en',
              items: [
                {
                  id: 'deal-bioderma',
                  brandNameEn: 'BIODERMA',
                  brandNameAr: 'بيوديرما',
                  preLabelEn: 'DEALS UP TO',
                  preLabelAr: 'عروض تصل إلى',
                  discountLabelEn: '40%',
                  discountLabelAr: '40%',
                  backgroundColor: 'hsl(210 60% 96%)',
                  href: '/shop?brands=bioderma',
                },
                {
                  id: 'deal-vaseline',
                  brandNameEn: 'Vaseline',
                  brandNameAr: 'فازلين',
                  preLabelEn: 'DEALS UP TO',
                  preLabelAr: 'عروض تصل إلى',
                  discountLabelEn: '55%',
                  discountLabelAr: '55%',
                  backgroundColor: 'hsl(220 50% 96%)',
                  href: '/shop?brands=vaseline',
                },
                {
                  id: 'deal-acure',
                  brandNameEn: 'ACURE',
                  brandNameAr: 'أكيور',
                  preLabelEn: 'DEALS UP TO',
                  preLabelAr: 'عروض تصل إلى',
                  discountLabelEn: '15%',
                  discountLabelAr: '15%',
                  backgroundColor: 'hsl(140 40% 96%)',
                  href: '/shop?brands=acure',
                },
              ],
            },
            {
              id: 'block-best-skin-rail',
              type: 'product_slider',
              position: 90,
              releaseId: 'release-mock-1',
              locale: 'en',
              title: { en: 'Best Skin Care Deals', ar: 'أفضل عروض العناية بالبشرة' },
              querySlug: 'best-skincare',
            },
            {
              id: 'block-deal-banners-korean',
              type: 'brand_deal_banner',
              position: 100,
              releaseId: 'release-mock-1',
              locale: 'en',
              titleEn: 'KOREAN MAKEUP',
              titleAr: 'مكياج كوري',
              items: [
                {
                  id: 'deal-dinto',
                  brandNameEn: 'Dinto',
                  brandNameAr: 'دينتو',
                  preLabelEn: 'DEALS UP TO',
                  preLabelAr: 'عروض تصل إلى',
                  discountLabelEn: '40%',
                  discountLabelAr: '40%',
                  backgroundColor: 'hsl(340 50% 96%)',
                  href: '/shop?brands=dinto',
                },
                {
                  id: 'deal-inga',
                  brandNameEn: 'INGA',
                  brandNameAr: 'إنجا',
                  preLabelEn: 'DEALS UP TO',
                  preLabelAr: 'عروض تصل إلى',
                  discountLabelEn: '40%',
                  discountLabelAr: '40%',
                  backgroundColor: 'hsl(200 40% 96%)',
                  href: '/shop?brands=inga',
                },
              ],
            },
            {
              id: 'block-best-korean-makeup-rail',
              type: 'product_slider',
              position: 110,
              releaseId: 'release-mock-1',
              locale: 'en',
              title: { en: 'Best Korean Makeup Products', ar: 'أفضل منتجات المكياج الكوري' },
              querySlug: 'korean-makeup',
            },
            {
              id: 'block-deal-banners-korean-care',
              type: 'brand_deal_banner',
              position: 120,
              releaseId: 'release-mock-1',
              locale: 'en',
              titleEn: 'KOREAN CARE',
              titleAr: 'العناية الكورية',
              items: [
                {
                  id: 'deal-laundryou',
                  brandNameEn: 'laundryou',
                  brandNameAr: 'لوندريو',
                  preLabelEn: 'DEALS UP TO',
                  preLabelAr: 'عروض تصل إلى',
                  discountLabelEn: '40%',
                  discountLabelAr: '40%',
                  backgroundColor: 'hsl(60 40% 96%)',
                  href: '/shop?brands=laundryou',
                },
                {
                  id: 'deal-manyo',
                  brandNameEn: 'ma:nyo',
                  brandNameAr: 'مانيو',
                  preLabelEn: 'DEALS UP TO',
                  preLabelAr: 'عروض تصل إلى',
                  discountLabelEn: '45%',
                  discountLabelAr: '45%',
                  backgroundColor: 'hsl(280 30% 97%)',
                  href: '/shop?brands=manyo',
                },
              ],
            },
            {
              id: 'block-best-korean-care-rail',
              type: 'product_slider',
              position: 130,
              releaseId: 'release-mock-1',
              locale: 'en',
              title: { en: 'Best Korean Care Products', ar: 'أفضل منتجات العناية الكورية' },
              querySlug: 'korean-skincare',
            },
            {
              id: 'block-deal-banners-fragrance',
              type: 'brand_deal_banner',
              position: 140,
              releaseId: 'release-mock-1',
              locale: 'en',
              items: [
                {
                  id: 'deal-armani',
                  brandNameEn: 'GIORGIO ARMANI',
                  brandNameAr: 'جورجيو أرماني',
                  preLabelEn: 'DEALS UP TO',
                  preLabelAr: 'عروض تصل إلى',
                  discountLabelEn: '20%',
                  discountLabelAr: '20%',
                  backgroundColor: 'hsl(0 0% 97%)',
                  href: '/shop?brands=giorgio-armani',
                },
                {
                  id: 'deal-aroub',
                  brandNameEn: 'AROUB',
                  brandNameAr: 'عروب',
                  preLabelEn: 'DEALS UP TO',
                  preLabelAr: 'عروض تصل إلى',
                  discountLabelEn: '75%',
                  discountLabelAr: '75%',
                  backgroundColor: 'hsl(35 60% 96%)',
                  href: '/shop?brands=aroub',
                },
                {
                  id: 'deal-ysl',
                  brandNameEn: 'Yves Saint Laurent',
                  brandNameAr: 'إيف سان لوران',
                  preLabelEn: 'DEALS UP TO',
                  preLabelAr: 'عروض تصل إلى',
                  discountLabelEn: '30%',
                  discountLabelAr: '30%',
                  backgroundColor: 'hsl(0 0% 97%)',
                  href: '/shop?brands=ysl',
                },
                {
                  id: 'deal-lancome',
                  brandNameEn: 'LANCÔME',
                  brandNameAr: 'لانكوم',
                  preLabelEn: 'DEALS UP TO',
                  preLabelAr: 'عروض تصل إلى',
                  discountLabelEn: '20%',
                  discountLabelAr: '20%',
                  backgroundColor: 'hsl(350 40% 97%)',
                  href: '/shop?brands=lancome',
                },
              ],
            },
            {
              id: 'block-best-perfume-rail',
              type: 'product_slider',
              position: 150,
              releaseId: 'release-mock-1',
              locale: 'en',
              title: { en: 'Best Serums Perfumes', ar: 'أفضل عطور السيروم' },
              querySlug: 'perfumes',
            },
            {
              id: 'block-newsletter',
              type: 'newsletter_cta',
              position: 200,
              releaseId: 'release-mock-1',
              locale: 'en',
              titleEn: 'Join our rewards program',
              titleAr: 'انضم لبرنامج المكافآت',
              subtitleEn: 'Earn points on every order and unlock exclusive launches.',
              subtitleAr: 'اكسب نقاطاً مع كل طلب واحصل على إطلاقات حصرية.',
              ctaLabelEn: 'Subscribe',
              ctaLabelAr: 'اشترك',
              href: '/account',
            },
          ],
        },
        identity: {
          customer: {
            shopBanner: {
              title: {
                en: 'Editorial Beauty Selections',
                ar: 'اختيارات تجميل تحريرية',
              },
              subtitle: {
                en: 'Curated products for routines that actually work.',
                ar: 'منتجات منتقاة لروتين فعلي النتائج.',
              },
              ctaLabel: {
                en: 'Explore shop',
                ar: 'استكشف المتجر',
              },
            },
            shopCatalog: {
              loadingLabel: {
                en: 'Loading shop...',
                ar: 'جاري تحميل المتجر...',
              },
              loadErrorTitle: {
                en: 'Unable to load products.',
                ar: 'تعذر تحميل المنتجات.',
              },
              retryLabel: {
                en: 'Retry',
                ar: 'إعادة المحاولة',
              },
              productsSuffix: {
                en: 'products',
                ar: 'منتج',
              },
              filtersButtonLabel: {
                en: 'Filters',
                ar: 'الفلاتر',
              },
              filterPanelTitle: {
                en: 'Filters',
                ar: 'الفلاتر',
              },
              filterCategoryTitle: {
                en: 'Category',
                ar: 'الفئة',
              },
              filterBrandTitle: {
                en: 'Brand',
                ar: 'العلامة',
              },
              filterPriceTitle: {
                en: 'Price',
                ar: 'السعر',
              },
              filterSpecialTitle: {
                en: 'Special',
                ar: 'خيارات خاصة',
              },
              saleOnlyLabel: {
                en: 'Sale only',
                ar: 'العروض فقط',
              },
              bundleOnlyLabel: {
                en: 'Bundle only',
                ar: 'الباقات فقط',
              },
              clearAllLabel: {
                en: 'Clear all',
                ar: 'مسح الكل',
              },
              clearFiltersLabel: {
                en: 'Clear filters',
                ar: 'مسح الفلاتر',
              },
              noProductsMessage: {
                en: 'No products match your filters.',
                ar: 'لا توجد منتجات مطابقة للفلاتر.',
              },
              closeLabel: {
                en: 'Close',
                ar: 'إغلاق',
              },
              sortLabels: {
                bestSelling: {
                  en: 'Best selling',
                  ar: 'الأكثر مبيعاً',
                },
                newest: {
                  en: 'Newest',
                  ar: 'الأحدث',
                },
                priceAsc: {
                  en: 'Price low-high',
                  ar: 'السعر من الأقل إلى الأعلى',
                },
                priceDesc: {
                  en: 'Price high-low',
                  ar: 'السعر من الأعلى إلى الأقل',
                },
              },
              chipPrefixes: {
                category: {
                  en: 'Category',
                  ar: 'الفئة',
                },
                brand: {
                  en: 'Brand',
                  ar: 'العلامة',
                },
                price: {
                  en: 'Price',
                  ar: 'السعر',
                },
              },
              priceBucketLabels: {
                all: {
                  en: 'All',
                  ar: 'الكل',
                },
                under25: {
                  en: 'Under $25',
                  ar: 'أقل من 25$',
                },
                between25And50: {
                  en: '$25 - $50',
                  ar: '25$ - 50$',
                },
                between50And100: {
                  en: '$50 - $100',
                  ar: '50$ - 100$',
                },
                over100: {
                  en: 'Over $100',
                  ar: 'أكثر من 100$',
                },
              },
            },
            accountPromo: {
              title: {
                en: 'Loyalty unlocks better routines',
                ar: 'الولاء يفتح لك روتيناً أفضل',
              },
              subtitle: {
                en: 'Earn points on every checkout and redeem on essentials.',
                ar: 'اكسب نقاطاً مع كل طلب واستبدلها على المنتجات الأساسية.',
              },
            },
            productDetails: {
              tabs: {
                description: {
                  en: 'Description',
                  ar: 'الوصف',
                },
                howToUse: {
                  en: 'How to use',
                  ar: 'طريقة الاستخدام',
                },
                ingredients: {
                  en: 'Ingredients',
                  ar: 'المكونات',
                },
              },
              labels: {
                inStock: {
                  en: 'In stock',
                  ar: 'متوفر',
                },
                outOfStock: {
                  en: 'Out of stock',
                  ar: 'غير متوفر',
                },
                quantity: {
                  en: 'Qty',
                  ar: 'الكمية',
                },
                noSelectableOptions: {
                  en: 'No selectable options for this product.',
                  ar: 'لا توجد خيارات تحديد لهذا المنتج.',
                },
                deliveryAssurance: {
                  en: 'Delivery & assurance',
                  ar: 'التوصيل والضمان',
                },
                selectedSubtotal: {
                  en: 'Selected subtotal',
                  ar: 'المجموع المختار',
                },
                reviewsTitle: {
                  en: 'Ratings & reviews',
                  ar: 'التقييمات والمراجعات',
                },
                loading: {
                  en: 'Loading...',
                  ar: 'جاري التحميل...',
                },
                noReviews: {
                  en: 'No customer reviews are available for this product yet.',
                  ar: 'لا توجد مراجعات حالياً لهذا المنتج.',
                },
                reviewsLoadError: {
                  en: 'Unable to load reviews right now.',
                  ar: 'تعذر تحميل المراجعات حالياً.',
                },
                addToCart: {
                  en: 'Add to cart',
                  ar: 'أضف إلى السلة',
                },
                addShort: {
                  en: 'Add',
                  ar: 'أضف',
                },
                adding: {
                  en: 'Adding...',
                  ar: 'جاري الإضافة...',
                },
                notifyMe: {
                  en: 'Notify me',
                  ar: 'أبلغني',
                },
                completeSetOutOfStock: {
                  en: 'Out of stock',
                  ar: 'غير متوفر',
                },
                submitError: {
                  en: 'Unable to add items to cart.',
                  ar: 'تعذر إضافة المنتجات إلى السلة.',
                },
              },
              defaults: {
                description: {
                  en: 'A premium formula designed for daily routines.',
                  ar: 'تركيبة فاخرة مصممة للاستخدام اليومي.',
                },
                howToUse: {
                  en: 'Apply to clean skin or hair as needed, morning and evening.',
                  ar: 'يُستخدم على بشرة أو شعر نظيف حسب الحاجة صباحاً ومساءً.',
                },
                ingredients: {
                  en: 'Aqua, Glycerin, Fragrance, Botanical Extracts.',
                  ar: 'ماء، جلسرين، عطر، مستخلصات نباتية.',
                },
              },
              deliveryHighlights: [
                {
                  en: 'Delivery in 2-4 business days',
                  ar: 'توصيل خلال 2-4 أيام عمل',
                },
                {
                  en: '14-day return window',
                  ar: 'إرجاع خلال 14 يوماً',
                },
                {
                  en: 'Secure payment at checkout',
                  ar: 'دفع آمن عند إتمام الطلب',
                },
              ],
              stockMessages: {
                limitedStock: {
                  en: 'Limited stock - recommended to checkout soon',
                  ar: 'مخزون محدود - يفضل إتمام الطلب قريباً',
                },
                readyDispatch: {
                  en: 'Ready for immediate dispatch',
                  ar: 'متوفر للشحن الفوري',
                },
                outOfStock: {
                  en: 'Currently out of stock',
                  ar: 'غير متوفر حالياً',
                },
              },
              crossSellByProduct: [
                {
                  productId: '1',
                  relatedProductIds: ['3', '5', '2', '4'],
                },
                {
                  productId: '2',
                  relatedProductIds: ['6', '3', '1', '4'],
                },
                {
                  productId: '3',
                  relatedProductIds: ['1', '5', '6', '2'],
                },
                {
                  productId: '4',
                  relatedProductIds: ['2', '6', '3', '1'],
                },
              ],
            },
            checkoutNotice: {
              en: 'Shipping timelines are estimated and confirmed after payment.',
              ar: 'مواعيد الشحن تقديرية ويتم تأكيدها بعد الدفع.',
            },
            checkout: {
              paymentMethods: {
                codEnabled: true,
                cardOnDeliveryEnabled: true,
                onlineCardEnabled: true,
              },
              fulfillment: {
                deliveryEnabled: true,
                branchPickupEnabled: true,
              },
              branches: [
                {
                  id: 'branch-1',
                  name: { en: 'Abdali Branch', ar: 'فرع العبدلي' },
                  city: { en: 'Amman', ar: 'عمان' },
                  area: { en: 'Abdali', ar: 'العبدلي' },
                  building: { en: 'Boulevard', ar: 'البوليفارد' },
                  stockCount: 42,
                  distanceKm: 2.4,
                  payAtBranchEnabled: true,
                  payNowEnabled: true,
                },
                {
                  id: 'branch-2',
                  name: { en: 'Sweifieh Branch', ar: 'فرع الصويفية' },
                  city: { en: 'Amman', ar: 'عمان' },
                  area: { en: 'Sweifieh', ar: 'الصويفية' },
                  building: { en: 'Galleria Street', ar: 'شارع الجاليريا' },
                  stockCount: 15,
                  distanceKm: 4.1,
                  payAtBranchEnabled: true,
                  payNowEnabled: true,
                },
                {
                  id: 'branch-3',
                  name: { en: 'Irbid Downtown', ar: 'فرع إربد - وسط البلد' },
                  city: { en: 'Irbid', ar: 'إربد' },
                  area: { en: 'Downtown', ar: 'وسط البلد' },
                  building: { en: 'Al Yarmouk Complex', ar: 'مجمع اليرموك' },
                  stockCount: 0,
                  distanceKm: 71.0,
                  payAtBranchEnabled: true,
                  payNowEnabled: true,
                },
              ],
            },
            loyalty: {
              pointToCurrency: 0.03,
              earnRatePerCurrency: 1,
              tiers: [
                { id: 'silver', name: 'Silver', minPoints: 0 },
                { id: 'gold', name: 'Gold', minPoints: 900 },
                { id: 'loyal', name: 'Loyal', minPoints: 2000 },
              ],
              tierThresholds: {
                gold: 900,
                loyal: 2000,
              },
              redeemOptions: [
                { percent: 10, pointsCost: 120 },
                { percent: 25, pointsCost: 280 },
                { percent: 50, pointsCost: 620 },
              ],
            },
          },
          pharmacist: {
            dashboardTitle: {
              en: 'Pharmacist Console',
              ar: 'لوحة الصيدلي',
            },
            panelLabels: {
              search: {
                en: 'Search or Scan',
                ar: 'بحث أو مسح',
              },
              consultation: {
                en: 'Consultation Form',
                ar: 'نموذج الاستشارة',
              },
              recommendations: {
                en: 'Recommendations & Stock',
                ar: 'التوصيات والمخزون',
              },
            },
            notice: {
              en: 'Only dermatologist-approved products can be marked as clinical recommendations.',
              ar: 'يمكن فقط وضع المنتجات المعتمدة كـ توصيات سريرية.',
            },
          },
          admin: {
            dashboardTitle: {
              en: 'Admin Command Center',
              ar: 'مركز تحكم الإدارة',
            },
            kpiLabels: [
              {
                id: 'sales-day',
                label: {
                  en: 'Sales Today',
                  ar: 'مبيعات اليوم',
                },
              },
              {
                id: 'sales-month',
                label: {
                  en: 'Sales This Month',
                  ar: 'مبيعات هذا الشهر',
                },
              },
              {
                id: 'sales-year',
                label: {
                  en: 'Sales This Year',
                  ar: 'مبيعات هذا العام',
                },
              },
            ],
            notice: {
              en: 'Campaign and loyalty updates publish to customer surfaces after approval.',
              ar: 'تحديثات الحملات والولاء تُنشر بعد الموافقة.',
            },
            controlToggles: [
              {
                id: 'flash-sale-zone',
                label: {
                  en: 'Flash sale zone',
                  ar: 'منطقة التخفيضات السريعة',
                },
                description: {
                  en: 'Controls the dedicated homepage urgency block.',
                  ar: 'يتحكم بظهور منطقة العروض العاجلة في الصفحة الرئيسية.',
                },
                enabled: true,
                surface: 'all',
              },
              {
                id: 'loyalty-redeem-checkout',
                label: {
                  en: 'Loyalty redeem at checkout',
                  ar: 'استبدال الولاء أثناء الدفع',
                },
                description: {
                  en: 'Enables percent-based loyalty redemption in checkout.',
                  ar: 'يفعّل الاستبدال بنسبة مئوية في صفحة الدفع.',
                },
                enabled: true,
                surface: 'all',
              },
              {
                id: 'pharmacist-console',
                label: {
                  en: 'Pharmacist console',
                  ar: 'لوحة الصيدلي',
                },
                description: {
                  en: 'Allows pharmacist workflow routes and scan tools.',
                  ar: 'يفعّل مسارات سير عمل الصيدلي وأدوات المسح.',
                },
                enabled: true,
                surface: 'web',
              },
              {
                id: 'branch-pickup',
                label: {
                  en: 'Branch pickup',
                  ar: 'الاستلام من الفرع',
                },
                description: {
                  en: 'Allows pickup fulfillment and pay-at-branch mode.',
                  ar: 'يفعّل الاستلام من الفرع والدفع في الفرع.',
                },
                enabled: true,
                surface: 'all',
              },
            ],
            rolePreview: [
              {
                id: 'role-admin',
                name: 'Master Admin',
                email: 'admin@realcosmetics.local',
                role: 'admin',
                status: 'active',
                lastActiveAt: '2026-02-25T08:30:00.000Z',
                permissions: {
                  canManageCmsToggles: true,
                  canManageUsers: true,
                  canRunCacheOps: true,
                },
              },
              {
                id: 'role-pharmacist',
                name: 'Pharmacist User',
                email: 'pharma@realcosmetics.local',
                role: 'pharmacist',
                status: 'active',
                lastActiveAt: '2026-02-24T16:15:00.000Z',
                permissions: {
                  canManageCmsToggles: false,
                  canManageUsers: false,
                  canRunCacheOps: false,
                },
              },
              {
                id: 'role-customer',
                name: 'Customer User',
                email: 'user@realcosmetics.local',
                role: 'customer',
                status: 'active',
                lastActiveAt: '2026-02-23T19:02:00.000Z',
                permissions: {
                  canManageCmsToggles: false,
                  canManageUsers: false,
                  canRunCacheOps: false,
                },
              },
            ],
          },
        },
      },
    }
  },
}
