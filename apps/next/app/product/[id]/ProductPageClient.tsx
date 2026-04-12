'use client'

import { useEffect, useMemo, useState } from 'react'
import { resolveDirection } from '@real/app/lib/rtl-manager'
import { setCurrentLocale, useCurrentLocale } from '@real/app/lib/i18n/client'
import { useRouter } from 'next/navigation'
import {
  Layout,
  defaultBrandItems,
  defaultCategories,
  defaultFooterLinks,
  defaultSalesItems,
  defaultShellContent,
  defaultSocialLinks,
  type LayoutBranding,
  type LayoutCampaign,
  type LayoutCart,
  type LayoutNavigation,
  type LayoutNewsletter,
  type LayoutLocale,
  type LayoutActions,
  type LayoutDisplay,
} from '@real/app/features/shell'
import { CMSHome, Product, Cart, Review } from '@real/app/lib/types'
import { CartLine } from '@real/app/features/shell'
import { ProductScreen } from '@real/app/screens/ProductScreen'
import { pushRecentlyViewedProductId } from '@real/app/lib/recently-viewed'
import { apiClient } from '../../apiClient'
import { cartCount, cartSubtotal, toCartLines } from '../../cart-utils'

function textForLocale(
  value: { en: string; ar: string } | undefined,
  locale: 'en' | 'ar',
  fallback: string
) {
  if (!value) {
    return fallback
  }
  return locale === 'ar' ? value.ar : value.en
}

type ProductPageClientProps = {
  productId: string
  initialProduct: Product | null
  initialProducts: Product[]
  initialCmsHome: CMSHome | null
  initialReviews: Review[]
  initialError: string | null
  initialReviewsError: string | null
}

export function ProductPageClient({
  productId,
  initialProduct,
  initialProducts,
  initialCmsHome,
  initialReviews,
  initialError,
  initialReviewsError,
}: ProductPageClientProps) {
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(initialProduct)
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [cart, setCart] = useState<Cart | null>(null)
  const [cartFeedbackKey, setCartFeedbackKey] = useState(0)
  const [cmsHome, setCmsHome] = useState<CMSHome | null>(initialCmsHome)
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [reviewsError, setReviewsError] = useState<string | null>(initialReviewsError)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(initialError)
  const locale = useCurrentLocale()
  const dir = resolveDirection(locale)

  useEffect(() => {
    setProduct(initialProduct)
    setProducts(initialProducts)
    setCmsHome(initialCmsHome)
    setReviews(initialReviews)
    setError(initialError)
    setReviewsError(initialReviewsError)
    setLoading(false)
    setReviewsLoading(false)
  }, [
    initialCmsHome,
    initialError,
    initialProduct,
    initialProducts,
    initialReviews,
    initialReviewsError,
  ])

  useEffect(() => {
    let active = true

    async function loadCart() {
      try {
        const cartResult = await apiClient.cart.get()
        if (active) {
          setCart(cartResult)
        }
      } catch (loadError) {
        if (active) {
          setError((current) =>
            current ?? (loadError instanceof Error ? loadError.message : 'Unable to fetch cart.')
          )
        }
      }
    }

    void loadCart()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!product?.id) {
      return
    }
    pushRecentlyViewedProductId(product.id)
  }, [product?.id])

  const lines = toCartLines(cart, products)
  const linesSubtotal = cartSubtotal(lines)
  const linesCount = cartCount(lines)

  // Grouped props for Layout
  const branding: LayoutBranding = useMemo(() => ({
    logoSrc: cmsHome?.shell?.branding?.logo.uri ?? '/brand-logo-placeholder.svg',
    logoAlt: cmsHome?.shell?.branding?.logo.alt?.[locale] ?? (locale === 'ar' ? 'ريال كوزمتكس' : 'Real Cosmetics'),
    logoSize: cmsHome?.shell?.branding?.logoSize,
  }), [cmsHome, locale])

  const campaign: LayoutCampaign = useMemo(() => ({
    text: cmsHome?.shell?.topBar?.message?.[locale] ?? 'Free delivery for orders above 99 USD',
    link: cmsHome?.shell?.topBar?.ctaLabel?.[locale] ?? 'Shop now',
  }), [cmsHome, locale])

  const cartProps: LayoutCart = useMemo(() => ({
    count: linesCount,
    items: lines,
    subtotal: linesSubtotal,
    loading,
    error,
    onViewCart: () => router.push('/cart'),
    onCheckout: () => router.push('/checkout'),
    onMobileCartNavigate: () => router.push('/cart'),
    onIncrease: async (item: CartLine) => {
      const updated = await apiClient.cart.setQuantity(item.id, item.quantity + 1)
      setCart(updated)
    },
    onDecrease: async (item: CartLine) => {
      const updated = await apiClient.cart.setQuantity(item.id, Math.max(0, item.quantity - 1))
      setCart(updated)
    },
    onRemove: async (item: CartLine) => {
      const updated = await apiClient.cart.remove(item.id)
      setCart(updated)
    },
  }), [lines, linesCount, linesSubtotal, loading, error])

  const navigation: LayoutNavigation = useMemo(() => ({
    categories: defaultCategories,
    salesItems: defaultSalesItems,
    brandItems: defaultBrandItems,
    footerLinks: defaultFooterLinks,
    socialLinks: defaultSocialLinks,
  }), [])

  const newsletter: LayoutNewsletter = useMemo(() => ({
    title: cmsHome?.shell?.footer?.newsletterTitle?.[locale] ?? 'Stay in the loop',
    subtitle: cmsHome?.shell?.footer?.newsletterSubtitle?.[locale] ?? 'Get launches, offers, and skincare insights.',
  }), [cmsHome, locale])

  const localeProps: LayoutLocale = useMemo(() => ({
    code: locale,
    dir,
    onChange: (nextLocale) => setCurrentLocale(nextLocale),
  }), [locale, dir])

  const actions: LayoutActions = useMemo(() => ({
    onPressLogo: () => router.push('/'),
  }), [])

  const display: LayoutDisplay = useMemo(() => ({
    showFooter: true,
  }), [])

  return (
    <Layout
      branding={branding}
      campaign={campaign}
      cart={cartProps}
      cartFeedbackKey={cartFeedbackKey}
      wishlistCount={0}
      accountCount={0}
      navigation={navigation}
      newsletter={newsletter}
      locale={localeProps}
      shellContent={cmsHome?.shell ?? defaultShellContent}
      actions={actions}
      display={display}
    >
      <ProductScreen
        product={product}
        products={products}
        locale={locale}
        completeSetTitle={
          cmsHome?.marketing?.completeSet?.title?.[locale] ?? (locale === 'ar' ? 'أكمل المجموعة' : 'Complete the set')
        }
        relatedTitle={
          cmsHome?.marketing?.rails?.[0]?.title?.[locale] ?? (locale === 'ar' ? 'قد يعجبك أيضاً' : 'You may also like')
        }
        completeSetQuery={cmsHome?.marketing?.completeSet?.query}
        relatedQuery={cmsHome?.marketing?.rails?.[0]?.query}
        relatedProductIds={
          cmsHome?.identity?.customer?.productDetails?.crossSellByProduct?.find(
            (item) => item.productId === productId
          )?.relatedProductIds ?? []
        }
        copy={{
          tabs: {
            description: textForLocale(cmsHome?.identity?.customer?.productDetails?.tabs?.description, locale, locale === 'ar' ? 'الوصف' : 'Description'),
            howToUse: textForLocale(cmsHome?.identity?.customer?.productDetails?.tabs?.howToUse, locale, locale === 'ar' ? 'طريقة الاستخدام' : 'How to use'),
            ingredients: textForLocale(cmsHome?.identity?.customer?.productDetails?.tabs?.ingredients, locale, locale === 'ar' ? 'المكونات' : 'Ingredients'),
          },
          labels: {
            inStock: textForLocale(cmsHome?.identity?.customer?.productDetails?.labels?.inStock, locale, locale === 'ar' ? 'متوفر' : 'In stock'),
            outOfStock: textForLocale(cmsHome?.identity?.customer?.productDetails?.labels?.outOfStock, locale, locale === 'ar' ? 'غير متوفر' : 'Out of stock'),
            quantity: textForLocale(cmsHome?.identity?.customer?.productDetails?.labels?.quantity, locale, locale === 'ar' ? 'الكمية' : 'Qty'),
            noSelectableOptions: textForLocale(cmsHome?.identity?.customer?.productDetails?.labels?.noSelectableOptions, locale, locale === 'ar' ? 'لا توجد خيارات تحديد لهذا المنتج.' : 'No selectable options for this product.'),
            deliveryAssurance: textForLocale(cmsHome?.identity?.customer?.productDetails?.labels?.deliveryAssurance, locale, locale === 'ar' ? 'التوصيل والضمان' : 'Delivery & assurance'),
            selectedSubtotal: textForLocale(cmsHome?.identity?.customer?.productDetails?.labels?.selectedSubtotal, locale, locale === 'ar' ? 'المجموع المختار' : 'Selected subtotal'),
            reviewsTitle: textForLocale(cmsHome?.identity?.customer?.productDetails?.labels?.reviewsTitle, locale, locale === 'ar' ? 'التقييمات والمراجعات' : 'Ratings & reviews'),
            loading: textForLocale(cmsHome?.identity?.customer?.productDetails?.labels?.loading, locale, locale === 'ar' ? 'جاري التحميل...' : 'Loading...'),
            noReviews: textForLocale(cmsHome?.identity?.customer?.productDetails?.labels?.noReviews, locale, locale === 'ar' ? 'لا توجد مراجعات حالياً لهذا المنتج.' : 'No customer reviews are available for this product yet.'),
            reviewsLoadError: textForLocale(cmsHome?.identity?.customer?.productDetails?.labels?.reviewsLoadError, locale, locale === 'ar' ? 'تعذر تحميل المراجعات حالياً.' : 'Unable to load reviews right now.'),
            addToCart: textForLocale(cmsHome?.identity?.customer?.productDetails?.labels?.addToCart, locale, locale === 'ar' ? 'أضف إلى السلة' : 'Add to cart'),
            addShort: textForLocale(cmsHome?.identity?.customer?.productDetails?.labels?.addShort, locale, locale === 'ar' ? 'أضف' : 'Add'),
            adding: textForLocale(cmsHome?.identity?.customer?.productDetails?.labels?.adding, locale, locale === 'ar' ? 'جاري الإضافة...' : 'Adding...'),
            notifyMe: textForLocale(cmsHome?.identity?.customer?.productDetails?.labels?.notifyMe, locale, locale === 'ar' ? 'أبلغني' : 'Notify me'),
            completeSetOutOfStock: textForLocale(cmsHome?.identity?.customer?.productDetails?.labels?.completeSetOutOfStock, locale, locale === 'ar' ? 'غير متوفر' : 'Out of stock'),
            submitError: textForLocale(cmsHome?.identity?.customer?.productDetails?.labels?.submitError, locale, locale === 'ar' ? 'تعذر إضافة المنتجات إلى السلة.' : 'Unable to add items to cart.'),
          },
          defaults: {
            description: textForLocale(cmsHome?.identity?.customer?.productDetails?.defaults?.description, locale, locale === 'ar' ? 'تركيبة فاخرة مصممة للاستخدام اليومي.' : 'A premium formula designed for daily routines.'),
            howToUse: textForLocale(cmsHome?.identity?.customer?.productDetails?.defaults?.howToUse, locale, locale === 'ar' ? 'يُستخدم على بشرة أو شعر نظيف حسب الحاجة صباحاً ومساءً.' : 'Apply to clean skin or hair as needed, morning and evening.'),
            ingredients: textForLocale(cmsHome?.identity?.customer?.productDetails?.defaults?.ingredients, locale, locale === 'ar' ? 'ماء، جلسرين، عطر، مستخلصات نباتية.' : 'Aqua, Glycerin, Fragrance, Botanical Extracts.'),
          },
          deliveryHighlights: (cmsHome?.identity?.customer?.productDetails?.deliveryHighlights ?? []).map((item) =>
            textForLocale(item, locale, '')
          ).filter(Boolean),
          stockMessages: {
            limitedStock: textForLocale(cmsHome?.identity?.customer?.productDetails?.stockMessages?.limitedStock, locale, locale === 'ar' ? 'مخزون محدود - يفضل إتمام الطلب قريباً' : 'Limited stock - recommended to checkout soon'),
            readyDispatch: textForLocale(cmsHome?.identity?.customer?.productDetails?.stockMessages?.readyDispatch, locale, locale === 'ar' ? 'متوفر للشحن الفوري' : 'Ready for immediate dispatch'),
            outOfStock: textForLocale(cmsHome?.identity?.customer?.productDetails?.stockMessages?.outOfStock, locale, locale === 'ar' ? 'غير متوفر حالياً' : 'Currently out of stock'),
          },
        }}
        reviews={reviews}
        reviewsLoading={reviewsLoading}
        reviewsError={reviewsError}
        loading={loading}
        error={error}
        onReload={() => router.refresh()}
        onSelectProduct={(id) => router.push(`/product/${id}`)}
        onAddToCart={async (id, quantity) => {
          const updated = await apiClient.cart.add(id, quantity)
          setCart(updated)
          setCartFeedbackKey((current) => current + 1)
        }}
      />
    </Layout>
  )
}
