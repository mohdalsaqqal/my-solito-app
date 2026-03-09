'use client'

import { useCallback, useEffect, useState } from 'react'
import { resolveDirection } from '@real/app/lib/rtl-manager'
import { setCurrentLocale, useCurrentLocale } from '@real/app/lib/i18n/client'
import { useParams, useRouter } from 'next/navigation'
import {
  Layout,
  defaultBrandItems,
  defaultCategories,
  defaultFooterLinks,
  defaultSalesItems,
  defaultShellContent,
  defaultSocialLinks,
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

export default function ProductPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const productId = params?.id
  const [product, setProduct] = useState<Product | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<Cart | null>(null)
  const [cartFeedbackKey, setCartFeedbackKey] = useState(0)
  const [cmsHome, setCmsHome] = useState<CMSHome | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [reviewsError, setReviewsError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const locale = useCurrentLocale()
  const dir = resolveDirection(locale)

  const loadData = useCallback(async () => {
    if (!productId) {
      return
    }
    setLoading(true)
    setError(null)
    setReviewsLoading(true)
    setReviewsError(null)
    try {
      const [productResult, productsResult, cartResult, cmsResult] = await Promise.all([
        apiClient.products.get(productId),
        apiClient.products.list(),
        apiClient.cart.get(),
        apiClient.cms.home(),
      ])
      setProduct(productResult)
      setProducts(productsResult)
      setCart(cartResult)
      setCmsHome(cmsResult)
      try {
        const reviewResult = await apiClient.reviews.list(productId)
        setReviews(reviewResult)
      } catch (reviewLoadError) {
        setReviews([])
        setReviewsError(
          reviewLoadError instanceof Error ? reviewLoadError.message : 'Unable to load reviews.'
        )
      } finally {
        setReviewsLoading(false)
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to fetch product.')
      setReviews([])
      setReviewsLoading(false)
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    void loadData()
  }, [loadData])

  useEffect(() => {
    if (!product?.id) {
      return
    }
    pushRecentlyViewedProductId(product.id)
  }, [product?.id])

  const lines = toCartLines(cart, products)
  const linesSubtotal = cartSubtotal(lines)
  const linesCount = cartCount(cart)

  return (
    <Layout
      locale={locale}
      onLocaleChange={(nextLocale) => setCurrentLocale(nextLocale)}
      dir={dir}
      shellContent={cmsHome?.shell ?? defaultShellContent}
      logoSrc={cmsHome?.shell?.branding?.logo.uri ?? '/brand-logo-placeholder.svg'}
      logoAlt="Real Cosmetics"
      campaignText={cmsHome?.shell?.topBar?.message?.[locale] ?? 'Free delivery for orders above 99 USD'}
      campaignLink={cmsHome?.shell?.topBar?.ctaLabel?.[locale] ?? 'Shop now'}
      cartCount={linesCount}
      wishlistCount={1}
      accountCount={1}
      cartItems={lines}
      cartSubtotal={linesSubtotal}
      cartLoading={loading}
      cartError={error}
      cartFeedbackKey={cartFeedbackKey}
      categories={defaultCategories}
      salesItems={defaultSalesItems}
      brandItems={defaultBrandItems}
      footerLinks={defaultFooterLinks}
      socialLinks={defaultSocialLinks}
      newsletterTitle={cmsHome?.shell?.footer?.newsletterTitle?.[locale] ?? 'Stay in the loop'}
      newsletterSubtitle={cmsHome?.shell?.footer?.newsletterSubtitle?.[locale] ?? 'Get launches, offers, and skincare insights.'}
      onViewCart={() => router.push('/cart')}
      onCheckout={() => router.push('/checkout')}
      onMobileCartNavigate={() => router.push('/cart')}
      onPressLogo={() => router.push('/')}
      onCartIncrease={async (item: CartLine) => {
        const updated = await apiClient.cart.setQuantity(item.id, item.quantity + 1)
        setCart(updated)
      }}
      onCartDecrease={async (item: CartLine) => {
        const updated = await apiClient.cart.setQuantity(item.id, Math.max(0, item.quantity - 1))
        setCart(updated)
      }}
      onCartRemove={async (item: CartLine) => {
        const updated = await apiClient.cart.remove(item.id)
        setCart(updated)
      }}
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
        onReload={loadData}
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
