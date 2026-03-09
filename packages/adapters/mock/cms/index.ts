import { CMSProvider } from '@real/providers/contracts'

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
                href: '/shop/categories/luxury-brands',
              },
              {
                id: 'cat-flash-sale',
                label: { en: '% Flash Sale', ar: '% تخفيضات سريعة' },
                href: '/sales',
              },
              {
                id: 'cat-skincare',
                label: { en: 'Skincare', ar: 'العناية بالبشرة' },
                href: '/shop/categories/skincare',
              },
              {
                id: 'cat-makeup',
                label: { en: 'Makeup', ar: 'المكياج' },
                href: '/shop/categories/makeup',
              },
              {
                id: 'cat-haircare',
                label: { en: 'Haircare', ar: 'العناية بالشعر' },
                href: '/shop/categories/haircare',
              },
              {
                id: 'cat-wellness',
                label: { en: 'Wellness', ar: 'العافية' },
                href: '/shop/categories/wellness',
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
          brandSpotlights: [
            {
              id: 'spotlight-fenty',
              enabled: true,
              bannerTitle: {
                en: 'Fenty Beauty Spotlight',
                ar: 'واجهة Fenty Beauty',
              },
              bannerSubtitle: {
                en: 'Editorial lip and gloss picks with premium finish.',
                ar: 'اختيارات تحريرية للشفاه واللمعان بلمسة فاخرة.',
              },
              bannerCtaLabel: {
                en: 'Shop Fenty',
                ar: 'تسوق Fenty',
              },
              bannerHref: '/shop',
              bannerImageUrl:
                'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=1800&h=700&q=80',
              railTitle: {
                en: 'Fenty Highlights',
                ar: 'منتجات Fenty المميزة',
              },
              query: {
                source: 'new_arrivals',
                limit: 8,
                sortBy: 'price_desc',
                brandNames: ['Fenty Beauty'],
              },
            },
            {
              id: 'spotlight-huda',
              enabled: true,
              bannerTitle: {
                en: 'Huda Beauty Editorial',
                ar: 'تحرير Huda Beauty',
              },
              bannerSubtitle: {
                en: 'Bold color stories and glossy seasonal edits.',
                ar: 'تدرجات جريئة ولمسات لامعة موسمية.',
              },
              bannerCtaLabel: {
                en: 'Shop Huda',
                ar: 'تسوق Huda',
              },
              bannerHref: '/shop',
              bannerImageUrl:
                'https://images.unsplash.com/photo-1590156203854-e88c6b4f6a43?auto=format&fit=crop&w=1800&h=700&q=80',
              railTitle: {
                en: 'Huda New Arrivals',
                ar: 'أحدث منتجات Huda',
              },
              query: {
                source: 'best_sellers',
                limit: 8,
                sortBy: 'price_desc',
                brandNames: ['Huda Beauty'],
              },
            },
          ],
          brandSections: [
            {
              id: 'brand-fenty',
              enabled: true,
              bannerTitle: {
                en: 'Fenty Beauty Spotlight',
                ar: 'واجهة Fenty Beauty',
              },
              bannerSubtitle: {
                en: 'Editorial lip and gloss picks with premium finish.',
                ar: 'اختيارات تحريرية للشفاه واللمعان بلمسة فاخرة.',
              },
              bannerCtaLabel: {
                en: 'Shop Fenty',
                ar: 'تسوق Fenty',
              },
              bannerHref: '/shop',
              bannerImageUrl:
                'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=1800&h=700&q=80',
              railTitle: {
                en: 'Fenty Highlights',
                ar: 'منتجات Fenty المميزة',
              },
              query: {
                source: 'new_arrivals',
                limit: 8,
                sortBy: 'price_desc',
                brandNames: ['Fenty Beauty'],
              },
            },
            {
              id: 'brand-huda',
              enabled: true,
              bannerTitle: {
                en: 'Huda Beauty Editorial',
                ar: 'تحرير Huda Beauty',
              },
              bannerSubtitle: {
                en: 'Bold color stories and glossy seasonal edits.',
                ar: 'تدرجات جريئة ولمسات لامعة موسمية.',
              },
              bannerCtaLabel: {
                en: 'Shop Huda',
                ar: 'تسوق Huda',
              },
              bannerHref: '/shop',
              bannerImageUrl:
                'https://images.unsplash.com/photo-1590156203854-e88c6b4f6a43?auto=format&fit=crop&w=1800&h=700&q=80',
              railTitle: {
                en: 'Huda New Arrivals',
                ar: 'أحدث منتجات Huda',
              },
              query: {
                source: 'best_sellers',
                limit: 8,
                sortBy: 'price_desc',
                brandNames: ['Huda Beauty'],
              },
            },
          ],
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
                title: 'Deals up to 30%',
                subtitle: 'Limited-time routines for everyday glow.',
                ctaLabel: 'Shop offers',
                href: '/sales',
                imageUrl: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=1200&h=700&q=80',
                badgeLabel: {
                  en: 'Flash deal',
                  ar: 'عرض سريع',
                },
              },
              {
                id: 'm-hero-2',
                title: 'Luxury brand highlights',
                subtitle: 'Curated launches from premium houses.',
                ctaLabel: 'Explore brands',
                href: '/shop',
                imageUrl: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&w=1200&h=700&q=80',
                badgeLabel: {
                  en: 'Top brands',
                  ar: 'أبرز العلامات',
                },
              },
              {
                id: 'm-hero-3',
                title: 'New arrivals this week',
                subtitle: 'Fresh picks for skincare and makeup.',
                ctaLabel: 'See new',
                href: '/shop',
                imageUrl: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=1200&h=700&q=80',
                badgeLabel: {
                  en: 'New arrivals',
                  ar: 'وصل حديثاً',
                },
              },
              {
                id: 'm-hero-4',
                title: 'Editor approved essentials',
                subtitle: 'Build your high-impact daily set.',
                ctaLabel: 'Build set',
                href: '/shop',
                imageUrl: 'https://images.unsplash.com/photo-1590156203854-e88c6b4f6a43?auto=format&fit=crop&w=1200&h=700&q=80',
                badgeLabel: {
                  en: 'Editor picks',
                  ar: 'اختيارات المحرر',
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
                en: 'Flash Sale Weekend',
                ar: 'ويكند التخفيضات السريعة',
              },
              subtitle: {
                en: 'Limited-time premium deals. Selling fast across top brands.',
                ar: 'عروض فاخرة لفترة محدودة. الطلب مرتفع على أبرز العلامات.',
              },
              ctaLabel: {
                en: 'Shop now',
                ar: 'تسوق الآن',
              },
              href: '/sales',
              imageUrl:
                'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1800&h=600&q=80',
              timerEndsAt: '2026-03-01T22:59:59.000Z',
              urgencyBadge: {
                en: 'Limited',
                ar: 'محدود',
              },
              showTimer: true,
              showUrgency: true,
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
          brands: [
            {
              id: 'b-ysl',
              name: 'YSL',
              href: '/shop',
              logoUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=240&h=240&q=80',
            },
            {
              id: 'b-fenty',
              name: 'Fenty Beauty',
              href: '/shop',
              logoUrl: 'https://images.unsplash.com/photo-1583241800698-61f4f53d6e8d?auto=format&fit=crop&w=240&h=240&q=80',
            },
            {
              id: 'b-dior',
              name: 'Dior',
              href: '/shop',
              logoUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=240&h=240&q=80',
            },
            {
              id: 'b-huda',
              name: 'Huda Beauty',
              href: '/shop',
              logoUrl: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=240&h=240&q=80',
            },
          ],
          topBrandsTitle: {
            en: 'Top Brands',
            ar: 'أهم العلامات التجارية',
          },
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
