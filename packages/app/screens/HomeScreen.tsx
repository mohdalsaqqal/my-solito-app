import { useMemo } from 'react'
import { Product, CMSHome } from '@real/app/lib/types'
import {
  HomeCategoryStrip,
  HomeHeroRail,
  HomeProductItem,
  HomeProductRail,
  RevealOnScroll,
} from '@real/ui/components'
import { PageScaffold, Section } from '@real/ui'
import { motionDuration } from '@real/tokens'
import { NavItem } from '@real/app/features/shell'
import { applyProductFilter } from '@real/app/lib/product-filter'
import { passThroughPricingService } from '@real/app/lib/pricing'

type HomeScreenProps = {
  products: Product[]
  cmsHome?: CMSHome | null
  categories: NavItem[]
  loading: boolean
  error: string | null
  onReload: () => void
  onNavigate?: (href: string) => void
  onSelectProduct?: (productId: string) => void
  onAddToCart?: (productId: string) => void
}

function deriveBrand(name: string) {
  const [left] = name.split('-')
  return left?.trim() || 'Brand'
}

function deriveProductName(name: string) {
  const split = name.split('-')
  if (split.length < 2) {
    return name
  }
  return split.slice(1).join('-').trim()
}

function toHomeProductItem(product: Product, badge?: string): HomeProductItem {
  const resolvedPrice = passThroughPricingService.getProductPrice(product)
  return {
    id: product.id,
    name: deriveProductName(product.name),
    brand: deriveBrand(product.name),
    price: resolvedPrice.unitPrice,
    imageUrl: product.image,
    href: `/product/${product.id}`,
    badge,
  }
}

export function HomeScreen({
  products,
  cmsHome,
  categories,
  loading,
  error,
  onReload,
  onNavigate,
  onSelectProduct,
  onAddToCart,
}: HomeScreenProps) {
  const heroItems = useMemo(() => {
    const cmsCards = cmsHome?.marketing?.hero?.cards ?? []
    if (cmsCards.length > 0) {
      return cmsCards
    }
    return cmsHome?.heroSlides.map((slide) => ({
      id: slide.id,
      title: slide.title,
      subtitle: slide.subtitle,
      ctaLabel: slide.ctaLabel,
      href: '/shop',
    })) ?? []
  }, [cmsHome])

  const flashSaleProducts = useMemo(
    () => applyProductFilter(products, { onSale: true, limit: 8 }).map((item) => toHomeProductItem(item, '-20%')),
    [products]
  )
  const bestSellerProducts = useMemo(
    () => applyProductFilter(products, { sort: 'bestseller', limit: 8 }).map((item) => toHomeProductItem(item)),
    [products]
  )
  const categoryItems = useMemo(
    () =>
      categories.map((item) => ({
        id: item.id,
        label: item.label,
        href: item.href,
      })),
    [categories]
  )

  function openHref(href?: string) {
    if (!href) {
      return
    }
    onNavigate?.(href)
  }

  return (
    <PageScaffold variant='editorial' density='roomy' scroll='auto'>
      <PageScaffold.Body>
        <Section bleed='full' y='roomy'>
          <RevealOnScroll delayMs={0}>
            <HomeHeroRail
              items={heroItems}
              autoplay={cmsHome?.marketing?.hero?.autoplay ?? true}
              autoplayMs={cmsHome?.marketing?.hero?.autoplayMs ?? 3200}
              onPressItem={openHref}
            />
          </RevealOnScroll>
        </Section>

        <Section y='standard'>
          <RevealOnScroll delayMs={motionDuration.stagger}>
            <HomeProductRail
              title='Flash Sale'
              items={flashSaleProducts}
              loading={loading}
              error={error}
              onRetry={onReload}
              onPressViewAll={() => openHref('/sales')}
              onPressProduct={(item) => onSelectProduct?.(item.id)}
              onAddToCart={(item) => onAddToCart?.(item.id)}
            />
          </RevealOnScroll>
        </Section>

        <Section y='tight'>
          <RevealOnScroll delayMs={motionDuration.stagger * 2}>
            <HomeCategoryStrip
              items={categoryItems}
              onPressItem={(item) => openHref(item.href)}
              onPressViewAll={() => openHref('/shop')}
            />
          </RevealOnScroll>
        </Section>

        <Section y='standard'>
          <RevealOnScroll delayMs={motionDuration.stagger * 3}>
            <HomeProductRail
              title='Trending Best Sellers'
              items={bestSellerProducts}
              loading={loading}
              error={error}
              onRetry={onReload}
              onPressViewAll={() => openHref('/shop')}
              onPressProduct={(item) => onSelectProduct?.(item.id)}
              onAddToCart={(item) => onAddToCart?.(item.id)}
            />
          </RevealOnScroll>
        </Section>
      </PageScaffold.Body>
    </PageScaffold>
  )
}
